/**
 * Renders, in priority order: a raw embed code pasted by the admin (Site
 * Settings > Map embed code), an auto-generated Google Maps iframe built
 * from the site name + address plus a "View on Google Maps" link (Site
 * Settings > Google Maps link), or a placeholder if neither is set yet.
 */
export default function MapEmbed({ siteName, address, mapLink, mapEmbed, minHeightClass = 'min-h-[26rem]', theme = 'light' }) {
  const hasCustomEmbed = typeof mapEmbed === 'string' && /<iframe|<embed/i.test(mapEmbed);
  // Search by name only: an address field that's still placeholder/unset
  // text would otherwise throw off Google's search-match for the embed.
  const query = siteName || address;
  const autoEmbedSrc = query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : null;

  if (hasCustomEmbed) {
    return <div className={`overflow-hidden rounded-[1.5rem] ${minHeightClass}`} dangerouslySetInnerHTML={{ __html: mapEmbed }} />;
  }

  if (autoEmbedSrc || mapLink) {
    return (
      <div className="flex flex-col items-center gap-5">
        {autoEmbedSrc && (
          <iframe
            title={`${siteName || 'Location'} map`}
            src={autoEmbedSrc}
            className={`w-full rounded-[1.5rem] ${minHeightClass}`}
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
        {mapLink && (
          <a href={mapLink} target="_blank" rel="noopener noreferrer" className="button-gold">
            View on Google Maps
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`grid place-items-center rounded-[1.5rem] p-8 text-center ${minHeightClass} ${theme === 'dark' ? 'bg-pearl/5' : 'bg-[#d8ccb8]'}`}>
      <div>
        <p className={`font-display text-5xl ${theme === 'dark' ? 'text-pearl' : 'text-ink'}`}>Map Placeholder</p>
        <p className={`mt-4 max-w-md text-sm leading-7 ${theme === 'dark' ? 'text-pearl/62' : 'text-ink/60'}`}>Add a Google Maps link from Site Settings to show a live map here.</p>
      </div>
    </div>
  );
}
