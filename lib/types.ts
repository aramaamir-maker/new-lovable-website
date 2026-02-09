// TODO: Replace with database ORM types (e.g., Prisma, Drizzle)
// These types define the data structure for the gallery application

export type PaintingStatus = 'draft' | 'active';
export type MediaType = 'image' | 'video';

/**
 * Site-wide settings (single record)
 */
export interface SiteSettings {
    hero_image_url: string;
    hero_title_he: string;
    hero_subtitle_he: string;
    contact_email: string;
    contact_phone: string;
    instagram_url: string;
    facebook_url: string;
}

/**
 * Painting artwork entity
 */
export interface Painting {
    id: string;
    title_he: string;
    subtitle_he: string; // e.g., "ציור מקורי בעבודת יד"
    short_description_he: string;
    status: PaintingStatus;
    created_at: string; // ISO date string
    updated_at: string;
}

/**
 * Media files associated with a painting (images/videos)
 */
export interface PaintingMedia {
    id: string;
    painting_id: string;
    media_type: MediaType;
    image_url: string | null; // For uploaded images
    video_url: string | null; // For YouTube embed URLs
    sort_order: number; // 1..8
    is_main: boolean;
}

/**
 * Size and pricing options for a painting
 */
export interface PaintingSize {
    id: string;
    painting_id: string;
    size_label_he: string; // e.g., "40x40"
    price_ils: number;
    sort_order: number; // 1..20
    is_active: boolean;
    is_default: boolean;
}

/**
 * Full painting with related entities
 */
export interface PaintingWithRelations extends Painting {
    media: PaintingMedia[];
    sizes: PaintingSize[];
}

/**
 * Database structure
 */
export interface Database {
    siteSettings: SiteSettings;
    paintings: Painting[];
    paintingMedia: PaintingMedia[];
    paintingSizes: PaintingSize[];
}
