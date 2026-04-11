export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/jobs/:path*',
    '/upload/:path*',
    '/preferences/:path*',
    '/resumes/:path*',
    '/admin/:path*',
    '/settings/:path*',
  ],
};
