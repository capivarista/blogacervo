import { Terminal, LogOut, Radio, Wifi } from 'lucide-react';
import { cookies } from 'next/headers';

async function logoutAction() {
    'use server';
    (await cookies()).delete('user_id');
}

/* ------------------------------------------------- */
export default async function Header() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value; // só para lógica futura

    return (
        <header className="sticky top-0 left-0 w-full z-[9999] isolate">
            {/* Fundo principal*/}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'linear-gradient(180deg, #000000 0%, #000e05 70%, #00140a 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                }}
            />

            {/* Scanlines */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,136,0.012) 3px, rgba(0,255,136,0.012) 4px)',
                }}
            />

            {/* BARRA DE STATUS */}
            <div
                className="relative flex items-center gap-4 px-6 md:px-12 py-2"
                style={{
                    borderBottom: '1px solid rgba(0,255,136,0.12)',
                    background: 'rgba(0,16,6,0.98)',
                }}
            >
        <span className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-[#00ff88]/80 uppercase">
          <Radio size={10} className="animate-pulse text-[#00ff88]" />
          SISTEMA ONLINE
        </span>

                <div className="ml-auto flex items-center gap-2">
                    <Wifi size={10} className="text-[#00ff88]/40" />
                    <span className="hidden text-[10px] font-mono tracking-[0.2em] text-[#00ff88]/50 uppercase sm:inline">
            SECURE CHANNEL // v2.4.1
          </span>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div
                className="relative flex items-center justify-between h-20 px-6 md:px-12"
                style={{ background: 'rgba(0,6,2,0.96)' }}
            >
                {/* LOGO */}
                <div className="flex items-center gap-4 select-none group cursor-default">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#00ff88] rounded-sm blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                        <div
                            className="relative bg-[#00ff88] text-black p-2.5 rounded-sm"
                            style={{ boxShadow: '0 0 20px rgba(0,255,136,0.4)' }}
                        >
                            <Terminal size={24} strokeWidth={3} />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-[0.1em] leading-none font-mono">
              <span className="text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]">
                ACERVO
              </span>
                            <span className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                BOOK
              </span>
                        </h1>
                        <p className="mt-1 text-[10px] font-mono tracking-[0.4em] uppercase text-[#00ff88]/40">
                            Protocolo Seguro
                        </p>
                    </div>
                </div>

                {/* BOTÃO DE LOGOUT */}
                <nav className="flex items-center gap-2">
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="cyber-btn-danger"
                            aria-label="Sair"
                        >
                            <LogOut size={20} />
                            <span className="hidden md:inline">Sair</span>
                        </button>
                    </form>
                </nav>
            </div>


            <div
                aria-hidden="true"
                className="w-full h-px"
                style={{
                    background:
                        'linear-gradient(90deg, transparent 0%, #00ff88 50%, transparent 100%)',
                    boxShadow: '0 0 15px rgba(0,255,136,0.5)',
                    opacity: 0.7,
                }}
            />
        </header>
    );
}
