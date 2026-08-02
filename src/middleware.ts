import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/modules/auth/lib/auth';

const publicRoutes = ['/login'];
const protectedRoutesDefaultRedirect = '/dashboard';
const publicRoutesDefaultRedirect = '/login';

export default async function middleware(req: NextRequest) {
    const { nextUrl } = req;
    const session = await auth();
    const isLoggedIn = !!session?.user;

    const isPublic = publicRoutes.includes(nextUrl.pathname);
    const isRoot = nextUrl.pathname === '/';

    if (isLoggedIn) {
        if (isPublic || isRoot) {
            return NextResponse.redirect(new URL(protectedRoutesDefaultRedirect, nextUrl));
        }
        return NextResponse.next();
    }

    if (!isPublic) {
        return NextResponse.redirect(new URL(publicRoutesDefaultRedirect, nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};