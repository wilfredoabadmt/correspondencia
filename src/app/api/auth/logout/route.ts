import { NextResponse, type NextRequest } from 'next/server';

function getRedirectUrl(request: NextRequest): URL {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';

    if (host && !host.startsWith('0.0.0.0') && !host.startsWith('127.0.0.1')) {
        return new URL('/login', `${proto}://${host}`);
    }

    const envUrl = process.env.COOLIFY_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (envUrl) {
        return new URL('/login', envUrl);
    }

    return new URL('/login', request.nextUrl);
}

export async function GET(request: NextRequest) {
    const redirectUrl = getRedirectUrl(request);
    const response = NextResponse.redirect(redirectUrl);

    // Delete session cookies with explicit path and maxAge 0
    const cookieOptions = { path: '/', maxAge: 0, expires: new Date(0) };
    response.cookies.set('session_token', '', cookieOptions);
    response.cookies.set('better-auth.session_token', '', cookieOptions);
    response.cookies.set('user_role', '', cookieOptions);
    response.cookies.set('user_org', '', cookieOptions);
    response.cookies.set('user_name', '', cookieOptions);
    response.cookies.set('user_email', '', cookieOptions);

    return response;
}

export async function POST(request: NextRequest) {
    const redirectUrl = getRedirectUrl(request);
    const response = NextResponse.redirect(redirectUrl);

    const cookieOptions = { path: '/', maxAge: 0, expires: new Date(0) };
    response.cookies.set('session_token', '', cookieOptions);
    response.cookies.set('better-auth.session_token', '', cookieOptions);
    response.cookies.set('user_role', '', cookieOptions);
    response.cookies.set('user_org', '', cookieOptions);
    response.cookies.set('user_name', '', cookieOptions);
    response.cookies.set('user_email', '', cookieOptions);

    return response;
}
