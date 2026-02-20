import { getPosts } from './actions';
import PostCard from '@/components/PostCard';
import CreatePostWrapper from '@/components/CreatePostWrapper';
import Header from '@/components/Header';
import { cookies } from 'next/headers';
import LoginForm from '@/components/LoginForm';
import { Activity } from 'lucide-react';

export const runtime = 'edge';

export default async function Page() {
    const userId = (await cookies()).get('user_id')?.value;

    // ---- LOGIN ----
    if (!userId) {
        return (
            <main className="fixed inset-0 w-full h-full bg-black overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="relative z-10 w-full max-w-[400px] px-4">
                    <LoginForm />
                </div>
            </main>
        );
    }

    const posts = await getPosts();

    return (
        <main className="min-h-screen bg-black text-[#00ff88] overflow-x-hidden selection:bg-[#00ff88] selection:text-black">
            <Header />

            <CreatePostWrapper />

            {/* Feed */}
            <div className="pt-6 pb-32 px-4 md:px-8 max-w-4xl mx-auto relative z-10">
                <div className="space-y-8">
                    {posts.map((post: any) => (
                        <PostCard key={post.id} post={post} />
                    ))}

                    {posts.length === 0 && (
                        <div className="mt-16 p-16 text-center border border-dashed border-[#00ff88]/20 bg-[#000a04] rounded-lg">
                            <Activity size={40} className="mx-auto mb-5 text-[#00ff88]/15" />
                            <p className="text-gray-700 font-mono text-xs tracking-[0.4em] uppercase">
                                Nenhum registro no log.
                            </p>
                            <p className="text-[#004422] font-mono text-[10px] tracking-widest mt-2">
                                ▸ Inicie uma transmissão usando o botão abaixo.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
