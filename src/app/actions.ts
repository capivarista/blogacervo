'use server';


if (!globalThis.setImmediate) {
    // @ts-ignore
    globalThis.setImmediate = (fn: any, ...args: any[]) => setTimeout(fn, 0, ...args);
}
// ------------------------------------------------

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { hash, compare } from 'bcrypt-ts';

// ==========================================
// AUTENTICAÇÃO
// ==========================================

export async function loginAction(prevState: any, formData: FormData) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const { data: user, error } = await supabase
            .from('usuarios')
            .select('id, senha_hash')
            .eq('email', email)
            .single();

        if (error || !user) {
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
        console.error('Erro Login:', e);
        return { error: 'Erro interno no servidor' };
    }
}

export async function registerAction(prevState: any, formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!name || !email || !password) return { error: 'Preencha todos os campos' };

        const passwordHash = await hash(password, 10);

        const { error } = await supabase
            .from('usuarios')
            .insert([{ nome_usuario: name, email, senha_hash: passwordHash, role: 'user' }]);

        if (error) {
            if (error.code === '23505') return { error: 'Email já cadastrado' };
            return { error: 'Erro ao salvar no banco' };
        }

        return { success: true };
    } catch (e) {
        console.error('Erro Registro:', e);
        return { error: 'Falha no registro' };
    }
}

// ==========================================
// POSTAGENS
// ==========================================

export async function getPosts() {

    const userId = (await cookies()).get('user_id')?.value;
    let userRole = 'user';


    if (userId) {
        const { data: u } = await supabase
            .from('usuarios')
            .select('role')
            .eq('id', userId)
            .single();
        if (u) userRole = u.role;
    }

    const { data: posts, error } = await supabase
        .from('postagens')
        .select(`
            *,
            usuarios!postagens_autor_id_fkey(nome_usuario),
            curtidas(usuario_id),
            comentarios(id, conteudo, usuarios(nome_usuario))
        `)
        .order('data_criacao', { ascending: false });

    if (error) return [];

    return (posts || []).map((p: any) => ({
        ...p,
        nome_usuario: p.usuarios?.nome_usuario || 'Desconhecido',
        likes_count: p.curtidas?.length || 0,
        comentarios: (p.comentarios || []).map((c: any) => ({
            ...c,
            nome_usuario: c.usuarios?.nome_usuario || 'Anônimo'
        })),
        // LÓGICA DO BOTÃO DEL: Aparece se for ADMIN ou se for o DONO do post
        current_user_is_admin: (userRole === 'admin') || (userId && p.autor_id == userId)
    }));
}

export async function createPost(formData: FormData) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return;

    const titulo = formData.get('title') as string;
    const conteudo = formData.get('content') as string;
    const imageBase64 = formData.get('image') as string;

    let imageUrl = null;

    if (imageBase64 && imageBase64.startsWith('data:image')) {
        try {
            const base64Data = imageBase64.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `${userId}-${Date.now()}.png`;

            const { error: uploadError } = await supabase.storage
                .from('post-images')
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (!uploadError) {
                const { data: urlData } = supabase.storage
                    .from('post-images')
                    .getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            }
        } catch (e) {
            console.error('Erro upload imagem:', e);
        }
    }

    await supabase.from('postagens').insert([{
        autor_id: parseInt(userId),
        titulo,
        conteudo,
        imagem_url: imageUrl
    }]);

    revalidatePath('/');
}

export async function deletePost(postId: number) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return;


    const { data: user } = await supabase
        .from('usuarios')
        .select('role')
        .eq('id', userId)
        .single();

    const isAdmin = user?.role === 'admin';

    const query = supabase.from('postagens').delete().eq('id', postId);


    if (!isAdmin) {
        query.eq('autor_id', userId);
    }

    await query;
    revalidatePath('/');
}

// ==========================================
// INTERAÇÕES
// ==========================================

export async function likePost(postId: number) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return;

    const { data: existing } = await supabase
        .from('curtidas')
        .select('*')
        .eq('postagem_id', postId)
        .eq('usuario_id', userId)
        .single();

    if (existing) {
        await supabase.from('curtidas').delete().eq('postagem_id', postId).eq('usuario_id', userId);
    } else {
        await supabase.from('curtidas').insert([{ postagem_id: postId, usuario_id: parseInt(userId) }]);
    }
    revalidatePath('/');
}


