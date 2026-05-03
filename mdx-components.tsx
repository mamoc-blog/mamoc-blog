import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';
import Figure from '@/components/frames/Figure';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import {
  ButtonTimerDynamic,
  LotkaVolterraDynamic,
  RK4ReactionDiffusionDynamic,
  CharacteristicLengthCalculatorDynamic,
  WFCCONTAINERDynamic,
} from '@/components/interactive/_dynamic';

const components = {
  Image,
  Link,
  Figure,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  ButtonTimer: ButtonTimerDynamic,
  LotkaVolterra: LotkaVolterraDynamic,
  RK4ReactionDiffusion: RK4ReactionDiffusionDynamic,
  CharacteristicLengthCalculator: CharacteristicLengthCalculatorDynamic,
  WFCCONTAINER: WFCCONTAINERDynamic,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
