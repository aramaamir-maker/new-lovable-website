import Link from 'next/link';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/data-store';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <section className={styles.hero}>
      {/* Image Area - Left side in visual (Right in RTL DOM) */}
      <div className={styles.heroImage}>
        {settings.hero_image_url ? (
          <Image
            src={settings.hero_image_url}
            alt={settings.hero_title_he}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderText}>גלריה</span>
          </div>
        )}
      </div>

      {/* Content Area - Right side in visual (Left in RTL DOM) */}
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{settings.hero_title_he || 'אמנות עכשווית'}</h1>
        <p className={styles.heroDescription}>
          {settings.hero_subtitle_he || 'גלריה המתמחה ביצירות אמנות מודרניות ומינימליסטיות.'}
        </p>
        <Link href="/gallery" className={styles.ctaButton}>
          צפייה ביצירות
        </Link>
      </div>
    </section>
  );
}
