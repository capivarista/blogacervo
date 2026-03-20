'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Hash, Trash2, Plus, User, ShieldAlert } from 'lucide-react';
import { getChannelMessages, sendMessage, createChannel, deleteMessage } from '@/app/actions';
import { ChatMessage, Channel } from '@/types';
import { createClient } from '@/lib/supabase-client';
const supabase = createClient();

// Defining props based on what is actually passed from the server
interface ChatMember {
    id: number;
    nome_usuario: string;
    is_owner: boolean;
}

interface ChatProps {
    communityId: number;
    initialData: {
        community: { nome: string; dono_id: number };
        channels: { id: number; nome: string }[];
        members: ChatMember[];
        currentUser: { id: number; isOwner: boolean };
    };
}

export default function ChatInterface({ communityId, initialData }: ChatProps) {
    // Map initial data to strict Channel type
    const [channels] = useState<Channel[]>(
        initialData.channels.map((c) => ({
            id: c.id,
            community_id: communityId,
            name: c.nome,
            slug: c.nome.toLowerCase().replace(/\s+/g, '-'),
            description: null,
            type: 'text',
            created_at: new Date().toISOString()
        }))
    );

    const [activeChannel, setActiveChannel] = useState<number | null>(channels[0]?.id || null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showNewChannelForm, setShowNewChannelForm] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState(false);
    
    // Members state (initially from props)
    const [members] = useState<ChatMember[]>(initialData.members);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll function
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Load messages and subscribe to Realtime changes
    useEffect(() => {
        if (!activeChannel) return;

        const fetchMsgs = async () => {
            const msgs = await getChannelMessages(activeChannel);
            // Map DB response to ChatMessage type
            const mapped: ChatMessage[] = msgs.map((m: any) => ({
                id: m.id,
                channel_id: m.canal_id,
                user_id: String(m.autor_id),
                content: m.conteudo,
                created_at: m.data_envio,
                updated_at: null,
                user_name: m.nome_usuario || 'Desconhecido',
                user_avatar_url: null
            }));
            setMessages(mapped);
        };

        fetchMsgs();

        // Subscribe to Supabase Realtime
        const channelSubscription = supabase
            .channel(`chat_room:${activeChannel}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for INSERT and DELETE
                    schema: 'public',
                    table: 'mensagens_chat',
                    filter: `canal_id=eq.${activeChannel}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newRecord = payload.new;
                        
                        // Find author to display name immediately
                        const author = members.find(m => m.id === newRecord.autor_id);
                        const userName = author ? author.nome_usuario : '...';

                        const newMsg: ChatMessage = {
                            id: newRecord.id,
                            channel_id: newRecord.canal_id,
                            user_id: String(newRecord.autor_id),
                            content: newRecord.conteudo,
                            created_at: newRecord.data_envio,
                            updated_at: null,
                            user_name: userName,
                            user_avatar_url: null
                        };

                        setMessages((prev) => {
                             // Avoid duplicates from optimistic updates or double events
                             if (prev.some(m => m.id === newMsg.id)) return prev;
                             return [...prev, newMsg];
                        });
                        
                        // Scroll to bottom
                        setTimeout(scrollToBottom, 100);

                    } else if (payload.eventType === 'DELETE') {
                        setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channelSubscription);
        };
    }, [activeChannel, members]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChannel) return;

        setLoadingMsg(true);
        const currentUserId = String(initialData.currentUser.id);

        // Optimistic UI Update
        const tempId = Date.now();
        const tempMsg: ChatMessage = {
            id: tempId,
            channel_id: activeChannel,
            user_id: currentUserId,
            content: newMessage,
            created_at: new Date().toISOString(),
            updated_at: null,
            user_name: 'Você',
            user_avatar_url: null
        };

        setMessages((prev) => [...prev, tempMsg]);
        const msgToSend = newMessage;
        setNewMessage('');

        await sendMessage(activeChannel, msgToSend);
        
        // Refresh to ensure synchronization and get real IDs
        const updatedRaw = await getChannelMessages(activeChannel);
        const updatedMapped: ChatMessage[] = updatedRaw.map((m: any) => ({
            id: m.id,
            channel_id: m.canal_id,
            user_id: String(m.autor_id),
            content: m.conteudo,
            created_at: m.data_envio,
            updated_at: null,
            user_name: m.nome_usuario || 'Desconhecido',
            user_avatar_url: null
        }));
        setMessages(updatedMapped);
        setLoadingMsg(false);
    };

    const handleDelete = async (msgId: number) => {
        if(confirm('Apagar esta mensagem?')) {
            // Optimistic Delete
            setMessages(prev => prev.filter(m => m.id !== msgId));
            await deleteMessage(msgId, communityId);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] border border-[#00ff88]/30 bg-black/80 rounded overflow-hidden shadow-[0_0_30px_rgba(0,255,136,0.1)]">

            {/* --- COLUNA 1: CANAIS --- */}
            <div className="w-64 border-r border-[#00ff88]/20 flex flex-col bg-black/50">
                <div className="p-4 border-b border-[#00ff88]/20">
                    <h2 className="font-bold text-[#00ff88] truncate">{initialData.community.nome}</h2>
                    <p className="text-[10px] text-gray-500 font-mono">SERVER ID: {communityId}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {channels.map((channel) => (
                        <button
                            key={channel.id}
                            onClick={() => setActiveChannel(channel.id)}
                            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm font-mono transition-colors ${
                                activeChannel === channel.id
                                    ? 'bg-[#00ff88]/20 text-[#00ff88]'
                                    : 'text-gray-400 hover:bg-[#00ff88]/5 hover:text-gray-200'
                            }`}
                        >
                            <Hash size={14} /> {channel.name}
                        </button>
                    ))}
                </div>

                {/* Botão Criar Canal (Apenas Owner) */}
                {initialData.currentUser.isOwner && (
                    <div className="p-2 border-t border-[#00ff88]/20">
                        {showNewChannelForm ? (
                            <form action={async (formData) => {
                                const name = formData.get('name') as string;
                                if(name) {
                                    await createChannel(communityId, name);
                                    setShowNewChannelForm(false);
                                    window.location.reload();
                                }
                            }} className="flex gap-1">
                                <input name="name" className="cyber-field !py-1 !px-2 text-xs" placeholder="nome-canal" autoFocus />
                                <button type="submit" className="text-[#00ff88]"><Plus size={16}/></button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowNewChannelForm(true)}
                                className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-[#00ff88] py-2 border border-dashed border-gray-700 hover:border-[#00ff88]"
                            >
                                <Plus size={12} /> NOVO CANAL
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* --- COLUNA 2: CHAT --- */}
            <div className="flex-1 flex flex-col bg-black/20 relative">
                {/* Header do Chat */}
                <div className="h-14 border-b border-[#00ff88]/20 flex items-center px-4 bg-black/40">
                    <Hash size={20} className="text-[#00ff88] mr-2" />
                    <span className="font-bold text-white">
                        {channels.find(c => c.id === activeChannel)?.name || 'Selecione um canal'}
                    </span>
                </div>

                {/* Lista de Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#00ff88]/30">
                    {messages.map((msg) => {
                        const isMe = msg.user_id === String(initialData.currentUser.id);
                        const canDelete = initialData.currentUser.isOwner || isMe;

                        return (
                            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`group flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center border ${
                                        isMe 
                                        ? 'bg-[#00ff88]/20 border-[#00ff88]' 
                                        : 'bg-black/40 border-[#00ff88]/30'
                                    }`}>
                                        <User size={14} className={isMe ? 'text-[#00ff88]' : 'text-gray-400'} />
                                    </div>

                                    {/* Conteúdo da Mensagem */}
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold ${isMe ? 'text-[#00ff88]' : 'text-gray-300'}`}>
                                                {msg.user_name}
                                            </span>
                                            <span className="text-[10px] text-gray-600">
                                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        
                                        <div className={`relative px-4 py-2 rounded border transition-colors ${
                                            isMe 
                                                ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-gray-100' 
                                                : 'bg-[#000a04]/80 border-[#00ff88]/10 text-gray-300'
                                        }`}>
                                            <p className="text-sm font-mono break-all whitespace-pre-wrap">
                                                {msg.content}
                                            </p>

                                            {/* Botão de Excluir */}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(msg.id)}
                                                    className={`absolute -top-2 ${isMe ? '-left-2' : '-right-2'} opacity-0 group-hover:opacity-100 p-1 bg-black border border-red-500/50 rounded-full text-red-500 hover:text-red-400 transition-all z-10`}
                                                    title="Excluir mensagem"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Área de Input */}
                <div className="p-4 bg-black/60 border-t border-[#00ff88]/20">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Enviar mensagem em #${channels.find(c => c.id === activeChannel)?.name}...`}
                            className="w-full bg-black border border-[#00ff88]/30 rounded p-3 pr-12 text-gray-300 focus:outline-none focus:border-[#00ff88] font-mono text-sm"
                            disabled={!activeChannel}
                        />
                        <button
                            type="submit"
                            disabled={loadingMsg || !activeChannel}
                            className="absolute right-2 top-2 p-1 text-[#00ff88] hover:text-white disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>

            {/* --- COLUNA 3: MEMBROS --- */}
            <div className="w-60 border-l border-[#00ff88]/20 hidden lg:flex flex-col bg-black/50">
                <div className="p-4 border-b border-[#00ff88]/20">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">MEMBROS ONLINE</h3>
                </div>
                <div className="p-2 space-y-1 overflow-y-auto">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 p-2 hover:bg-[#00ff88]/5 rounded cursor-default group">
                            <div className={`w-2 h-2 rounded-full ${member.is_owner ? 'bg-yellow-400' : 'bg-[#00ff88]'}`}></div>
                            <span className={`text-sm font-mono truncate ${member.is_owner ? 'text-yellow-400' : 'text-gray-300'}`}>
                                {member.nome_usuario}
                            </span>
                            {member.is_owner && <ShieldAlert size={12} className="text-yellow-400 ml-auto" />}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}