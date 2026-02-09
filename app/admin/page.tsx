'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const adminLinks = [
    { href: '/admin/products', label: 'ניהול יצירות', description: 'הוספה, עריכה ומחיקה של יצירות' },
    { href: '/admin/settings', label: 'הגדרות האתר', description: 'תמונת רקע, כותרות ופרטי התקשרות' },
];

export default function AdminPage() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <div className={styles.admin}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>ממשק ניהול</h1>
                        <p className={styles.subtitle}>ברוכים הבאים לממשק הניהול</p>
                    </div>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        התנתקות
                    </button>
                </header>

                <nav className={styles.nav}>
                    {adminLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={styles.navCard}>
                            <h2 className={styles.navTitle}>{link.label}</h2>
                            <p className={styles.navDescription}>{link.description}</p>
                        </Link>
                    ))}
                </nav>

                <footer className={styles.footer}>
                    <Link href="/" className={styles.viewSiteLink}>
                        צפייה באתר ←
                    </Link>
                </footer>
            </div>
        </div>
    );
}
