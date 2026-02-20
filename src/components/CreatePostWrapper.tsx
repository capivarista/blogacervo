'use client';

import { useState, useEffect, useRef } from 'react';
import { PenSquare, X, Terminal, Menu, Search, Filter, Users, User } from 'lucide-react';
import NewPostForm from '@/components/NewPostForm';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

export default function CreatePostWrapper() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);


    useEffect(() => {
        if (!isMenuOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);


    if (!mounted) return null;

    return (
        <>

            <div
                ref={menuRef}
                className="flex flex-col items-end gap-4"
                style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    zIndex: 99990
                }}
            >
                {/* 1. MENU EXPANSÍVEL */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="flex flex-col bg-[#000a04] border-2 border-[#00ff88] shadow-[0_0_40px_rgba(0,255,136,0.4)] overflow-hidden w-56 rounded-sm relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00ff88]/80 to-[#00ff88]" />

                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="group flex items-center bg-transparent text-[#00ff88] hover:text-black hover:bg-[#00ff88] active:bg-[#00cc66] transition-colors duration-150 border-b border-[#00ff88]/20 w-full text-left"
                            >
                                <span className="flex items-center justify-center w-12 h-12 shrink-0 border-r border-[#00ff88]/30 group-hover:border-black/20 transition-colors">
                                    <Search size={16} className="transition-transform duration-150 group-hover:scale-110" />
                                </span>
                                <span className="flex-1 px-4 font-mono text-[11px] font-bold tracking-[0.2em] uppercase">
                                    Pesquisa
                                </span>
                            </button>

                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="group flex items-center bg-transparent text-[#00ff88] hover:text-black hover:bg-[#00ff88] active:bg-[#00cc66] transition-colors duration-150 border-b border-[#00ff88]/20 w-full text-left"
                            >
                                <span className="flex items-center justify-center w-12 h-12 shrink-0 border-r border-[#00ff88]/30 group-hover:border-black/20 transition-colors">
                                    <Filter size={16} className="transition-transform duration-150 group-hover:scale-110" />
                                </span>
                                <span className="flex-1 px-4 font-mono text-[11px] font-bold tracking-[0.2em] uppercase">
                                    Filtro
                                </span>
                            </button>

                            <Link
                                href="/communities"
                                onClick={() => setIsMenuOpen(false)}
                                className="group flex items-center bg-transparent text-[#00ff88] hover:text-black hover:bg-[#00ff88] active:bg-[#00cc66] transition-colors duration-150 border-b border-[#00ff88]/20"
                            >
                                <span className="flex items-center justify-center w-12 h-12 shrink-0 border-r border-[#00ff88]/30 group-hover:border-black/20 transition-colors">
                                    <Users size={16} className="transition-transform duration-150 group-hover:scale-110" />
                                </span>
                                <span className="flex-1 px-4 font-mono text-[11px] font-bold tracking-[0.2em] uppercase">
                                    Comunidade
                                </span>
                            </Link>

                            <Link
                                href="/profile"
                                onClick={() => setIsMenuOpen(false)}
                                className="group flex items-center bg-transparent text-[#00ff88] hover:text-black hover:bg-[#00ff88] active:bg-[#00cc66] transition-colors duration-150"
                            >
                                <span className="flex items-center justify-center w-12 h-12 shrink-0 border-r border-[#00ff88]/30 group-hover:border-black/20 transition-colors">
                                    <User size={16} className="transition-transform duration-150 group-hover:scale-110" />
                                </span>
                                <span className="flex-1 px-4 font-mono text-[11px] font-bold tracking-[0.2em] uppercase">
                                    Perfil
                                </span>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. BOTÃO HAMBÚRGUER */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    title="Acessar Menu"
                    className={`flex items-center justify-center w-14 h-14 rounded-sm border-2 transition-all duration-200 ${
                        isMenuOpen
                            ? 'bg-[#00ff88] text-black border-[#00ff88] shadow-[0_0_30px_rgba(0,255,136,0.7)]'
                            : 'bg-[#000a04] text-[#00ff88] border-[#00ff88] shadow-[0_0_18px_rgba(0,255,136,0.3)] hover:bg-[#00ff88]/15'
                    }`}
                >
                    <motion.div animate={{ rotate: isMenuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        {isMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
                    </motion.div>
                </motion.button>

                {/* 3. BOTÃO NOVA TRANSMISSÃO */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    title="Nova Transmissão"
                    className="relative flex flex-row-reverse items-center bg-[#000a04] border-2 border-[#00ff88] rounded-sm shadow-[0_0_24px_rgba(0,255,136,0.4)] cursor-pointer group hover:bg-[#00ff88]/10 transition-all duration-200 overflow-hidden"
                >
                    <span className="flex items-center justify-center w-14 h-14 shrink-0 border-l border-[#00ff88]/40 bg-[#00ff88]/5 group-hover:bg-[#00ff88]/15 transition-colors duration-200">
                        <PenSquare
                            size={22}
                            strokeWidth={2.5}
                            className="text-[#00ff88] group-hover:rotate-12 transition-transform duration-200"
                        />
                    </span>
                    <span className="px-5 font-mono font-bold text-[12px] tracking-[0.2em] uppercase whitespace-nowrap text-[#00ff88]">
                        Nova Transmissão
                    </span>
                </motion.button>
            </div>


            {/* -- MODAL DE NOVA POSTAGEM -- */}
            <AnimatePresence>
                {isOpen && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            zIndex: 99999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0, 5, 2, 0.65)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)'
                        }}
                    >
                        {/* Camada invisível para fechar ao clicar fora */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{ position: 'absolute', inset: 0 }}
                        />

                        {/* JANELA DO MODAL */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className="relative flex flex-col w-[92vw] max-w-3xl min-h-[550px] max-h-[88vh] bg-[#000a04]/98 border border-[#00ff88]/50 shadow-[0_0_100px_rgba(0,255,136,0.15)] overflow-hidden"
                            style={{
                                clipPath: 'polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px))',
                                zIndex: 100000
                            }}
                        >
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00ff88] to-transparent shadow-[0_0_10px_2px_rgba(0,255,136,0.8)]" />

                            {/* Cabeçalho do Modal */}
                            <div className="flex items-center justify-between p-3 px-6 border-b border-[#00ff88]/15 bg-[#001408]/90">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]/80" />
                                    </div>
                                    <div className="w-px h-4 bg-[#003311]" />
                                    <Terminal size={14} className="text-[#00ff88]" />
                                    <span className="font-mono font-bold text-[10px] tracking-[0.2em] uppercase text-[#00ff88]/80">
                                        Nova Transmissão // Protocolo Aberto
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center border border-[#004422] text-[#00ff88]/60 hover:text-black hover:border-[#00ff88] hover:bg-[#00ff88] active:scale-95 transition-all bg-transparent rounded-sm"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Conteúdo do Form */}
                            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                                <NewPostForm onClose={() => setIsOpen(false)} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}