'use client';

import { useState } from 'react';
import { likePost, createComment, deletePost } from '@/app/actions';
import { Heart, MessageSquare, Trash2, Send, User, ChevronDown, ChevronUp } from 'lucide-react';

interface Comment {
    id: number;
    conteudo: string;
    nome_usuario: string;
}

interface Post {
    id: number;
    titulo: string;
    conteudo: string;
    imagem_url?: string;
    nome_usuario: string;
    likes_count: number;
    data_criacao: string;
    comentarios: Comment[];
    current_user_is_admin: boolean;
}

export default function PostCard({ post }: { post: Post }) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const formattedDate = new Date(post.data_criacao).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        await likePost(post.id);
        setIsLiking(false);
    };

    const handleDelete = async () => {
        if (!confirm('Confirmar exclusão do registro?')) return;
        setIsDeleting(true);
        await deletePost(post.id);
        setIsDeleting(false);
    };

    return (
        <article
            className={`relative overflow-hidden transition-all duration-300 bg-[#000a04] border border-[#00ff88]/25 hover:border-[#00ff88]/55 shadow-[0_0_20px_rgba(0,255,136,0.04),inset_0_0_40px_rgba(0,255,136,0.02)] hover:shadow-[0_0_35px_rgba(0,255,136,0.1),inset_0_0_40px_rgba(0,255,136,0.03)] ${
                isDeleting ? 'opacity-30 pointer-events-none scale-[0.98]' : ''
            }`}
            style={{
                clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))',
            }}
        >
            <div
                aria-hidden="true"
                className="absolute top-0 right-0 pointer-events-none z-10 w-[18px] h-[18px] border-b border-l border-[#00ff88]/35"
            />

            {/* ── HEADER DO CARD ── */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#001408]/60 border-b border-[#00ff88]/10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 shrink-0 bg-[#001a0a] border border-[#00ff88]/30 rounded-sm">
                        <User size={14} className="text-[#00ff88]/60" />
                    </div>
                    <div>
                        <span className="text-[11px] font-mono font-bold tracking-[0.18em] uppercase block text-[#00ff88]/90">
                            {post.nome_usuario}
                        </span>
                        <span className="text-[9px] font-mono tracking-wider text-[#004422]/90">
                            ▸ {formattedDate}
                        </span>
                    </div>
                </div>

                {/* BOTÃO DA LIXEIRA (deu tanto erro) */}
                {post.current_user_is_admin && (
                    <button
                        onClick={handleDelete}
                        title="Deletar Registro"
                        className="flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-200 rounded-sm cursor-pointer bg-transparent border border-[#ff3333]/50 text-[#ff3333] hover:bg-[#ff3333] hover:text-black hover:border-[#ff3333] shadow-[0_0_10px_rgba(255,51,51,0.15)]"
                    >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">Del</span>
                    </button>
                )}
            </div>

            {/* ── IMAGEM ── */}
            {post.imagem_url && (
                <div className="cyber-image-container w-full bg-black border-b border-[#00ff88]/15">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={post.imagem_url}
                        alt={post.titulo}
                        className="cyber-image-filter w-full h-auto block max-h-[600px] object-contain object-center"
                    />
                </div>
            )}

            {/* ── CORPO ── */}
            <div className="px-5 pt-5 pb-3">
                <h2 className="text-base md:text-lg font-black font-mono tracking-[0.06em] leading-snug mb-3 uppercase text-white">
                    <span className="text-[#00ff88]/40 mr-2 font-normal">//</span>
                    {post.titulo}
                </h2>
                <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words text-[#88ccaa]/80">
                    {post.conteudo}
                </p>
            </div>

            {/* ── RODAPÉ ── */}
            <div className="px-5 py-4 mt-1 flex items-center gap-4 border-t border-[#00ff88]/10 bg-[#001105]/50">
                <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className="flex items-center gap-2 px-4 py-2 font-mono text-[11px] tracking-[0.12em] uppercase rounded-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 border border-[#00ff88]/40 text-[#00ff88] bg-transparent hover:bg-[#00ff88]/20 hover:border-[#00ff88] hover:shadow-[0_0_10px_rgba(0,255,136,0.2)]"
                >
                    <Heart
                        size={14}
                        className={post.likes_count > 0 ? 'fill-[#00ff88]/20' : ''}
                    />
                    <span>{post.likes_count}</span>
                </button>

                <button
                    onClick={() => setShowComments((v) => !v)}
                    className={`flex items-center gap-2 px-4 py-2 font-mono text-[11px] tracking-[0.12em] uppercase rounded-sm cursor-pointer transition-all duration-200 border bg-transparent ${
                        showComments
                            ? 'border-[#00ff88] bg-[#00ff88]/20 text-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.2)]'
                            : 'border-[#00ff88]/40 text-[#00ff88] hover:bg-[#00ff88]/20 hover:border-[#00ff88] hover:shadow-[0_0_10px_rgba(0,255,136,0.2)]'
                    }`}
                >
                    <MessageSquare size={14} />
                    <span>{post.comentarios.length}</span>
                    {showComments
                        ? <ChevronUp size={12} className="ml-1" />
                        : <ChevronDown size={12} className="ml-1" />
                    }
                </button>

                <div className="flex-1 h-px bg-[#002211]" />
                <span className="text-[8px] font-mono tracking-widest select-none text-[#004422]">
                    ID::{String(post.id).padStart(6, '0')}
                </span>
            </div>

            {/* ── COMENTÁRIOS ── */}
            {showComments && (
                <div className="border-t border-[#00ff88]/20 bg-[#000a04]">
                    {post.comentarios.length > 0 ? (
                        <div className="px-5 py-4 space-y-4 max-h-52 overflow-y-auto custom-scrollbar">
                            {post.comentarios.map((c) => (
                                <div key={c.id} className="flex gap-3">
                                    <div className="flex items-center justify-center w-6 h-6 shrink-0 mt-0.5 bg-[#001408] border border-[#00ff88]/30 rounded-sm">
                                        <User size={12} className="text-[#00ff88]/60" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-mono font-bold uppercase tracking-wider mr-2 text-[#00ff88]">
                                            {c.nome_usuario}
                                        </span>
                                        <span className="text-xs font-mono leading-relaxed text-[#ccffdd]/80">
                                            {c.conteudo}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="px-5 py-4 text-xs font-mono italic tracking-wider text-[#004422]">
                            ▸ sem respostas no log...
                        </p>
                    )}

                    <form
                        action={async (formData: FormData) => {
                            await createComment(formData);
                            setCommentText('');
                        }}
                        className="flex items-center border-t border-[#00ff88]/20"
                    >
                        <input type="hidden" name="postId" value={post.id} />
                        <span className="pl-4 font-mono text-sm select-none text-[#00ff88]/50">▸</span>
                        <input
                            name="content"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="INSERIR RESPOSTA..."
                            className="flex-1 bg-transparent px-3 py-4 font-mono text-xs outline-none text-[#ccffdd] placeholder:text-[#004422]"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className="flex items-center justify-center px-6 py-4 transition-colors duration-150 cursor-pointer border-l border-[#00ff88]/20 text-[#00ff88] bg-transparent hover:bg-[#00ff88]/25 active:bg-[#00ff88]/35 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}
        </article>
    );
}