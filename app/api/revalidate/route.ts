// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * On-Demand Revalidation API
 * 
 * Usage:
 * - Development: http://localhost:3000/api/revalidate?secret=dev123
 * - Production: https://yourdomain.com/api/revalidate?secret=YOUR_SECRET_KEY
 * 
 * This will immediately refresh all data from Supabase without waiting for the revalidate timer
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get('secret');
    const path = searchParams.get('path') || '/';

    // Verify secret token
    const expectedSecret = process.env.REVALIDATE_SECRET || 'dev123';

    if (secret !== expectedSecret) {
        return NextResponse.json(
            { error: 'Invalid secret token' },
            { status: 401 }
        );
    }

    try {
        // Revalidate the specified path (default: homepage)
        revalidatePath(path);

        console.log(`✅ Revalidated path: ${path} at ${new Date().toISOString()}`);

        return NextResponse.json({
            success: true,
            message: `Path ${path} has been revalidated`,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ Revalidation error:', error);

        return NextResponse.json(
            { error: 'Error revalidating', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { secret, path = '/' } = body;

        // Verify secret token
        const expectedSecret = process.env.REVALIDATE_SECRET || 'dev123';

        if (secret !== expectedSecret) {
            return NextResponse.json(
                { error: 'Invalid secret token' },
                { status: 401 }
            );
        }

        // Revalidate the specified path
        revalidatePath(path);

        console.log(`✅ Revalidated path: ${path} at ${new Date().toISOString()}`);

        return NextResponse.json({
            success: true,
            message: `Path ${path} has been revalidated`,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ Revalidation error:', error);

        return NextResponse.json(
            { error: 'Error revalidating', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
