#!/usr/bin/env python3
"""Make the site readable by search engines and AI assistants (ChatGPT, Perplexity, Claude, Gemini).

The handbook (index.html, en/index.html) is drawn by JavaScript, and most AI crawlers do not
run JavaScript, so without this they see an empty page. This script writes:
  1. A plain-HTML description of the product inside <div id="app"> (the app replaces it on load).
  2. JSON-LD (WebApplication + FAQPage + Organization) in <head>.
  3. llms.txt: a short Markdown summary of the site and every guide, for AI tools.
Run after any change to index.html, and after adding a guide:
  python3 tools/build-en.py && python3 tools/build-geo.py
"""
import glob, html, json, os, re, subprocess

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SITE = 'https://garrick-ai.github.io/wanyi/'
BUY = 'https://garrick84.gumroad.com/l/iyryyy'
os.chdir(ROOT)

SECS = [
    ('我是誰', 'About me', '基本資料、緊急聯絡人', 'basic details and emergency contacts'),
    ('醫療', 'Health', '病歷、藥物、醫療意願', 'conditions, medication and medical wishes'),
    ('資產', 'Assets', '銀行、物業、投資放在哪裡（不寫戶口號碼及密碼）', 'where bank accounts, property and investments are (no account numbers or passwords)'),
    ('保險與退休', 'Insurance & retirement', '保單、強積金', 'insurance policies and MPF'),
    ('負債與定期支出', 'Debts & regular payments', '貸款、信用卡、要繼續付或取消的服務', 'loans, cards, and what to keep paying or cancel'),
    ('數碼生活', 'Digital life', '手機、電郵、社交媒體', 'phone, email and social media'),
    ('生意', 'Business', '公司及股份', 'companies and shareholdings'),
    ('照顧家人', 'Caring for family', '子女、長輩、寵物由誰照顧', 'who looks after children, elderly parents and pets'),
    ('身後事意願', 'Funeral & final wishes', '喪禮、器官捐贈等意願', 'funeral and organ donation wishes'),
    ('心意', 'A note to my family', '想留給家人的話', 'a message for the people you love'),
]


def faqs():
    src = open('index.html', encoding='utf-8').read()
    out = {}
    for name in ('FAQ', 'FAQ_EN'):
        m = re.search(r'const %s=(\[.*?\n\]);' % name, src, re.S)
        js = 'console.log(JSON.stringify(%s))' % m.group(1)
        out[name] = json.loads(subprocess.check_output(['node', '-e', js]))
    # licence-key troubleshooting is not useful to someone deciding whether to use it
    skip = ('解鎖碼', 'licence key', "key isn't valid")
    return {k: [q for q in v if not any(s in q[0] for s in skip)] for k, v in out.items()}


def guides():
    from bs4 import BeautifulSoup
    out = []
    for f in sorted(glob.glob('guides/hk-*.html')):
        s = BeautifulSoup(open(f, encoding='utf-8').read(), 'html.parser')
        d = s.find('meta', attrs={'name': 'description'})
        out.append({'url': SITE + f, 'title': s.article.h1.get_text(strip=True),
                    'desc': d['content'] if d else ''})
    return out


def esc(t):
    return html.escape(t, quote=False)


