'use client';

import { useState } from 'react';
import { Search, Users, Plus, Shield, LogOut, LogIn, MessageSquare } from 'lucide-react';
import { createCommunity, joinCommunity, leaveCommunity } from '@/app/actions';
import Link from 'next/link';

export default function CommunityInterface({ allData, myData }: { allData: any[], myData: any[] }) {
    const [activeTab, setActiveTab] = useState<'all' | 'my'>('my');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);


    const filteredList = (activeTab === 'all' ? allData : myData).filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full">

            {/* --- CONTROLES SUPERIORES --- */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center mb-8">

                {/* Abas */}
                <div className="flex bg-[#002211] p-1 rounded border border-[#00ff88]/30">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`px-4 py-2 text-xs font-mono font-bold transition-all flex items-center gap-2 ${activeTab === 'my' ? 'bg-[#00ff88] text-black shadow-[0_0_10px_#00ff88]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Shield size={14} /> MEUS CLÃS
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-xs font-mono font-bold transition-all flex items-center gap-2 ${activeTab === 'all' ? 'bg-[#00ff88] text-black shadow-[0_0_10px_#00ff88]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Users size={14} /> REDE GLOBAL
                    </button>
                </div>

                {/* Busca e Criar */}
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-[#00ff88]/50" size={16} />
                        <input
                            placeholder="LOCALIZAR CLÃ..."
                            className="cyber-field pl-9 py-2 text-sm rounded-none border-[#00ff88]/30"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="btn-cyber !py-2 !px-3"
                        title="Criar Novo Clã"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            {/* --- FORMULÁRIO DE CRIAÇÃO (Toggle) --- */}
            {showCreateForm && (
                <div className="glass-panel mb-8 border-l-4 border-l-[#00ff88] animate-in slide-in-from-top-4">
                    <h3 className="text-[#00ff88] font-bold mb-4">INICIAR NOVO PROTOCOLO DE GRUPO</h3>
                    <form action={async (formData) => {
                        await createCommunity(formData);
                        setShowCreateForm(false);
                    }} className="flex flex-col gap-4">
                        <input name="nome" placeholder="NOME DO CLÃ (ÚNICO)" className="cyber-field" required maxLength={30} />
                        <textarea name="descricao" placeholder="DIRETRIZES E OBJETIVOS..." className="cyber-field h-24" required />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowCreateForm(false)} className="text-xs text-gray-500 hover:text-white px-4 py-2">CANCELAR</button>
                            <button type="submit" className="btn-cyber">FUNDAR CLÃ</button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- LISTA DE CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredList.map((com) => (
                    <div key={com.id} className="glass-panel p-0 overflow-hidden flex flex-col h-full group hover:border-[#00ff88] transition-colors">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-xl font-bold text-white group-hover:text-[#00ff88] transition-colors">{com.nome}</h4>
                                {com.is_member && <span className="text-[10px] bg-[#00ff88]/20 text-[#00ff88] px-2 py-1 rounded border border-[#00ff88]/30">MEMBRO</span>}
                            </div>
                            <p className="text-gray-400 text-xs font-mono mb-4 line-clamp-3">
                                {com.descricao}
                            </p>
                            <div className="text-[10px] text-gray-500 font-mono">
                                MEMBROS: {com.membros_count} | ID: #{com.id.toString().padStart(4, '0')}
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="p-3 bg-black/40 border-t border-[#00ff88]/20 flex justify-end gap-2">
                            {com.is_member ? (
                                <>
                                    {/* BOTÃO DE CHAT */}
                                    <Link
                                        href={`/communities/${com.id}/chat`}
                                        className="text-xs bg-[#00ff88] text-black hover:bg-[#00ff88]/80 flex items-center gap-2 px-3 py-1 rounded transition-all font-bold"
                                    >
                                        <MessageSquare size={12} /> ACESSAR CHAT
                                    </Link>

                                    <button
                                        onClick={() => leaveCommunity(com.id)}
                                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-3 py-1 hover:bg-red-900/20 rounded transition-all border border-transparent hover:border-red-900/30"
                                    >
                                        <LogOut size={12} /> SAIR
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => joinCommunity(com.id)}
                                    className="text-xs bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88] hover:text-black border border-[#00ff88]/50 flex items-center gap-2 px-4 py-1 rounded transition-all font-bold"
                                >
                                    <LogIn size={12} /> JUNTAR-SE
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {filteredList.length === 0 && (
                    <div className="col-span-full text-center py-12 border border-dashed border-[#00ff88]/30 rounded">
                        <p className="text-gray-500 font-mono">NENHUM CLÃ ENCONTRADO NESTE SETOR.</p>
                    </div>
                )}
            </div>
        </div>
    );
}