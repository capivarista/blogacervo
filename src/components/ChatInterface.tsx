'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Hash, Trash2, Plus, User, ShieldAlert, MoreVertical } from 'lucide-react';
import { getChannelMessages, sendMessage, createChannel, deleteMessage } from '@/app/actions';

interface ChatProps {
    communityId: number;
    initialData: {
        community: any;
        channels: any[];
        members: any[];
        currentUser: { id: number; isOwner: boolean };
    };
}

export default function ChatInterface({ communityId, initialData }: ChatProps) {
    const [activeChannel, setActiveChannel] = useState(initialData.channels[0]?.id || null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [channels, setChannels] = useState(initialData.channels);
    const [showNewChannelForm, setShowNewChannelForm] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [loadingMsg, setLoadingMsg] = useState(false);

    // Auto-scroll para baixo
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    useEffect(() => {
        if (!activeChannel) return;

        const fetchMsgs = async () => {
            const msgs = await getChannelMessages(activeChannel);
            setMessages(msgs);
        };

        fetchMsgs();
        const interval = setInterval(fetchMsgs, 3000);

        return () => clearInterval(interval);
    }, [activeChannel]);


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChannel) return;

        setLoadingMsg(true);
        const tempMsg = {
            id: Math.random(),
            conteudo: newMessage,
            nome_usuario: 'Você',
            autor_id: initialData.currentUser.id,
            data_envio: new Date().toISOString(),
            sending: true
        };
        setMessages([...messages, tempMsg]);
        const msgToSend = newMessage;
        setNewMessage('');

        await sendMessage(activeChannel, msgToSend);


        const updated = await getChannelMessages(activeChannel);
        setMessages(updated);
        setLoadingMsg(false);
    };

    const handleDelete = async (msgId: number) => {
        if(confirm('Apagar esta mensagem?')) {
            await deleteMessage(msgId, communityId);
            const updated = await getChannelMessages(activeChannel);
            setMessages(updated);
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
                    {channels.map((channel: any) => (
                        <button
                            key={channel.id}
                            onClick={() => setActiveChannel(channel.id)}
                            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm font-mono transition-colors ${
                                activeChannel === channel.id
                                    ? 'bg-[#00ff88]/20 text-[#00ff88]'
                                    : 'text-gray-400 hover:bg-[#00ff88]/5 hover:text-gray-200'
                            }`}
                        >
                            <Hash size={14} /> {channel.nome}
                        </button>
                    ))}
                </div>

                {/* Botão Criar Canal */}
                {initialData.currentUser.isOwner && (
                    <div className="p-2 border-t border-[#00ff88]/20">
                        {showNewChannelForm ? (
                            <form action={async (formData) => {
                                const name = formData.get('name') as string;
                                if(name) {
                                    await createChannel(communityId, name);
                                    setShowNewChannelForm(false);
                                    // Hack simples para recarregar a página e pegar o canal novo
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
                        {channels.find((c: any) => c.id === activeChannel)?.nome || 'Selecione um canal'}
                    </span>
                </div>

                {/* Lista de Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#00ff88]/30">
                    {messages.map((msg) => {
                        const isMe = msg.autor_id === initialData.currentUser.id;
                        const canDelete = initialData.currentUser.isOwner || isMe;

                        return (
                            <div key={msg.id} className={`group flex gap-3 ${msg.sending ? 'opacity-50' : ''}`}>
                                <div className="w-8 h-8 rounded bg-[#00ff88]/10 flex items-center justify-center shrink-0 border border-[#00ff88]/30">
                                    <User size={14} className="text-[#00ff88]" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold ${isMe ? 'text-[#00ff88]' : 'text-gray-300'}`}>
                                            {msg.nome_usuario}
                                        </span>
                                        <span className="text-[10px] text-gray-600">
                                            {new Date(msg.data_envio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 font-mono break-all whitespace-pre-wrap mt-1">
                                        {msg.conteudo}
                                    </p>
                                </div>

                                {canDelete && !msg.sending && (
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-opacity self-start"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-black/60 border-t border-[#00ff88]/20">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Enviar mensagem em #${channels.find((c: any) => c.id === activeChannel)?.nome}...`}
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

            {/* --- COLUNA 3: MEMBROS*/}
            <div className="w-60 border-l border-[#00ff88]/20 hidden lg:flex flex-col bg-black/50">
                <div className="p-4 border-b border-[#00ff88]/20">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">MEMBROS ONLINE</h3>
                </div>
                <div className="p-2 space-y-1 overflow-y-auto">
                    {initialData.members.map((member: any) => (
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