'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import type { Painting } from '@/lib/types';

interface PaintingWithImage extends Painting {
    main_image: string | null;
}

export default function AdminProductsPage() {
    const [paintings, setPaintings] = useState<PaintingWithImage[]>([]);
    const [filteredPaintings, setFilteredPaintings] = useState<PaintingWithImage[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchPaintings();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPaintings(paintings);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            setFilteredPaintings(paintings.filter(p =>
                p.title_he.toLowerCase().includes(lowerTerm) ||
                p.id.toLowerCase().includes(lowerTerm)
            ));
        }
    }, [searchTerm, paintings]);

    const fetchPaintings = async () => {
        try {
            const response = await fetch('/api/paintings');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setPaintings(data);
            setFilteredPaintings(data);
        } catch (error) {
            console.error('Failed to fetch paintings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setCreating(true);
        try {
            const response = await fetch('/api/paintings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title_he: 'יצירה חדשה',
                    subtitle_he: 'ציור מקורי בעבודת יד',
                    short_description_he: '',
                    status: 'draft',
                }),
            });

            if (!response.ok) throw new Error('Failed to create');
            const newPainting = await response.json();
            router.push(`/admin/products/${newPainting.id}`);
        } catch (error) {
            console.error('Failed to create painting:', error);
            alert('שגיאה ביצירת ציור חדש');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('האם למחוק את היצירה?')) return;

        try {
            const response = await fetch(`/api/paintings?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');
            setPaintings((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            console.error('Failed to delete painting:', error);
            alert('שגיאה במחיקת הציור');
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('he-IL');
    };

    const getStatusLabel = (status: string) => {
        return status === 'active' ? 'פעיל' : 'טיוטה';
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <p className={styles.loading}>טוען...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <Link href="/admin" className={styles.backLink}>← חזרה לממשק ניהול</Link>
                        <h1 className={styles.title}>ניהול מוצרים</h1>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            onClick={handleCreate}
                            className={styles.addBtn}
                            disabled={creating}
                        >
                            {creating ? 'יוצר...' : 'מוצר חדש +'}
                        </button>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            התנתקות
                        </button>
                    </div>
                </header>

                {/* Search Bar */}
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="חיפוש מוצר..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                {filteredPaintings.length === 0 ? (
                    <div className={styles.empty}>
                        <p>{searchTerm ? 'לא נמצאו יצירות תואמות לחיפוש' : 'אין יצירות עדיין'}</p>
                        {!searchTerm && (
                            <button onClick={handleCreate} className={styles.addBtn}>
                                הוספת יצירה ראשונה
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={styles.table}>
                        <div className={styles.tableHeader}>
                            <span>תמונה</span>
                            <span>שם היצירה</span>
                            <span>סטטוס</span>
                            <span>פעולות</span>
                        </div>
                        {filteredPaintings.map((painting) => (
                            <div key={painting.id} className={styles.tableRow}>
                                <div className={styles.thumbnailWrapper}>
                                    {painting.main_image ? (
                                        <div className={styles.thumbnailImg} style={{ backgroundImage: `url(${painting.main_image})` }} />
                                    ) : (
                                        <div className={styles.thumbnailPlaceholder}>🎨</div>
                                    )}
                                </div>
                                <span className={styles.paintingTitle}>{painting.title_he}</span>
                                <span className={`${styles.status} ${styles[painting.status]}`}>
                                    {getStatusLabel(painting.status)}
                                </span>
                                <div className={styles.actions}>
                                    <Link href={`/admin/products/${painting.id}`} className={styles.editBtn}>
                                        עריכה
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(painting.id)}
                                        className={styles.deleteBtn}
                                    >
                                        מחיקה
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
