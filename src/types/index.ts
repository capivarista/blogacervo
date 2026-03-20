export interface Comment {
    id: number;
    conteudo: string;
    nome_usuario: string;
}

export interface Post {
    id: number;
    titulo: string;
    conteudo: string;
    imagem_url?: string;
    nome_usuario: string;
    likes_count: number;
    data_criacao: string;
    comentarios: Comment[];
    current_user_is_admin: boolean;
}

export interface Community {
    id: number;
    name: string;
    description: string | null;
    slug: string;
    image_url: string | null;
    owner_id: string;
    created_at: string;
    _count?: {
        members: number;
    };
}

export interface Channel {
    id: number;
    community_id: number;
    name: string;
    slug: string;
    description: string | null;
    type: 'text' | 'voice' | 'announcement';
    created_at: string;
}

export interface CommunityMember {
    id: number;
    community_id: number;
    user_id: string;
    role: 'owner' | 'admin' | 'moderator' | 'member';
    joined_at: string;
}

export interface ChatMessage {
    id: number;
    channel_id: number;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string | null;
    user_name: string;
    user_avatar_url: string | null;
}
