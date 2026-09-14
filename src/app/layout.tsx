import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VICE DISTRICT 3D | Open-World Action Experience',
  description: 'GTA-inspired 3D open-world prototype built with Next.js, React Three Fiber, Rapier Physics, Zustand, Route Handlers, Zod, and Prisma.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full overflow-hidden">
      <body className="h-full w-full overflow-hidden bg-slate-950 select-none antialiased">
        {children}
      </body>
    </html>
  );
}
