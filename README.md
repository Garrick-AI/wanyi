# 萬一手冊

以一問一答方式整理個人及家庭重要資料，並自動生成可複製文字的 PDF 手冊。

- 所有資料只保存在用家自己的裝置，不經任何伺服器。
- 第一部分免費，其餘部分以 Gumroad 解鎖碼解鎖。
- 答案會加密夾附在 PDF 內，日後上載 PDF 即可繼續修改。

字型：Noto Sans / Noto Serif CJK（SIL Open Font License）。PDF：pdf-lib（MIT）。

## 中英文版

- 英文翻譯集中在 `i18n.js`（以中文原文為鍵），網站介面及 PDF 共用。答案內部一律以中文選項值儲存，轉換語言不會影響資料。
- PDF 可選「中文」、「English」或「中英對照」。
- 英文版網址 `/wanyi/en/` 由 `tools/build-en.py` 從 `index.html` 生成。**每次修改 `index.html` 後，都要執行 `python3 tools/build-en.py` 再提交。**


## Search engines and AI assistants
- After changing index.html or adding a guide, run: python3 tools/build-en.py && python3 tools/build-geo.py
  (writes the plain-HTML description and JSON-LD that crawlers and AI tools read, and llms.txt).
- IndexNow key file: 9055b3b613f527fdbeafccb5a0ca0ea3.txt. To tell Bing about new pages, open
  https://api.indexnow.org/indexnow?url=<page URL>&key=9055b3b613f527fdbeafccb5a0ca0ea3&keyLocation=https://garrick-ai.github.io/wanyi/9055b3b613f527fdbeafccb5a0ca0ea3.txt
