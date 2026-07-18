"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const total = images.length;

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + total) % total),
    [total]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % total),
    [total]
  );

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    },
    [onClose, prev, next]
  );

  useEffect(() => {
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleKey]);

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[60] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Dark backdrop */}
        <div className="pointer-events-none fixed inset-0 bg-black/90 backdrop-blur-md" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close lightbox"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Counter */}
        {total > 1 && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-white/70 backdrop-blur-md">
            {index + 1} / {total}
          </div>
        )}

        {/* Navigation arrows */}
        {total > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next image"
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image */}
        <motion.div
          key={`lightbox-img-${index}`}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-h-[85vh] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={images[index]}
            alt={`Image ${index + 1} of ${total}`}
            width={1200}
            height={800}
            className="max-h-[85vh] w-auto rounded-lg object-contain"
            priority
            unoptimized
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
