export const formatCurrency = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0
  }).format(value);

export const bySlug = (items, slug) => items.find((item) => item.slug === slug || item.id === slug);

export const getCategories = (items, key = 'category') => ['All', ...Array.from(new Set(items.map((item) => item[key]).filter(Boolean)))];

export const pageUrl = (baseUrl, path = '') => `${(baseUrl || '').replace(/\/$/, '')}${path}`;
