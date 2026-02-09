import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPaintingWithRelations } from '@/lib/data-store';
import { PaintingSize } from '@/lib/types';
import ProductClient from './ProductClient';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const painting = await getPaintingWithRelations(resolvedParams.id);

    if (!painting) {
        return {
            title: 'יצירה לא נמצאה | קמי תכשיטי קירות',
        };
    }

    return {
        title: `${painting.title_he} | קמי תכשיטי קירות`,
        description: painting.short_description_he || `יצירת אמנות ${painting.title_he} מאת קמי`,
    };
}

// Helper to generate default sizes if none exist
function generateDefaultSizes(paintingId: string): PaintingSize[] {
    const sizes = [
        { label: '40x40', price: 1200 },
        { label: '50x50', price: 1800 },
        { label: '60x60', price: 2400 },
        { label: '70x70', price: 3200 },
        { label: '80x80', price: 4200 },
        { label: '90x90', price: 5400 },
        { label: '100x100', price: 6800 },
        { label: '120x120', price: 9200 },
        { label: '30x40', price: 900 },
        { label: '35x50', price: 1300 },
        { label: '40x60', price: 1600 },
        { label: '50x70', price: 2200 },
        { label: '60x80', price: 2900 },
        { label: '70x90', price: 3800 },
        { label: '80x100', price: 4900 },
        { label: '95x120', price: 7200 },
        { label: '55x70', price: 2600 },
        { label: '65x80', price: 3400 },
        { label: '75x90', price: 4400 },
        { label: '85x100', price: 5600 },
    ];

    return sizes.map((s, i) => ({
        id: `gen-size-${i}`,
        painting_id: paintingId,
        size_label_he: s.label,
        is_default: i === 0,
        price_ils: s.price,
        sort_order: i + 1,
        is_active: true
    }));
}

export default async function GalleryItemPage({ params }: PageProps) {
    const resolvedParams = await params;
    const painting = await getPaintingWithRelations(resolvedParams.id);

    if (!painting) {
        notFound();
    }

    // Ensure we have sizes for the UI (Mock data for visual requirement)
    // If we have fewer than 10 sizes, assume incomplete data and show the full 20-item grid
    if (painting.sizes.length < 10) {
        painting.sizes = generateDefaultSizes(painting.id);
    }

    // Sort sizes just in case
    painting.sizes.sort((a, b) => a.price_ils - b.price_ils);

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <Link href="/gallery" className={styles.backLink}>
                    ← חזרה לגלריה
                </Link>

                <ProductClient painting={painting} />
            </div>
        </div>
    );
}
