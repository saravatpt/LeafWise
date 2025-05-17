export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-muted/50 border-t border-border py-6 text-center text-muted-foreground">
      <div className="container mx-auto px-4">
        <p className="text-sm">&copy; {currentYear} LeafWise. All rights reserved.</p>
        <p className="text-xs mt-1">Discover the world of plants.</p>
      </div>
    </footer>
  );
}
