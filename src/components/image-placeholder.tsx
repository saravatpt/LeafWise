
import { Camera } from 'lucide-react';
import React, { useRef } from 'react';

interface ImagePlaceholderProps {
  onImageSelect: (file: File) => void;
  currentImage?: string | null; // To display a preview if an image is selected
}

export function ImagePlaceholder({ onImageSelect, currentImage }: ImagePlaceholderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePlaceholderClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-muted-foreground/30 bg-muted/20 aspect-square w-full max-w-sm mx-auto cursor-pointer hover:border-primary/70 transition-colors duration-300 shadow-inner relative overflow-hidden"
      onClick={handlePlaceholderClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlaceholderClick(); }}
      aria-label="Tap to scan or upload plant image"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-hidden="true"
      />
      {currentImage ? (
        <img src={currentImage} alt="Selected plant" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <>
          <Camera className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <p className="text-center text-muted-foreground font-medium">
            Tap to scan or upload plant image
          </p>
          <p className="text-xs text-center text-muted-foreground/80 mt-2">
            (AI image identification coming soon!)
          </p>
        </>
      )}
    </div>
  );
}
