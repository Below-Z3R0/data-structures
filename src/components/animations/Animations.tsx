"use client";

import { domAnimation, LazyMotion, m, type Variants } from "motion/react";
import type { ReactNode } from "react";

// ============================================
// Easing presets & motion constants
// ============================================
// Apple-like easeOut (smooth deceleration)
const easeOut = [0.16, 1, 0.3, 1] as const;

// Spring preset (physical, natural feel)
const spring = { type: "spring", stiffness: 80, damping: 20 } as const;

// ============================================
// Reusable variants (DRY)
// ============================================

// Section-level reveal: fade + 24px up
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

// Text-level reveal: only opacity (subtle)
const textVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: easeOut } },
};

// Stagger container: orchestrates child reveal
const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Stagger item: child of stagger container
const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOut },
  },
};

// ============================================
// Level-based reveal components
// ============================================

/**
 * Section-level reveal: standard for entire sections and cards.
 * Triggers when entering viewport (once).
 */
export function SectionReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <m.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/**
 * Text-level reveal: subtle opacity-only animation.
 * Use for paragraphs, descriptions, etc.
 */
export function TextReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <m.div
      variants={textVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/**
 * Slide reveal: directional entrance for bipartito layouts.
 * direction="left" (default) or "right"
 */
export function SlideReveal({
  children,
  delay = 0,
  direction = "left",
  distance = 40,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  direction?: "left" | "right";
  distance?: number;
  className?: string;
}) {
  const x = direction === "left" ? -distance : distance;
  return (
    <m.div
      initial={{ opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/**
 * Stagger group: orchestrates child reveals with stagger.
 * Pair with StaggerItem as direct children.
 */
export function StaggerGroup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/**
 * Stagger item: child of StaggerGroup.
 * Inherits parent variant keys (hidden/show).
 */
export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div variants={staggerItemVariants} className={className}>
      {children}
    </m.div>
  );
}

/**
 * Eyebrow reveal: mini-title with subtle slide.
 * For "Featured", "Sobre mí" tags, etc.
 */
export function EyebrowReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
      <m.div
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: delay || 0.3, ease: easeOut }}
      >
        {children}
      </m.div>
    </div>
  );
}

/**
 * Pop reveal: spring-based entrance for badges and status indicators.
 */
export function PopReveal({
  children,
  delay = 0,
  scale = 0.8,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  scale?: number;
  className?: string;
}) {
  return (
    <m.div
      initial={{ opacity: 0, scale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </m.div>
  );
}

// ============================================
// Utility components
// ============================================

/**
 * ExpandLine: horizontal line that expands from 0 to 100% width on enter.
 * Uses CSS transition (not motion) — simpler for this case.
 */
export function ExpandLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px bg-muted ${className}`}
      style={{
        width: "100%",
        animation: "expandLine 1.2s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
    />
  );
}

/**
 * scrollToSection: smooth scroll to element by id.
 * Pure utility, no animation.
 */
export const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

/**
 * LoadingDots: 3 dots que aparecen cuando isLoading=true.
 * CONTROLLED — solo se renderiza mientras loading=true (no es loop infinito).
 * Reemplaza la versión anterior que tenía `repeat: Infinity`.
 */
export function LoadingDots({
  isLoading = true,
  className = "",
}: {
  isLoading?: boolean;
  className?: string;
}) {
  if (!isLoading) return null;

  return (
    <output
      className={`inline-flex items-center gap-1 ${className}`}
      aria-label="Cargando"
    >
      {[0, 1, 2].map((i) => (
        <m.span
          key={i}
          initial={{ y: 0, opacity: 0.4 }}
          animate={{ y: -4, opacity: 1 }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          className="inline-block size-1.5 rounded-full bg-current"
        />
      ))}
    </output>
  );
}

// Re-export LazyMotion and domAnimation for app-level setup
export { domAnimation, LazyMotion };
