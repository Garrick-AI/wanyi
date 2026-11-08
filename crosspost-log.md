# Cross-post log

Each new guide in `guides/` is posted to three places after it is live on the site.
The daily cross-post task reads this table, posts whatever is missing, and updates it.

| Guide | Pinterest pin | Medium | Matters |
|---|---|---|---|
| hk-after-death-checklist.html | done (pin-after-death.png) | done | done /a/9p0b9ew3cmb4 |
| hk-mpf-after-death.html | done (pin-mpf.png) | done | done /a/0sh7u9mplcar |
| hk-enduring-power-of-attorney.html | done (pin-epa.png) | done | done /a/k2hoz4o7ajvb |
| hk-advance-medical-directive.html | done (pin-advance-directive.png) | done | done /a/48kukcnmdcq1 |
| hk-how-to-make-a-will.html | done (pin-will.png) | done | pending (draft RHJhZnQ6MTk0MDcyMg already filled, only needs 發布) |

Handbook pins (not guides): pin-handbook-zh.png and pin-handbook-en.png, both done.

## Rules
- Matters: at most 1 article per day (publishing is rate limited; ACTION_LIMIT_EXCEEDED means try again tomorrow).
- Medium: import from the guide URL, so Medium sets the canonical link back to the site.
- Pinterest: board 萬一手冊, link to the guide URL.

## Tools
- `python3 tools/pin.py pin-<name>.png "標題\n第二行" "要點1|要點2|..." "萬一手冊｜副題"` makes the pin in assets/pins/.
- `python3 tools/matters_html.py guides/<slug>.html` gives the title, summary and HTML to paste into Matters.
