# Runco Growth website

Static site: no build step, no database, no framework. Upload the files and it runs.

## What's in the folder

| File | What it is |
| --- | --- |
| `index.html` | Homepage: headline, three client videos, two client messages, the 30-Day Authority Sprint offer with both guarantees, contact, five FAQs |
| `authority-score.html` | Tool for cold DMs, not linked from the homepage: eight-question quiz that scores a founder's online presence |
| `30-day-video-plan.html` | Tool for cold DMs, not linked from the homepage: visitors enter who they help, get a 12-video plan, then send it to your WhatsApp |
| `assets/styles.css`, `assets/site.js` | Design and behaviour for all pages |
| `assets/*.woff2` | Fonts, self-hosted for speed (Bricolage Grotesque, Instrument Serif and Geist, SIL Open Font License) |
| `assets/og.jpg` | Preview image shown when the link is shared on WhatsApp, X, LinkedIn |
| `media/` | Client videos, client photos and feedback screenshots |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `site.webmanifest` | The site icon for browser tabs, Google results and phone home screens |
| `404.html`, `robots.txt`, `sitemap.xml` | Error page, and the two files Google reads first |

## Contact settings

Your handles are set at the top of `assets/site.js`:

```js
var CONTACT = {
  whatsapp: "917023812488",
  instagram: "advertabhay",
  x: "advertabhay",
  email: "abhay@runcogrowth.com"
};
```

Every button reads from this. The main button opens WhatsApp with a pre-written message ("Hi Abhay, I'd like to claim my three free videos...") and the quiz sends the visitor's score the same way. To change a handle, edit it here and in the matching `wa.me` links and `sameAs` lines in the three `.html` files (search for the old value).

## Places this month

The "2 of 4 November places left" line comes from one setting near the top of `assets/site.js`:

```js
var SPOTS = { month: "2026-11", total: 4, taken: 2 };
```

Raise `taken` each time a founder signs. On the 1st of each month, change `month` and reset `taken`. If `month` doesn't match the current month, the site shows only "I take on 4 founders a month", so an out-of-date count never appears. Keep the number true: visitors who message you will find out.

## The videos

Each video on the homepage uses three files in `media/`:

| File | Used for |
| --- | --- |
| `name-video-loop.mp4` | Silent preview that plays by itself in the card (480 x 854, first 8 to 10 seconds) |
| `name-video.mp4` | Full video with sound, opens when the card is tapped (720 x 1280) |
| `name-video-poster.webp` | Still frame shown before the preview loads |

To replace a video, export new files with the same names. With ffmpeg:

```
ffmpeg -i source.mp4 -vf "scale=720:1280,fps=30" -c:v libx264 -preset slow -crf 26 -c:a aac -b:a 128k -movflags +faststart name-video.mp4
ffmpeg -t 8 -i source.mp4 -vf "scale=480:854,fps=24" -an -c:v libx264 -preset slow -crf 30 -movflags +faststart name-video-loop.mp4
ffmpeg -ss 1 -i source.mp4 -frames:v 1 -vf "scale=480:854" name-video-poster.webp
```

To change a name or caption, edit the matching `<button class="reel">` block in `index.html`.

The small photo under each video is `name-avatar.webp` (160 x 160).

## Client messages

The two screenshots in the "Don't take my word for it" section are `media/feedback-whatsapp-1.webp` and `feedback-whatsapp-2.webp`. Their labels say "Client, on WhatsApp". To name the client once they agree, edit the label in `index.html`.

## Upload

1. Put everything in your host's web root (often `public_html`), so `index.html` sits at `https://runcogrowth.com/`.
2. Turn on HTTPS and redirect `http://` and `www.` to `https://runcogrowth.com`. The canonical tags and sitemap assume that exact address.
3. Set `404.html` as the custom error page in your host's settings.
4. If your host offers it, enable gzip or Brotli compression and long cache times for `/assets/` and `/media/`.

## Get Google to index it

1. Add `runcogrowth.com` as a Domain property in Google Search Console and verify by DNS.
2. Submit `https://runcogrowth.com/sitemap.xml` under Sitemaps.
3. Use URL Inspection on each page and click Request indexing.
4. Run the homepage through Google's Rich Results Test and PageSpeed Insights.

## What's already done for search

- One clear topic per page, descriptive titles and meta descriptions, a single H1, real headings
- Structured data: Organization, Person, WebSite, Offer, three VideoObjects and FAQPage on the homepage; WebPage and BreadcrumbList on the tool pages
- Canonical URLs, sitemap, robots.txt, social share tags
- Fast first load: pages, fonts and images come to under 300 KB. Video previews load only when they scroll into view, and full videos only when tapped
- Built for phones first: swipeable videos, tap-sized buttons, and an action bar that appears once the first button scrolls away

## What moves rankings from here

On-page work gets you indexed and ranking for your own name. Ranking for competitive searches takes links and more pages. In order of payoff:

1. **Ask Mark, Cody and Gage for a link** to runcogrowth.com from their site or bio. Links from real client sites are the strongest signal you can get this month.
3. **Publish one new page a week** that answers a question founders search for, for example "how often should a CEO post on LinkedIn". Each page links back to the offer. Add each new URL to `sitemap.xml`.
4. **Write one case-study page per client** with the video, what you did and what changed.
5. **Upload the videos to YouTube too** and link back to the site in each description.
