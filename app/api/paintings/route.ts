import { NextResponse } from 'next/server';
import { getPaintings, createPainting, deletePainting } from '@/lib/data-store';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') as 'draft' | 'active' | null;

        const paintings = await getPaintings(status || undefined);

        // Fetch relations for all paintings to find main image
        // In a real DB we would use include: { media: true }
        // Here we inefficiently fetch all media or we can read the DB once
        // For now, let's map in parallel since it's a small JSON DB in memory
        const paintingsWithImages = await Promise.all(paintings.map(async (p) => {
            const relations = await import('@/lib/data-store').then(mod => mod.getPaintingWithRelations(p.id));
            const mainMedia = relations?.media.find(m => m.is_main) || relations?.media[0];
            return {
                ...p,
                main_image: mainMedia?.image_url || mainMedia?.video_url ? `https://img.youtube.com/vi/${mainMedia.video_url}/default.jpg` : null
            };
        }));

        return NextResponse.json(paintingsWithImages);
    } catch (error) {
        console.error('Failed to get paintings:', error);
        return NextResponse.json(
            { error: 'שגיאה בטעינת היצירות' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const painting = await createPainting(data);
        return NextResponse.json(painting, { status: 201 });
    } catch (error) {
        console.error('Failed to create painting:', error);
        return NextResponse.json(
            { error: 'שגיאה ביצירת הציור' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'חסר מזהה' },
                { status: 400 }
            );
        }

        const success = await deletePainting(id);
        if (!success) {
            return NextResponse.json(
                { error: 'הציור לא נמצא' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete painting:', error);
        return NextResponse.json(
            { error: 'שגיאה במחיקת הציור' },
            { status: 500 }
        );
    }
}
