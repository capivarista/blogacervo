'use client';

import { useActionState } from 'react';
import { registerAction } from '@/app/actions';
import { UserPlus, Mail, Lock, User, ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function RegisterForm() {
    const [state, action, isPending] = useActionState(registerAction, undefined);

    return (
        <div className="glass-panel w-full p-8 flex flex-col gap-6 relative overflow-hidden">

            <div className="flex flex-col items-center gap-4">
                <h1 className="text-xl font-bold text-[#00ff88] tracking-[0.2em] uppercase">
                    REGISTRO
                </h1>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                    Solicitação de Acesso
                </p>
            </div>

            {state?.success ? (
                <div className="text-center py-8 flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                    <div className="bg-[#00ff88]/10 border border-[#00ff88] p-4 rounded-full">
                        <UserPlus className="text-[#00ff88]" size={32} />
                    </div>
                    <p className="text-white font-bold tracking-widest text-sm">ACESSO CONCEDIDO</p>
                    <Link
                        href="/"
                        className="btn-cyber w-full mt-4"
                    >
                        <ArrowLeft size={16} /> VOLTAR AO LOGIN
                    </Link>
                </div>
            ) : (
                <form action={action} className="flex flex-col gap-4 w-full">

                    {state?.error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-400 text-xs p-3 font-mono text-center">
                            ERRO: {state.error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-[#00ff88]/40" size={18} />
                            <input
                                name="name"
                                placeholder="CODENAME"
                                className="cyber-field pl-10"
                                required
                                autoComplete="off"
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-[#00ff88]/40" size={18} />
                            <input
                                name="email"
                                type="email"
                                placeholder="EMAIL"
                                className="cyber-field pl-10"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-[#00ff88]/40" size={18} />
                            <input
                                name="password"
                                type="password"
                                placeholder="SENHA"
                                className="cyber-field pl-10"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn-cyber w-full mt-2"
                    >
                        {isPending ? 'PROCESSANDO...' : 'REGISTRAR'}
                    </button>

                    <div className="relative border-t border-[#00ff88]/20 pt-6 mt-2">
                        <Link
                            href="/"
                            className="btn-cyber w-full opacity-80 hover:opacity-100"
                        >
                            <LogIn size={16} /> JÁ TENHO CONTA
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}