import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'צור קשר | קמי תכשיטי קירות',
    description: 'צרו קשר עם קמי תכשיטי קירות - נשמח לשמוע מכם ולענות על כל שאלה',
};

export default function ContactPage() {
    return (
        <div className={styles.contact}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>בואו לבקר אותנו</h1>
                    <p className={styles.subtitle}>
                        הגלריה שלנו פתוחה לקהל. נשמח לארח אתכם ולהציג את הקולקציה המלאה
                    </p>
                </header>

                <div className={styles.cardsRow}>
                    <div className={styles.card}>
                        <div className={styles.iconWrapper}>🕒</div>
                        <h3 className={styles.cardTitle}>שעות פעילות</h3>
                        <p className={styles.cardText}>ראשון-חמישי: 10:00-18:00</p>
                        <p className={styles.cardText}>שישי: 10:00-14:00</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.iconWrapper}>✉️</div>
                        <h3 className={styles.cardTitle}>אימייל</h3>
                        <a href="mailto:contact@kammy.co.il" className={styles.cardLink}>contact@kammy.co.il</a>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.iconWrapper}>📞</div>
                        <h3 className={styles.cardTitle}>טלפון</h3>
                        <a href="tel:051-5199250" className={styles.cardLink}>051-5199250</a>
                        <a href="https://wa.me/972515199250?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%99%D7%A6%D7%99%D7%A8%D7%95%D7%AA%20%D7%A9%D7%9C%D7%9A" target="_blank" className={styles.whatsappLink}>
                            WhatsApp 💬
                        </a>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.iconWrapper}>📍</div>
                        <h3 className={styles.cardTitle}>כתובת</h3>
                        <p className={styles.cardText}>רחוב הנביאים 12, תל אביב-יפו</p>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <h2 className={styles.formTitle}>שלח לנו הודעה</h2>
                    <form className={styles.form}>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name" className={styles.label}>שם מלא</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className={styles.input}
                                    placeholder="שם מלא"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.label}>אימייל</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={styles.input}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="message" className={styles.label}>הודעה</label>
                            <textarea
                                id="message"
                                name="message"
                                className={styles.textarea}
                                placeholder="כתוב את ההודעה כאן..."
                                rows={6}
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            שלח הודעה
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
