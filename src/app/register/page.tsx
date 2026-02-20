import RegisterForm from '@/components/RegisterForm';

export const runtime = 'edge';

export const metadata = {
    title: "REGISTER // BLOG.ACERVOBOOK",
};

export default function RegisterPage() {
    return (

        <main className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden">

            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-[450px] px-4">
                <RegisterForm />
            </div>
        </main>
    );
}