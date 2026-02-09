'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import type { SiteSettings } from '@/lib/types';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setMessage({ type: 'error', text: 'שגיאה בטעינת ההגדרות' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (!response.ok) throw new Error('Failed to save');

            setMessage({ type: 'success', text: 'ההגדרות נשמרו בהצלחה!' });
            router.refresh();
        } catch (error) {
            console.error('Failed to save settings:', error);
            setMessage({ type: 'error', text: 'שגיאה בשמירת ההגדרות' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setSettings((prev) => prev ? { ...prev, hero_image_url: data.url } : null);
            setMessage({ type: 'success', text: 'התמונה הועלתה בהצלחה!' });
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'שגיאה בהעלאת התמונה' });
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
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
                        <h1 className={styles.title}>הגדרות האתר</h1>
                    </div>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        התנתקות
                    </button>
                </header>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <div className={styles.sections}>
                    {/* Hero Section Settings */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>הגדרות עמוד הבית</h2>

                        <div className={styles.form}>
                            {/* Hero Image Upload */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>תמונת רקע (Hero)</label>
                                <div className={styles.imageUploadArea}>
                                    {settings?.hero_image_url ? (
                                        <div className={styles.imagePreview}>
                                            <Image
                                                src={settings.hero_image_url}
                                                alt="Hero preview"
                                                width={300}
                                                height={200}
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                    ) : (
                                        <div className={styles.noImage}>
                                            <span>אין תמונה</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className={styles.fileInput}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={styles.uploadBtn}
                                        disabled={uploading}
                                    >
                                        {uploading ? 'מעלה...' : 'העלאת תמונה'}
                                    </button>
                                </div>
                            </div>

                            {/* Hero Title */}
                            <div className={styles.formGroup}>
                                <label htmlFor="hero_title" className={styles.label}>כותרת ראשית</label>
                                <input
                                    type="text"
                                    id="hero_title"
                                    value={settings?.hero_title_he || ''}
                                    onChange={(e) => setSettings((prev) => prev ? { ...prev, hero_title_he: e.target.value } : null)}
                                    className={styles.input}
                                    placeholder="אמנות עכשווית"
                                />
                            </div>

                            {/* Hero Subtitle */}
                            <div className={styles.formGroup}>
                                <label htmlFor="hero_subtitle" className={styles.label}>תיאור (כותרת משנה)</label>
                                <textarea
                                    id="hero_subtitle"
                                    value={settings?.hero_subtitle_he || ''}
                                    onChange={(e) => setSettings((prev) => prev ? { ...prev, hero_subtitle_he: e.target.value } : null)}
                                    className={styles.textarea}
                                    rows={3}
                                    placeholder="תיאור קצר על הגלריה..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Contact Settings */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>פרטי התקשרות</h2>
                        <div className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.label}>אימייל</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={settings?.contact_email || ''}
                                    onChange={(e) => setSettings((prev) => prev ? { ...prev, contact_email: e.target.value } : null)}
                                    className={styles.input}
                                    placeholder="contact@example.com"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone" className={styles.label}>טלפון</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={settings?.contact_phone || ''}
                                    onChange={(e) => setSettings((prev) => prev ? { ...prev, contact_phone: e.target.value } : null)}
                                    className={styles.input}
                                    placeholder="050-0000000"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Social Media Settings */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>רשתות חברתיות</h2>
                        <div className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="instagram" className={styles.label}>אינסטגרם</label>
                                <input
                                    type="url"
                                    id="instagram"
                                    value={settings?.instagram_url || ''}
                                    onChange={(e) => setSettings((prev) => prev ? { ...prev, instagram_url: e.target.value } : null)}
                                    className={styles.input}
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="facebook" className={styles.label}>פייסבוק</label>
                                <input
                                    type="url"
                                    id="facebook"
                                    value={settings?.facebook_url || ''}
                                    onChange={(e) => setSettings((prev) => prev ? { ...prev, facebook_url: e.target.value } : null)}
                                    className={styles.input}
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                        </div>
                    </section>

                    <button
                        onClick={handleSave}
                        className={styles.saveBtn}
                        disabled={saving}
                    >
                        {saving ? 'שומר...' : 'שמירת הגדרות'}
                    </button>
                </div>
            </div>
        </div>
    );
}
