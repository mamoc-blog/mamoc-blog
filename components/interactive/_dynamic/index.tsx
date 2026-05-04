'use client';

// Client-only wrappers for interactive components that touch browser APIs at
// import time (Chart.js, p5, jsxgraph, ably). dynamic({ ssr: false }) requires
// being called inside a client module — hence this file. mdx-components.tsx
// (server) re-exports these.

import dynamic from 'next/dynamic';

export const ButtonTimerDynamic = dynamic(
  () => import('../ButtonTimer'),
  { ssr: false },
);
export const LotkaVolterraDynamic = dynamic(
  () => import('../LotkaVolterra'),
  { ssr: false },
);
export const RK4ReactionDiffusionDynamic = dynamic(
  () => import('../RK4ReactionDiffusion'),
  { ssr: false },
);
export const CharacteristicLengthCalculatorDynamic = dynamic(
  () => import('../CharacteristicLengthCalculator'),
  { ssr: false },
);
