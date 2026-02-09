import { NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/lib/data-store';

export async function GET() {
    try {
        const settings = await getSiteSettings();
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to get settings:', error);
        return NextResponse.json(
            { error: 'שגיאה בטעינת ההגדרות' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const updates = await request.json();
        const settings = await updateSiteSettings(updates);
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to update settings:', error);
        return NextResponse.json(
            { error: 'שגיאה בשמירת ההגדרות' },
            { status: 500 }
        );
    }
}