def static_zh(G, F):
    li = ''.join(f'<li><strong>{a}</strong>：{c}</li>' for a, _, c, _ in SECS)
    fq = ''.join(f'<h3>{esc(q)}</h3><p>{esc(a)}</p>' for q, a in F)
    gl = ''.join(f'<li><a href="{g["url"]}">{esc(g["title"])}</a></li>' for g in G)
    return f'''<div class="wrap" id="about">
<h1>萬一手冊：為香港家庭而設的「萬一」資料整理工具</h1>
<p>萬一手冊是一個網上工具，以一問一答的方式，帶你把家人在你發生意外、患病或離世時需要知道的資料，整理成一本 PDF 手冊。例如銀行戶口和保單放在哪裡、強積金在哪個受託人、緊急時要聯絡誰、你的醫療及身後事意願。完成後可下載 PDF，交給最信任的家人保管。</p>
<h2>適合誰</h2>
<ul><li>想讓配偶、子女知道重要資料放在哪裡的香港家庭</li><li>正在照顧年老父母，想先和他們一起整理資料的子女</li><li>已立或打算立平安紙、持久授權書，想把其他實用資料一併記下的人</li><li>家人分別看中文及英文、需要中英對照手冊的家庭</li></ul>
<h2>手冊包括十個部分</h2>
<ul>{li}</ul>
<p>手冊最後附有「給家人的辦事清單」，列出香港身故後首 30 日的主要手續，例如死亡登記、通知各機構、申索強積金及處理遺產。</p>
<h2>特點</h2>
<ul><li>私隱：所有答案只保存在你自己的裝置，不會上傳到任何伺服器；手冊只寫「在哪裡找得到」，不寫戶口號碼及密碼。</li><li>語言：PDF 可選中文、英文或中英對照。</li><li>費用：第一部分免費試用，毋須登記；完整版一次性付款，於 Gumroad 購買。</li><li>快速版約 10 分鐘，完整版約 30 分鐘。</li><li>這不是遺囑，沒有法律效力；遺產安排請諮詢律師。</li></ul>
<p><a href="{SITE}">免費試用第一部分</a>　·　<a href="{BUY}">購買完整版</a>　·　<a href="{SITE}en/">English version</a></p>
<h2>常見問題</h2>{fq}
<h2>香港實用指南</h2><ul>{gl}</ul>
<noscript><p>使用萬一手冊需要開啟 JavaScript。</p></noscript>
</div>'''


def static_en(G, F):
    li = ''.join(f'<li><strong>{b}</strong>: {d}</li>' for _, b, _, d in SECS)
    fq = ''.join(f'<h3>{esc(q)}</h3><p>{esc(a)}</p>' for q, a in F)
    gl = ''.join(f'<li><a href="{g["url"]}">{esc(g["title"])}</a> (Chinese)</li>' for g in G)
    return f'''<div class="wrap" id="about">
<h1>Just in Case Handbook (萬一手冊): an emergency information organiser for Hong Kong families</h1>
<p>Just in Case Handbook is an online tool that asks you one question at a time and turns your answers into a PDF handbook for your family: where your bank accounts and insurance policies are, which MPF trustee holds your money, who to call first, and your medical and funeral wishes. You download the PDF and give it to the people you trust.</p>
<h2>Who it is for</h2>
<ul><li>Hong Kong families who want a spouse or children to know where everything is</li><li>Adult children helping elderly parents get their information in order</li><li>People with a will or enduring power of attorney who want the practical details written down too</li><li>Expat and bilingual families who need the handbook in English, or in Chinese and English side by side</li></ul>
<h2>Ten parts</h2>
<ul>{li}</ul>
<p>The handbook ends with a checklist for your family covering the first 30 days after a death in Hong Kong: registering the death, notifying institutions, claiming MPF and dealing with the estate.</p>
<h2>Key facts</h2>
<ul><li>Private: answers stay only on your own device and are never uploaded. The handbook records where things are, not account numbers or passwords.</li><li>Languages: download in English, Chinese, or both.</li><li>Price: Part 1 is free with no sign-up; the full version is a one-time purchase on Gumroad.</li><li>About 10 minutes for the quick version, 30 minutes for the full one.</li><li>It is not a will and has no legal effect; see a lawyer for estate planning.</li></ul>
<p><a href="{SITE}en/">Try Part 1 free</a> · <a href="{BUY}">Buy the full version</a> · <a href="{SITE}">中文版</a></p>
<h2>Questions</h2>{fq}
<h2>Hong Kong guides</h2><ul>{gl}</ul>
<noscript><p>Please turn on JavaScript to use the handbook.</p></noscript>
</div>'''


