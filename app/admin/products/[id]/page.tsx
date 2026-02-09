'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import SizesEditor from './SizesEditor';
import styles from './page.module.css';
import type { PaintingWithRelations, PaintingStatus, PaintingMedia, PaintingSize } from '@/lib/types';

export default function AdminProductEditPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [painting, setPainting] = useState<PaintingWithRelations | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchPainting();
    }, [id]);

    const fetchPainting = async () => {
        try {
            const response = await fetch(`/api/paintings/${id}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data: PaintingWithRelations = await response.json();

            // --- One-time Migration / Auto-sync (Requirement 2) ---
            // If sizes are missing or empty, initialize and SAVE them immediately
            if (!data.sizes || data.sizes.length === 0) {
                const legacySizes = (data as any).sizeOptions || (data as any).sizes_json || (data as any).sizes;

                let migratedSizes: PaintingSize[] = [];
                if (Array.isArray(legacySizes) && legacySizes.length > 0) {
                    // Migrate from legacy format
                    migratedSizes = legacySizes.map((s: any, i: number) => {
                        const label = typeof s === 'string' ? s : (s.size_label_he || s.label || s.size_label || '');
                        const price = typeof s === 'object' ? (s.price_ils || s.price || 0) : 0;
                        return {
                            id: `mig-${Date.now()}-${i}`,
                            painting_id: id,
                            size_label_he: label,
                            price_ils: price,
                            sort_order: i + 1,
                            is_active: true,
                            is_default: i === 0
                        };
                    });
                } else {
                    // No legacy data, use standard defaults
                    migratedSizes = generateDefaultSizes(id);
                }

                // Save immediately to ensure "Single source of truth" is persisted
                const saveResponse = await fetch(`/api/paintings/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, sizes: migratedSizes }),
                });

                if (saveResponse.ok) {
                    const updated = await saveResponse.json();
                    setPainting(updated);
                } else {
                    setPainting({ ...data, sizes: migratedSizes });
                }
            } else {
                setPainting(data);
            }
        } catch (error) {
            console.error('Failed to fetch painting:', error);
            setMessage({ type: 'error', text: 'שגיאה בטעינת הציור' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!painting) return;

        // --- Validation (Requirement 5) ---
        const activeSizes = painting.sizes.filter(s => s.is_active);

        if (activeSizes.length === 0) {
            alert('שגיאה: חייב להיות לפחות גודל פעיל אחד.');
            return;
        }

        const hasInvalidPrice = activeSizes.some(s => s.price_ils <= 0);
        if (hasInvalidPrice) {
            alert('שגיאה: כל המחירים לגדלים פעילים חייבים להיות מספרים חיוביים.');
            return;
        }

        const hasMissingLabel = activeSizes.some(s => !s.size_label_he || !s.size_label_he.trim());
        if (hasMissingLabel) {
            alert('שגיאה: לכל הגדלים הפעילים חייב להיות תיאור גודל.');
            return;
        }

        // Enforce exactly one default among active sizes
        const defaultCount = activeSizes.filter(s => s.is_default).length;
        if (defaultCount === 0) {
            const firstActiveIdx = painting.sizes.findIndex(s => s.id === activeSizes[0].id);
            painting.sizes[firstActiveIdx].is_default = true;
        } else if (defaultCount > 1) {
            let foundFirst = false;
            painting.sizes = painting.sizes.map(s => {
                if (s.is_active && s.is_default) {
                    if (!foundFirst) { foundFirst = true; return s; }
                    return { ...s, is_default: false };
                }
                return s;
            });
        }

        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/paintings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(painting),
            });

            if (!response.ok) throw new Error('Failed to save');
            const updated = await response.json();
            setPainting(updated);
            setMessage({ type: 'success', text: 'השינויים נשמרו בהצלחה!' });
        } catch (error) {
            console.error('Failed to save painting:', error);
            setMessage({ type: 'error', text: 'שגיאה בשמירת השינויים' });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof PaintingWithRelations, value: any) => {
        setPainting((prev) => prev ? { ...prev, [field]: value } : null);
    };

    // --- Media Handlers ---

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !painting) return;

        // Limitation: Max 8 media items
        if (painting.media.length + e.target.files.length > 8) {
            alert('ניתן להעלות עד 8 פריטי מדיה');
            return;
        }

        const files = Array.from(e.target.files);
        const newMediaItems: PaintingMedia[] = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!res.ok) throw new Error('Upload failed');
                const { url } = await res.json();

                newMediaItems.push({
                    id: `temp-${Date.now()}-${Math.random()}`,
                    painting_id: painting.id,
                    media_type: 'image',
                    image_url: url,
                    video_url: null,
                    sort_order: painting.media.length + newMediaItems.length + 1,
                    is_main: painting.media.length === 0 && newMediaItems.length === 0 // First one is main
                });
            } catch (err) {
                console.error('Upload error', err);
                alert('שגיאה בהעלאת תמונה');
            }
        }

        setPainting(prev => prev ? {
            ...prev,
            media: [...prev.media, ...newMediaItems]
        } : null);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const addYouTubeVideo = () => {
        const url = prompt('הכנס קישור ליוטיוב:');
        if (!url || !painting) return;

        // Extract ID
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;

        if (!videoId) {
            alert('קישור לא תקין');
            return;
        }

        if (painting.media.length >= 8) {
            alert('ניתן להעלות עד 8 פריטי מדיה');
            return;
        }

        const newMedia: PaintingMedia = {
            id: `temp-${Date.now()}`,
            painting_id: painting.id,
            media_type: 'video',
            image_url: null,
            video_url: videoId,
            sort_order: painting.media.length + 1,
            is_main: false
        };

        setPainting(prev => prev ? { ...prev, media: [...prev.media, newMedia] } : null);
    };

    const removeMedia = (mediaId: string) => {
        if (!painting) return;
        const newMedia = painting.media.filter(m => m.id !== mediaId);
        // If we removed the main image, set the first one as main
        if (painting.media.find(m => m.id === mediaId)?.is_main && newMedia.length > 0) {
            newMedia[0].is_main = true;
        }
        setPainting({ ...painting, media: newMedia });
    };

    const setMainMedia = (mediaId: string) => {
        if (!painting) return;
        const newMedia = painting.media.map(m => ({
            ...m,
            is_main: m.id === mediaId
        }));
        setPainting({ ...painting, media: newMedia });
    };

    const moveMedia = (index: number, direction: 'left' | 'right') => {
        if (!painting) return;
        const newMedia = [...painting.media];
        // RTL: 'right' means visual right (previous index), 'left' means next index because of flex-direction or just logic
        // Let's stick to array index logic: 
        // Index 0 is first. 
        // Swap with index - 1 or index + 1

        const targetIndex = direction === 'right' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newMedia.length) {
            [newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]];
            // Update sort_order
            newMedia.forEach((m, i) => m.sort_order = i + 1);
            setPainting({ ...painting, media: newMedia });
        }
    };

    // --- Sizes Handlers ---

    const handleSizesChange = (newSizes: PaintingSize[]) => {
        setPainting(prev => prev ? { ...prev, sizes: newSizes } : null);
    };

    if (loading) return <div className={styles.loading}>טוען...</div>;
    if (!painting) return <div className={styles.error}>הציור לא נמצא</div>;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <Link href="/admin/products" className={styles.backLink}>← חזרה לרשימה</Link>
                    <div className={styles.headerTitleRow}>
                        <h1 className={styles.title}>עריכת יצירה</h1>
                        <button onClick={handleSave} disabled={saving} className={styles.saveBtnTop}>
                            {saving ? 'שומר...' : 'שמירה'}
                        </button>
                    </div>
                </header>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <div className={styles.editorGrid}>
                    {/* Left Column: Media */}
                    <div className={styles.mediaColumn}>
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>מדיה ({painting.media.length}/8)</h2>
                            <div className={styles.mediaGrid}>
                                {painting.media.map((media, index) => (
                                    <div key={media.id} className={`${styles.mediaItem} ${media.is_main ? styles.mainMedia : ''}`}>
                                        <div className={styles.mediaPreview}>
                                            {media.media_type === 'video' ? (
                                                <div className={styles.videoPlaceholder}>
                                                    <span className={styles.playIcon}>▶</span>
                                                    <img
                                                        src={`https://img.youtube.com/vi/${media.video_url}/default.jpg`}
                                                        alt="Video thumbnail"
                                                        className={styles.mediaImg}
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className={styles.mediaImg}
                                                    style={{ backgroundImage: `url(${media.image_url})` }}
                                                />
                                            )}

                                            <div className={styles.mediaActions}>
                                                <button onClick={() => setMainMedia(media.id)} className={styles.starBtn} title="קבע כתמונה ראשית">
                                                    {media.is_main ? '★' : '☆'}
                                                </button>
                                                <button onClick={() => removeMedia(media.id)} className={styles.removeBtn} title="מחק">
                                                    ✕
                                                </button>
                                            </div>

                                            <div className={styles.reorderOverlay}>
                                                {index > 0 && (
                                                    <button onClick={() => moveMedia(index, 'right')} className={styles.moveBtn}>→</button>
                                                )}
                                                {index < painting.media.length - 1 && (
                                                    <button onClick={() => moveMedia(index, 'left')} className={styles.moveBtn}>←</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {painting.media.length < 8 && (
                                    <div className={styles.addMediaTile}>
                                        <button onClick={() => fileInputRef.current?.click()} className={styles.addMediaBtn}>
                                            + תמונה
                                        </button>
                                        <button onClick={addYouTubeVideo} className={styles.addMediaBtn}>
                                            + יוטיוב
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            hidden
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & Sizes */}
                    <div className={styles.detailsColumn}>
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>פרטים כלליים</h2>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>כותרת</label>
                                <input
                                    type="text"
                                    value={painting.title_he}
                                    onChange={(e) => updateField('title_he', e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>תת-כותרת</label>
                                <input
                                    type="text"
                                    value={painting.subtitle_he}
                                    onChange={(e) => updateField('subtitle_he', e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>תיאור קצר</label>
                                <textarea
                                    value={painting.short_description_he}
                                    onChange={(e) => updateField('short_description_he', e.target.value)}
                                    className={styles.textarea}
                                    rows={4}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>סטטוס</label>
                                <select
                                    value={painting.status}
                                    onChange={(e) => updateField('status', e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="draft">טיוטה</option>
                                    <option value="active">פעיל</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>גדלים ומחירים</h2>
                            <SizesEditor
                                sizes={painting.sizes}
                                onChange={handleSizesChange}
                                paintingId={painting.id}
                            />
                        </div>
                    </div>
                </div>
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
        is_default: i === 0
    }));
}
