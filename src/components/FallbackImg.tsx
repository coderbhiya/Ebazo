'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { src: string; fallback?: string };

// <img> that switches to `fallback` when `src` is missing or broken — including when it already
// failed during server rendering, before React could attach onError.
export default function FallbackImg({ src, fallback, ...rest }: Props) {
  const [current, setCurrent] = useState(src || fallback || '');
  const ref = useRef<HTMLImageElement>(null);
  const switchToFallback = () => {
    if (fallback && current !== fallback) setCurrent(fallback);
  };

  useEffect(() => {
    setCurrent(src || fallback || '');
  }, [src, fallback]);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) switchToFallback();
  });

  if (!current) return null;
  return <img ref={ref} src={current} onError={switchToFallback} {...rest} />;
}
