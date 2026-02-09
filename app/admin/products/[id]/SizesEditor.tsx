'use client';

import { useState, useEffect } from 'react';
import { PaintingSize } from '@/lib/types';
import styles from './page.module.css';

interface SizesEditorProps {
    sizes: PaintingSize[];
    onChange: (sizes: PaintingSize[]) => void;
    paintingId: string;
}

export default function SizesEditor({ sizes, onChange, paintingId }: SizesEditorProps) {
    const sortedSizes = [...sizes].sort((a, b) => a.sort_order - b.sort_order);

    const handleUpdate = (index: number, field: keyof PaintingSize, value: any) => {
        const newSizes = [...sortedSizes];
        newSizes[index] = { ...newSizes[index], [field]: value };

        // Ensure only one default
        if (field === 'is_default' && value === true) {
            newSizes.forEach((s, i) => {
                if (i !== index) s.is_default = false;
            });
        }

        // If default becomes inactive, clear default (or warn? let's just clear for now)
        if (field === 'is_active' && value === false && newSizes[index].is_default) {
            newSizes[index].is_default = false;
            // Try to find another active one to be default? 
            // Logic: keep simple, loop will fix it if needed on save or render
            const firstActive = newSizes.find(s => s.is_active);
            if (firstActive) firstActive.is_default = true;
        }

        onChange(newSizes);
    };

    const handleAdd = () => {
        const newSize: PaintingSize = {
            id: `temp-size-${Date.now()}`,
            painting_id: paintingId,
            size_label_he: '',
            price_ils: 0,
            sort_order: sortedSizes.length + 1,
            is_active: true,
            is_default: sortedSizes.length === 0 // First one is default
        };
        onChange([...sortedSizes, newSize]);
    };

    const handleRemove = (index: number) => {
        const newSizes = sortedSizes.filter((_, i) => i !== index);
        // Re-index sort order
        newSizes.forEach((s, i) => s.sort_order = i + 1);

        // If we removed the default, set new default
        if (sortedSizes[index].is_default && newSizes.length > 0) {
            const firstActive = newSizes.find(s => s.is_active) || newSizes[0];
            firstActive.is_default = true;
        }

        onChange(newSizes);
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sortedSizes.length) return;

        const newSizes = [...sortedSizes];
        [newSizes[index], newSizes[targetIndex]] = [newSizes[targetIndex], newSizes[index]];

        // Update sort orders
        newSizes.forEach((s, i) => s.sort_order = i + 1);
        onChange(newSizes);
    };

    const handleResetDefaults = () => {
        if (!confirm('האם אתה בטוח? פעולה זו תמחק את כל הגדלים הקיימים ותיצור רשימה חדשה.')) return;

        const defaultSizes = generateDefaultSizes(paintingId);
        onChange(defaultSizes);
    };

    return (
        <div className={styles.sizesEditor}>
            <div className={styles.sizesToolbar}>
                <button onClick={handleAdd} className={styles.addBtn}>+ הוסף גודל</button>
                <button onClick={handleResetDefaults} className={styles.resetBtn}>איפוס לרשימה מלאה</button>
            </div>

            <div className={styles.sizesTable} dir="rtl">


                {sortedSizes.map((size, index) => (
                    <div key={size.id} className={`${styles.tableRow} ${!size.is_active ? styles.rowInactive : ''}`}>
                        <div className={styles.colOrder}>
                            <div className={styles.orderBtns}>
                                <button onClick={() => handleMove(index, 'up')} disabled={index === 0}>▲</button>
                                <button onClick={() => handleMove(index, 'down')} disabled={index === sortedSizes.length - 1}>▼</button>
                            </div>
                        </div>

                        <div className={styles.colLabel}>
                            <input
                                type="text"
                                value={size.size_label_he || ''}
                                onChange={(e) => handleUpdate(index, 'size_label_he', e.target.value)}
                                className={styles.sizeInput}
                                placeholder="למשל 40x40"
                            />
                        </div>

                        <div className={styles.colPrice}>
                            <input
                                type="number"
                                value={size.price_ils ?? 0}
                                onChange={(e) => handleUpdate(index, 'price_ils', Number(e.target.value))}
                                className={styles.priceInput}
                                min="0"
                            />
                        </div>

                        <div className={styles.colActive}>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={size.is_active}
                                    onChange={(e) => handleUpdate(index, 'is_active', e.target.checked)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        <div className={styles.colDefault}>
                            <input
                                type="radio"
                                name={`defaultSize-${paintingId}`}
                                checked={size.is_default}
                                onChange={() => handleUpdate(index, 'is_default', true)}
                                disabled={!size.is_active}
                            />
                        </div>

                        <div className={styles.colActions}>
                            <button onClick={() => handleRemove(index)} className={styles.deleteBtn} title="מחק">🗑️</button>
                        </div>
                    </div>
                ))}

                {sortedSizes.length === 0 && (
                    <div className={styles.emptyState}>אין גדלים מוגדרים. הוסף גודל או אפס לרשימה המלאה.</div>
                )}
            </div>
        </div>
    );
}

function generateDefaultSizes(paintingId: string): PaintingSize[] {
    const sizes = [
        { label: '30x40', price: 900 },
        { label: '40x40', price: 1200 },
        { label: '35x50', price: 1300 },
        { label: '40x60', price: 1600 },
        { label: '50x50', price: 1800 },
        { label: '50x70', price: 2200 },
        { label: '60x60', price: 2400 },
        { label: '55x70', price: 2600 },
        { label: '60x80', price: 2900 },
        { label: '70x70', price: 3200 },
        { label: '65x80', price: 3400 },
        { label: '70x90', price: 3800 },
        { label: '80x80', price: 4200 },
        { label: '75x90', price: 4400 },
        { label: '80x100', price: 4900 },
        { label: '90x90', price: 5400 },
        { label: '85x100', price: 5600 },
        { label: '100x100', price: 6800 },
        { label: '95x120', price: 7200 },
        { label: '120x120', price: 9200 },
    ];

    return sizes.map((s, i) => ({
        id: `gen-${Date.now()}-${i}`,
        painting_id: paintingId,
        size_label_he: s.label,
        price_ils: s.price,
        sort_order: i + 1,
        is_active: true,
        is_default: i === 4 // Set ~50x50 as default arbitrarily, or 0
    }));
}
