# CMS JSON Schema Reference

All files live in `cms-data/` (outside the web root — see README-CMS.md). Every
write goes through `public/api/lib/json_store.php`, which enforces: pretty-printed
UTF-8 JSON, atomic writes (temp file + rename), a backup copy before every write,
and a refusal to overwrite a file that's currently unparsable.

Collection records always carry `id` (server-generated, immutable), `createdAt`, and
`updatedAt` (ISO 8601). Most also carry `order` (integer, used for drag/reorder) and
either `active` or `status` for visibility. `slug` is auto-derived from `title`/`name`
on create if not supplied, and is what public URLs use — `id` is an opaque identifier,
not a routable slug.

## site-settings.json (singleton object, not an array)

```jsonc
{
  "siteName": "string",
  "tagline": "string",
  "baseUrl": "string (your live domain, e.g. https://saidesertcamp.com)",
  "logo": "string (media URL)",
  "logoWidth": number, "logoHeight": number,
  "favicon": "string (media URL)",
  "bookNowLabel": "string",
  "primaryColor": "string (hex)", "darkColor": "string (hex)",
  "currency": "string (ISO 4217, e.g. USD)",
  "defaultImage": "string (media URL)",
  "newsletterTitle": "string", "newsletterText": "string",
  "contact": {
    "phone": "string", "whatsapp": "string (digits + country code, no +)",
    "email": "string", "address": "string", "hours": "string",
    "location": "string", "coordinates": { "latitude": "string", "longitude": "string" },
    "mapEmbed": "string (iframe embed or note)", "mapLink": "string (URL)"
  },
  "social": [{ "name": "string", "url": "string", "icon": "instagram|facebook|x|linkedin", "enabled": boolean }],
  "header": { "announcement": { "enabled": boolean, "text": "string", "link": "string" } },
  "footer": {
    "aboutText": "string", "showNewsletter": boolean, "copyrightText": "string",
    "credit": { "text": "string", "url": "string" },
    "blocks": { "quickLinks": boolean, "legal": boolean, "contact": boolean, "social": boolean }
  },
  "seoDefaults": { "title": "string", "description": "string", "ogImage": "string", "twitterHandle": "string" },
  "customHeadScript": "string (raw <script> body; admin-only, injected as-is into <head>)"
}
```

## navigation.json (collection)

Each record is a top-level menu item; `children` (optional) renders as a dropdown.

```jsonc
{
  "id": "string", "label": "string", "path": "string (route or URL)",
  "external": boolean, "newTab": boolean, "enabled": boolean, "order": number,
  "children": [{ "id": "string", "label": "string", "path": "string", "description": "string", "external": boolean, "newTab": boolean, "enabled": boolean }]
}
```

## pages.json (collection)

One record per existing route. `path` and `slug` are fixed to the app's actual React
Router routes and are not meant to be changed (see the SPA-routing limitation in
README-CMS.md). `status` is editorial metadata today, not a visibility switch.

```jsonc
{
  "id": "string", "slug": "string", "path": "string", "name": "string",
  "status": "published|draft", "order": number,
  "hero": { "eyebrow": "string", "title": "string", "subtitle": "string", "image": "string", "buttons": [] },
  "seo": {
    "title": "string", "description": "string", "focusKeyword": "string",
    "canonical": "string", "ogTitle": "string", "ogDescription": "string",
    "ogImage": "string", "noindex": boolean
  }
}
```

## packages.json / rooms.json / activities.json (collections)

Same shape family; `rooms.json` additionally has `occupancy`, `bedType`, `size`,
`policies`, `reviews`; `packages.json`/`activities.json` have `duration`, `faqs` (packages
only), `itinerary`.

```jsonc
{
  "id": "string", "slug": "string", "title": "string",
  "shortDescription": "string", "description": "string",
  "price": number, "oldPrice": number|null, "priceSuffix": "string",
  "capacity": "string|number", "active": boolean, "featured": boolean, "order": number,
  "image": "string", "gallery": ["string"],
  "inclusions": ["string"], "exclusions": ["string"], "highlights": ["string"], "itinerary": ["string"],
  "amenities": ["string"], "features": ["string"], "policies": ["string"],
  "reviews": [{ "name": "string", "rating": number, "text": "string" }],
  "ctaLabel": "string", "whatsappMessage": "string",
  "seo": { "title": "string", "description": "string", "focusKeyword": "string", "canonical": "string", "ogTitle": "string", "ogDescription": "string", "ogImage": "string", "noindex": boolean }
}
```

## gallery.json (collection)

```jsonc
{ "id": "string", "title": "string", "category": "string", "type": "image|video", "src": "string", "alt": "string", "videoUrl": "string (video type only)", "span": "string (Tailwind grid class)", "order": number, "active": boolean }
```

## testimonials.json (collection)

```jsonc
{ "id": "string", "name": "string", "location": "string", "rating": 1-5, "review": "string", "image": "string", "order": number, "active": boolean }
```

## faqs.json (collection)

```jsonc
{ "id": "string", "question": "string", "answer": "string", "category": "string", "order": number, "active": boolean }
```

## amenities.json (collection)

Site-wide "estate amenities" shown on Home/About. `icon` maps to a fixed icon set in
`src/components/AmenityIcon.jsx`.

```jsonc
{ "id": "string", "title": "string", "description": "string", "icon": "butler|dining|spa|car|event|concierge", "order": number, "active": boolean }
```

## blogs.json (collection)

```jsonc
{
  "id": "string", "slug": "string", "title": "string", "excerpt": "string",
  "contentHtml": "string (sanitized HTML, allowlist enforced server-side)",
  "image": "string", "author": "string", "category": "string", "tags": ["string"],
  "date": "YYYY-MM-DD", "status": "draft|published", "featured": boolean, "order": number,
  "seo": { "title": "string", "description": "string", "focusKeyword": "string", "canonical": "string", "ogTitle": "string", "ogDescription": "string", "ogImage": "string", "noindex": boolean }
}
```

## enquiries.json (collection, admin-only, never exposed via public GET)

```jsonc
{
  "id": "string", "name": "string", "email": "string", "phone": "string",
  "inquiryType": "string", "message": "string", "sourcePage": "string",
  "status": "New|Contacted|Confirmed|Closed", "notes": "string (admin-only)",
  "createdAt": "ISO 8601", "updatedAt": "ISO 8601"
}
```

## users.json (collection, admin-only, never exposed via any API response)

```jsonc
{
  "id": "string", "username": "string", "passwordHash": "string (bcrypt via password_hash)",
  "role": "admin", "mustChangePassword": boolean,
  "createdAt": "ISO 8601", "updatedAt": "ISO 8601", "lastLoginAt": "ISO 8601|null"
}
```

## media.json (collection — the media library index; actual files live in `public/uploads/`)

```jsonc
{
  "id": "string", "filename": "string (server-generated, on disk)", "originalName": "string (as uploaded, cosmetic only)",
  "url": "string (/uploads/images/... or /uploads/documents/...)", "kind": "image|document",
  "mime": "string", "size": number (bytes),
  "title": "string", "alt": "string", "uploadedBy": "string (username)",
  "createdAt": "ISO 8601", "updatedAt": "ISO 8601"
}
```
