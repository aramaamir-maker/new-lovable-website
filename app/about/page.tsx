import type { Metadata } from 'next';
import Image from 'next/image';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'על האמן | קמי תכשיטי קירות',
    description: 'הכירו את האמן מאחורי קמי תכשיטי קירות - סיפור, השראה ותהליך היצירה',
};

export default function AboutPage() {
    return (
        <div className={styles.about}>
            <div className={styles.container}>
                <h1 className={styles.title}>על האמן</h1>

                <div className={styles.content}>
                    {/* Image Area - Placeholder */}
                    <div className={styles.imageArea}>
                        {/* 
                          Ideally this would be a real image of the artist.
                          For now, a styled placeholder or generic art image.
                        */}
                        <div className={styles.placeholderImage}>
                            <span>תמונת האמן</span>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className={styles.textArea}>
                        <p className={styles.paragraph}>
                            שמי קמי. אני יוצר עבודות מקוריות בעבודת יד — אמנות עכשווית עם נוכחות שקטה וחומריות מורגשת.
                        </p>
                        <p className={styles.paragraph}>
                            העבודות משלבות שכבות, טקסטורות וצבע, ונבנות תהליך־אחר־תהליך — כך שכל יצירה נשארת חד־פעמית.
                        </p>
                        <p className={styles.paragraph}>
                            אם אהבתם יצירה או תרצו להזמין עבודה בהתאמה, אפשר לפנות אליי בוואטסאפ או בטלפון.
                        </p>

                        <div className={styles.signature}>
                            קמי
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
