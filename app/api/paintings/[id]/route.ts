import { NextResponse } from 'next/server';
import {
    getPaintingWithRelations,
    updatePainting,
    getPaintingMedia,
    addPaintingMedia,
    updatePaintingMedia,
    deletePaintingMedia,
    getPaintingSizes,
    addPaintingSize,
    updatePaintingSize,
    deletePaintingSize
} from '@/lib/data-store';
import { PaintingMedia, PaintingSize } from '@/lib/types';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const resolvedParams = await params;
        const painting = await getPaintingWithRelations(resolvedParams.id);

        if (!painting) {
            return NextResponse.json(
                { error: 'הציור לא נמצא' },
                { status: 404 }
            );
        }

        return NextResponse.json(painting);
    } catch (error) {
        console.error('Failed to get painting:', error);
        return NextResponse.json(
            { error: 'שגיאה בטעינת הציור' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const resolvedParams = await params;
        const paintingId = resolvedParams.id;
        const updates = await request.json(); // Explicitly expecting full PaintingWithRelations structure where needed

        // 1. Update basic painting info
        const paintingUpdates = {
            title_he: updates.title_he,
            subtitle_he: updates.subtitle_he,
            short_description_he: updates.short_description_he,
            status: updates.status,
        };
        const painting = await updatePainting(paintingId, paintingUpdates);

        if (!painting) {
            return NextResponse.json({ error: 'הציור לא נמצא' }, { status: 404 });
        }

        // 2. Sync Media
        if (updates.media && Array.isArray(updates.media)) {
            const currentMedia = await getPaintingMedia(paintingId);
            const newMediaIds = new Set(updates.media.map((m: PaintingMedia) => m.id).filter((id: string) => !id.startsWith('temp-')));

            // Delete removed media
            for (const m of currentMedia) {
                if (!newMediaIds.has(m.id)) {
                    await deletePaintingMedia(m.id);
                }
            }

            // Update or Create
            for (const m of updates.media) {
                if (m.id.startsWith('temp-') || m.id.startsWith('new-')) {
                    await addPaintingMedia({
                        painting_id: paintingId,
                        media_type: m.media_type,
                        image_url: m.image_url,
                        video_url: m.video_url,
                        sort_order: m.sort_order,
                        is_main: m.is_main
                    });
                } else {
                    await updatePaintingMedia(m.id, {
                        sort_order: m.sort_order,
                        is_main: m.is_main,
                        image_url: m.image_url,
                        video_url: m.video_url
                    });
                }
            }
        }

        // 3. Sync Sizes
        if (updates.sizes && Array.isArray(updates.sizes)) {
            const currentSizes = await getPaintingSizes(paintingId);
            const newSizeIds = new Set(updates.sizes.map((s: PaintingSize) => s.id).filter((id: string) => !id.startsWith('gen-') && !id.startsWith('temp-')));

            // Delete removed sizes (if any, though usually we keep them or deactivate)
            for (const s of currentSizes) {
                if (!newSizeIds.has(s.id)) {
                    await deletePaintingSize(s.id);
                }
            }

            // Update or Create
            for (const s of updates.sizes) {
                if (s.id.startsWith('gen-') || s.id.startsWith('temp-')) {
                    await addPaintingSize({
                        painting_id: paintingId,
                        size_label_he: s.size_label_he,
                        price_ils: s.price_ils,
                        sort_order: s.sort_order,
                        is_active: s.is_active,
                        is_default: s.is_default
                    });
                } else {
                    await updatePaintingSize(s.id, {
                        size_label_he: s.size_label_he,
                        price_ils: s.price_ils,
                        sort_order: s.sort_order,
                        is_active: s.is_active,
                        is_default: s.is_default
                    });
                }
            }
        }

        // Return updated full object
        const updatedFull = await getPaintingWithRelations(paintingId);
        return NextResponse.json(updatedFull);

    } catch (error) {
        console.error('Failed to update painting:', error);
        return NextResponse.json(
            { error: 'שגיאה בעדכון הציור' },
            { status: 500 }
        );
    }
}
