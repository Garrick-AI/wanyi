#!/usr/bin/env python3
"""Convert a guide page into simple HTML for pasting into a Matters (matters.town) draft.

usage: python3 tools/matters_html.py guides/<slug>.html [more.html ...] > out.json
Prints JSON {slug: {title, summary, html, warnings}}.
- Matters keeps only basic tags (p, h2, h3, ul/ol/li, a, strong, blockquote), so tables
  become <li>key：value</li>. A two-sided comparison table (e.g. 可以 / 不可以) becomes
  two separate lists, and is noted in `warnings`.
- The CTA box becomes an h3 + paragraph + plain link to the handbook.
"""
import json, os, re, sys
from bs4 import BeautifulSoup, NavigableString

SITE = 'https://garrick-ai.github.io/wanyi/'
KEEP = {'a', 'strong', 'b', 'em', 'br'}

def inline(el):
    out = []
    for c in el.children:
        if isinstance(c, NavigableString):
            out.append(str(c).replace('<', '&lt;'))
        elif c.name == 'br':
            continue
        elif c.name == 'a':
            href = c.get('href', '')
            if not href.startswith('http'):
                href = SITE + 'guides/' + href if not href.startswith('../') else SITE + href[3:]
            out.append(f'<a href="{href}">{inline(c)}</a>')
        elif c.name in ('strong', 'b'):
            out.append(f'<strong>{inline(c)}</strong>')
        else:
            out.append(inline(c))
    return ''.join(out).strip()

def convert(path):
    s = BeautifulSoup(open(path, encoding='utf-8').read(), 'html.parser')
    slug = os.path.basename(path)
    url = SITE + 'guides/' + slug
    a = s.article
    title = a.h1.get_text(strip=True)
    lead = a.find('p', class_='lead')
    summary = lead.get_text(strip=True) if lead else ''
    parts = [f'<p>原文刊於萬一手冊網站：<a href="{url}">{url}</a></p>']
    warnings = []
    for el in a.find_all(recursive=False):
        cls = el.get('class') or []
        if el.name == 'h1' or 'meta' in cls or 'toc' in cls:
            continue
        if el.name == 'p' and 'sources' in cls:      # 延伸閱讀 links
            parts.append(f'<p>{inline(el)}</p>'); continue
        if el.name in ('h2', 'h3'):
            for n in el.find_all('span', class_='n'): n.decompose()
            parts.append(f'<{el.name}>{el.get_text(strip=True)}</{el.name}>')
        elif el.name == 'p':
            parts.append(f'<p>{inline(el)}</p>')
        elif el.name in ('ul', 'ol'):
            parts.append(f'<{el.name}>' + ''.join(f'<li>{inline(li)}</li>' for li in el.find_all('li', recursive=False)) + f'</{el.name}>')
        elif el.name == 'table':
            ths = [th.get_text(strip=True) for th in el.find_all('th')]
            if len(ths) == 2 and (ths[1].startswith('不') and ths[1][1:] == ths[0] or re.search(r'不(可以|能|會)', ths[1])):
                # two-sided comparison (可以 / 不可以): one list per column, not key：value
                cols = [[], []]
                for tr in el.find_all('tr'):
                    for i, td in enumerate(tr.find_all('td')[:2]):
                        if td.get_text(strip=True): cols[i].append(inline(td))
                for i in (0, 1):
                    parts.append(f'<p><strong>{ths[i]}：</strong></p><ul>' + ''.join(f'<li>{c}</li>' for c in cols[i]) + '</ul>')
                warnings.append(f'two-sided table {ths} split into two lists; glance at it before publishing')
                continue
            items = []
            for tr in el.find_all('tr'):
                tds = tr.find_all('td')
                if len(tds) >= 2:
                    items.append(f'<li><strong>{tds[0].get_text(strip=True)}</strong>：{inline(tds[1])}</li>')
                elif tds:
                    items.append(f'<li>{inline(tds[0])}</li>')
            parts.append('<ul>' + ''.join(items) + '</ul>')
        elif el.name == 'div' and 'cta' in cls:
            h = el.find(['h3', 'h2'])
            p = el.find('p')
            parts.append(f'<h3>{h.get_text(strip=True)}</h3><p>{inline(p)}</p><p>第一部分免費試用：<a href="{SITE}">{SITE}</a></p>')
        elif el.name == 'div' and 'sources' in cls:
            parts.append('<h3>資料來源</h3><ul>' + ''.join(f'<li>{inline(li)}</li>' for li in el.find_all('li')) + '</ul>')
        elif el.name == 'div':
            parts.append(f'<p>{inline(el)}</p>')
    return {'title': title, 'summary': summary[:200], 'html': '\n'.join(parts), 'warnings': warnings}

if __name__ == '__main__':
    print(json.dumps({os.path.basename(p): convert(p) for p in sys.argv[1:]}, ensure_ascii=False, indent=1))
