import * as React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M16 2.66663L29.3333 9.33329L16 16L2.66667 9.33329L16 2.66663Z"
      fill="url(#paint0_linear)"
    />
    <path
      d="M2.66667 22.6666L16 29.3333L29.3333 22.6666V16L16 22.6666L2.66667 16V22.6666Z"
      fill="url(#paint1_linear)"
    />
    <path
      d="M2.66667 16L16 22.6666L29.3333 16L16 9.33329L2.66667 16Z"
      fill="url(#paint2_linear)"
    />
    <defs>
      <linearGradient
        id="paint0_linear"
        x1="16"
        y1="2.66663"
        x2="16"
        y2="16"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="hsl(var(--primary))" />
        <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
      </linearGradient>
      <linearGradient
        id="paint1_linear"
        x1="16"
        y1="16"
        x2="16"
        y2="29.3333"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="hsl(var(--primary))" />
        <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
      </linearGradient>
      <linearGradient
        id="paint2_linear"
        x1="16"
        y1="9.33329"
        x2="16"
        y2="22.6666"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="hsl(var(--accent))" />
        <stop offset="1" stopColor="hsl(var(--accent))" stopOpacity="0.7" />
      </linearGradient>
    </defs>
  </svg>
);
