import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext.jsx';
import { pageUrl } from '../utils/format';
import { hotelSchema, localBusinessSchema } from './schema';

export default function SEO({ title, description, path = '/', image, schemas = [], type = 'website' }) {
  const { settings, getPage } = useContent();
  const pageSeo = getPage(path)?.seo;

  const effectiveTitle = pageSeo?.title || title;
  const fullTitle = effectiveTitle ? `${effectiveTitle} | ${settings.siteName}` : settings.siteName;
  const metaDescription = pageSeo?.description || description || settings.seoDefaults?.description || settings.tagline;
  const canonical = pageSeo?.canonical || pageUrl(settings.baseUrl, path);
  const ogImage = pageSeo?.ogImage || image || settings.seoDefaults?.ogImage || settings.defaultImage;
  const ogTitle = pageSeo?.ogTitle || fullTitle;
  const ogDescription = pageSeo?.ogDescription || metaDescription;
  const noindex = Boolean(pageSeo?.noindex);
  const jsonLd = [hotelSchema(settings), localBusinessSchema(settings), ...schemas];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
      {settings.seoDefaults?.twitterHandle && <meta name="twitter:site" content={settings.seoDefaults.twitterHandle} />}
      {jsonLd.map((schema, index) => (
        <script type="application/ld+json" key={index}>
          {JSON.stringify(schema)}
        </script>
      ))}
      {settings.customHeadScript && <script>{settings.customHeadScript}</script>}
    </Helmet>
  );
}
