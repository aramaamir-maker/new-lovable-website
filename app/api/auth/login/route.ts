import { NextResponse } from 'next/server';
import { verifyPassword, setAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        if (!password) {
            return NextResponse.json(
                { error: 'נדרשת סיסמה' },
                { status: 400 }
            );
        }

        const isValid = verifyPassword(password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'סיסמה שגויה' },
                { status: 401 }
            );
        }

        await setAdminSession();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'שגיאת התחברות' },
            { status: 500 }
        );
    }
}