export async function createComment(formData: FormData) {
    const userId = (await cookies()).get('user_id')?.value;
    const content = formData.get('content') as string;
    const postId = formData.get('postId') as string;


    if (!userId) return;
    if (!content || content.trim().length === 0) {

        return { error: "O comentário não pode estar vazio." };
    }
    if (content.length > 500) {
        return { error: "Comentário muito longo (max 500 caracteres)." };
    }



    await supabase.from('comentarios').insert([{
        postagem_id: parseInt(postId),
        autor_id: parseInt(userId),
        conteudo: content.trim() // Remove espaços extras
    }]);

    revalidatePath('/');
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
        const { data: community, error: cError } = await supabase
            .from('comunidades')
            .insert([{ nome, descricao, dono_id: parseInt(userId) }])
            .select()
            .single();

        if (cError) throw cError;

        await supabase.from('membros_comunidade').insert([{ comunidade_id: community.id, usuario_id: parseInt(userId) }]);
        await supabase.from('canais').insert([{ community_id: community.id, nome: 'geral' }]);

        revalidatePath('/communities');
        return { success: true };
    } catch (e) {
        return { error: 'Erro ao criar comunidade.' };
    }
}

export async function getCommunityData() {
    const userId = (await cookies()).get('user_id')?.value;

    const { data: all } = await supabase.from('comunidades').select('*, membros_comunidade(usuario_id)');

    const allProcessed = (all || []).map((c: any) => ({
        ...c,
        membros_count: c.membros_comunidade?.length || 0,
        is_member: userId ? c.membros_comunidade?.some((m: any) => m.usuario_id == userId) : false
    }));

    return {
        allCommunities: allProcessed,
        myCommunities: allProcessed.filter((c: any) => c.is_member)
    };
}

export async function joinCommunity(comunidadeId: number) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return;
    await supabase.from('membros_comunidade').insert([{ comunidade_id: comunidadeId, usuario_id: parseInt(userId) }]);
    revalidatePath('/communities');
}

export async function leaveCommunity(comunidadeId: number) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return;
    await supabase.from('membros_comunidade').delete().eq('comunidade_id', comunidadeId).eq('usuario_id', userId);
    revalidatePath('/communities');
}

export async function getCommunityChatData(communityId: number) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return null;

    const { data: community } = await supabase.from('comunidades').select('*').eq('id', communityId).single();
    const { data: channels } = await supabase.from('canais').select('*').eq('community_id', communityId);
    const { data: members } = await supabase.from('membros_comunidade').select('usuarios(id, nome_usuario)').eq('comunidade_id', communityId);

    return {
        community,
        channels: channels || [],
        members: (members || []).map((m: any) => ({
            ...m.usuarios,
            is_owner: m.usuarios.id == community?.dono_id
        })),
        currentUser: { id: parseInt(userId), isOwner: community?.dono_id == userId }
    };
}

export async function getChannelMessages(channelId: number) {
    const { data } = await supabase
        .from('mensagens_chat')
        .select('*, usuarios(nome_usuario)')
        .eq('canal_id', channelId)
        .order('data_envio', { ascending: true });

    return (data || []).map((m: any) => ({ ...m, nome_usuario: m.usuarios?.nome_usuario }));
}

export async function sendMessage(channelId: number, content: string) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return;
    await supabase.from('mensagens_chat').insert([{ canal_id: channelId, autor_id: parseInt(userId), conteudo: content }]);
}

export async function createChannel(communityId: number, channelName: string) {
    const userId = (await cookies()).get('user_id')?.value;
    const { data: community } = await supabase.from('comunidades').select('dono_id').eq('id', communityId).single();
    if (community?.dono_id != userId) return { error: 'Sem permissão' };

    await supabase.from('canais').insert([{
        community_id: communityId,
        nome: channelName.toLowerCase().replace(/\s/g, '-')
    }]);
    revalidatePath(`/communities/${communityId}/chat`);
}

export async function deleteMessage(messageId: number, communityId: number) {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return;
    await supabase.from('mensagens_chat').delete().eq('id', messageId).eq('autor_id', userId);
}