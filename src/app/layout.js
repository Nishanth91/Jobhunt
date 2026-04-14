import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import ThemeProvider from '@/components/ThemeProvider';
import SidebarProvider from '@/components/SidebarProvider';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title: 'JobHunt — Your Career Command Center',
  description: 'Personalized job search dashboard with AI-powered resume tailoring and ATS scoring',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-mesh" aria-hidden="true" />
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>
              <div className="relative z-10 overflow-x-hidden w-full max-w-[100vw]">
                {children}
              </div>
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
