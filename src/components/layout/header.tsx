import { Leaf } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
          <Leaf className="w-8 h-8 text-accent" />
          <span>LeafWise</span>
        </Link>
        {/* Navigation items can be added here if needed */}
      </div>
    </header>
  );
}
