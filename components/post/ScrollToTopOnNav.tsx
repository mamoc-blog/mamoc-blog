'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// On client-side navigation into a post, scroll the document to the top so the
// reader sees the breadcrumb + title masthead instead of landing at the first
// heading. rehype-autolink-headings (behavior: 'wrap') gives every heading an
// in-page anchor; combined with prefetched route transitions and IO-driven
// active-heading tracking in PostSummary, the default scroll-restoration
// occasionally lands mid-article. This forces the contract.
export function ScrollToTopOnNav() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
