import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata = {
  title: 'JobHunt — Your Career Command Center',
  description: 'Personalized job search dashboard with AI-powered resume tailoring and ATS scoring',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-mesh" aria-hidden="true" />
        <AuthProvider>
          <ThemeProvider>
            <div className="relative z-10">
              {children}
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
