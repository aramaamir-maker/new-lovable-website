// TODO: Replace with proper auth library (e.g., NextAuth.js, Lucia)
// This is a simple password-based auth for development

import { cookies } from 'next/headers';

const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_TOKEN = 'authenticated'; // Simple token for demo

/**
 * Verify admin password against environment variable
 * TODO: Replace with proper password hashing (bcrypt)
 */
export function verifyPassword(password: string): boolean {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        console.error('ADMIN_PASSWORD environment variable is not set');
        return false;
    }
    return password === adminPassword;
}

/**
 * Set admin session cookie
 * TODO: Replace with proper session management
 */
export async function setAdminSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, SESSION_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
    });
}

/**
 * Clear admin session cookie
 */
export async function clearAdminSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);
}

/**
 * Check if user is authenticated as admin
 * TODO: Replace with proper session validation
 */
export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_SESSION_COOKIE);
    return session?.value === SESSION_TOKEN;
}

/**
 * Get session cookie value (for middleware)
 */
export function getSessionCookieName(): string {
    return ADMIN_SESSION_COOKIE;
}

export function getSessionTokenValue(): string {
    return SESSION_TOKEN;
}
