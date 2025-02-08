'use client'
import { urlFor } from '../sanity/lib/image';
import Image from 'next/image';
import { Image as SanityImage } from 'sanity';

interface ImageSlideshowProps {
  images: SanityImage[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function ImageSlideshow({ images, currentIndex, onNext, onPrev }: ImageSlideshowProps) {
  return (
    <div className="relative">
      <div className="aspect-w-1 aspect-h-1 w-full">
        <div className="relative w-full h-[500px]">
          <Image
            src={urlFor(images[currentIndex]).url()}
            alt={`Product image ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority={currentIndex === 0}
          />
        </div>
      </div>
      
      {/* Navigation buttons */}
      <button
        onClick={onPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
      >
        {/* Previous arrow icon */}
      </button>
      <button
        onClick={onNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
      >
        {/* Next arrow icon */}
      </button>
    </div>
  );
} 