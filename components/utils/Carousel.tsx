import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./Carousel.module.scss";

interface CarouselProps {
  srcs: string[];
  authors: string[];
  blogTitles: string[];
  blogUrls: string[];
  onChangeCursor?: (cursorPos: number) => void;
}

export const Carousel = ({ srcs, authors, blogTitles, blogUrls }: CarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onScroll = useCallback((emblaApi: any) => {
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress * 100);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll(emblaApi);
    emblaApi.on("reInit", onScroll);
    emblaApi.on("scroll", onScroll);
  }, [emblaApi, onScroll]);

  return (
    <div className={styles.embla}>
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.container}>
          {srcs.map((src, index) => (
            <div className={styles.slide} key={index}>
              <Link href={blogUrls[index]} legacyBehavior>
                <a className={styles.slideInner}>
                  <Image
                    className={styles.slideImg}
                    src={src}
                    alt={blogTitles[index]}
                    layout="fill"
                  />
                  <div className={styles.overlay}>
                    <h3 className={styles.title}>{blogTitles[index]}</h3>
                    <div className={styles.author}>
                      <span>by {authors[index]}</span>
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <button className={styles.button} onClick={scrollPrev} aria-label="Previous Slide">
          <FaChevronLeft />
        </button>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ transform: `scaleX(${scrollProgress / 100})` }}
          />
        </div>

        <button className={styles.button} onClick={scrollNext} aria-label="Next Slide">
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};