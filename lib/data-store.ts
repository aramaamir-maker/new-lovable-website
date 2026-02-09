// TODO: Replace with database queries (e.g., Prisma, Drizzle)
// This is a JSON-based data store for development/prototyping
// All functions should be replaced with actual database calls

import { promises as fs } from 'fs';
import path from 'path';
import type {
    Database,
    SiteSettings,
    Painting,
    PaintingMedia,
    PaintingSize,
    PaintingWithRelations,
} from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

/**
 * Read the entire database
 * TODO: Replace with database connection
 */
async function readDb(): Promise<Database> {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        throw new Error('Failed to read database');
    }
}

/**
 * Write the entire database
 * TODO: Replace with database transactions
 */
async function writeDb(data: Database): Promise<void> {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing database:', error);
        throw new Error('Failed to write database');
    }
}

// ============================================
// Site Settings
// ============================================

/**
 * Get site settings
 * TODO: Replace with: prisma.siteSettings.findFirst()
 */
export async function getSiteSettings(): Promise<SiteSettings> {
    const db = await readDb();
    return db.siteSettings;
}

/**
 * Update site settings
 * TODO: Replace with: prisma.siteSettings.update()
 */
export async function updateSiteSettings(
    settings: Partial<SiteSettings>
): Promise<SiteSettings> {
    const db = await readDb();
    db.siteSettings = { ...db.siteSettings, ...settings };
    await writeDb(db);
    return db.siteSettings;
}

// ============================================
// Paintings
// ============================================

/**
 * Get all paintings
 * TODO: Replace with: prisma.painting.findMany()
 */
export async function getPaintings(
    status?: 'draft' | 'active'
): Promise<Painting[]> {
    const db = await readDb();
    if (status) {
        return db.paintings.filter((p) => p.status === status);
    }
    return db.paintings;
}

/**
 * Get a single painting by ID
 * TODO: Replace with: prisma.painting.findUnique()
 */
export async function getPainting(id: string): Promise<Painting | null> {
    const db = await readDb();
    return db.paintings.find((p) => p.id === id) || null;
}

/**
 * Get painting with all related media and sizes
 * TODO: Replace with: prisma.painting.findUnique({ include: { media: true, sizes: true } })
 */
export async function getPaintingWithRelations(
    id: string
): Promise<PaintingWithRelations | null> {
    const db = await readDb();
    const painting = db.paintings.find((p) => p.id === id);
    if (!painting) return null;

    const media = db.paintingMedia
        .filter((m) => m.painting_id === id)
        .sort((a, b) => a.sort_order - b.sort_order);

    const sizes = db.paintingSizes
        .filter((s) => s.painting_id === id)
        .sort((a, b) => a.sort_order - b.sort_order);

    return { ...painting, media, sizes };
}

/**
 * Create a new painting
 * TODO: Replace with: prisma.painting.create()
 */
export async function createPainting(
    painting: Omit<Painting, 'id' | 'created_at' | 'updated_at'>
): Promise<Painting> {
    const db = await readDb();
    const now = new Date().toISOString();
    const newPainting: Painting = {
        ...painting,
        id: `painting-${Date.now()}`,
        created_at: now,
        updated_at: now,
    };
    db.paintings.push(newPainting);
    await writeDb(db);
    return newPainting;
}

/**
 * Update a painting
 * TODO: Replace with: prisma.painting.update()
 */
export async function updatePainting(
    id: string,
    updates: Partial<Omit<Painting, 'id' | 'created_at'>>
): Promise<Painting | null> {
    const db = await readDb();
    const index = db.paintings.findIndex((p) => p.id === id);
    if (index === -1) return null;

    db.paintings[index] = {
        ...db.paintings[index],
        ...updates,
        updated_at: new Date().toISOString(),
    };
    await writeDb(db);
    return db.paintings[index];
}

/**
 * Delete a painting and its related media/sizes
 * TODO: Replace with: prisma.painting.delete() with cascade
 */
