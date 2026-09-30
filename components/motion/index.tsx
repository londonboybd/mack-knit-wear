"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
} from "motion/react";

/**
 * Shared Motion Tokens
 * Coherent durations, easings, distances, and stagger limits
 * tuned for an editorial, tactile, credible textile portfolio.
 */
export const motionTokens = {
  duration: {
    feedback: 0.2, // 200ms UI micro-interactions
    content: 0.55, // 550ms content entrances
    image: 0.75, // 750ms image settling
    slow: 0.9, // 900ms contemplative scenes
  },
  ease: {
    // Editorial deceleration: fast initial velocity with calm settling
    editorial: [0.16, 1, 0.3, 1] as const,
    subtle: [0.25, 0.1, 0.25, 1] as const,
    standard: [0.4, 0, 0.2, 1] as const,
  },
  distance: {
    xs: 8,
    sm: 14,
    md: 20,
    lg: 28,
  },
  stagger: {
    default: 65, // 65ms step
    maxDelay: 320, // 320ms maximum cumulative delay
  },
} as const;

/**
 * Hook to detect and reactively subscribe to user's reduced-motion preference.
 */
export function usePrefersReducedMotion(): boolean {
  const motionReduced = useReducedMotion();
  const [reduced, setReduced] = useState<boolean>(Boolean(motionReduced));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return Boolean(motionReduced || reduced);
}

type AllowedTag = "div" | "section" | "article" | "aside" | "header" | "footer";

const motionTagMap = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  aside: motion.aside,
  header: motion.header,
  footer: motion.footer,
};

/* =========================================================================
   1. SECTION REVEAL (Scroll-triggered content entrance)
   ========================================================================= */

export interface SectionRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  className?: string;
  as?: AllowedTag;
  style?: React.CSSProperties;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export function SectionReveal({
  children,
  delay = 0,
  direction = "up",
  distance = motionTokens.distance.md,
  className = "",
  as = "div",
  style,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isInView = useInView(ref, {
    once: true,
    margin: "0px 0px -40px 0px",
  });

  const getOffset = () => {
    switch (direction) {
      case "up":
        return { y: distance };
      case "down":
        return { y: -distance };
      case "left":
        return { x: distance };
      case "right":
        return { x: -distance };
      default:
        return {};
    }
  };

  const Tag = as;
  if (reducedMotion) {
    return (
      <Tag
        ref={ref}
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={`motion-reveal is-revealed ${className}`}
        style={style}
      >
        {children}
      </Tag>
    );
  }

  const MotionComponent = motionTagMap[as] || motion.div;
  const initialOffset = getOffset();

  return (
    <MotionComponent
      ref={ref}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={`motion-reveal ${isInView ? "is-revealed" : ""} ${className}`}
      initial={{ opacity: 0, ...initialOffset }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...initialOffset }}
      transition={{
        duration: motionTokens.duration.content,
        ease: motionTokens.ease.editorial,
        delay: delay / 1000,
      }}
      style={style}
    >
      {children}
    </MotionComponent>
  );
}

// Backward-compatible alias for existing imports
export const Reveal = SectionReveal;

/* =========================================================================
   2. HERO ENTRANCE (Secondary above-the-fold content on initial load)
   ========================================================================= */

export interface HeroEntranceProps {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  direction?: "up" | "down" | "none";
  className?: string;
  as?: AllowedTag;
  style?: React.CSSProperties;
  id?: string;
  "aria-label"?: string;
}

export function HeroEntrance({
  children,
  delay = 0,
  distance = motionTokens.distance.sm,
  direction = "up",
  className = "",
  as = "div",
  style,
  id,
  "aria-label": ariaLabel,
}: HeroEntranceProps) {
  const reducedMotion = usePrefersReducedMotion();

  const Tag = as;
  if (reducedMotion) {
    return (
      <Tag
        id={id}
        aria-label={ariaLabel}
        className={`motion-hero-entrance ${className}`}
        style={style}
      >
        {children}
      </Tag>
    );
  }

  const MotionComponent = motionTagMap[as] || motion.div;
  const initialOffset =
    direction === "up"
      ? { y: distance }
      : direction === "down"
      ? { y: -distance }
      : {};

  return (
    <MotionComponent
      id={id}
      aria-label={ariaLabel}
      className={`motion-hero-entrance ${className}`}
      initial={{ opacity: 0, ...initialOffset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: motionTokens.duration.content,
        ease: motionTokens.ease.editorial,
        delay: delay / 1000,
      }}
      style={style}
    >
      {children}
    </MotionComponent>
  );
}

/* =========================================================================
   3. STAGGER GROUP (Coordinated sequential reveals)
   ========================================================================= */

export interface StaggerGroupProps {
  children: React.ReactNode;
  staggerInterval?: number;
  maxDelay?: number;
  distance?: number;
  className?: string;
  as?: AllowedTag;
  style?: React.CSSProperties;
  id?: string;
  "aria-label"?: string;
}

