'use client';

import { useState, ChangeEvent } from 'react';
import { createPost } from '@/app/actions';
import { Upload, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function NewPostForm({ onClose }: { onClose?: () => void }) {
    const [imageB64, setImageB64] = useState('');
    const [fileName, setFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('ERRO: Arquivo excede 2MB.');
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
                    try {
                        await createPost(formData);
                        toast.success('Protocolo registrado com sucesso.');
                    } catch (error) {
                        toast.error('Falha ao registrar protocolo.');
                    }
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
                    className="w-full px-4 py-3 text-2xl font-bold text-white transition-colors bg-[#00ff88]/5 border-b-2 outline-none border-cyber-border-dark focus:border-cyber-primary placeholder:text-gray-600"
                    required
                    autoComplete="off"
                    autoFocus
                />


                <div className="flex-1 flex flex-col min-h-[250px]">
                    <textarea
                        name="content"
                        placeholder="Digite o conteúdo do protocolo..."
                        className="w-full h-full text-xl font-mono leading-relaxed bg-[#00ff88]/5 outline-none resize-none text-white placeholder:text-gray-600"
                        required
                    />
                </div>

                {/* Rodapé */}
                <div className="flex items-center justify-between pt-6 mt-auto border-t border-cyber-primary/20">
                    <label className="flex items-center gap-3 px-4 py-3 transition-colors border border-transparent rounded-lg cursor-pointer text-cyber-primary hover:text-white hover:bg-cyber-primary/10 hover:border-cyber-primary/30">
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
                        className="btn-cyber !py-3 !px-8 !rounded-full hover:scale-105 transition-transform flex items-center gap-3 text-sm shadow-cyber-glow-sm"
                    >
                        <span className="font-bold tracking-widest">{isSubmitting ? 'ENVIANDO...' : 'PUBLICAR'}</span>
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}