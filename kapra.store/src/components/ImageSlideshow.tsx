'use client'
import { useState } from 'react';
import { urlFor } from '../sanity/lib/image';

interface Image {
  _key: string;
  asset: {
    _ref: string;
    _type: 'reference';
  };
  color?: string;
  alt?: string;
  [key: string]: any;
}

interface ImageSlideshowProps {
  images?: Image[];
  selectedColor?: string;
}

export function ImageSlideshow({ images = [], selectedColor }: ImageSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const filteredImages = selectedColor && images 
    ? images.filter(img => img.color === selectedColor)
    : images;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  if (!filteredImages.length) return null;

  return (
    <div className="relative group">
      {/* Main Image */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <img
          src={urlFor(filteredImages[currentIndex]).width(1000).height(1000).url()}
          alt={filteredImages[currentIndex].alt || 'Product image'}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navigation Arrows */}
      {filteredImages.length > 1 && (
        <>
          <button
            onClick={previousImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            ←
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            →
          </button>
        </>
      )}

      {/* Thumbnail Navigation */}
      <div className="flex justify-center mt-4 space-x-2">
        {filteredImages.map((image, index) => (
          <button
            key={image._key}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-black w-4' : 'bg-gray-300'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 