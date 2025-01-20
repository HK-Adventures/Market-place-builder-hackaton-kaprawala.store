import { headers } from 'next/headers';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div suppressHydrationWarning>{children}</div>
      </body>
    </html>
  );
} 