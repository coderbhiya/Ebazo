'use client';

import React, { useRef } from 'react';

interface Props {
  // Classes for the scrolling row (layout for mobile + any grid layout for larger screens)
  className: string;
  children: React.ReactNode;
}

// Horizontal row that scrolls by touch swipe and mouse drag (no arrow buttons), so the same
// row can turn into a plain grid on larger screens.
export default function Carousel({ className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: 0 });

  // Mouse drag (touch already scrolls natively). Snapping is paused while dragging.
  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse' || e.button !== 0 || el.scrollWidth <= el.clientWidth) return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: 0 };

    const onMove = (ev: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = ev.clientX - drag.current.startX;
      drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
      if (drag.current.moved > 4) {
        el.style.scrollSnapType = 'none';
        el.style.cursor = 'grabbing';
        el.scrollLeft = drag.current.startLeft - dx;
      }
    };
    const onUp = () => {
      drag.current.active = false;
      el.style.cursor = '';
      el.style.scrollSnapType = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // A drag must not also open the card that was under the pointer
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved > 4) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = 0;
    }
  };

  return (
    <div
        ref={ref}
        className={`${className} overscroll-x-contain`}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        {children}
    </div>
  );
}
