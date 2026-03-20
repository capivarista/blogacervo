'use server';

export const runtime = 'nodejs'

if (!globalThis.setImmediate) {
    // @ts-ignore
    globalThis.setImmediate = (fn: any, ...args: any[]) => setTimeout(fn, 0, ...args);
}
// ------------------------------------------------

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';
import prisma from '@/lib/prisma';
import { hash, compare } from 'bcrypt-ts';

// ==========================================
// VALIDAÇÃO DE SENHA
// ==========================================

/**
 * Valida força da senha com requisitos de segurança:
 * - Mínimo 8 caracteres
 * - 1 letra maiúscula
 * - 1 número
 * - 1 caractere especial
 */
function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
    if (password.length < 8) {
        return { valid: false, error: 'Senha deve ter mínimo 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Senha deve conter letra maiúscula' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: 'Senha deve conter número' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, error: 'Senha deve conter caractere especial' };
    }
    return { valid: true };
}

// ==========================================
// AUTENTICAÇÃO
// ==========================================

export async function loginAction(prevState: any, formData: FormData) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // Busca usuário via Prisma
        const user = await prisma.usuarios.findUnique({
            where: { email: email.toLowerCase() },
            select: { id: true, senha_hash: true },
        });

        if (!user) {
            return { error: 'Credenciais inválidas' };
        }

        const valid = await compare(password, user.senha_hash);

        if (!valid) {
            return { error: 'Senha incorreta' };
        }

        (await cookies()).set('user_id', user.id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        });

        return { success: true };
    } catch (e) {
        console.error('[LoginAction] Erro:', e);
        return { error: 'Erro interno no servidor' };
    }
}

export async function registerAction(prevState: any, formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!name || !email || !password) {
            return { error: 'Preencha todos os campos' };
        }

        // Validação de força da senha
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            return { error: passwordValidation.error! };
        }

        // Verifica se email já existe no Prisma
        const existingUser = await prisma.usuarios.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return { error: 'Email já cadastrado' };
        }

        const passwordHash = await hash(password, 10);

        // Cria usuário usando Prisma (migration do Supabase → Prisma)
        await prisma.usuarios.create({
            data: {
                nome_usuario: name,
                email: email.toLowerCase(),
                senha_hash: passwordHash,
                role: 'user',
                is_admin: false,
            },
        });

        return { success: true };
    } catch (e) {
        console.error('[RegisterAction] Erro:', e);
        return { error: 'Falha no registro' };
    }
}

// ==========================================
// POSTAGENS
// ==========================================

export async function getPosts(page: number = 1, limit: number = 20) {
    const userId = (await cookies()).get('user_id')?.value;
    let userRole = 'user';

    if (userId) {
        const user = await prisma.usuarios.findUnique({
            where: { id: parseInt(userId) },
            select: { role: true },
        });
        if (user?.role) userRole = user.role;
    }

    const offset = (page - 1) * limit;

    const posts = await prisma.postagens.findMany({
        take: limit,
        skip: offset,
        orderBy: { data_criacao: 'desc' },
        include: {
            usuarios: { select: { nome_usuario: true } },
            curtidas: { select: { usuario_id: true } },
            comentarios: {
                include: {
                    usuarios: { select: { nome_usuario: true } },
                },
            },
        },
    });

    return posts.map((p: any) => ({
        ...p,
        nome_usuario: p.usuarios?.nome_usuario || 'Desconhecido',
        likes_count: p.curtidas?.length || 0,
        comentarios: (p.comentarios || []).map((c: any) => ({
            ...c,
            nome_usuario: c.usuarios?.nome_usuario || 'Anônimo',
        })),
        current_user_is_admin: (userRole === 'admin') || (userId && p.autor_id == parseInt(userId)),
    }));
}

/**
 * Valida buffer de imagem verificando magic bytes (PNG, JPEG, GIF, WebP)
 * Previne upload de arquivos maliciosos com extensão enganosa
 */
function validateImageBuffer(buffer: Buffer): boolean {
    const signatures = [
        [0x89, 0x50, 0x4E, 0x47],           // PNG
        [0xFF, 0xD8, 0xFF],                 // JPEG
        [0x47, 0x49, 0x46, 0x38],           // GIF
        [0x52, 0x49, 0x46, 0x46],           // WebP (RIFF)
    ];

    for (const sig of signatures) {
        if (sig.every((byte, i) => buffer[i] === byte)) {
            return true;
        }
    }
    return false;
}

