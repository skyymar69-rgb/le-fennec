import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Camera, Loader2, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { uploadMultipleImages } from '../../lib/storage';
import { useApp } from '../../contexts/AppContext';

interface Props {
  images:   string[];
  onChange: (urls: string[]) => void;
  max?:     number;
}

const ImageUploader: React.FC<Props> = ({ images, onChange, max = 10 }) => {
  const { user } = useApp();
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const listingId = `tmp_${Date.now()}`;

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;

    const remaining = max - images.length;
    const selected  = Array.from(files).slice(0, remaining);
    if (!selected.length) return;

    // Validate types and sizes
    const valid = selected.filter(f => {
      if (!f.type.startsWith('image/')) return false;
      if (f.size > 10 * 1024 * 1024) return false; // 10MB max
      return true;
    });

    if (!valid.length) return;

    setUploading(true);
    try {
      const uploaded = await uploadMultipleImages(valid, user?.id || 'guest', listingId);
      onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }, [images, max, user, onChange]);

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));
  const moveLeft  = (idx: number) => {
    if (idx === 0) return;
    const next = [...images];
    [next[idx-1], next[idx]] = [next[idx], next[idx-1]];
    onChange(next);
  };
  const moveRight = (idx: number) => {
    if (idx === images.length - 1) return;
    const next = [...images];
    [next[idx], next[idx+1]] = [next[idx+1], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {images.length < max && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-8 cursor-pointer transition-all ${
            dragOver
              ? 'border-dz-green bg-dz-green/10 scale-[1.01]'
              : 'border-border hover:border-dz-green hover:bg-muted/50'
          }`}
        >
          {uploading ? (
            <Loader2 size={32} className="text-dz-green animate-spin"/>
          ) : (
            <Camera size={32} className="text-muted-foreground"/>
          )}
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">
              {uploading ? 'Upload en cours…' : 'Glissez vos photos ici'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ou cliquez pour sélectionner · {images.length}/{max} · JPG, PNG, WebP · 10 Mo max
            </p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleFiles(e.target.files)}/>
        </div>
      )}

      {/* Photo grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-xl overflow-hidden bg-muted border border-border">
              <img src={url} alt={`Photo ${i+1}`} className="w-full h-full object-cover"/>

              {/* Main badge */}
              {i === 0 && (
                <div className="absolute bottom-0 inset-x-0 bg-dz-green text-white text-[9px] font-black text-center py-0.5 flex items-center justify-center gap-0.5">
                  <Star size={8}/> PHOTO PRINCIPALE
                </div>
              )}

              {/* Controls on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {i > 0 && (
                  <button type="button" onClick={() => moveLeft(i)}
                    className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors">
                    <ArrowLeft size={12}/>
                  </button>
                )}
                <button type="button" onClick={() => remove(i)}
                  className="w-7 h-7 bg-dz-red/80 hover:bg-dz-red rounded-full flex items-center justify-center text-white transition-colors">
                  <X size={12}/>
                </button>
                {i < images.length - 1 && (
                  <button type="button" onClick={() => moveRight(i)}
                    className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors">
                    <ArrowRight size={12}/>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add more */}
          {images.length < max && (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-dz-green hover:bg-dz-green/5 flex flex-col items-center justify-center gap-1 transition-all">
              <Upload size={18} className="text-muted-foreground"/>
              <span className="text-[9px] text-muted-foreground font-medium">Ajouter</span>
            </button>
          )}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-xs text-amber-600 flex items-center gap-1.5 px-1">
          <Camera size={11}/>
          Les annonces avec photos reçoivent <strong>5× plus de contacts</strong>
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
