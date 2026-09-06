export const hotelSchema = (settings) => ({
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  name: settings.siteName,
  description: settings.tagline,
  image: settings.defaultImage,
  address: {
    '@type': 'PostalAddress',
    streetAddress: settings.contact?.address,
    addressLocality: settings.contact?.location
  },
  telephone: settings.contact?.phone,
  email: settings.contact?.email,
  priceRange: '$$$$',
  starRating: { '@type': 'Rating', ratingValue: '5' }
});

export const localBusinessSchema = (settings) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: settings.siteName,
  address: settings.contact?.address,
  telephone: settings.contact?.phone,
  email: settings.contact?.email,
  openingHours: 'Mo-Su 00:00-23:59'
});

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

export const faqSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer }
  }))
});

export const blogSchema = (post, settings) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  image: post.image,
  datePublished: post.date,
  author: { '@type': 'Person', name: post.author },
  publisher: { '@type': 'Organization', name: settings.siteName },
  description: post.excerpt
});
