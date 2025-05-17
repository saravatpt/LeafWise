import { Camera } from 'lucide-react';

export function ImagePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-muted-foreground/30 bg-muted/20 aspect-square w-full max-w-sm mx-auto cursor-pointer hover:border-primary/70 transition-colors duration-300 shadow-inner">
      <Camera className="w-16 h-16 text-muted-foreground/50 mb-4" />
      <p className="text-center text-muted-foreground font-medium">
        Tap to scan or upload plant image
      </p>
      <p className="text-xs text-center text-muted-foreground/80 mt-2">
        (Full image scanning feature coming soon!)
      </p>
    </div>
  );
}