export async function createPost(formData: FormData) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return { error: 'Não autorizado' };

    const titulo = formData.get('title') as string;
    const conteudo = formData.get('content') as string;

    let imageUrl = null;

    const imageFile = formData.get('image') as File | null;
    const imageBase64 = formData.get('image') as string | null;

    // 1. PROCESSA COMO ARQUIVO NATIVO
    if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
        // Validação de tamanho (max 2MB)
        if (imageFile.size > 2 * 1024 * 1024) {
            return { error: 'Imagem muito grande (max 2MB)' };
        }

        try {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // VALIDAÇÃO DE MIME TYPE REAL (magic bytes)
            if (!validateImageBuffer(buffer)) {
                return { error: 'Formato de arquivo inválido. Apenas PNG, JPEG, GIF e WebP são aceitos.' };
            }

            const fileExt = imageFile.name.split('.').pop() || 'png';
            const fileName = `user-${userId}-${Date.now()}.${fileExt}`;

            const supabase = createServerClient();
            const { error: uploadError } = await supabase.storage
                .from('post-images')
                .upload(fileName, buffer, {
                    contentType: imageFile.type,
                    upsert: false
                });

            if (uploadError) {
                console.error("[CreatePost] Upload Error:", uploadError);
                return { error: 'Falha ao upload da imagem' };
            }

            const { data: urlData } = supabase.storage
                .from('post-images')
                .getPublicUrl(fileName);
            imageUrl = urlData.publicUrl;

        } catch (e) {
            console.error('[CreatePost] Erro crítico ao ler o File:', e);
            return { error: 'Erro ao processar imagem' };
        }
    }
    // 2. FALLBACK: PROCESSA COMO BASE64
    else if (typeof imageBase64 === 'string' && imageBase64.startsWith('data:image')) {
        try {
            const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const mimeType = matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, 'base64');

                // VALIDAÇÃO DE MIME TYPE REAL
                if (!validateImageBuffer(buffer)) {
                    return { error: 'Formato de arquivo inválido' };
                }

                const fileExt = mimeType.split('/')[1] || 'png';
                const fileName = `user-${userId}-${Date.now()}.${fileExt}`;

                const supabase = createServerClient();
                const { error: uploadError } = await supabase.storage
                    .from('post-images')
                    .upload(fileName, buffer, {
                        contentType: mimeType,
                        upsert: false
                    });

                if (uploadError) {
                    console.error("[CreatePost] Upload Error (Base64):", uploadError);
                    return { error: 'Falha ao upload da imagem' };
                }

                const { data: urlData } = supabase.storage
                    .from('post-images')
                    .getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            }
        } catch (e) {
            console.error('[CreatePost] Erro ao processar imagem Base64:', e);
            return { error: 'Erro ao processar imagem' };
        }
    }

    // 3. SALVA NO BANCO DE DADOS (Prisma)
    await prisma.postagens.create({
        data: {
            autor_id: parseInt(userId),
            titulo,
            conteudo,
            imagem_url: imageUrl,
        },
    });

    revalidatePath('/');
    return { success: true };
}

export async function deletePost(postId: number) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return { error: 'Não autorizado' };

    const user = await prisma.usuarios.findUnique({
        where: { id: parseInt(userId) },
        select: { role: true },
    });

    const isAdmin = user?.role === 'admin';

    if (isAdmin) {
        await prisma.postagens.delete({ where: { id: postId } });
    } else {
        // Verifica se o usuário é o autor do post
        const post = await prisma.postagens.findUnique({
            where: { id: postId },
            select: { autor_id: true },
        });

        if (!post || post.autor_id != parseInt(userId)) {
            return { error: 'Acesso negado' };
        }

        await prisma.postagens.delete({ where: { id: postId } });
    }

    revalidatePath('/');
    return { success: true };
}

// ==========================================
// INTERAÇÕES
// ==========================================

export async function likePost(postId: number) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return { error: 'Não autorizado' };

    const existing = await prisma.curtidas.findFirst({
        where: {
            postagem_id: postId,
            usuario_id: parseInt(userId),
        },
    });

    if (existing) {
        await prisma.curtidas.delete({
            where: {
                postagem_id_usuario_id: {
                    postagem_id: postId,
                    usuario_id: parseInt(userId),
                }
            },
        });
    } else {
        await prisma.curtidas.create({
            data: {
                postagem_id: postId,
                usuario_id: parseInt(userId),
            },
        });
    }

    revalidatePath('/');
    return { success: true };
}


export async function createComment(formData: FormData) {
    const userId = (await cookies()).get('user_id')?.value;
    const content = formData.get('content') as string;
    const postId = formData.get('postId') as string;

    if (!userId) {
        return { error: 'Não autorizado' };
    }

    if (!content || content.trim().length === 0) {
        return { error: 'O comentário não pode estar vazio' };
    }

    if (content.length > 500) {
        return { error: 'Comentário muito longo (max 500 caracteres)' };
    }

    await prisma.comentarios.create({
        data: {
            postagem_id: parseInt(postId),
            autor_id: parseInt(userId),
            conteudo: content.trim(),
        },
    });

    revalidatePath('/');
    return { success: true };
}

