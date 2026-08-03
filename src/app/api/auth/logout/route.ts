import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL('/', request.url);
    const response = NextResponse.redirect(url);

    // Delete session cookies
    response.cookies.delete('session_token');
    response.cookies.delete('user_role');
    response.cookies.delete('user_org');
    response.cookies.delete('user_name');
    response.cookies.delete('user_email');

    return response;
}

export async function POST(request: Request) {
    const response = NextResponse.json({ success: true }, { status: 200 });

    // Delete session cookies
    response.cookies.delete('session_token');
    response.cookies.delete('user_role');
    response.cookies.delete('user_org');
    response.cookies.delete('user_name');
    response.cookies.delete('user_email');

    return response;
}
