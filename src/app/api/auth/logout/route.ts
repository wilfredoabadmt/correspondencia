import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const redirectUrl = new URL('/', request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Delete session cookies with explicit path and maxAge 0
    const cookieOptions = { path: '/', maxAge: 0, expires: new Date(0) };
    response.cookies.set('session_token', '', cookieOptions);
    response.cookies.set('user_role', '', cookieOptions);
    response.cookies.set('user_org', '', cookieOptions);
    response.cookies.set('user_name', '', cookieOptions);
    response.cookies.set('user_email', '', cookieOptions);

    return response;
}

export async function POST(request: NextRequest) {
    const redirectUrl = new URL('/', request.url);
    const response = NextResponse.redirect(redirectUrl);

    const cookieOptions = { path: '/', maxAge: 0, expires: new Date(0) };
    response.cookies.set('session_token', '', cookieOptions);
    response.cookies.set('user_role', '', cookieOptions);
    response.cookies.set('user_org', '', cookieOptions);
    response.cookies.set('user_name', '', cookieOptions);
    response.cookies.set('user_email', '', cookieOptions);

    return response;
}
