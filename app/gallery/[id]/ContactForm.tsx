'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface ContactFormProps {
    paintingTitle: string;
}

export default function ContactForm({ paintingTitle }: ContactFormProps) {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setStatus('success');
    };

    if (status === 'success') {
        return (
            <div className={styles.formSuccess}>
                <h3>תודה שפנית אלינו!</h3>
                <p>קיבלנו את הפרטים שלך ונחזור אליך בהקדם.</p>
                <button
                    onClick={() => setStatus('idle')}
                    className={styles.resetBtn}
                >
                    שלח פניה נוספת
                </button>
            </div>
        );
    }

    return (
        <form className={styles.contactForm} onSubmit={handleSubmit}>
            <h3 className={styles.formTitle}>השאירו פרטים ונחזור אליכם</h3>

            <div className={styles.formGroup}>
                <input
                    type="text"
                    placeholder="שם מלא *"
                    required
                    className={styles.input}
                />
                <input
                    type="tel"
                    placeholder="טלפון *"
                    required
                    className={styles.input}
                />
            </div>

            <input
                type="email"
                placeholder="אימייל"
                className={styles.input}
            />

            <textarea
                placeholder="ספרו לנו בטח שנוכל לעזור..."
                className={styles.textarea}
                rows={3}
            ></textarea>

            <button
                type="submit"
                className={styles.submitBtn}
                disabled={status === 'submitting'}
            >
                {status === 'submitting' ? 'שולח...' : 'שלח פניה'}
            </button>
        </form>
    );
}
