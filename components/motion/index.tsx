"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return reduced;
}

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  className?: string;
  as?: React.ElementType;
}

export function Reveal({
  children,
  delay = 0,
  direction = "up",
  distance = 20,
  className = "",
  as: Component = "div",
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Default to visible for progressive enhancement
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setMounted(true);
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    // If element is already in or near viewport, show immediately
    if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
      setIsVisible(true);
      return;
    }

    // Only elements further down the page get scroll-reveal treatment
    setIsVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const getTransform = () => {
    if (!mounted || reducedMotion || isVisible || direction === "none") return "none";
    switch (direction) {
      case "up":
        return `translateY(${distance}px)`;
      case "down":
        return `translateY(-${distance}px)`;
      case "left":
        return `translateX(${distance}px)`;
      case "right":
        return `translateX(-${distance}px)`;
      default:
        return "none";
    }
  };

  return (
    <Component
      ref={ref}
      className={`motion-reveal ${isVisible ? "is-revealed" : ""} ${className}`}
      style={{
        opacity: isVisible || reducedMotion || !mounted ? 1 : 0,
        transform: getTransform(),
        transition: reducedMotion
          ? "opacity 0.2s ease"
          : `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}

interface StaggerGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  staggerInterval?: number;
  className?: string;
  as?: React.ElementType;
}

export function StaggerGroup({
  children,
  staggerInterval = 100,
  className = "",
  as: Component = "div",
  ...rest
}: StaggerGroupProps) {
  const childArray = React.Children.toArray(children);

  return (
    <Component className={`motion-stagger-group ${className}`} {...rest}>
      {childArray.map((child, index) => (
        <Reveal key={index} delay={index * staggerInterval}>
          {child}
        </Reveal>
      ))}
    </Component>
  );
}

interface ImageRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  aspectRatio?: string;
  className?: string;
  priority?: boolean;
}

export function ImageReveal({
  src,
  alt,
  aspectRatio,
  className = "",
  style,
  ...rest
}: ImageRevealProps) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true); // Default to visible
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setIsInView(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      className={`motion-image-reveal-wrapper ${isInView ? "revealed" : ""} ${className}`}
      style={{
        aspectRatio,
        overflow: "hidden",
        position: "relative",
        background: "var(--surface-secondary)",
        ...style,
      }}
      {...rest}
    >
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className="motion-image-reveal-target"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: 1, // Always visible for progressive enhancement
          transition: reducedMotion
            ? "none"
            : "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const docEl = document.documentElement;
          const scrollTop = window.scrollY || docEl.scrollTop;
          const scrollHeight = docEl.scrollHeight - docEl.clientHeight;
          if (scrollHeight > 0) {
            setProgress(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reducedMotion]);

  if (reducedMotion || progress <= 0) return null;

  return (
    <div
      className="scroll-progress-bar"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "2px",
        width: `${progress}%`,
        backgroundColor: "var(--londonboy-accent)",
        zIndex: 9999,
        pointerEvents: "none",
        transition: "width 0.1s linear",
      }}
    />
  );
}

interface InteractiveLinkProps {
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
    <Link href={href} className={`interactive-link ${className}`} onClick={onClick}>
      {content}
    </Link>
  );
}
