import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPaintings, getPaintingMedia } from '@/lib/data-store';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'גלריה | קמי תכשיטי קירות',
    description: 'צפו ביצירות האמנות שלנו - אוסף מגוון של יצירות מודרניות ומינימליסטיות',
};

export default async function GalleryPage() {
    const paintings = await getPaintings('active');

    // Get main media for each painting
    const paintingsWithMedia = await Promise.all(
        paintings.map(async (painting) => {
            const media = await getPaintingMedia(painting.id);
            const mainMedia = media.find((m) => m.is_main) || media[0];
            return { ...painting, mainImage: mainMedia?.image_url || null };
        })
    );

    return (
        <div className={styles.gallery}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>גלריה</h1>
                    <p className={styles.subtitle}>
                        אוסף היצירות שלנו
                    </p>
                </header>

                {paintingsWithMedia.length === 0 ? (
                    <div className={styles.empty}>
                        <p>אין יצירות להצגה כרגע</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {paintingsWithMedia.map((painting) => (
                            <Link
                                key={painting.id}
                                href={`/gallery/${painting.id}`}
                                className={styles.item}
                            >
                                <div className={styles.itemImage}>
                                    {painting.mainImage ? (
                                        <Image
                                            src={painting.mainImage}
                                            alt={painting.title_he}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className={styles.placeholder}></div>
                                    )}
                                </div>
                                <h3 className={styles.itemTitle}>{painting.title_he}</h3>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
