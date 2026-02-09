'use client';

import { useState } from 'react';
import { PaintingWithRelations, PaintingSize } from '@/lib/types';
import MediaGallery from './MediaGallery';
import SizesGrid from './SizesGrid';
import ContactForm from './ContactForm';
import styles from './page.module.css';

interface ProductClientProps {
    painting: PaintingWithRelations;
}

export default function ProductClient({ painting }: ProductClientProps) {
    const activeSizes = painting.sizes
        .filter(s => s.is_active)
        .sort((a, b) => a.sort_order - b.sort_order);

    const [selectedSize, setSelectedSize] = useState<PaintingSize | null>(
        activeSizes.find(s => s.is_default) || activeSizes[0] || null
    );

    // WhatsApp Message Generator
    const handleWhatsApp = () => {
        const phone = '972515199250';
        const sizeText = selectedSize ? `${selectedSize.size_label_he} ס״מ` : 'גודל לא נבחר';
        const text = `היי, אני מתעניין בציור '${painting.title_he}' בגודל ${sizeText}. אשמח לפרטים נוספים.`;
        const encodedText = encodeURIComponent(text);
        window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
    };

    return (
        <div className={styles.productLayout}>
            {/* Right Column (Media) - comes first in RTL */}
            <div className={styles.mediaColumn}>
                <MediaGallery media={painting.media} title={painting.title_he} />
            </div>

            {/* Left Column (Details) */}
            <div className={styles.detailsColumn}>
                <h1 className={styles.title}>{painting.title_he}</h1>
                <h2 className={styles.subtitle}>ציור מקורי בעבודת יד</h2>

                <div className={styles.priceRow}>
                    מחיר ליצירה:
                    <span className={styles.currentPrice}>
                        {selectedSize ? ` ₪${(selectedSize.price_ils || 0).toLocaleString()}` : ' בחר גודל'}
                    </span>
                </div>

                <p className={styles.description}>
                    {painting.short_description_he}
                </p>

                <SizesGrid
                    sizes={activeSizes}
                    selectedSize={selectedSize}
                    onSelect={setSelectedSize}
                />

                <div className={styles.actions}>
                    <button onClick={handleWhatsApp} className={styles.whatsappBtn}>
                        WhatsApp 💬
                    </button>
                    <a href="tel:051-5199250" className={styles.callBtn}>
                        התקשר 📞 051-5199250
                    </a>
                </div>

                <div className={styles.divider} />

                <ContactForm paintingTitle={painting.title_he} />
            </div>
        </div>
    );
}
