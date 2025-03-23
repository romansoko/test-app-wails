// This file contains type declarations for SVG and HTML elements in React JSX

import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // SVG elements
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
      
      // HTML elements
      div: React.HTMLProps<HTMLDivElement>;
      header: React.HTMLProps<HTMLElement>;
      h1: React.HTMLProps<HTMLHeadingElement>;
      h2: React.HTMLProps<HTMLHeadingElement>;
      h3: React.HTMLProps<HTMLHeadingElement>;
      button: React.HTMLProps<HTMLButtonElement>;
      span: React.HTMLProps<HTMLSpanElement>;
      input: React.HTMLProps<HTMLInputElement>;
      textarea: React.HTMLProps<HTMLTextAreaElement>;
      label: React.HTMLProps<HTMLLabelElement>;
      table: React.HTMLProps<HTMLTableElement>;
      thead: React.HTMLProps<HTMLTableSectionElement>;
      tbody: React.HTMLProps<HTMLTableSectionElement>;
      tfoot: React.HTMLProps<HTMLTableSectionElement>;
      tr: React.HTMLProps<HTMLTableRowElement>;
      th: React.HTMLProps<HTMLTableCellElement>;
      td: React.HTMLProps<HTMLTableCellElement>;
      select: React.HTMLProps<HTMLSelectElement>;
      option: React.HTMLProps<HTMLOptionElement>;
    }
  }
} 