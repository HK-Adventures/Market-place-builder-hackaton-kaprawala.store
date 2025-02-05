import { headers } from 'next/headers';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen">
      {children}
    </div>
  );
} 