export async function deletePainting(id: string): Promise<boolean> {
    const db = await readDb();
    const index = db.paintings.findIndex((p) => p.id === id);
    if (index === -1) return false;

    db.paintings.splice(index, 1);
    db.paintingMedia = db.paintingMedia.filter((m) => m.painting_id !== id);
    db.paintingSizes = db.paintingSizes.filter((s) => s.painting_id !== id);
    await writeDb(db);
    return true;
}

// ============================================
// Painting Media
// ============================================

/**
 * Get media for a painting
 * TODO: Replace with: prisma.paintingMedia.findMany()
 */
export async function getPaintingMedia(paintingId: string): Promise<PaintingMedia[]> {
    const db = await readDb();
    return db.paintingMedia
        .filter((m) => m.painting_id === paintingId)
        .sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Add media to a painting
 * TODO: Replace with: prisma.paintingMedia.create()
 */
export async function addPaintingMedia(
    media: Omit<PaintingMedia, 'id'>
): Promise<PaintingMedia> {
    const db = await readDb();
    const newMedia: PaintingMedia = {
        ...media,
        id: `media-${Date.now()}`,
    };
    db.paintingMedia.push(newMedia);
    await writeDb(db);
    return newMedia;
}

/**
 * Update painting media
 * TODO: Replace with: prisma.paintingMedia.update()
 */
export async function updatePaintingMedia(
    id: string,
    updates: Partial<Omit<PaintingMedia, 'id'>>
): Promise<PaintingMedia | null> {
    const db = await readDb();
    const index = db.paintingMedia.findIndex((m) => m.id === id);
    if (index === -1) return null;

    db.paintingMedia[index] = { ...db.paintingMedia[index], ...updates };
    await writeDb(db);
    return db.paintingMedia[index];
}

/**
 * Delete painting media
 * TODO: Replace with: prisma.paintingMedia.delete()
 */
export async function deletePaintingMedia(id: string): Promise<boolean> {
    const db = await readDb();
    const index = db.paintingMedia.findIndex((m) => m.id === id);
    if (index === -1) return false;

    db.paintingMedia.splice(index, 1);
    await writeDb(db);
    return true;
}

// ============================================
// Painting Sizes
// ============================================

/**
 * Get sizes for a painting
 * TODO: Replace with: prisma.paintingSize.findMany()
 */
export async function getPaintingSizes(paintingId: string): Promise<PaintingSize[]> {
    const db = await readDb();
    return db.paintingSizes
        .filter((s) => s.painting_id === paintingId)
        .sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Add size option to a painting
 * TODO: Replace with: prisma.paintingSize.create()
 */
export async function addPaintingSize(
    size: Omit<PaintingSize, 'id'>
): Promise<PaintingSize> {
    const db = await readDb();
    const newSize: PaintingSize = {
        ...size,
        id: `size-${Date.now()}`,
    };
    db.paintingSizes.push(newSize);
    await writeDb(db);
    return newSize;
}

/**
 * Update painting size
 * TODO: Replace with: prisma.paintingSize.update()
 */
export async function updatePaintingSize(
    id: string,
    updates: Partial<Omit<PaintingSize, 'id'>>
): Promise<PaintingSize | null> {
    const db = await readDb();
    const index = db.paintingSizes.findIndex((s) => s.id === id);
    if (index === -1) return null;

    db.paintingSizes[index] = { ...db.paintingSizes[index], ...updates };
    await writeDb(db);
    return db.paintingSizes[index];
}

/**
 * Delete painting size
 * TODO: Replace with: prisma.paintingSize.delete()
 */
export async function deletePaintingSize(id: string): Promise<boolean> {
    const db = await readDb();
    const index = db.paintingSizes.findIndex((s) => s.id === id);
    if (index === -1) return false;

    db.paintingSizes.splice(index, 1);
    await writeDb(db);
    return true;
}
