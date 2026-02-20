import { getCommunityChatData } from '@/app/actions';
import ChatInterface from '@/components/ChatInterface';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const runtime = 'edge';

export const metadata = {
    title: "CHAT // BLOG.ACERVOBOOK",
};


export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {


    const { id } = await params;


    const data = await getCommunityChatData(parseInt(id));

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-[#00ff88] bg-black">
                <h1 className="text-2xl font-bold mb-4">ACESSO NEGADO</h1>
                <p className="mb-4 text-gray-400">Você não é membro desta comunidade ou ela não existe.</p>
                <Link href="/communities" className="btn-cyber">VOLTAR</Link>
            </div>
        )
    }

    return (
        <main className="h-screen flex flex-col p-4 bg-black overflow-hidden relative">

            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            <header className="mb-4 flex items-center gap-4 z-10">
                <Link href="/communities" className="text-[#00ff88] hover:text-white transition-colors">
                    <ArrowLeft />
                </Link>
                <h1 className="text-xl font-bold text-white tracking-widest">
                    ACERVO // CHAT // <span className="text-[#00ff88]">{data.community.nome.toUpperCase()}</span>
                </h1>
            </header>

            <div className="flex-1 z-10">
                <ChatInterface communityId={parseInt(id)} initialData={data} />
            </div>
        </main>
    );
}