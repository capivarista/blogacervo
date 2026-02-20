import { getCommunityData } from '@/app/actions';
import CommunityInterface from '@/components/CommunityInterface';
import { Network } from 'lucide-react';
import Link from 'next/link';

export const runtime = 'edge';

export const metadata = {
    title: "COMMUNITIES // BLOG.ACERVOBOOK",
};

export default async function CommunitiesPage() {
    const { allCommunities, myCommunities } = await getCommunityData();

    return (
        <main className="min-h-screen p-4 md:p-8 relative bg-black text-[#00ff88]">

            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">

                <header className="mb-8 border-b border-[#00ff88]/20 pb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Network className="text-[#00ff88]" />
                            COMUNIDADES <span className="text-gray-600 text-lg font-mono">v1.0</span>
                        </h1>
                        <p className="text-xs text-gray-500 font-mono mt-1">NÓDULOS DE CONEXÃO E GRUPOS DE INTERESSE</p>
                    </div>

                    <Link href="/" className="btn-cyber text-xs">
                        &lt; VOLTAR AO FEED
                    </Link>
                </header>


                <CommunityInterface allData={allCommunities} myData={myCommunities} />
            </div>
        </main>
    );
}