'use client';

import { PaintingSize } from '@/lib/types';
import styles from './page.module.css';

interface SizesGridProps {
    sizes: PaintingSize[];
    selectedSize: PaintingSize | null;
    onSelect: (size: PaintingSize) => void;
}

export default function SizesGrid({ sizes, selectedSize, onSelect }: SizesGridProps) {
    if (!sizes || sizes.length === 0) return null;

    return (
        <div className={styles.sizesSection}>
            <h3 className={styles.sectionTitle}>בחר גודל</h3>
            <div className={styles.sizesGrid}>
                {sizes.map((size) => (
                    <button
                        key={size.id}
                        className={`${styles.sizeBox} ${selectedSize?.id === size.id ? styles.selected : ''}`}
                        onClick={() => onSelect(size)}
                    >
                        <span className={styles.sizeLabel}>{size.size_label_he} ס״מ</span>
                        <span className={styles.sizePrice}>₪{size.price_ils.toLocaleString()}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
