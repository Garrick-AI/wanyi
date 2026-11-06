/* 萬一手冊 — text-based PDF builder (pdf-lib). Renders a neutral block list. */
(function (root) {
  "use strict";
  const hex = (h, rgb) => { const n = parseInt(h.slice(1), 16); return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); };
  const NOBREAK_START = "，。、；：？！」』）》〉…%,.;:?!)";

  async function buildPdf(PDFLib, fonts, blocks, opt) {
    opt = opt || {};
    const clean = opt.clean || (s => s);
    const { PDFDocument, rgb } = PDFLib;
    const C = {
      bg: hex("#FBF5EC", rgb), card: hex("#FFFDF9", rgb), ink: hex("#3E342C", rgb), muted: hex("#9A8C7E", rgb),
      faint: hex("#C9BCAD", rgb), line: hex("#EADFD2", rgb), acc: hex("#C26A4A", rgb), accDark: hex("#A0553A", rgb),
      peach: hex("#F6E3D3", rgb), peachSoft: hex("#FAEEE3", rgb), sage: hex("#8BA88E", rgb), sageSoft: hex("#E4ECE3", rgb)
    };
    const doc = await PDFDocument.create();
    if (fonts.fontkit) doc.registerFontkit(fonts.fontkit);
    const emb = async f => (typeof f === "function" ? f(doc) : doc.embedFont(f, { subset: false }));
    const sans = await emb(fonts.sans), serif = await emb(fonts.serif);
    doc.setTitle(clean("萬一手冊" + (opt.owner ? " · " + opt.owner : "")));
    doc.setCreator("萬一手冊");

    const W = 595.28, H = 841.89, M = 56, CW = W - 2 * M, TOP = H - 64, BOTTOM = 70;
    let page, y, pageNo = 0;

    const tw = (s, f, z) => f.widthOfTextAtSize(clean(s), z);
    function text(s, x, yy, f, z, color, o) {
      s = clean(String(s)); if (!s) return;
      page.drawText(s, Object.assign({ x, y: yy, size: z, font: f, color }, o || {}));
    }
    function center(s, yy, f, z, color) { text(s, (W - tw(s, f, z)) / 2, yy, f, z, color); }
    function wrap(s, f, z, maxW) {
      const out = [];
      for (const para of String(s == null ? "" : s).split(/\r?\n/)) {
        let line = "";
        for (const ch of Array.from(para)) {
          const t = line + ch;
          if (line && tw(t, f, z) > maxW && NOBREAK_START.indexOf(ch) < 0) {
            const sp = line.lastIndexOf(" ");
            if (/[A-Za-z0-9]/.test(ch) && /[A-Za-z0-9]$/.test(line) && sp > 0) { out.push(line.slice(0, sp)); line = line.slice(sp + 1) + ch; }
            else { out.push(line); line = ch === " " ? "" : ch; }
          }
          else line = t;
        }
        out.push(line);
      }
      return out;
    }
    function rrect(x, yTop, w, h, r, o) {
      r = Math.min(r, h / 2, w / 2);
      const p = `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
      page.drawSvgPath(p, Object.assign({ x, y: yTop }, o));
    }
    function hline(x1, x2, yy, color, t) { page.drawLine({ start: { x: x1, y: yy }, end: { x: x2, y: yy }, thickness: t || 0.6, color: color || C.line }); }

    function newPage(decor) {
      page = doc.addPage([W, H]); pageNo++;
      page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.bg });
      if (decor) {
        page.drawCircle({ x: W - 30, y: H - 20, size: 120, color: C.peach, opacity: 0.55 });
        page.drawCircle({ x: W - 118, y: H - 58, size: 26, color: C.sageSoft, opacity: 0.9 });
      }
      if (pageNo > 1) {
        hline(M, W - M, 46, C.line, 0.5);
        text("萬一手冊" + (opt.owner ? " · " + opt.owner : ""), M, 30, sans, 8.5, C.muted);
        const pn = String(pageNo - 1); text(pn, W - M - tw(pn, sans, 8.5), 30, sans, 8.5, C.muted);
      }
      y = TOP;
    }
    function ensure(h) { if (y - h < BOTTOM) { newPage(false); y = TOP + 8; return true; } return false; }

    /* ---------- block renderers ---------- */
    function cover(b) {
      newPage(false);
      // warm background shapes
      page.drawCircle({ x: W / 2, y: -40, size: 300, color: C.peach, opacity: 0.7 });
      page.drawCircle({ x: W / 2, y: -40, size: 220, color: C.peachSoft, opacity: 0.9 });
      page.drawCircle({ x: 70, y: H - 70, size: 46, color: C.sageSoft, opacity: 0.9 });
      page.drawCircle({ x: W - 80, y: H - 150, size: 18, color: C.peach, opacity: 0.9 });
      // house + heart illustration
      const hx = W / 2 - 44, hy = H - 210;
      page.drawSvgPath("M 0 40 L 44 4 L 88 40", { x: hx, y: hy, borderColor: C.acc, borderWidth: 3, borderLineCap: 1 });
      page.drawSvgPath("M 12 34 V 92 H 76 V 34", { x: hx, y: hy, borderColor: C.acc, borderWidth: 3, borderLineCap: 1 });
      page.drawSvgPath("M 44 82 C 22 68 26 50 38 52 C 42 53 44 56 44 58 C 44 56 46 53 50 52 C 62 50 66 68 44 82 Z", { x: hx, y: hy, color: C.acc });
      center("PERSONAL HANDBOOK", H - 330, sans, 9, C.muted);
      center("萬一手冊", H - 392, serif, 50, C.acc);
      center("寫給我最重要的人", H - 428, sans, 12.5, C.muted);
      const nm = b.name && String(b.name).trim() ? String(b.name).trim() : "";
      if (nm) { center(nm, H - 490, sans, 20, C.ink); hline(W / 2 - 60, W / 2 + 60, H - 502, C.faint, 0.6); }
      else { hline(W / 2 - 80, W / 2 + 80, H - 492, C.faint, 0.8); }
      center("最後更新：" + b.date, H - 524, sans, 10, C.muted);
      // message card
      const cw = 340, ch = 104, cx = (W - cw) / 2, cy = 236;
      rrect(cx, cy, cw, ch, 18, { color: C.card, borderColor: C.peach, borderWidth: 1 });
      const msg = ["如果你正在讀這本手冊，", "代表我需要你的幫忙。", "你需要知道的事，我都寫在裡面了。"];
      msg.forEach((m, i) => center(m, cy - 34 - i * 22, sans, 12, C.ink));
    }
    function section(b) {
      newPage(true);
      page.drawCircle({ x: M + 17, y: y - 4, size: 17, color: C.peach });
      const n = String(b.n); text(n, M + 17 - tw(n, serif, 16) / 2, y - 10, serif, 16, C.accDark);
      text(b.title, M + 46, y - 12, serif, 24, C.ink);
      y -= 44;
      for (const l of wrap(b.why, sans, 10.5, CW)) { text(l, M, y, sans, 10.5, C.muted); y -= 17; }
      y -= 4; page.drawLine({ start: { x: M, y }, end: { x: M + 36, y }, thickness: 2, color: C.acc }); y -= 22;
    }
    function h3(b) {
      ensure(60); y -= 14;
      page.drawCircle({ x: M + 4, y: y + 4.5, size: 3.2, color: C.sage });
      text(b.text, M + 14, y, serif, 13.5, C.ink); y -= 16;
    }
    function kv(b) {
      const LW = 104, z = 11.5, lh = 19;
      for (const [k, v] of b.rows) {
        const has = v != null && String(v).trim() !== "";
        const lines = has ? wrap(v, sans, z, CW - LW - 8) : ["—"];
        const h = Math.max(1, lines.length) * lh + 14;
        ensure(h);
        text(k, M + 4, y - 17, sans, 10, C.muted);
        lines.forEach((l, i) => text(l, M + LW, y - 17 - i * lh, sans, z, has ? C.ink : C.faint));
        y -= h; hline(M, W - M, y);
      }
      y -= 10;
    }
    function table(b) {
      const z = 11, lh = 17, pad = 7;
      const ws = b.widths.map(f => f * CW);
      const xs = ws.reduce((a, w, i) => (a.push(i ? a[i - 1] + ws[i - 1] : M), a), []);
      const header = () => {
        rrect(M, y, CW, 24, 8, { color: C.peach });
        b.cols.forEach((c, i) => text(c, xs[i] + pad, y - 16, sans, 9.5, C.accDark));
        y -= 24;
      };
      ensure(24 + 34); header();
      b.rows.forEach((r, ri) => {
        const cells = r.map((v, i) => { const has = b.blank || (v != null && String(v).trim() !== ""); return { has, lines: has ? wrap(v, sans, z, ws[i] - 2 * pad) : ["—"] }; });
        const h = Math.max(b.minRow || 0, Math.max(...cells.map(c => c.lines.length)) * lh + 2 * pad);
        if (ensure(h)) header();
        if (ri % 2 === 1) page.drawRectangle({ x: M, y: y - h, width: CW, height: h, color: C.card, opacity: 0.8 });
        cells.forEach((c, i) => c.lines.forEach((l, li) => text(l, xs[i] + pad, y - pad - 11 - li * lh, sans, z, c.has ? C.ink : C.faint)));
        y -= h; hline(M, W - M, y);
      });
      y -= 12;
    }
    function note(b) { ensure(30); text(b.text, M + 4, y - 14, sans, 11, C.faint); y -= 30; }
    function para(b) { for (const l of wrap(b.text, sans, 11.5, CW)) { ensure(20); text(l, M + 4, y - 14, sans, 11.5, C.ink); y -= 19; } y -= 10; }
    function letter(b) {
      const lh = 28, z = 13, inner = CW - 48;
      const lines = b.text && String(b.text).trim() ? wrap(b.text, sans, z, inner) : [];
      let i = 0;
      const n = Math.max(lines.length, 6);
      while (i < n) {
        const room = Math.floor((y - BOTTOM - 40) / lh);
        if (room < 3) { newPage(false); y = TOP + 8; continue; }
        const take = Math.min(room, n - i), h = take * lh + 40;
        rrect(M, y, CW, h, 16, { color: C.card, borderColor: C.peach, borderWidth: 1 });
        for (let k = 0; k < take; k++) {
          const ly = y - 20 - (k + 1) * lh + 8;
          hline(M + 24, W - M - 24, ly, C.line, 0.6);
          if (lines[i + k]) text(lines[i + k], M + 24, ly + 7, sans, z, C.ink);
        }
        i += take; y -= h + 16;
      }
    }
    function disc(b) {
      ensure(60); y -= 8; hline(M, W - M, y, C.line, 0.6); y -= 18;
      for (const l of wrap(b.text, sans, 9.5, CW)) { ensure(16); text(l, M, y, sans, 9.5, C.muted); y -= 15.5; }
    }
    function stepsBlock(b) {
      b.steps.forEach((st, si) => {
        const lines = st.items.map(it => wrap(it, sans, 11, CW - 46));
        const first = (lines[0] || []).length;
        ensure(34 + first * 17);
        page.drawCircle({ x: M + 12, y: y - 10, size: 12, color: C.peach });
        const n = String(si + 1); text(n, M + 12 - tw(n, serif, 12) / 2, y - 14.5, serif, 12, C.accDark);
        text(st.title, M + 34, y - 15, serif, 14, C.ink); y -= 32;
        lines.forEach(ls => {
          ensure(ls.length * 17 + 4);
          page.drawCircle({ x: M + 38, y: y - 7.5, size: 2.2, color: C.sage });
          ls.forEach((l, i) => text(l, M + 46, y - 11 - i * 17, sans, 11, C.ink));
          y -= ls.length * 17 + 6;
        });
        y -= 10;
      });
    }
    const R = { cover, section, h3, kv, table, note, para, letter, disc, steps: stepsBlock };
    for (const b of blocks) { if (R[b.t]) R[b.t](b); }
    if (opt.attach) await doc.attach(opt.attach.bytes, opt.attach.name, { mimeType: "application/json", description: "萬一手冊資料備份（日後上載此 PDF 即可繼續修改）" });
    return doc.save();
  }
  /* ---------- answers -> blocks (shared by screen preview and PDF) ---------- */
  const SEC = [
    { title: "我是誰", why: "發生意外時，家人第一時間需要知道的資料。" },
    { title: "醫療", why: "給醫護人員和家人參考的健康資料與醫療意願。" },
    { title: "資產", why: "這裡只記錄在哪裡找得到，不含任何戶口號碼或密碼。" },
    { title: "保險與退休", why: "逐一申索，避免遺漏。" },
    { title: "負債與定期支出", why: "哪些款項要繼續付、哪些服務要取消。" },
    { title: "數碼生活", why: "手機與網上帳戶的處理方法。" },
    { title: "生意", why: "公司事務的交接安排。" },
    { title: "照顧家人", why: "如果我暫時無法照顧他們。" },
    { title: "身後事意願", why: "請按照我的意願安排，不用猜測。" },
    { title: "心意", why: "我想對你說的話。" }
  ];
  const s_ = x => String(x == null ? "" : x).trim();
  const filled = r => r && Object.values(r).some(x => s_(x));
  function tbl(cols, widths, rows) {
    const rs = (rows || []).filter(r => r.some(x => s_(x)));
    return rs.length ? { t: "table", cols, widths, rows: rs } : { t: "note", text: "未填寫" };
  }
  function per(A, src, id, c1, c2) {
    const s = A[src] || [], g = A[id] || {};
    return tbl([c1, c2], [0.34, 0.66], s.map(x => [x, g[x] || ""]));
  }
  const list = (A, id, keys) => (A[id] || []).filter(filled).map(r => keys.map(k => r[k]));
  const yn = (v, none, block) => v === "沒有" ? { t: "para", text: none } : block;
  const join = (...xs) => xs.filter(s_).join("\n");
  const APPENDIX = [
    { title: "首 24 小時", items: [
      "如在醫院離世，醫生會確認死亡並簽發《死因醫學證明書》（表格18）。",
      "如屬意外、死因不明或入院不足 24 小時，個案會交由死因裁判官處理，須等候其指示才可辦理後事。",
      "翻閱本手冊「醫療」及「身後事意願」部分，並聯絡第一部分列出的緊急聯絡人。"] },
    { title: "14 日內：辦理死亡登記", items: [
      "自然死亡個案須於 14 日內向入境事務處辦理死亡登記，可親身或網上辦理。",
      "需要文件：表格18、死者的香港身份證或旅行證件、申報人的香港身份證或旅行證件。",
      "登記免費；死亡證明書每份港幣 140 元。銀行、保險和強積金都會要求出示，可考慮多申請幾份。"] },
    { title: "喪禮安排", items: [
      "按本手冊「身後事意願」部分的儀式及安排，聯絡殯儀服務。",
      "按「需要通知的人」名單通知親友。"] },
    { title: "首兩至四星期：通知各機構", items: [
      "銀行：聯名戶口一般會轉給尚存的戶口持有人；個人名義的戶口須待遺產手續完成才可處理。",
      "保險公司：按「保險與退休」部分的保單清單逐一申索。",
      "強積金：由遺產代理人憑授予書向受託人申索，強積金行政事務現經「積金易」平台處理。",
      "僱主、稅務局、按揭銀行、信用卡公司；並按「負債與定期支出」部分取消或轉名定期扣款。"] },
    { title: "處理遺產", items: [
      "一般須向高等法院遺產承辦處申請遺囑認證書（有遺囑）或遺產管理書（沒有遺囑）。",
      "遺產全部為款項而總值不超過港幣 5 萬元：可向民政事務總署遺產受益人支援組申請確認通知書。",
      "遺產只有銀行存款及／或強積金，而總值不超過港幣 15 萬元：遺產承辦處公眾申請組一般可協助以簡易方式處理。",
      "香港已於 2006 年取消遺產稅。",
      "如涉及物業、海外資產或家人之間有爭議，建議委託律師處理。"] }
  ];
  function makeBlocks(A, date) {
    const b = [];
    const sec = i => b.push({ t: "section", n: i + 1, title: SEC[i].title, why: SEC[i].why });
    const h3 = t => b.push({ t: "h3", text: t });
    b.push({ t: "cover", name: A.name || "", date });
    // 1
    sec(0);
    b.push({ t: "kv", rows: [["姓名", A.name], ["家人稱呼", A.nick], ["婚姻狀況", A.marital]] });
    h3("家庭成員"); b.push(tbl(["姓名", "關係", "電話"], [0.36, 0.28, 0.36], list(A, "family", ["name", "rel", "phone"])));
    h3("緊急聯絡人");
    const ecl = A.ec_local || {}, ecf = A.ec_far || {}, ec = [];
    if (filled(ecl)) ec.push(["本地", ecl.name, ecl.rel, ecl.phone]);
    if (A.ec_far_yn === "有" && filled(ecf)) ec.push(["外地" + (ecf.city ? "（" + ecf.city + "）" : ""), ecf.name, ecf.rel, ecf.phone]);
    b.push(tbl(["", "姓名", "關係", "電話"], [0.2, 0.28, 0.2, 0.32], ec));
    h3("重要文件存放位置"); b.push(per(A, "docs", "docs_loc", "文件", "存放位置"));
    // 2
    sec(1);
    const d = A.doctor || {};
    b.push({ t: "kv", rows: [["醫生／診所", join(d.name, d.phone)], ["常去的醫院", d.hosp], ["健康資料", A.med],
      ["預設醫療指示", join(A.amd, A.amd === "已經簽署" ? A.amd_d : "")], ["器官捐贈", A.organ]] });
    // 3
    sec(2);
    h3("銀行"); b.push(per(A, "bank_regions", "bank_detail", "地區", "銀行"));
    h3("投資"); b.push(yn(A.invest_yn, "沒有投資戶口。", tbl(["證券行／平台", "類別", "結單或資料在哪裡"], [0.34, 0.26, 0.4], list(A, "invest", ["inst", "type", "where"]))));
    h3("物業"); b.push(yn(A.prop_yn, "沒有物業。", tbl(["地區／地址", "業權", "按揭銀行"], [0.42, 0.24, 0.34], list(A, "prop", ["addr", "own", "mort"]))));
    h3("其他資產");
    b.push({ t: "kv", rows: [["加密貨幣", A.crypto_yn === "有" ? join("有", A.crypto) : A.crypto_yn === "沒有" ? "沒有" : ""],
      ["保險箱／貴重物品", A.valuables], ["借出／借入款項", A.lent]] });
    // 4
    sec(3);
    h3("保單"); b.push(yn(A.ins_yn, "沒有個人保險。", tbl(["保險公司", "種類", "經紀／電話", "受益人"], [0.28, 0.2, 0.3, 0.22], list(A, "ins", ["co", "type", "agent", "ben"]))));
    h3("強積金及其他退休計劃");
    const m = A.mpf || {};
    b.push({ t: "kv", rows: [["強積金", join(m.trustee, m.note)], ["其他計劃／福利", A.pension]] });
    // 5
    sec(4);
    h3("貸款"); b.push(yn(A.loans_yn, "沒有按揭以外的貸款。", tbl(["銀行／財務機構", "類別", "備註"], [0.36, 0.24, 0.4], list(A, "loans", ["inst", "type", "note"]))));
    h3("信用卡"); b.push(s_(A.cards) ? { t: "para", text: A.cards } : { t: "note", text: "未填寫" });
    h3("定期扣款及訂閱"); b.push(tbl(["服務名稱", "扣款方式", "處理方式"], [0.4, 0.3, 0.3], list(A, "autopay", ["svc", "pay", "todo"])));
    const tx = A.tax || {};
    b.push({ t: "kv", rows: [["會計師／稅務代表", join(tx.name, tx.phone)]] });
    // 6
    sec(5);
    const phone = A.phone ? join(A.phone, A.phone !== "未有安排" ? A.phone_d : "") : "";
    const pw = A.pw_yn === "有" ? join("有", A.pw_d) : A.pw_yn === "沒有" ? "沒有使用" : "";
    b.push({ t: "kv", rows: [["手機解鎖", phone], ["密碼管理工具", pw], ["主要電郵", A.email], ["社交媒體", A.social], ["相片及檔案", A.photos]] });
    // 7
    sec(6);
    if (A.biz_yn === "沒有") b.push({ t: "para", text: "沒有經營公司或持有公司股份。" });
    else {
      b.push(tbl(["公司名稱", "角色／持股", "合夥人／會計師聯絡"], [0.34, 0.28, 0.38], list(A, "biz", ["co", "role", "contact"])));
      if (s_(A.biz_note)) { h3("交接安排"); b.push({ t: "para", text: A.biz_note }); }
    }
    // 8
    sec(7);
    b.push({ t: "kv", rows: [["子女", A.kids], ["心目中的監護人", A.guardian], ["長輩", A.elders], ["寵物", A.pets]] });
    // 9
    sec(8);
    const w = A.will_d || {};
    b.push({ t: "kv", rows: [
      ["遺囑", A.will === "已經訂立" ? join("已經訂立", w.lawyer && "律師：" + w.lawyer, w.where && "正本：" + w.where, w.exec && "執行人：" + w.exec) : A.will],
      ["持久授權書", A.epa === "已經簽署" ? join("已經簽署", A.epa_d) : A.epa],
      ["儀式", A.rite], ["遺體安排", A.burial], ["其他意願", A.wishes]] });
    h3("需要通知的人"); b.push(tbl(["姓名", "關係", "電話"], [0.34, 0.32, 0.34], list(A, "notify", ["name", "rel", "phone"])));
    // 10
    sec(9);
    b.push({ t: "letter", text: A.letter || "" });
    // appendix
    b.push({ t: "section", n: "附", title: "給家人的辦事清單", why: "身故後首 30 日（香港）。按次序處理，不用一次做完。" });
    b.push({ t: "steps", steps: APPENDIX });
    b.push({ t: "disc", text: "以上資料整理自香港政府部門及社區法網（2026年11月），手續或有更新，請以有關部門最新公布為準。" });
    h3("年度更新記錄");
    b.push({ t: "table", cols: ["日期", "更新內容"], widths: [0.26, 0.74], rows: [["", ""], ["", ""], ["", ""]], minRow: 28, blank: true });
    b.push({ t: "disc", text: "本手冊只是個人資料整理工具，並非具法律效力的遺囑，亦不構成任何法律、財務或醫療意見。涉及遺產安排，請諮詢律師。建議每年檢查及更新一次，並讓信任的人知道本手冊存放的位置。更新後請銷毀舊版本，以封面「最後更新」日期最新的一份為準。" });
    return b;
  }

  async function readAttachment(PDFLib, bytes, wanted) {
    const { PDFDocument, PDFName, PDFArray, PDFDict, decodePDFRawStream } = PDFLib;
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    const names = doc.catalog.lookupMaybe(PDFName.of("Names"), PDFDict); if (!names) return null;
    const ef = names.lookupMaybe(PDFName.of("EmbeddedFiles"), PDFDict); if (!ef) return null;
    const arr = ef.lookupMaybe(PDFName.of("Names"), PDFArray); if (!arr) return null;
    for (let i = 0; i + 1 < arr.size(); i += 2) {
      const nm = arr.lookup(i); const fs = arr.lookup(i + 1, PDFDict);
      const n = nm && nm.decodeText ? nm.decodeText() : "";
      if (wanted && n !== wanted) continue;
      const efd = fs.lookupMaybe(PDFName.of("EF"), PDFDict); if (!efd) continue;
      const st = efd.lookup(PDFName.of("F"));
      return decodePDFRawStream(st).decode();
    }
    return null;
  }

  const api = { buildPdf, makeBlocks, readAttachment };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.WanyiPdf = api;
})(this);