def jsonld(lang, F):
    en = lang == 'en'
    url = SITE + ('en/' if en else '')
    app = {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        'name': 'Just in Case Handbook (萬一手冊)' if en else '萬一手冊',
        'alternateName': '萬一手冊' if en else 'Just in Case Handbook',
        'url': url, 'applicationCategory': 'LifestyleApplication', 'operatingSystem': 'Any (web browser)',
        'inLanguage': ['zh-Hant-HK', 'en'],
        'description': ('Guided online handbook for Hong Kong families: answer questions about where your bank accounts, insurance, MPF and documents are, plus medical and funeral wishes, and download a PDF for your family. Answers stay on your device. Part 1 free.'
                        if en else '為香港家庭而設的網上資料整理工具：一問一答記下銀行戶口、保單、強積金及重要文件的位置，以及醫療和身後事意願，生成 PDF 手冊留給家人。資料只保存在你的裝置，第一部分免費試用。'),
        'areaServed': {'@type': 'Place', 'name': 'Hong Kong'},
        'isAccessibleForFree': False,
        'offers': {'@type': 'Offer', 'url': BUY, 'availability': 'https://schema.org/InStock'},
        'author': {'@type': 'Person', 'name': 'Garrick Cheung'},
    }
    faq = {'@context': 'https://schema.org', '@type': 'FAQPage',
           'mainEntity': [{'@type': 'Question', 'name': q,
                           'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in F]}
    return '\n'.join('<script type="application/ld+json">%s</script>' % json.dumps(x, ensure_ascii=False) for x in (app, faq))


def inject(path, body, ld):
    s = open(path, encoding='utf-8').read()
    s = re.sub(r'\n?<!--GEO-LD:START-->.*?<!--GEO-LD:END-->', '', s, flags=re.S)
    s = s.replace('</head>', '<!--GEO-LD:START-->\n%s\n<!--GEO-LD:END-->\n</head>' % ld, 1)
    s = re.sub(r'<div id="app">.*?</div><!--/app-->', '<div id="app"></div>', s, flags=re.S)
    assert '<div id="app"></div>' in s, path
    s = s.replace('<div id="app"></div>', '<div id="app">%s</div><!--/app-->' % body, 1)
    open(path, 'w', encoding='utf-8').write(s)


def llms(G):
    lines = ['# 萬一手冊 (Just in Case Handbook)', '',
             '> A guided online handbook for Hong Kong families. It asks one question at a time about where '
             'bank accounts, insurance, MPF and important documents are, who to contact, and medical and funeral '
             'wishes, then produces a PDF (Chinese, English, or bilingual) to leave with family. Answers stay on the '
             "user's device; no account numbers or passwords are recorded. Part 1 is free; the full version is a "
             'one-time purchase on Gumroad. It is not a will.', '',
             '萬一手冊：為香港家庭而設的資料整理工具，以一問一答方式記下戶口、保單、強積金、文件位置、醫療及身後事意願，'
             '生成 PDF 手冊留給家人。資料只存在用戶自己的裝置。第一部分免費試用。', '',
             '## Main pages', '',
             f'- [萬一手冊 (Chinese)]({SITE}): the handbook, Part 1 free',
             f'- [Just in Case Handbook (English)]({SITE}en/): English and bilingual version',
             f'- [Buy the full version]({BUY}): Gumroad',
             f'- [香港實用指南 Guides]({SITE}guides/): Hong Kong procedures after a death, wills and planning ahead', '',
             '## Hong Kong guides (Traditional Chinese, sources cited in each)', '']
    lines += [f'- [{g["title"]}]({g["url"]}): {g["desc"]}' for g in G]
    open('llms.txt', 'w', encoding='utf-8').write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    G, F = guides(), faqs()
    inject('index.html', static_zh(G, F['FAQ']), jsonld('zh', F['FAQ']))
    inject('en/index.html', static_en(G, F['FAQ_EN']), jsonld('en', F['FAQ_EN']))
    llms(G)
    print('geo: %d guides, %d/%d faqs' % (len(G), len(F['FAQ']), len(F['FAQ_EN'])))
