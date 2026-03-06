import { MetadataRoute } from 'next';

const BASE_URL = 'https://travelshopalgeria.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '', '/about', '/contact', '/help', '/faq', '/privacy', '/terms',
    '/blog', '/careers', '/partners', '/search', '/login', '/register',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path === '/search' ? 0.9 : 0.7,
  }));

  return staticEntries;
}
