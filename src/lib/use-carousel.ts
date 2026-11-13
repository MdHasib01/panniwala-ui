'use client';

import { useEffect, useRef, useState } from 'react';

/** Native scrolling; measure cards only on resize and when scrolling settles. */
export function useCarousel(itemCount: number, align: 'start' | 'center' = 'start') {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ activeIndex: 0, canScrollLeft: false, canScrollRight: false });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;

    const update = () => {
      clearTimeout(timer);
      const bounds = el.getBoundingClientRect();
      const padding = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
      const target = align === 'center' ? bounds.left + el.clientWidth / 2 : bounds.left + padding;
      let activeIndex = 0;
      let minDistance = Infinity;
      Array.from(el.children).forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + (align === 'center' ? rect.width / 2 : 0) - target);
        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = index;
        }
      });
      const canScrollLeft = el.scrollLeft > 4;
      const canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
      setState((previous) => previous.activeIndex === activeIndex &&
        previous.canScrollLeft === canScrollLeft && previous.canScrollRight === canScrollRight
        ? previous : { activeIndex, canScrollLeft, canScrollRight });
    };

    // Debounced fallback for browsers without scrollend support.
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(update, 120);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('scrollend', update);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    update();
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('scrollend', update);
    };
  }, [itemCount, align]);

  const scrollToCard = (index: number) => {
    const el = scrollerRef.current;
    const card = el?.children[index];
    if (!el || !card) return;
    const rect = card.getBoundingClientRect();
    const offset = rect.left - el.getBoundingClientRect().left;
    const inset = align === 'center' ? (el.clientWidth - rect.width) / 2
      : parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    // CSS controls smooth scrolling and respects reduced-motion preferences.
    el.scrollTo({ left: el.scrollLeft + offset - inset, behavior: 'auto' });
  };

  const scrollByCard = (direction: 1 | -1) => scrollToCard(
    Math.max(0, Math.min(itemCount - 1, state.activeIndex + direction))
  );

  return { scrollerRef, ...state, scrollToCard, scrollByCard };
}
