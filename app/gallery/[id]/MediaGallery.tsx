'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PaintingMedia } from '@/lib/types';
import styles from './page.module.css';

interface MediaGalleryProps {
    media: PaintingMedia[];
    title: string;
}

const extractYouTubeId = (url: string) => {
    if (!url) return null;
    // If it's a raw ID (11 chars), return it directly
    if (url.length === 11) return url;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const toYouTubeEmbedUrl = (url: string) => {
    const id = extractYouTubeId(url);
    if (!id) return null;
    // minimal cleanup, ensures we just have the embed url with the id
    return `https://www.youtube.com/embed/${id}`;
};

export default function MediaGallery({ media, title }: MediaGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [videoError, setVideoError] = useState(false);

    // Sort media by sort_order
    const sortedMedia = [...media].sort((a, b) => a.sort_order - b.sort_order);
    const activeMedia = sortedMedia[activeIndex];

    // Reset loop or index on media change
    useEffect(() => {
        if (activeIndex >= sortedMedia.length) {
            setActiveIndex(0);
        }
        setVideoError(false);
    }, [sortedMedia, activeIndex]);

    if (!activeMedia) return null;

    const isVideo = activeMedia.media_type === 'video';
    const embedUrl = isVideo && activeMedia.video_url ? toYouTubeEmbedUrl(activeMedia.video_url) : null;
    const mainVideoId = isVideo && activeMedia.video_url ? extractYouTubeId(activeMedia.video_url) : null;

    return (
        <div className={styles.mediaGallery}>
            {/* Main Viewer */}
            <div className={styles.mainViewer}>
                {isVideo ? (
                    videoError || !embedUrl ? (
                        // Fallback Card
                        <div className={styles.fallbackCard}>
                            <p className={styles.fallbackText}>לא ניתן להציג את הווידאו כאן. לחץ כדי לצפות ביוטיוב.</p>
                            <a
                                href={activeMedia.video_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.fallbackButton}
                            >
                                צפה ביוטיוב
                            </a>
                        </div>
                    ) : (
                        // Iframe Player
                        <iframe
                            src={embedUrl || ''}
                            className={styles.iframe}
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            onError={() => setVideoError(true)}
                        />
                    )
                ) : (
                    // Standard Image Viewer
                    <div className={styles.imageWrapper}>
                        {activeMedia.image_url ? (
                            <Image
                                src={activeMedia.image_url}
                                alt={title}
                                fill
                                style={{ objectFit: 'contain' }}
                                priority
                                className={styles.mainImage}
                            />
                        ) : null}
                    </div>
                )}
            </div>

            {/* Thumbnail Strip */}
            {sortedMedia.length > 1 && (
                <div className={styles.thumbnailStrip}>
                    {sortedMedia.map((item, index) => {
                        const isItemVideo = item.media_type === 'video';
                        const isActive = index === activeIndex;

                        let thumbSrc = item.image_url;
                        if (isItemVideo && item.video_url) {
                            const ytid = extractYouTubeId(item.video_url);
                            if (ytid) thumbSrc = `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`;
                        }

                        return (
                            <button
                                key={item.id}
                                className={`${styles.thumbnail} ${isActive ? styles.activeThumb : ''}`}
                                onClick={() => setActiveIndex(index)}
                                aria-label={isItemVideo ? `Play video ${index + 1}` : `View image ${index + 1}`}
                            >
                                {thumbSrc ? (
                                    <Image
                                        src={thumbSrc}
                                        alt={`Thumbnail ${index + 1}`}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className={styles.thumbPlaceholder} />
                                )}
                                {isItemVideo && <div className={styles.playIcon}>▶</div>}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