// ==========================================
// COMUNIDADES
// ==========================================

export async function createCommunity(formData: FormData) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return { error: 'Não autorizado' };

    const nome = formData.get('nome') as string;
    const descricao = formData.get('descricao') as string;

    try {
        const community = await prisma.comunidades.create({
            data: {
                nome,
                descricao,
                dono_id: parseInt(userId),
            },
        });

        await prisma.membros_comunidade.create({
            data: {
                comunidade_id: community.id,
                usuario_id: parseInt(userId),
            },
        });

        await prisma.canais.create({
            data: {
                comunidade_id: community.id, // <-- Mude de community_id para comunidade_id
                nome: 'geral',
            },
        });

        revalidatePath('/communities');
        return { success: true };
    } catch (e) {
        console.error('[CreateCommunity] Erro:', e);
        return { error: 'Erro ao criar comunidade' };
    }
}

export async function getCommunityData() {
    const userId = (await cookies()).get('user_id')?.value;

    if (!userId) {
        return { allCommunities: [], myCommunities: [] };
    }

    const all = await prisma.comunidades.findMany({
        include: {
            membros_comunidade: { select: { usuario_id: true } },
        },
    });

    const allProcessed = all.map((c: any) => ({
        ...c,
        membros_count: c.membros_comunidade?.length || 0,
        is_member: c.membros_comunidade?.some((m: any) => m.usuario_id == parseInt(userId)),
    }));

    return {
        allCommunities: allProcessed,
        myCommunities: allProcessed.filter((c: any) => c.is_member),
    };
}

export async function joinCommunity(comunidadeId: number) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return { error: 'Não autorizado' };

    await prisma.membros_comunidade.create({
        data: {
            comunidade_id: comunidadeId,
            usuario_id: parseInt(userId),
        },
    });

    revalidatePath('/communities');
    return { success: true };
}

export async function leaveCommunity(comunidadeId: number) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return { error: 'Não autorizado' };

    await prisma.membros_comunidade.deleteMany({
        where: {
            comunidade_id: comunidadeId,
            usuario_id: parseInt(userId),
        },
    });

    revalidatePath('/communities');
    return { success: true };
}

export async function getCommunityChatData(communityId: number) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return null;

    const community = await prisma.comunidades.findUnique({
        where: { id: communityId },
    });

    const channels = await prisma.canais.findMany({
        where: { comunidade_id: communityId },
    });

    const members = await prisma.membros_comunidade.findMany({
        where: { comunidade_id: communityId },
        include: { usuarios: { select: { id: true, nome_usuario: true } } },
    });

    return {
        community,
        channels: channels || [],
        members: (members || []).map((m: any) => ({
            ...m.usuarios,
            is_owner: m.usuarios.id == community?.dono_id,
        })),
        currentUser: { id: parseInt(userId), isOwner: community?.dono_id == parseInt(userId) },
    };
}

export async function getChannelMessages(channelId: number) {
    const messages = await prisma.mensagens_chat.findMany({
        where: { canal_id: channelId },
        include: { usuarios: { select: { nome_usuario: true } } },
        orderBy: { data_envio: 'asc' },
    });

    return messages.map((m: any) => ({ ...m, nome_usuario: m.usuarios?.nome_usuario }));
}

export async function sendMessage(channelId: number, content: string) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return { error: 'Não autorizado' };

    await prisma.mensagens_chat.create({
        data: {
            canal_id: channelId,
            autor_id: parseInt(userId),
            conteudo: content,
        },
    });

    return { success: true };
}

export async function createChannel(communityId: number, channelName: string) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return { error: 'Não autorizado' };

    const community = await prisma.comunidades.findUnique({
        where: { id: communityId },
        select: { dono_id: true },
    });

    if (community?.dono_id != parseInt(userId)) {
        return { error: 'Sem permissão' };
    }

    await prisma.canais.create({
        data: {
            comunidade_id: communityId, // <-- Mude de community_id para comunidade_id
            nome: channelName.toLowerCase().replace(/\s/g, '-'),
        },
    });

    revalidatePath(`/communities/${communityId}/chat`);
    return { success: true };
}

export async function deleteMessage(messageId: number, communityId: number) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return { error: 'Não autorizado' };

    await prisma.mensagens_chat.deleteMany({
        where: {
            id: messageId,
            autor_id: parseInt(userId),
        },
    });

    return { success: true };
}