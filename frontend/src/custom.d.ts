import * as React from 'react';

declare module 'react' {
  interface SVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Add any custom SVG attributes here
    stopColor?: string;
    stopOpacity?: number;
    dx?: number | string;
    dy?: number | string;
    floodColor?: string;
    floodOpacity?: number;
    result?: string;
    in?: string;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      svg: React.SVGProps<SVGSVGElement>;
      path: React.SVGProps<SVGPathElement>;
      circle: React.SVGProps<SVGCircleElement>;
      defs: React.SVGProps<SVGDefsElement>;
      linearGradient: React.SVGProps<SVGLinearGradientElement>;
      stop: React.SVGProps<SVGStopElement>;
      filter: React.SVGProps<SVGFilterElement>;
      feDropShadow: React.SVGProps<SVGFEDropShadowElement>;
      feGaussianBlur: React.SVGProps<SVGFEGaussianBlurElement>;
      feMerge: React.SVGProps<SVGFEMergeElement>;
      feMergeNode: React.SVGProps<SVGFEMergeNodeElement>;
      g: React.SVGProps<SVGGElement>;
    }
  }
} 