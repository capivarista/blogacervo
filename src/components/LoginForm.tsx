'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions';
import { Terminal, Lock, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
    const [state, action, isPending] = useActionState(loginAction, undefined);

    return (

        <div className="glass-panel w-full p-8 flex flex-col gap-6 relative overflow-hidden">

            {/* Cabeçalho */}
            <div className="flex flex-col items-center gap-4">
                <div className="bg-[#00ff88]/5 p-3 rounded-full border border-[#00ff88]/30">
                    <Terminal size={32} className="text-[#00ff88]" />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white tracking-[0.2em]">
                        ACERVO<span className="text-[#00ff88]">BOOK</span>
                    </h1>
                    <p className="text-[10px] text-gray-500 font-mono mt-1 tracking-widest uppercase">
                        Sistema de Acesso Restrito
                    </p>
                </div>
            </div>

            {/* Formulário */}
            <form action={action} className="flex flex-col gap-4 w-full">
                {state?.error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 font-mono text-center">
                        PROIBIDO: {state.error}
                    </div>
                )}

                <div className="space-y-4">
                    <input
                        name="email"
                        type="email"
                        placeholder="IDENTIFICADOR (EMAIL)"
                        className="cyber-field"
                        required
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="CHAVE DE ACESSO"
                        className="cyber-field"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="btn-cyber w-full mt-2"
                >
                    <Lock size={16} />
                    {isPending ? 'DECIFRANDO...' : 'INICIAR SESSÃO'}
                </button>
            </form>

            {/* Divisória e Cadastro */}
            <div className="relative border-t border-[#00ff88]/20 pt-6 mt-2">
                <p className="text-[10px] text-gray-500 text-center font-mono mb-4">
                    NÃO POSSUI CREDENCIAIS?
                </p>

                <Link
                    href="/register"
                    className="btn-cyber w-full opacity-90 hover:opacity-100"
                >
                    <UserPlus size={16} />
                    REGISTRAR NOVO NÓ
                </Link>
            </div>
        </div>
    );
}