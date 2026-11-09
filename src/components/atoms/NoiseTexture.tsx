"use client";

import { useId } from "react";

interface NoiseTextureProps extends React.SVGProps<SVGSVGElement> {
  opacity?: number;
  seed?: number;
}

/**
 * Textura de grano (ruido) para el fondo.
 *
 * Combina dos turbulencias fractalNoise —una fina y otra de escala
 * grande— y promedia ambas para que el fondo tenga textura sin
 * distraer del contenido.
 */
export function NoiseTexture({
  opacity = 0.12,
  seed = 42,
  ...props
}: NoiseTextureProps) {
  const rawId = useId();
  const id = `noise-${rawId.replace(/:/g, "")}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <filter
          id={id}
          x="0"
          y="0"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          {/* Grano fino */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="2"
            seed={seed}
            stitchTiles="stitch"
            result="fine"
          />

          {/* Variacion de escala grande */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008"
            numOctaves="2"
            seed={seed + 1}
            stitchTiles="stitch"
            result="large"
          />

          {/* Promedio real: 50% fine + 50% large */}
          <feComposite
            in="fine"
            in2="large"
            operator="arithmetic"
            k1="0"
            k2="0.5"
            k3="0.5"
            k4="0"
            result="combined"
          />

          {/* Escala de grises */}
          <feColorMatrix
            in="combined"
            type="saturate"
            values="0"
            result="gray"
          />

          {/* Reduce el contraste para hacerlo mas sutil */}
          <feComponentTransfer in="gray">
            <feFuncR type="linear" slope="0.5" intercept="0.25" />
            <feFuncG type="linear" slope="0.5" intercept="0.25" />
            <feFuncB type="linear" slope="0.5" intercept="0.25" />
          </feComponentTransfer>
        </filter>
      </defs>

      <rect
        width="100%"
        height="100%"
        filter={`url(#${id})`}
        opacity={opacity}
      />
    </svg>
  );
}
