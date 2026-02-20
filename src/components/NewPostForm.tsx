'use client';

import { useState } from 'react';
import { createPost } from '@/app/actions';
import { Upload, Send } from 'lucide-react';

export default function NewPostForm({ onClose }: { onClose?: () => void }) {
    const [imageB64, setImageB64] = useState('');
    const [fileName, setFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('ERRO: Arquivo excede 2MB.');
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageB64(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="p-6 md:p-8 flex-1 flex flex-col h-full bg-transparent">
            <form
                action={async (formData) => {
                    setIsSubmitting(true);
                    await createPost(formData);
                    setIsSubmitting(false);
                    setImageB64('');
                    setFileName('');
                    if (onClose) onClose();
                }}
                className="flex flex-col gap-6 h-full flex-1"
            >
                {/* Título */}
                <input
                    name="title"
                    placeholder="ASSUNTO..."
                    className="bg-transparent border-b-2 border-[#004422] focus:border-[#00ff88] text-white font-bold text-2xl px-0 py-3 outline-none w-full placeholder:text-[#004422] transition-colors"
                    required
                    autoComplete="off"
                    autoFocus
                />


                <div className="flex-1 flex flex-col min-h-[250px]">
                    <textarea
                        name="content"
                        placeholder="Digite o conteúdo do protocolo..."
                        className="w-full h-full bg-transparent text-[#ccffdd] text-xl resize-none outline-none placeholder:text-[#004422] font-mono leading-relaxed"
                        required
                    />
                </div>

                {/* Rodapé */}
                <div className="flex justify-between items-center pt-6 border-t border-[#00ff88]/20 mt-auto">
                    <label className="cursor-pointer flex items-center gap-3 text-[#00ff88] hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-[#00ff88]/10 border border-transparent hover:border-[#00ff88]/30">
                        <Upload size={22} />
                        <span className="text-sm font-bold tracking-wider">{fileName ? 'ANEXADO' : 'MÍDIA'}</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>

                    <input type="hidden" name="image" value={imageB64} />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-cyber !py-3 !px-8 !rounded-full hover:scale-105 transition-transform flex items-center gap-3 text-sm shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                    >
                        <span className="font-bold tracking-widest">{isSubmitting ? 'ENVIANDO...' : 'PUBLICAR'}</span>
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}