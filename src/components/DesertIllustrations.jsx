/** Small decorative line-art accents used in the footer. Not photographic —
 * simplified silhouettes in the site's gold/pearl palette. */

export function CamelCaravanSilhouette({ className = '' }) {
  const camel = (x) => (
    <g transform={`translate(${x} 0)`}>
      <path
        d="M4 46 L4 34 C4 28 8 24 12 24 C13 18 17 14 21 14 C22 10 25 6 29 6 C33 6 35 10 35 14 L35 20 C39 20 42 23 42 27 L42 34 L46 34 L46 46 L40 46 L40 40 L10 40 L10 46 Z"
        fill="currentColor"
      />
      <circle cx="30" cy="12" r="2.4" fill="currentColor" />
    </g>
  );
  return (
    <svg viewBox="0 0 220 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <ellipse cx="110" cy="47" rx="108" ry="3" fill="currentColor" opacity=".25" />
      {camel(0)}
      {camel(58)}
      {camel(116)}
      {/* walking figure */}
      <g transform="translate(178 10)">
        <circle cx="8" cy="4" r="3.2" fill="currentColor" />
        <path d="M8 8 L8 26 M8 14 L2 22 M8 14 L16 20 M8 26 L3 36 M8 26 L14 36" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function FortSkylineOutline({ className = '' }) {
  return (
    <svg viewBox="0 0 420 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M0 138 L0 100 L16 100 L16 88 L28 88 L28 100 L48 100 L48 70 L58 60 L68 70 L68 100 L92 100 L92 78 L104 66 L104 50 L112 50 L112 66 L124 78 L124 100 L150 100 L150 84 L162 84 L162 72 C162 62 178 62 178 72 L178 84 L192 84 L192 100 L230 100 L230 60 L244 44 L258 60 L258 100 L300 100 L300 88 L312 88 L312 100 L330 100 L330 76 L342 64 L354 76 L354 100 L420 100 L420 138 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="244" cy="40" r="3" fill="currentColor" />
    </svg>
  );
}
