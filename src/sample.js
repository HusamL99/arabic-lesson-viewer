function svgDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const sampleAssets = {
  "tea.jpg": {
    filename: "tea.jpg",
    mime: "image/svg+xml",
    size: 1680,
    dataUrl: svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#20170f"/><stop offset=".55" stop-color="#84613b"/><stop offset="1" stop-color="#0b2d2d"/>
        </linearGradient>
        <radialGradient id="light" cx=".62" cy=".36" r=".48"><stop stop-color="#fff2bf" stop-opacity=".85"/><stop offset=".72" stop-color="#fff2bf" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)"/><rect width="1200" height="800" fill="url(#light)"/>
      <ellipse cx="600" cy="610" rx="330" ry="58" fill="#090706" opacity=".35"/>
      <path d="M389 349c0-95 88-156 202-156s202 61 202 156c0 151-65 222-202 222S389 500 389 349Z" fill="#e8d3a2"/>
      <path d="M793 329c104-9 165 32 153 98-13 69-91 104-176 76l18-70c55 17 90 4 95-20 6-28-25-44-79-38Z" fill="#d0ac72"/>
      <path d="M432 348c28 39 86 62 159 62s131-23 159-62" fill="none" stroke="#7b4e29" stroke-width="20" stroke-linecap="round"/>
      <text x="600" y="705" text-anchor="middle" font-family="Noto Sans Arabic, Arial" font-size="64" fill="#fff7da">شاي بالنعنع</text>
    </svg>`)
  },
  "market.jpg": {
    filename: "market.jpg",
    mime: "image/svg+xml",
    size: 1940,
    dataUrl: svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#111013"/><stop offset=".55" stop-color="#3f3126"/><stop offset="1" stop-color="#123335"/></linearGradient>
        <linearGradient id="gold" x1="0" x2="1"><stop stop-color="#f5d487"/><stop offset="1" stop-color="#966a35"/></linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#sky)"/>
      <path d="M80 252h1040v390H80z" fill="#211914"/><path d="M80 252h1040l-80-108H160z" fill="url(#gold)"/>
      <path d="M165 252v390M350 252v390M535 252v390M720 252v390M905 252v390" stroke="#5d4028" stroke-width="18"/>
      <circle cx="270" cy="520" r="78" fill="#d2633f"/><circle cx="410" cy="526" r="62" fill="#d5ad45"/><circle cx="555" cy="520" r="78" fill="#44745f"/><circle cx="720" cy="526" r="62" fill="#c9a05a"/><circle cx="888" cy="520" r="78" fill="#b84a46"/>
      <text x="600" y="705" text-anchor="middle" font-family="Noto Sans Arabic, Arial" font-size="64" fill="#fff4d3">السوق البلدي</text>
    </svg>`)
  }
};

export const sampleMarkdown = `# Jordanian Arabic Foundations

## Warm Greetings
Gentle input for noticing everyday Jordanian chunks before recall.

- **dialogue** — كيف حالك؟ — How are you? | cefr=A1 | dialect=Jordanian | function=greeting | transliteration=keef haalak?
- **example** — الحمد لله، منيح — Thank God, I am good | cefr=A1 | dialect=Jordanian | transliteration=ilhamdulillah, mneeh
- **question** — شو بتحب تشرب؟ — What do you like to drink? | cefr=A1 | dialect=Jordanian | function=preference
- **vocab** — شاي بالنعنع — Mint tea | image=tea.jpg | cefr=A1 | dialect=Jordanian | root=ش ي ي | frequency=high

## At The Market
Contextual vocabulary and short reusable phrases for a communicative exchange.

- **reading** — اليوم رحت على السوق واشتريت خضرة وفواكه. — Today I went to the market and bought vegetables and fruit. | image=market.jpg | cefr=A2 | topic=shopping | dialect=Jordanian
- **dialogue** — بكم الكيلو؟ — How much is the kilo? | cefr=A2 | function=asking price | dialect=Jordanian
- **listening** — اسمع السعر، بعدين كرر الجملة بصوتك. — Listen to the price, then repeat the sentence aloud. | cefr=A2 | notes=Audio metadata is preserved for future lessons.
- **example** — بدي نص كيلو لو سمحت — I want half a kilo, please | cefr=A2 | grammar=polite request | dialect=Jordanian`;
