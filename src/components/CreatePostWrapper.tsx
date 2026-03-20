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
                            className="relative flex flex-col w-56 overflow-hidden border-2 rounded-sm bg-[#000a04] border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                        >
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00ff88]/80 to-[#00ff88]" />

                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="group flex w-full items-center border-b border-[#00ff88]/20 bg-transparent text-left text-[#00ff88] transition-colors duration-150 hover:bg-[#00ff88] hover:text-black active:bg-[#00ff88]/80"
                            >
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-[#00ff88]/30 transition-colors group-hover:border-black/20">
                                    <Search size={16} className="transition-transform duration-150 group-hover:scale-110" />
                                </span>
                                <span className="flex-1 px-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
                                    Pesquisa
                                </span>
                            </button>

                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="group flex w-full items-center border-b border-[#00ff88]/20 bg-transparent text-left text-[#00ff88] transition-colors duration-150 hover:bg-[#00ff88] hover:text-black active:bg-[#00ff88]/80"
                            >
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-[#00ff88]/30 transition-colors group-hover:border-black/20">
                                    <Filter size={16} className="transition-transform duration-150 group-hover:scale-110" />
                                </span>
                                <span className="flex-1 px-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
                                    Filtro
                                </span>
                            </button>

                            <Link
                                href="/communities"
                                onClick={() => setIsMenuOpen(false)}
                                className="group flex items-center border-b border-[#00ff88]/20 bg-transparent text-[#00ff88] transition-colors duration-150 hover:bg-[#00ff88] hover:text-black active:bg-[#00ff88]/80"
                            >
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-[#00ff88]/30 transition-colors group-hover:border-black/20">
                                    <Users size={16} className="transition-transform duration-150 group-hover:scale-110" />
                                </span>
                                <span className="flex-1 px-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
                                    Comunidade
                                </span>
                            </Link>

                            <Link
                                href="/profile"
                                onClick={() => setIsMenuOpen(false)}
                                className="group flex items-center bg-transparent text-[#00ff88] transition-colors duration-150 hover:bg-[#00ff88] hover:text-black active:bg-[#00ff88]/80"
                            >
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-[#00ff88]/30 transition-colors group-hover:border-black/20">
                                    <User size={16} className="transition-transform duration-150 group-hover:scale-110" />
                                </span>
                                <span className="flex-1 px-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
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
                    className={`flex h-14 w-14 items-center justify-center rounded-sm border-2 transition-all duration-200 ${
                        isMenuOpen
                            ? 'border-[#00ff88] bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.5)]'
                            : 'border-[#00ff88] bg-[#000a04] text-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.2)] hover:bg-[#00ff88]/15'
                    }`}
                >
                    <motion.div animate={{ rotate: isMenuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        {isMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
                    </motion.div>
                </motion.button>

                {/* 3. BOTÃO NOVA TRANSMISSÃO (ESTILIZADO) */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    title="Nova Transmissão"
                    className="group relative flex flex-row-reverse items-center overflow-hidden rounded-sm border-2 border-[#00ff88] bg-[#000a04] text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.3)] cursor-pointer transition-all duration-300 hover:bg-[#00ff88]/10 hover:shadow-[0_0_25px_rgba(0,255,136,0.6)]"
                >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center border-l border-[#00ff88]/40 bg-[#00ff88]/5 transition-colors duration-300 group-hover:bg-[#00ff88] group-hover:text-black">
                        <PenSquare
                            size={22}
                            strokeWidth={2.5}
                            className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                        />
                    </span>
                    <span className="px-5 font-mono text-[12px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
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
                            backgroundColor: 'rgba(0, 5, 2, 0.85)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)'
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
                            className="relative flex flex-col w-[92vw] max-w-3xl min-h-[550px] max-h-[88vh] overflow-hidden border border-[#00ff88]/50 bg-[#000a04] shadow-[0_0_50px_rgba(0,255,136,0.15)]"
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
                                    <div className="w-px h-4 bg-[#00ff88]/30" />
                                    <Terminal size={14} className="text-[#00ff88]" />
                                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#00ff88]/80">
                                        Nova Transmissão // Protocolo Aberto
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#00ff88]/30 bg-transparent text-[#00ff88]/60 transition-all hover:border-[#00ff88] hover:bg-[#00ff88] hover:text-black active:scale-95"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Conteúdo do Form */}
                            <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
                                <NewPostForm onClose={() => setIsOpen(false)} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