export function StaggerGroup({
  children,
  staggerInterval = motionTokens.stagger.default,
  maxDelay = motionTokens.stagger.maxDelay,
  distance = motionTokens.distance.sm,
  className = "",
  as = "div",
  style,
  id,
  "aria-label": ariaLabel,
}: StaggerGroupProps) {
  const childArray = React.Children.toArray(children);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "0px 0px -40px 0px",
  });
  const reducedMotion = usePrefersReducedMotion();

  const Tag = as;
  if (reducedMotion) {
    return (
      <Tag
        id={id}
        aria-label={ariaLabel}
        className={`motion-stagger-group ${className}`}
        style={style}
      >
        {children}
      </Tag>
    );
  }

  const MotionComponent = motionTagMap[as] || motion.div;

  return (
    <MotionComponent
      ref={ref}
      id={id}
      aria-label={ariaLabel}
      className={`motion-stagger-group ${className}`}
      style={style}
    >
      {childArray.map((child, index) => {
        const itemDelay = Math.min(index * staggerInterval, maxDelay) / 1000;
        const key =
          React.isValidElement(child) && child.key != null
            ? child.key
            : index;

        return (
          <motion.div
            key={key}
            className="motion-stagger-item"
            initial={{ opacity: 0, y: distance }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
            transition={{
              duration: motionTokens.duration.content,
              ease: motionTokens.ease.editorial,
              delay: itemDelay,
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </MotionComponent>
  );
}

/* =========================================================================
   4. IMAGE REVEAL (Aspect-ratio-preserving editorial image settle)
   ========================================================================= */

export interface ImageRevealProps {
  src: string;
  alt: string;
  aspectRatio?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  delay?: number;
  sizes?: string;
  style?: React.CSSProperties;
}

export function ImageReveal({
  src,
  alt,
  aspectRatio,
  className = "",
  imageClassName = "",
  priority = false,
  delay = 0,
  sizes,
  style,
}: ImageRevealProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isInView = useInView(ref, {
    once: true,
    margin: "0px 0px -30px 0px",
  });

  const shouldReveal = reducedMotion || priority || isInView;

  return (
    <div
      ref={ref}
      className={`motion-image-reveal-wrapper ${
        shouldReveal && (imageLoaded || priority || reducedMotion)
          ? "revealed"
          : ""
      } ${className}`}
      style={{
        aspectRatio,
        overflow: "hidden",
        position: "relative",
        backgroundColor: "var(--surface-secondary)",
        ...style,
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        sizes={sizes}
        onLoad={() => setImageLoaded(true)}
        initial={
          reducedMotion
            ? false
            : {
                opacity: 0,
                scale: 1.035,
              }
        }
        animate={
          reducedMotion || (shouldReveal && imageLoaded)
            ? {
                opacity: 1,
                scale: 1,
              }
            : priority
            ? {
                opacity: 1,
                scale: 1,
              }
            : {
                opacity: 0,
                scale: 1.035,
              }
        }
        transition={{
          opacity: {
            duration: motionTokens.duration.content,
            ease: "easeOut",
            delay: delay / 1000,
          },
          scale: {
            duration: motionTokens.duration.image,
            ease: motionTokens.ease.editorial,
            delay: delay / 1000,
          },
        }}
        className={`motion-image-reveal-target ${imageClassName}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}

/* =========================================================================
   5. BOUNDED PARALLAX (Subtle scroll-linked movement inside an overflow frame)
   ========================================================================= */

export interface BoundedParallaxProps {
  children: React.ReactNode;
  offset?: number; // max travel in pixels
  className?: string;
  style?: React.CSSProperties;
}

export function BoundedParallax({
  children,
  offset = 16,
  className = "",
  style,
}: BoundedParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Map progress (0 -> 1) to bounded travel (-offset -> +offset)
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  if (reducedMotion) {
    return (
      <div
        className={`motion-parallax-container ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`motion-parallax-container ${className}`}
      style={{
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      <motion.div
        style={{
          y,
          willChange: "transform",
          height: "100%",
          width: "100%",
          scale: 1.05, // Slight scale reserve so frame edges never uncover
        }}
        className="motion-parallax-inner"
      >
        {children}
      </motion.div>
    </div>
  );
}

/* =========================================================================
   6. SCROLL PROGRESS (scaleX GPU-accelerated reading indicator)
   ========================================================================= */

export function ScrollProgress({ className = "" }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();

  if (reducedMotion) return null;

  return (
    <motion.div
      className={`scroll-progress-bar ${className}`}
      style={{
        scaleX: scrollYProgress,
        transformOrigin: "0% 50%",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        backgroundColor: "var(--londonboy-accent)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}

/* =========================================================================
   7. INTERACTIVE LINK (Refined micro-interaction with hover arrow feedback)
   ========================================================================= */

export interface InteractiveLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  isExternal?: boolean;
  arrow?: boolean;
  onClick?: () => void;
}

export function InteractiveLink({
  href,
  children,
  className = "",
  isExternal = false,
  arrow = true,
  onClick,
}: InteractiveLinkProps) {
  const content = (
    <>
      <span className="interactive-link-label">{children}</span>
      {arrow && (
        <span className="interactive-link-arrow" aria-hidden="true">
          <ArrowUpRight size={14} />
        </span>
      )}
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`interactive-link ${className}`}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={`interactive-link ${className}`}
      onClick={onClick}
    >
      {content}
    </Link>
  );
}
