import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const redirectUrl = new URL('/', request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Delete session cookies
    response.cookies.delete('session_token');
    response.cookies.delete('user_role');
    response.cookies.delete('user_org');
    response.cookies.delete('user_name');
    response.cookies.delete('user_email');

    return response;
}

export async function POST(request: NextRequest) {
    const redirectUrl = new URL('/', request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Delete session cookies
    response.cookies.delete('session_token');
    response.cookies.delete('user_role');
    response.cookies.delete('user_org');
    response.cookies.delete('user_name');
    response.cookies.delete('user_email');

    return response;
}
