/**
 * Dynamic metadata helpers for SEO.
 * Used in useEffect on 'use client' pages to set document.title and meta tags.
 */

export function setPageMeta(opts: {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  // Set document title
  document.title = `${opts.title} | Travel Shop Algeria`;

  // Update or create meta tags
  const setMeta = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const setNameMeta = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Open Graph
  setMeta('og:title', opts.title);
  if (opts.description) {
    setNameMeta('description', opts.description);
    setMeta('og:description', opts.description);
  }
  if (opts.image) {
    setMeta('og:image', opts.image);
  }
  if (opts.url) {
    setMeta('og:url', opts.url);
  }

  // Twitter Card
  setNameMeta('twitter:card', 'summary_large_image');
  setNameMeta('twitter:title', opts.title);
  if (opts.description) setNameMeta('twitter:description', opts.description);
  if (opts.image) setNameMeta('twitter:image', opts.image);
}
