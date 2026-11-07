/*
  자동 점검 — 휴대폰 크기 화면(너비 360·390·430px)에서 앱을 처음부터 끝까지 눌러 봐요.
  실행: node tests/run-tests.js
  (Playwright와 Chromium이 설치된 컴퓨터에서 실행해요. 화면 캡처는 tests/screenshots 폴더에 저장돼요.)
  설계 규칙(docs/design-rules.md)이 다시 깨지지 않는지도 함께 점검해요. 점검 이름 앞의 [규칙 n]이 그 번호예요.
*/
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const SHOTS = path.join(__dirname, 'screenshots');
const WIDTHS = (process.env.WIDTHS || '360,390,430').split(',').map(Number);

/* ───── 결과 기록 ───── */
let passed = 0;
const failures = [];
function ok(cond, msg) {
  if (cond) { passed++; } else { failures.push(msg); console.log('  ✗ ' + msg); }
}

/* ───── 정적 파일 서버 ───── */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.md': 'text/plain; charset=utf-8'
};
function startServer() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

/* ───── 1. 데이터 점검 (브라우저 없이) ───── */
const FIXED = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixed-ids.json'), 'utf8'));
/* 원자료(무드 미터, 손선주 외 2012 부록) 단어 → 앱 낱말 대응표. 욕설·비하어 26개는 저장소에 적지 않고 개수만 확인 */
const SOURCE_MAP = JSON.parse(fs.readFileSync(path.join(__dirname, 'source-word-map.json'), 'utf8'));
const EXCLUDED_EXPLETIVES = 26;
const CORE_WORDS = ['수치심', '죄책감', '분노', '두려움', '상실감', '슬픔'];
/* 화면에 다시 나오면 안 되는 말 (재발 방지) */
const BANNED_UI = [/\d개까지/, /건너뛰/, /섞인 마음 쪽/, /게임 방법/];

function loadData() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const f of ['emotions.js', 'needs.js', 'questions.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'), ctx, { filename: f });
  }
  return ctx.window.MAEUM_DATA;
}
function emotionIndex(D) {
  const emo = {};
  D.quadrants.forEach((q) => q.categories.forEach((c) => c.emotions.forEach((e) => {
    emo[e.id] = { ...e, quad: q.id, cat: c.id, parent: null };
    (e.same || []).forEach((x) => { emo[x.id] = { ...x, desc: e.desc, hidden: !!e.hidden, quad: q.id, cat: c.id, parent: e.id }; });
  })));
  return emo;
}
function findEmo(D, id) { return emotionIndex(D)[id]; }

function checkData() {
  console.log('■ 데이터 파일 점검');
  const D = loadData();
  const emo = {};
  const retired = {};
  let total = 0;
  // 기분 4칸
  ok(D.quadrants.length === 4 && JSON.stringify(D.quadrants.map((q) => q.id)) === JSON.stringify(['yellow', 'green', 'red', 'blue']), '기분 4칸: 노랑·초록·빨강·파랑');
  D.quadrants.forEach((q) => {
    ok(q.name && q.label && q.hint && /^#[0-9A-Fa-f]{6}$/.test(q.color), `${q.id}: name/label/hint/color`);
    ok(q.categories.length >= 4, `${q.id}: 범주 4개 이상`);
    q.categories.forEach((c) => {
      ok(c.id && c.label && c.emotions.length >= 1, `${q.id}/${c.id}: 범주 id/label/낱말`);
      c.emotions.forEach((e) => {
        ok(e.word && e.desc, `${e.id}: word/desc 모두 있어야 함`);
        ok(!emo[e.id], `감정 id 중복: ${e.id}`);
        emo[e.id] = e; total++;
        (e.same || []).forEach((x) => { ok(x.word && x.id && !emo[x.id], `같은 뜻 다른 말 id/word (${x.id})`); emo[x.id] = { ...x, desc: e.desc, parent: e.id }; total++; });
      });
    });
  });
  (D.retiredEmotions || []).forEach((e) => { retired[e.id] = e; (e.same || []).forEach((x) => { retired[x.id] = x; }); });
  ok(new Set(D.quadrants.map((q) => q.color)).size === 4, '칸 색이 서로 다름');
  ok(total >= 640, `감정 낱말 640개 이상 (지금 ${total}개)`);
  // [규칙 1] 섞인 마음 쪽처럼 "여러 감정을 하나로 묶은 칸·범주"가 없음
  const catLabels = D.quadrants.flatMap((q) => q.categories.map((c) => c.label));
  ok(!catLabels.some((l) => /섞인/.test(l)), '[규칙 1] "섞인 마음" 칸·범주가 없음 (여러 감정은 각각 골라 표현)');
  // [규칙 1] 핵심 감정 5개
  ok(JSON.stringify((D.coreEmotions || []).map((id) => emo[id] && emo[id].word)) === JSON.stringify(CORE_WORDS), `[규칙 1] 핵심 감정 6개: ${CORE_WORDS.join('·')}`);
  // 예전 id는 지우지 않음
  FIXED.emotions.forEach((id) => ok(!!emo[id] || !!retired[id], `예전 감정 id ${id}가 그대로 있음`));
  FIXED.needs.forEach((id) => ok(D.needs.some((n) => n.id === id), `예전 욕구 id ${id}가 그대로 있음`));
  ok(Object.keys(retired).every((id) => !emo[id]), '화면에서 뺀 낱말(retiredEmotions)은 고르는 화면에 없음');
  // 원자료 단어가 모두 고를 수 있는 낱말로 있음
  const wordSet = new Set(Object.values(emo).map((e) => e.word));
  ok(SOURCE_MAP.length + EXCLUDED_EXPLETIVES === 604, `원자료 단어 수: 대응표 ${SOURCE_MAP.length} + 욕설 ${EXCLUDED_EXPLETIVES} = 604`);
  SOURCE_MAP.forEach((m) => ok(wordSet.has(m.game), `원자료 "${m.src}"(${m.origin})의 앱 낱말 "${m.game}"가 있음`));
  const words = Object.values(emo).map((e) => e.word);
  ok(new Set(words).size === words.length, '감정 낱말이 서로 겹치지 않음');
  ok((D.searchSuggest || []).every((id) => emo[id]), '낱말로 찾기 추천 감정 id가 모두 있음');
  // 욕구
  const need = {};
  D.needs.forEach((n) => { ok(!need[n.id], `욕구 id 중복: ${n.id}`); need[n.id] = n; ok(n.word && n.text, `욕구 ${n.id}: word/text`); });
  ok(D.needs.length >= 150, `욕구 낱말 150개 이상 (지금 ${D.needs.length}개)`);
  ok(new Set(D.needs.map((n) => n.word)).size === D.needs.length, '욕구 낱말이 서로 겹치지 않음');
  ok(D.needCategories.length === 14, `욕구 14범주 (지금 ${D.needCategories.length}개)`);
  const inCats = D.needCategories.flatMap((c) => c.needs);
  ok(inCats.length === D.needs.length && new Set(inCats).size === D.needs.length && inCats.every((id) => need[id]), '모든 욕구가 범주에 한 번씩 들어감');
  D.needCategories.forEach((c) => ok(c.label && c.hint && c.tip && c.needs.length >= 3, `욕구 범주 ${c.id}: label/hint/tip, 욕구 3개 이상`));
  Object.entries(D.needsByEmotion).forEach(([eid, list]) => ok(!!emo[eid] && !emo[eid].parent && list.length >= 3 && list.every((id) => need[id]), `needsByEmotion.${eid}: 원래 낱말 id, 욕구 id 확인`));
  const catIds = new Set(D.quadrants.flatMap((q) => q.categories.map((c) => c.id)));
  Object.entries(D.needsByCategory).forEach(([cid, list]) => ok(catIds.has(cid) && list.every((id) => need[id]), `needsByCategory.${cid}: 범주·욕구 id 확인`));
  ok([...catIds].every((cid) => D.needsByCategory[cid]), '감정 범주마다 욕구 후보가 있음');
  ok(D.thoughtWords.length >= 30, '생각이 섞인 말 30개 이상');
  const grouped = (D.thoughtGroups || []).flatMap((g) => g.words);
  ok(D.thoughtGroups.length === 6 && D.thoughtGroups.every((g) => g.id && g.label && g.words.length >= 3), '[규칙 7] 상대가 나에게 한 일: 여섯 묶음, 묶음마다 3개 이상');
  ok(grouped.length === D.thoughtWords.length && D.thoughtWords.every((t) => grouped.filter((w) => w === t.word).length === 1), '[규칙 7] 생각이 섞인 말은 모두 한 묶음에 한 번씩');
  ok(D.quadrants.every((q) => !/나쁘/.test(q.label)) && D.quadrants.filter((q) => /안 좋고/.test(q.label)).length === 2, '[규칙 7] 기분 4칸 이름: "기분이 나쁘고" 대신 "기분이 안 좋고"');
  ok(!/작은 실천 제안|무엇을 말해 주나요/.test(JSON.stringify(D.text) + JSON.stringify(D.guide)), '[규칙 6] 마음 카드에 작은 실천 제안·"무엇을 말해 주나요" 없음');
  ok(D.guide.sections.some((x) => /이전/.test(x.title) && /그대로 남아/.test(x.body)), '[규칙 6] 사용 방법에 이전 단계로 돌아가기 설명');
  ok(!/보너스 별|★/.test(JSON.stringify(D.text) + JSON.stringify(D.guide)), '[규칙 10] 보너스별(★) 문구 없음');
  const mains = D.quadrants.flatMap((q) => q.categories.flatMap((c) => c.emotions.map((e) => ({ e, c }))));
  ok(Object.keys(D.antonyms.byWord).every((id) => mains.some((m) => m.e.id === id)), '[규칙 10] 반대말 낱말 id가 모두 있음');
  ok(mains.every((m) => (D.antonyms.byWord[m.e.id] || D.antonyms.byCategory[m.c.id] || []).every((w) => w && w !== m.e.word)), '[규칙 10] 반대말이 자기 자신이 아님');
  ok(mains.filter((m) => (D.antonyms.byWord[m.e.id] || D.antonyms.byCategory[m.c.id] || []).length === 0).length <= 3, '[규칙 10] 반대말이 없는 낱말은 두 마음이 섞인 말 3개뿐');
  D.thoughtWords.forEach((t) => ok(t.word && t.feelings.length && t.feelings.every((id) => emo[id]) && t.needs.length && t.needs.every((id) => need[id]), `생각이 섞인 말 "${t.word}": 느낌·욕구 id 확인`));
  ok(D.needSearchSuggest.every((id) => need[id]), '욕구 찾기 추천 id가 모두 있음');
  // 5번 경로
  ok(D.approaches.length === 4, '5번 경로 4가지');
  D.approaches.forEach((a) => a.options.forEach((o) => {
    ok(o.emotions.length === 4 && o.emotions.every((id) => emo[id]), `경로 ${a.key}/${o.label}: 감정 4개 id 확인`);
    if (o.need) ok(!!need[o.need], `경로 ${a.key}: 욕구 id ${o.need}`);
  }));
  // 사용 방법·참고자료
  ok(CORE_WORDS.length % 3 === 0, '[규칙 5] 핵심 감정은 3개씩 줄이 꽉 차는 개수 (빈 칸 없음)');
  ok(D.quadrants.every((q) => q.face), '[규칙 5] 기분 4칸마다 얼굴 그림(face)');
  ok(D.coreEmotions.every((id) => D.coreFaces && D.coreFaces[id]), '[규칙 5] 핵심 감정마다 얼굴 그림(coreFaces)');
  ok(D.guide && D.guide.sections.length >= 6 && D.guide.install.length >= 2, '사용 방법: 설명 6개 이상, 설치 방법');
  const refs = D.guide.references.flatMap((g) => g.items);
  ok(refs.length >= 15 && refs.every((r) => /\(\d{4}\)/.test(r) || /한국NVC센터/.test(r)), `참고자료 15개 이상, 연도 표기 (지금 ${refs.length}개)`);
  // [규칙 1·2] 금지된 문구
  const allText = JSON.stringify(D.text) + JSON.stringify(D.guide);
  BANNED_UI.forEach((re) => ok(!re.test(allText), `[규칙 1·2] 화면 문장에 "${re.source}"가 없음`));
  ok(D.text.appTitle === '감정 및 욕구 찾기', '[규칙 2] 앱 이름 "감정 및 욕구 찾기"');
  console.log(`  감정 ${total}개, 욕구 ${D.needs.length}개, 생각이 섞인 말 ${D.thoughtWords.length}개`);
  return D;
}

/* ───── 화면 점검 도구 ───── */
async function layoutCheck(page, label) {
  const problems = await page.evaluate(() => {
    const out = [];
    const vw = window.innerWidth;
    if (document.documentElement.scrollWidth > vw + 1) out.push(`가로 넘침: 문서 폭 ${document.documentElement.scrollWidth} > 화면 ${vw}`);
    const visible = (el) => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      if (el.closest('.sr-only') || el.closest('details:not([open]) > :not(summary)')) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const leaves = [];
    const root = document.querySelector('#app .sheet') || document.querySelector('#app');
    root.querySelectorAll('*').forEach((el) => {
      if (!visible(el)) return;
      if (el.closest('.navbar')) return; /* 화면 아래에 떠 있는 이동 막대는 겹침 점검에서 빼요 (단추 크기는 아래에서 점검) */
      const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) return;
      leaves.push(el);
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 16) out.push(`글자 16px 미만(${fs}px): "${el.textContent.trim().slice(0, 20)}"`);
      const r = el.getBoundingClientRect();
      const inScroller = el.closest('.pick-chips');
      if (!inScroller && (r.right > vw + 1 || r.left < -1)) out.push(`화면 밖으로 나감: "${el.textContent.trim().slice(0, 20)}"`);
    });
    const rects = leaves.map((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return { el, rects: Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0) };
    });
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        let hit = false;
        for (const ra of a.rects) for (const rb of b.rects) {
          const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (w > 2 && h > 2) hit = true;
        }
        if (hit) out.push(`글자 겹침: "${a.el.textContent.trim().slice(0, 15)}" ↔ "${b.el.textContent.trim().slice(0, 15)}"`);
      }
    }
    root.querySelectorAll('button, summary').forEach((b) => {
      if (!visible(b)) return;
      const r = b.getBoundingClientRect();
      if (r.height < 44 || r.width < 44) out.push(`버튼이 작음(${Math.round(r.width)}×${Math.round(r.height)}): "${b.textContent.trim().slice(0, 15)}"`);
    });
    return out;
  });
  problems.forEach((p) => ok(false, `[${label}] ${p}`));
  if (!problems.length) passed++;
}

function makeHelpers(page, width) {
  const dir = path.join(SHOTS, String(width));
  fs.mkdirSync(dir, { recursive: true });
  let shotNo = 0;
  const seen = new Set();
  return {
    async screen(name) {
      await page.waitForSelector(`#app > [data-screen="${name}"]`, { timeout: 4000 }).catch(() => {});
      return page.getAttribute('#app > section', 'data-screen').catch(() => null);
    },
    async expect(name, label) {
      const cur = await this.screen(name);
      ok(cur === name, `[${width}px ${label}] 화면이 "${name}"이어야 하는데 "${cur}"`);
      return cur === name;
    },
    async opt(n) { await page.click(`#app > section .opt[data-num="${n}"]`); },
    async cause(n) {
      await page.click(`#app > section .opt[data-num="${n}"]`);
      if ((await this.screen('cause')) === 'cause') await page.click('[data-testid="nav-next"]');
    },
    async snap(name) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await layoutCheck(page, `${width}px ${name}`);
      const scr = await page.getAttribute('#app > section', 'data-screen').catch(() => null);
      if (scr && scr !== 'home') {
        const nav = await page.evaluate(() => {
          const b = document.querySelector('.navbar .nav-back'), n = document.querySelector('.navbar .nav-next');
          if (!b || !n) return null;
          const rb = b.getBoundingClientRect(), rn = n.getBoundingClientRect();
          return { back: b.textContent, sameSize: Math.abs(rb.height - rn.height) < 1 && Math.abs(rb.width - rn.width) < 2, backLeft: rb.left < rn.left, bottom: Math.abs(rn.bottom - window.innerHeight) < 40 };
        });
        ok(!!nav && /이전|처음으로/.test(nav.back) && nav.sameSize && nav.backLeft && nav.bottom, `[${width}px ${name}] [규칙 8] 아래쪽에 같은 크기의 "← 이전"(왼쪽)·"다음"(오른쪽) 단추 ${JSON.stringify(nav)}`);
      }
      if (seen.has(name)) return;
      seen.add(name);
      shotNo++;
      await page.screenshot({ path: path.join(dir, `${String(shotNo).padStart(2, '0')}-${name}.png`), fullPage: !(await page.$('.sheet-wrap')) });
    },
    async count() {
      const t = await page.textContent('[data-testid="pick-bar"] .pick-title').catch(() => '');
      const m = t.match(/(\d+)개/);
      return m ? Number(m[1]) : 0;
    },
    async needCount() {
      const t = await page.textContent('[data-testid="need-bar"] .pick-title').catch(() => '');
      const m = t.match(/(\d+)개/);
      return m ? Number(m[1]) : 0;
    }
  };
}

async function newGame(page, h, situation) {
  await page.click('[data-testid="start"]');
  await h.expect('situation', '상황 입력');
  await page.fill('#situation', situation);
  await page.click('[data-testid="nav-next"]');
  await h.expect('emotion', '감정 고르기');
}
/* 강도 화면의 감정마다 점수 고르기 */
async function setAllIntensity(page, score) {
  const ids = await page.$$eval('.int-block', (e) => e.map((x) => x.getAttribute('data-emotion-block')));
  for (let i = 0; i < ids.length; i++) {
    const s = typeof score === 'function' ? score(i) : score;
    await page.click(`[data-emotion="${ids[i]}"][data-score="${s}"]`);
  }
  return ids;
}
/* 핵심 감정 하나만 골라 욕구 화면까지 */
async function toNeedWith(page, h, coreId, score) {
  await page.click(`.core-chip[data-id="${coreId}"]`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('intensity', '강도');
  await setAllIntensity(page, score || 5);
  await page.click('[data-testid="nav-next"]');
  await h.expect('cause', '원인');
  await h.cause(1);
  await h.expect('need', '욕구');
}
async function suggestIds(page) {
  return page.$$eval('[data-testid="need-suggest"] .chip', (e) => e.map((x) => x.getAttribute('data-need')));
}
async function bg(page, sel) { return page.$eval(sel, (e) => getComputedStyle(e).backgroundColor); }

/* ───── 2. 화면 테스트 ───── */
async function runForWidth(browser, base, width, D) {
  console.log(`■ 휴대폰 화면 너비 ${width}px`);
  const context = await browser.newContext({
    viewport: { width, height: 800 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR'
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const h = makeHelpers(page, width);
  const EMO = emotionIndex(D);
  const NEEDW = Object.fromEntries(D.needs.map((n) => [n.id, n.word]));

  await page.goto(base + '/index.html');

  /* 2-1. 처음 열면 사용 방법이 한 번 나옴 */
  await h.expect('guide', '처음 열면 사용 방법');
  ok((await page.$$('[data-testid="guide-section"]')).length === D.guide.sections.length, `[${width}px] 사용 방법 설명 ${D.guide.sections.length}개`);
  ok(!!(await page.$('[data-screen="guide"] [data-testid="install-help"]')), `[${width}px] [규칙 2] 홈 화면 설치 방법은 사용 방법 안에 있음`);
  const refN = D.guide.references.flatMap((g) => g.items).length;
  ok((await page.$$('[data-testid="guide-refs"] .ref-item')).length === refN, `[${width}px] [규칙 2] 사용 방법 끝에 참고자료 ${refN}개`);
  const refsLast = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('[data-testid="guide-section"], [data-testid="install-help"], [data-testid="guide-refs"]'));
    return items[items.length - 1].getAttribute('data-testid');
  });
  ok(refsLast === 'guide-refs', `[${width}px] [규칙 2] 참고자료가 사용 방법 맨 끝 부분에 있음`);
  ok(!(await page.isVisible('[data-testid="guide-refs"] .ref-item >> nth=0')), `[${width}px] [규칙 2] 참고자료는 처음에 접혀 있음`);
  await page.click('[data-testid="guide-refs"] summary');
  ok(await page.isVisible('[data-testid="guide-refs"] .ref-item >> nth=0'), `[${width}px] [규칙 2] 참고자료 제목을 누르면 펼쳐짐`);
  await h.snap('guide-refs-open');
  await page.click('[data-testid="guide-refs"] summary');
  const guideBg = await bg(page, '[data-screen="guide"] [data-testid="nav-next"]');
  await h.snap('guide');
  await page.click('[data-testid="guide-back"]');
  await h.expect('home', '사용 방법 → 처음 화면');
  await page.reload();
  await h.expect('home', '한 번 본 뒤에는 바로 처음 화면');

  /* 2-2. 표지 [규칙 2] */
  {
    const homeText = await page.textContent('#app');
    ok((await page.textContent('#app h1')).trim() === '감정 및 욕구 찾기', `[${width}px] [규칙 2] 제목 "감정 및 욕구 찾기"`);
    ok(!/[💗❤♥💖💕💓💞]/u.test(homeText), `[${width}px] [규칙 2] 제목 위 하트 없음`);
    ok(!/게임 방법/.test(homeText) && /사용 방법/.test(homeText), `[${width}px] [규칙 2] "게임 방법" 대신 "사용 방법"`);
    ok(!(await page.$('[data-screen="home"] [data-testid="install-help"]')), `[${width}px] [규칙 2] 처음 화면에 설치 방법 버튼 없음`);
    ok(!/109|1577-0199|자살/.test(homeText), `[${width}px] 처음 화면에 상담 전화 문구 없음`);
    const lay = await page.evaluate(() => {
      const menus = Array.from(document.querySelectorAll('.menu-row .menu-btn'));
      const r = (e) => e.getBoundingClientRect();
      return {
        labels: menus.map((m) => m.querySelector('.menu-label').textContent),
        tops: menus.map((m) => Math.round(r(m).top)),
        startBottom: r(document.querySelector('[data-testid="start"]')).bottom
      };
    });
    ok(JSON.stringify(lay.labels) === JSON.stringify(['감정 도감', '주간 보고서', '지난 기록', '기록 옮기기']), `[${width}px] [규칙 2] 메뉴 4개: ${lay.labels.join('·')}`);
    ok(Math.max(...lay.tops) - Math.min(...lay.tops) <= 1, `[${width}px] [규칙 2] 메뉴 4개가 한 줄 (위치 ${lay.tops.join(',')})`);
    ok(Math.min(...lay.tops) > lay.startBottom, `[${width}px] 메뉴는 시작 버튼 아래`);
    const startBg = await bg(page, '[data-testid="start"]');
    ok(startBg !== guideBg, `[${width}px] [규칙 2] 사용 방법 버튼 색(${guideBg})이 시작하기 색(${startBg})과 다름`);
    const [sr, sg, sb] = startBg.match(/\d+/g).map(Number);
    ok(sb > sr + 60 && sb > sg + 30 && sr + sg + sb > 250, `[${width}px] [규칙 5] 시작하기는 먹색이 아닌 파랑 계통 (${startBg})`);
    // 글자 크게: 켜도 화면이 넘치지 않고, 다시 열어도 유지
    await page.click('[data-testid="big-text"]');
    ok(await page.evaluate(() => document.documentElement.classList.contains('big-text')), `[${width}px] [규칙 5] 글자 크게 켜기`);
    await h.snap('home-big');
    await page.click('[data-testid="start"]');
    await page.click('[data-testid="nav-next"]');
    await h.expect('emotion', '글자 크게: 감정 고르기');
    await page.click('.quad[data-quad="red"]');
    await h.snap('emotion-big');
    await page.click('.topbar .top-btn >> nth=1');
    await page.reload();
    ok(await page.evaluate(() => document.documentElement.classList.contains('big-text')), `[${width}px] 글자 크게는 다시 열어도 유지`);
    await page.click('[data-testid="big-text"]');
    ok(!(await page.evaluate(() => document.documentElement.classList.contains('big-text'))), `[${width}px] 글자 크게 끄기`);
    ok(!(await page.$('[data-testid="home-stats"]')), `[${width}px] 기록이 없으면 기록 요약 줄 없음`);
    await h.snap('home');
    await page.click('[data-testid="menu-guide"]');
    await h.expect('guide', '처음 화면 → 사용 방법');
    await page.click('[data-testid="guide-back"]');
    await h.expect('home', '사용 방법 → 처음 화면 (다시)');
  }

  /* 2-3. 감정 고르기: 개수 제한·건너뛰기 없이 여러 칸에서 모두 고르기 [규칙 1] */
  await newGame(page, h, '친구가 약속을 또 어겨서 한참 기다렸다.');
  {
    const emoText = await page.textContent('#app');
    BANNED_UI.forEach((re) => ok(!re.test(emoText), `[${width}px] [규칙 1] 감정 고르기 화면에 "${re.source}" 없음`));
    ok(!(await page.$('[data-testid="fam-skip"], [data-testid="fam-next"]')), `[${width}px] [규칙 1] "이 쪽은 건너뛰기" 버튼 없음`);
    const coreWords = await page.$$eval('.core-chip .core-word', (e) => e.map((x) => x.textContent));
    ok(JSON.stringify(coreWords) === JSON.stringify(CORE_WORDS), `[${width}px] [규칙 1] 핵심 감정 6개: ${coreWords.join('·')}`);
    const rows = await page.$$eval('.core-chip', (e) => e.map((x) => Math.round(x.getBoundingClientRect().top)));
    ok(new Set(rows).size === 2 && rows.filter((t) => t === rows[0]).length === 3, `[${width}px] [규칙 5] 핵심 감정이 3개씩 두 줄 (빈 칸 없음)`);
    ok(!(await page.$('[data-testid="pick-bar"]')), `[${width}px] [규칙 5] 아무것도 안 골랐을 때는 고른 감정 막대가 없음`);
    const secNums = await page.$$eval('[data-screen="emotion"] .sec-num', (e) => e.map((x) => x.textContent));
    ok(JSON.stringify(secNums) === JSON.stringify(['1', '2', '3']), `[${width}px] [규칙 5] 감정 고르기 묶음 번호 1·2·3 (${secNums.join('·')})`);
    const secTitles = await page.$$eval('[data-screen="emotion"] .sec-title', (e) => e.map((x) => x.textContent.replace(/^\d/, '')));
    ok(JSON.stringify(secTitles) === JSON.stringify(['기분 4칸으로 찾기', '핵심 감정으로 찾기', '다른 방법으로 찾기']), `[${width}px] [규칙 7] ① 기분 4칸 → ② 핵심 감정 → ③ 다른 방법 (${secTitles.join(' → ')})`);
    ok((await page.textContent('[data-testid="thought-open"]')).includes('상대가 나에게 한 일로 찾기'), `[${width}px] [규칙 7] "상대가 나에게 한 일로 찾기"`);
    ok((await page.$$('[data-testid="ways"] .way')).length === 3, `[${width}px] [규칙 5] 다른 방법 3가지가 한 묶음`);
    const order = await page.evaluate(() => document.querySelector('.quad-grid').getBoundingClientRect().top < document.querySelector('[data-testid="core"]').getBoundingClientRect().top);
    ok(order, `[${width}px] [규칙 7] 기분 4칸이 핵심 감정보다 위`);
    ok((await page.$$('.quad')).length === 4, `[${width}px] 기분 4칸`);
    await h.snap('emotion');
  }
  for (const id of D.coreEmotions) await page.click(`.core-chip[data-id="${id}"]`);
  const NC = D.coreEmotions.length;
  ok((await h.count()) === NC, `[${width}px] 핵심 감정 ${NC}개 모두 체크`);
  ok(!!(await page.$('[data-testid="pick-note"]')), `[${width}px] 방금 고른 낱말의 뜻이 나옴`);
  // 4칸을 차례로 열어 칸마다 3개씩 더 고름 → 제한 없이 NC + 12개
  const quadPicks = {};
  for (const q of D.quadrants) {
    await page.click(`.quad[data-quad="${q.id}"]`);
    ok(!!(await page.$(`[data-testid="quad-panel"][data-quad="${q.id}"]`)), `[${width}px] ${q.name} 칸이 펼쳐짐`);
    const free = await page.$$eval('[data-testid="quad-panel"] .chip[aria-pressed="false"]', (e) => e.map((x) => x.getAttribute('data-id')));
    const take = [free[0], free[Math.floor(free.length / 2)], free[free.length - 1]];
    for (const id of take) await page.click(`[data-testid="quad-panel"] .chip[data-id="${id}"]`);
    quadPicks[q.id] = take;
    if (q.id === 'red') await h.snap('emotion-open');
  }
  ok((await h.count()) === NC + 12, `[${width}px] [규칙 1] 4칸 모두에서 골라 ${NC + 12}개 (개수 제한 없음, 실제 ${await h.count()})`);
  const quadCount = await page.textContent('.quad[data-quad="yellow"] .quad-count').catch(() => '');
  ok(quadCount.includes('✓3'), `[${width}px] 다른 칸을 열어도 노랑 칸에서 고른 3개가 남아 있음 (${quadCount})`);
  // 막대에서 빼고 다시 넣기
  await page.click(`[data-pick="${quadPicks.green[0]}"]`);
  ok((await h.count()) === NC + 11, `[${width}px] 고른 감정 막대의 ✕로 빼기`);
  await page.click('.quad[data-quad="green"]');
  await page.click(`[data-testid="quad-panel"] .chip[data-id="${quadPicks.green[0]}"]`);
  ok((await h.count()) === NC + 12, `[${width}px] 다시 넣기`);
  await page.click('[data-testid="quad-close"]');
  // 생각이 섞인 말 (가짜 느낌) → 밑의 느낌을 고르고 욕구 후보를 넘겨줌
  const twi = D.thoughtWords.findIndex((t) => t.word === '무시당한');
  const tw = D.thoughtWords[twi];
  await page.click('[data-testid="thought-open"]');
  await h.expect('thought', '상대가 나에게 한 일로 찾기');
  ok((await page.$$('[data-screen="thought"] .tgroup')).length === 6, `[${width}px] [규칙 7] 상대가 나에게 한 일: 여섯 묶음`);
  ok((await h.count()) === NC + 12, `[${width}px] 따로 연 화면에도 고른 감정이 그대로`);
  await page.click(`[data-thought="${twi}"]`);
  ok(await page.isVisible('[data-testid="thought-card"]'), `[${width}px] "무시당한"을 누르면 번역 카드`);
  ok((await page.textContent('[data-testid="thought-needs"]')).includes(NEEDW[tw.needs[0]]), `[${width}px] 번역 카드에 욕구 후보 "${NEEDW[tw.needs[0]]}"`);
  const freeFeel = tw.feelings.find((id) => !Object.values(quadPicks).flat().includes(id) && !D.coreEmotions.includes(id));
  await page.click(`[data-testid="thought-card"] .chip[data-id="${freeFeel}"]`);
  const ALLN = NC + 13;
  ok((await h.count()) === ALLN, `[${width}px] 번역 카드의 느낌 "${EMO[freeFeel].word}"도 함께 체크 (${ALLN}개)`);
  await h.snap('emotion-thought');
  await page.click('[data-testid="nav-back"]');
  await h.expect('emotion', '말로 찾기 → 감정 고르기');
  ok((await h.count()) === ALLN, `[${width}px] 돌아와도 말로 찾기에서 고른 감정이 남아 있음`);
  await page.click('[data-testid="nav-next"]');

  /* 2-4. 강도: 고른 감정 모두 한 화면에, 감정 낱말 강조 [규칙 3] */
  await h.expect('intensity', '강도');
  ok((await page.$$('.int-block')).length === ALLN, `[${width}px] 강도 화면에 감정 ${ALLN}개`);
  const st = await page.$eval('.int-word', (e) => { const c = getComputedStyle(e); return { size: parseFloat(c.fontSize), weight: parseInt(c.fontWeight, 10), color: c.color, body: getComputedStyle(document.body).color }; });
  ok(st.size >= 24 && st.weight >= 800 && st.color !== st.body, `[${width}px] [규칙 3] 강도 화면 감정 낱말 강조 (크기 ${st.size}px, 굵기 ${st.weight}, 색 ${st.color})`);
  ok(await page.isDisabled('[data-testid="nav-next"]'), `[${width}px] 모두 고르기 전에는 다음 버튼이 꺼짐`);
  await setAllIntensity(page, (i) => (i % 10) + 1);
  ok(!(await page.isDisabled('[data-testid="nav-next"]')), `[${width}px] 모두 고르면 다음 버튼이 켜짐`);
  ok((await page.textContent('[data-testid="int-value"]')).includes('1점'), `[${width}px] 고른 점수가 낱말 옆에 나옴`);
  await h.snap('intensity');
  await page.click('[data-testid="nav-next"]');
  await h.expect('cause', '원인');
  ok(await page.isDisabled('[data-testid="nav-next"]'), `[${width}px] [규칙 8] 원인을 고르기 전에는 다음 단추가 꺼짐`);
  await h.cause(2);

  /* 2-5. 욕구: 후보·14범주에서 여러 개 [규칙 1] */
  await h.expect('need', '욕구');
  const cand = await suggestIds(page);
  ok(cand.length >= 6, `[${width}px] 욕구 후보 ${cand.length}개`);
  ok(tw.needs.every((id) => cand.includes(id)), `[${width}px] "무시당한"의 욕구 후보가 먼저 나옴`);
  await page.click(`[data-testid="need-suggest"] .chip[data-need="${cand[0]}"]`);
  await page.click(`[data-testid="need-suggest"] .chip[data-need="${cand[1]}"]`);
  ok((await page.$$('.ncat')).length === 14, `[${width}px] 욕구 14범주`);
  const bodyNeed = D.needCategories.find((c) => c.id === 'body').needs[0];
  const limitNeed = D.needCategories.find((c) => c.id === 'limit').needs[1];
  await page.click('.ncat[data-ncat="body"] .ncat-head');
  await page.click(`.ncat[data-ncat="body"] .chip[data-need="${bodyNeed}"]`);
  await page.click('.ncat[data-ncat="limit"] .ncat-head');
  await page.click(`.ncat[data-ncat="limit"] .chip[data-need="${limitNeed}"]`);
  ok((await h.needCount()) === 4, `[${width}px] [규칙 1] 욕구 4개 체크 (여러 범주에서)`);
  ok(!!(await page.$('[data-testid="need-note"]')), `[${width}px] 방금 고른 욕구의 뜻이 나옴`);
  const needText = await page.textContent('#app');
  BANNED_UI.forEach((re) => ok(!re.test(needText), `[${width}px] [규칙 1] 욕구 화면에 "${re.source}" 없음`));
  await h.snap('need');
  await page.click('[data-testid="nav-next"]');

  /* 2-6. 마음 카드 */
  await h.expect('result', '마음 카드');
  ok((await page.$$('[data-testid="result-emotion-item"]')).length === ALLN, `[${width}px] 마음 카드에 감정 ${ALLN}개`);
  const rn = await page.textContent('[data-testid="result-need"]');
  ok([cand[0], cand[1], bodyNeed, limitNeed].every((id) => rn.includes(NEEDW[id])), `[${width}px] 마음 카드에 욕구 4개: ${rn}`);
  const summary = await page.textContent('[data-testid="result-summary"]');
  ok(summary.includes('필요했어요') && !/[{}]/.test(summary), `[${width}px] 한 줄 정리: ${summary.slice(0, 40)}…`);
  ok(await page.isVisible('[data-testid="result-note"]'), `[${width}px] "이 순간의 해석" 안내`);
  let rec = await page.evaluate(() => { const r = window.__maeum.records(); return r[r.length - 1]; });
  ok(rec.emotions.length === ALLN && rec.needIds.length === 4 && rec.needId === cand[0], `[${width}px] 기록: 감정 ${ALLN}개, 욕구 4개`);
  ok(!(await page.$('[data-testid="result-tip"], [data-testid="reflect-input"]')) && !/작은 실천 제안|무엇을 말해 주나요/.test(await page.textContent('#app')), `[${width}px] [규칙 6] 마음 카드에 작은 실천 제안·"무엇을 말해 주나요" 없음`);
  ok((await page.textContent('.topbar .top-btn >> nth=0')).includes('이전'), `[${width}px] [규칙 6] 마음 카드에도 이전 버튼`);
  await page.click('[data-testid="need-fit-unsure"]');
  rec = await page.evaluate(() => { const r = window.__maeum.records(); return r[r.length - 1]; });
  ok(rec.needFit === 'unsure', `[${width}px] 욕구 응답 저장`);
  await h.snap('result');
  await page.click('[data-testid="nav-next"]');
  await h.expect('home', '마음 카드 → 처음 화면');

  /* 2-7. 욕구 응답이 다음 후보 차례에 반영 */
  await newGame(page, h, '슬픈 일이 있었다.');
  await toNeedWith(page, h, 'sad30', 6);
  const c1 = await suggestIds(page);
  await page.click(`[data-testid="need-suggest"] .chip[data-need="${c1[0]}"]`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('result', '응답 1');
  await page.click('[data-testid="need-fit-no"]');
  await page.click('[data-testid="nav-next"]');
  await newGame(page, h, '또 슬픈 일이 있었다.');
  await toNeedWith(page, h, 'sad30', 4);
  const c2 = await suggestIds(page);
  ok(!c2.includes(c1[0]), `[${width}px] "아니요"였던 욕구(${NEEDW[c1[0]]})는 후보에서 빠짐`);
  await page.click(`[data-testid="need-suggest"] .chip[data-need="${c2[2]}"]`);
  await page.click('[data-testid="nav-next"]');
  await page.click('[data-testid="need-fit-yes"]');
  await page.click('[data-testid="nav-next"]');
  await newGame(page, h, '세 번째 슬픈 일.');
  await toNeedWith(page, h, 'sad30', 3);
  ok((await suggestIds(page))[0] === c2[2], `[${width}px] "네"였던 욕구(${NEEDW[c2[2]]})가 후보 맨 앞`);
  // 욕구 낱말로 찾기
  await page.click('[data-testid="need-search-open"]');
  await h.expect('needSearch', '욕구 낱말로 찾기');
  await page.fill('[data-testid="search-input"]', '인정받고 싶었다');
  const nres = await page.$$eval('[data-testid="search-results"] .search-item', (e) => e.map((x) => x.textContent));
  ok(nres.some((t) => t.includes('인정')), `[${width}px] "인정받고 싶었다" → 인정 욕구`);
  await page.click('[data-testid="search-results"] .search-item >> nth=0');
  ok((await h.needCount()) === 1, `[${width}px] 찾은 욕구를 체크`);
  await h.snap('need-search');
  await page.click('[data-testid="nav-back"]');
  await h.expect('need', '욕구 찾기 → 욕구 화면');
  ok((await h.needCount()) === 1, `[${width}px] 돌아와도 고른 욕구가 남아 있음`);
  await page.click('[data-testid="need-bar"] .pick-chip');
  ok(await page.isVisible('[data-testid="need-none-note"]') && !(await page.isDisabled('[data-testid="nav-next"]')), `[${width}px] 욕구를 안 골라도 "마음 카드 만들기"를 누를 수 있음`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('result', '욕구 없이 → 마음 카드');
  ok((await page.textContent('[data-testid="result-summary"]')).includes('아직 찾는 중'), `[${width}px] 욕구 없이: 욕구는 찾는 중`);
  await page.click('[data-testid="nav-next"]');

  /* 2-8. 낱말로 찾기 */
  await newGame(page, h, '발표하다가 말을 더듬었다.');
  await page.click('[data-testid="search-open"]');
  await h.expect('search', '낱말로 찾기');
  for (const [q, want] of [['서운했다', '서운함'], ['부끄러웠다', '부끄러움'], ['낙심', '낙심'], ['개운해요', '개운함']]) {
    await page.fill('[data-testid="search-input"]', q);
    const res = await page.$$eval('[data-testid="search-results"] .search-item .opt-label', (e) => e.map((x) => x.textContent.replace(/^[✓★ ]+/, '')));
    ok(res.includes(want), `[${width}px] "${q}" → "${want}" (찾은 것: ${res.slice(0, 4).join(', ')})`);
  }
  await page.fill('[data-testid="search-input"]', '무시당했다');
  ok(!!(await page.$('[data-testid="search-thought"]')), `[${width}px] [규칙 7] "무시당했다"를 적으면 "상대가 나에게 한 일"로 이어 줌`);
  await page.click('[data-testid="search-thought"] >> nth=0');
  await h.expect('thought', '낱말로 찾기 → 상대가 나에게 한 일');
  ok(await page.isVisible('[data-testid="thought-card"]'), `[${width}px] [규칙 7] 그 말의 밑 감정 카드가 바로 펼쳐짐`);
  await page.click('[data-testid="nav-back"]');
  await h.expect('search', '상대가 나에게 한 일 → 낱말로 찾기');
  await page.fill('[data-testid="search-input"]', '서운');
  await page.click('[data-testid="search-results"] .search-item >> nth=0');
  ok((await h.count()) === 1, `[${width}px] 찾은 낱말을 체크`);
  await h.snap('search');
  await page.click('[data-testid="nav-back"]');
  await h.expect('emotion', '찾기 → 감정 고르기');
  ok((await h.count()) === 1, `[${width}px] 돌아와도 고른 감정이 남아 있음`);
  await page.click('.topbar .top-btn >> nth=1');
  await h.expect('home', '그만하기 → 처음 화면');

  /* 2-9. 잘 모르겠어요 → 몸 느낌 → … → 이름 붙이기 어려운 감정 */
  await newGame(page, h, '그냥 오늘 하루가 이상했다.');
  await page.click('[data-testid="not-sure"]');
  const order = ['body', 'action', 'reverse', 'past'];
  for (let k = 0; k < 4; k++) {
    await h.expect('approach', `5번 경로 ${k + 1}`);
    ok((await page.getAttribute('#app > section', 'data-approach')) === order[k], `[${width}px] 경로 ${k + 1}: ${order[k]}`);
    if (k === 0) await h.snap('approach');
    await h.opt(5);
  }
  await h.expect('unnamed', '이름 붙이기 어려운 감정');
  await page.click('[data-testid="nav-next"]');
  await h.expect('intensity', '이름 붙이기 어려운 감정의 강도');
  ok((await page.textContent('.int-word')).includes('이름 붙이기 어려운 감정'), `[${width}px] 강도 화면에 "이름 붙이기 어려운 감정"`);
  await setAllIntensity(page, 3);
  await page.click('[data-testid="nav-next"]');
  await h.opt(5);
  await page.click('[data-testid="nav-next"]');
  await h.expect('need', '욕구');
  await page.click('[data-testid="nav-next"]');
  await h.expect('result', '이름 붙이기 어려운 감정 → 마음 카드');
  await page.click('[data-testid="nav-next"]');
  // 욕구부터 거꾸로: 고른 욕구가 후보 맨 앞, 고른 감정은 5번 경로 낱말 화면에서 체크
  await newGame(page, h, '내 마음을 아무도 몰랐다.');
  await page.click('[data-testid="not-sure"]');
  await h.opt(5); await h.opt(5);
  await h.expect('approach', '욕구부터 거꾸로');
  const rev = D.approaches[2].options[0];
  await h.opt(1);
  await h.expect('words', '거꾸로 → 감정 낱말');
  await h.opt(1); await h.opt(2);
  ok((await h.count()) === 2, `[${width}px] 5번 경로 낱말도 여러 개 체크`);
  await h.snap('words');
  await page.click('[data-testid="nav-next"]');
  await setAllIntensity(page, 6);
  await page.click('[data-testid="nav-next"]');
  await h.cause(1);
  await h.expect('need', '거꾸로 → 욕구');
  ok((await suggestIds(page))[0] === rev.need, `[${width}px] 거꾸로 경로에서 고른 욕구(${NEEDW[rev.need]})가 후보 맨 앞`);
  await page.click('.topbar .top-btn >> nth=1');

  /* 2-10. 강도 화면의 보류·빼기 [규칙 6], 이전 버튼으로 처음 단계까지 돌아갔다 와도 모두 남음 [규칙 6] */
  await newGame(page, h, '이전 버튼 점검');
  for (const id of ['fear07', 'sad30', 'ang19']) await page.click(`.core-chip[data-id="${id}"]`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('intensity', '이전 버튼: 강도');
  ok((await page.$$('.int-block')).length === 3, `[${width}px] 강도: 감정 3개`);
  await page.click('[data-hold="sad30"]');
  await page.click('[data-remove="ang19"]');
  ok((await page.$$('.int-block')).length === 1, `[${width}px] [규칙 6] 보류·빼기 뒤 강도 고를 감정 1개`);
  ok((await page.textContent('[data-testid="held-list"]')).includes('슬픔') && (await page.textContent('[data-testid="removed-list"]')).includes('분노'), `[${width}px] [규칙 6] 보류한 감정·뺀 감정이 아래에 따로 나옴`);
  await page.click('[data-testid="removed-list"] [data-restore="ang19"]');
  ok((await page.$$('.int-block')).length === 2 && !(await page.$('[data-testid="removed-list"]')), `[${width}px] [규칙 6] 뺀 감정 되살리기`);
  await page.click('[data-remove="ang19"]');
  await page.click('[data-emotion="fear07"][data-score="7"]');
  await h.snap('intensity-hold');
  await page.click('[data-testid="nav-next"]');
  await h.expect('cause', '보류 뒤 원인');
  await h.cause(2);
  await h.expect('need', '보류 뒤 욕구');
  const c10 = await suggestIds(page);
  await page.click(`[data-testid="need-suggest"] .chip[data-need="${c10[0]}"]`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('result', '보류 뒤 마음 카드');
  ok((await page.textContent('[data-testid="result-held"]')).includes('슬픔') && (await page.$$('[data-testid="result-emotion-item"]')).length === 1, `[${width}px] [규칙 6] 마음 카드: 강도 고른 감정 1개 + 보류한 감정 따로`);
  const n10 = await page.evaluate(() => window.__maeum.records().length);
  const id10 = await page.evaluate(() => { const r = window.__maeum.records(); return r[r.length - 1].id; });
  await page.click('[data-testid="need-fit-yes"]');
  // 마음 카드 → 욕구 → 원인 → 강도 → 감정 → 있었던 일, 모두 남아 있어야 함
  await page.click('.topbar .top-btn >> nth=0');
  await h.expect('need', '마음 카드 → 이전');
  ok((await h.needCount()) === 1, `[${width}px] [규칙 6] 마음 카드에서 돌아와도 고른 욕구가 남아 있음`);
  await page.click('.topbar .top-btn >> nth=0');
  await h.expect('cause', '욕구 → 이전');
  ok((await page.getAttribute('.opt[data-id="attitude"]', 'aria-pressed')) === 'true', `[${width}px] [규칙 6] 원인 화면에 전에 고른 원인이 표시됨`);
  await page.click('.topbar .top-btn >> nth=0');
  await h.expect('intensity', '원인 → 이전');
  ok(!!(await page.$('[data-emotion="fear07"][data-score="7"].selected')) && (await page.textContent('[data-testid="held-list"]')).includes('슬픔') && (await page.textContent('[data-testid="removed-list"]')).includes('분노'), `[${width}px] [규칙 6] 강도·보류·뺀 감정이 남아 있음`);
  await page.click('.topbar .top-btn >> nth=0');
  await h.expect('emotion', '강도 → 이전');
  ok((await h.count()) === 2, `[${width}px] [규칙 6] 감정 고르기: 고른 감정 2개(뺀 분노는 풀림)`);
  await page.click('.topbar .top-btn >> nth=0');
  await h.expect('situation', '감정 → 이전');
  ok((await page.inputValue('#situation')) === '이전 버튼 점검', `[${width}px] [규칙 6] 있었던 일에 적은 글이 남아 있음`);
  // 다시 앞으로: 리셋되지 않고 같은 카드가 고쳐짐
  await page.click('[data-testid="nav-next"]');
  await h.expect('emotion', '다시 앞으로: 감정');
  ok((await h.count()) === 2, `[${width}px] [규칙 6] 다시 와도 고른 감정 2개`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('intensity', '다시 앞으로: 강도');
  ok(!(await page.isDisabled('[data-testid="nav-next"]')), `[${width}px] [규칙 6] 다시 와도 강도가 남아 다음 버튼이 켜져 있음`);
  await page.click('[data-testid="nav-next"]');
  await h.cause(2);
  await h.expect('need', '다시 앞으로: 욕구');
  ok((await h.needCount()) === 1, `[${width}px] [규칙 6] 다시 와도 고른 욕구가 남아 있음`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('result', '다시 앞으로: 마음 카드');
  const after10 = await page.evaluate(() => window.__maeum.records());
  ok(after10.length === n10 && after10[after10.length - 1].id === id10 && after10[after10.length - 1].needFit === 'yes', `[${width}px] [규칙 6] 다시 만들어도 새 기록이 늘지 않고 같은 카드·욕구 응답이 그대로`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('home', '보류 점검 → 처음 화면');

  /* 2-11. 연속 기록·주간 보고서·도감·지난 기록 (옛 기록 형식 포함) */
  const base11 = await page.evaluate(() => window.__maeum.records().length);
  await page.evaluate(() => {
    const key = 'maeum-chatgi-v1';
    const d = JSON.parse(localStorage.getItem(key));
    const mk = (daysAgo, emotionId, emotionWord, family, needId, needWord, intensity, extra) => {
      const t = new Date(); t.setDate(t.getDate() - daysAgo); t.setHours(20, 0, 0, 0);
      const p = (n) => (n < 10 ? '0' : '') + n;
      return Object.assign({ id: 'x' + daysAgo + emotionId, ts: t.toISOString(), date: t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate()), situation: '지난 기록 ' + daysAgo, family, emotionId, emotionWord, hidden: false, intensity, cause: 'word', causeText: '', needId, needWord, summary: '요약', tip: '실천', path: 'normal', five: 0 }, extra || {});
    };
    d.records.unshift(
      mk(1, 'sad01', '서운함', 'sad', 'con2', '알아줌', 6),
      mk(2, 'sad01', '서운함', 'sad', 'con2', '알아줌', 4, { reflection: '쉬지 않고 달려 왔다' }),
      mk(3, 'mix06', '고마우면서 미안함', 'mixed', 'mean4', '고마움 전하기', 5),
      mk(9, 'fear01', '걱정', 'fear', 'saf2', '미리 알기', 5),
      mk(10, 'fear13', '창피함', 'shame', 'con2', '알아줌', 5));
    localStorage.setItem(key, JSON.stringify(d));
  });
  await page.reload();
  await h.expect('home', '옛 기록을 더한 뒤 처음 화면');
  const all11 = base11 + 5;
  ok((await page.textContent('[data-testid="stat-count"]')).includes(`${all11}개`), `[${width}px] 기록 요약 줄: 기록 ${all11}개`);
  const homeLay = await page.evaluate(() => {
    const r = (s) => document.querySelector(s).getBoundingClientRect();
    const al = (s) => getComputedStyle(document.querySelector(s)).textAlign;
    return { aligns: ['.app-title', '.app-sub', '.encourage', '.home-stats'].map(al), stats: r('[data-testid="home-stats"]'), start: r('[data-testid="start"]'), menu: r('.menu-row'), enc: r('.encourage') };
  });
  ok(homeLay.aligns.every((a) => a === 'center'), `[${width}px] [규칙 7] 처음 화면 글자 가운데 맞춤 (${homeLay.aligns.join(',')})`);
  ok(homeLay.stats.top > homeLay.enc.bottom + 40 && homeLay.stats.bottom <= homeLay.menu.top, `[${width}px] [규칙 7] 기록 요약 줄은 아래쪽 메뉴 바로 위`);
  ok((await page.textContent('[data-testid="stat-streak"]')).includes('4일'), `[${width}px] 연속 기록 4일 (오늘~사흘 전)`);
  ok((await page.evaluate(() => window.__maeum.records().find((r) => r.emotionId === 'fear13').family)) === 'red', `[${width}px] 옛 기록(창피함)의 칸 값이 빨강으로 맞춰짐`);
  await h.snap('home-records');
  await page.click('[data-testid="menu-report"]');
  await h.expect('report', '주간 보고서');
  const week = await page.evaluate(() => {
    const t = new Date(); t.setDate(t.getDate() - 6);
    const p = (n) => (n < 10 ? '0' : '') + n;
    const sk = t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate());
    const recs = window.__maeum.records().filter((r) => r.date >= sk);
    const em = (r) => (r.emotions && r.emotions.length ? r.emotions : [{ id: r.emotionId }]);
    return { n: recs.length, many: recs.filter((r) => em(r).length > 1).length };
  });
  ok((await page.textContent('[data-testid="report-count"]')).includes(`${week.n}개`), `[${width}px] 이번 주 기록 ${week.n}개`);
  ok((await page.textContent('[data-testid="report-mixed"]')).includes(`${week.many}개`) && (await page.textContent('[data-testid="report-mixed"]')).includes('여러 감정'), `[${width}px] 여러 감정 기록 ${week.many}개`);
  ok((await page.$$('[data-testid="bars-need"] .bar-row')).length >= 3, `[${width}px] 욕구 막대그래프 (여러 욕구 기록 포함)`);
  ok((await page.textContent('[data-testid="bars-pair"]')).includes('→'), `[${width}px] 감정·욕구 짝`);
  ok((await page.$$('[data-testid="bars-family"] .bar-row')).length >= 4, `[${width}px] 기분 4칸 막대그래프`);
  ok((await page.$$('[data-testid="intensity-chart"] .chart-day')).length === 7, `[${width}px] 하루 평균 강도 그래프`);
  await h.snap('report');
  await page.click('.topbar .top-btn');
  await page.click('[data-testid="menu-dex"]');
  await h.expect('dex', '감정 도감');
  const total = await page.evaluate(() => window.__maeum.totalWords());
  ok((await page.textContent('[data-testid="dex-total"]')).includes(`${total}개 중`), `[${width}px] 도감 전체 ${total}개`);
  ok((await page.$$('.dex-tab')).length === 4, `[${width}px] [규칙 9] 도감은 기분 4칸으로 나뉨`);
  const yellowMains = D.quadrants[0].categories.reduce((a, c) => a + c.emotions.length, 0);
  ok((await page.$$('.dex-word')).length === yellowMains, `[${width}px] [규칙 9] 노랑 칸 감정 목록 ${yellowMains}개 (뜻과 함께)`);
  const sad01N = await page.evaluate(() => window.__maeum.records().filter((r) => (r.emotions && r.emotions.length ? r.emotions.map((x) => x.id) : [r.emotionId]).includes('sad01')).length);
  await page.click('.dex-tab[data-dex-tab="blue"]');
  ok(!(await page.$('[data-testid="dex-explain"]')), `[${width}px] [규칙 9] 누르기 전에는 설명이 접혀 있음`);
  const dexLay = await page.$$eval('.dex-item', (e) => e.slice(0, 2).map((x) => { const r = x.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left) }; }));
  ok(dexLay[0].top === dexLay[1].top && dexLay[0].left < dexLay[1].left, `[${width}px] [규칙 10] 도감 낱말은 2개씩 나란히`);
  ok(!(await page.$('.dex-short')) && !/마음이 아래로 가라앉고/.test(await page.textContent('.dex-list')), `[${width}px] [규칙 10] 목록에는 낱말만 (밑에 설명 없음)`);
  await page.click('.dex-word[data-dex="sad01"]');
  const ex = await page.textContent('[data-testid="dex-explain"]');
  const dts = await page.$$eval('[data-testid="dex-explain"] dt', (e) => e.map((x) => x.textContent));
  ok(JSON.stringify(dts) === JSON.stringify(['뜻', '비슷한 말', '반대말']), `[${width}px] [규칙 10] + 단추를 누르면 뜻·비슷한 말·반대말 3가지만 (${dts.join('·')}, 골라 본 횟수 ${sad01N}번은 안 보임)`);
  ok((await page.textContent('[data-testid="dex-meaning"]')) === EMO.sad01.desc && (await page.textContent('[data-testid="dex-opposite"]')).includes(D.antonyms.byWord.sad01[0]) && (await page.textContent('[data-testid="dex-similar"]')).length > 1, `[${width}px] [규칙 10] 서운함: 뜻·비슷한 말·반대말(${D.antonyms.byWord.sad01.join(', ')})`);
  await h.snap('dex-detail');
  await page.click('.dex-word[data-dex="sad01"]');
  ok(!(await page.$('[data-testid="dex-explain"]')), `[${width}px] [규칙 9] 다시 누르면 접힘`);
  await h.snap('dex');
  await page.click('.topbar .top-btn');
  await page.click('[data-testid="menu-records"]');
  await h.expect('records', '지난 기록');
  ok((await page.$$('.rec')).length === all11, `[${width}px] 지난 기록 ${all11}개`);
  ok((await page.textContent('#app')).includes('고마우면서 미안함'), `[${width}px] 화면에서 뺀 옛 낱말도 지난 기록에 이름이 나옴`);
  ok((await page.textContent('[data-testid="rec-reflection"]')).includes('쉬지 않고 달려 왔다'), `[${width}px] 옛 기록에 남긴 말은 지난 기록에 "내 피드백"으로 나옴`);
  ok((await page.$$('.rec [data-testid="rec-edit"]')).length === all11 && (await page.$$('.rec [data-testid="rec-feedback"]')).length === all11 && (await page.$$('.rec [data-testid="rec-delete"]')).length === all11, `[${width}px] [규칙 9] 기록마다 수정·피드백·삭제 단추`);
  await h.snap('records');
  // 피드백 쓰기
  await page.click('.rec[data-rec="x1sad01"] [data-testid="rec-feedback"]');
  await h.expect('feedback', '피드백 쓰기');
  await h.snap('feedback');
  await page.fill('[data-testid="feedback-input"]', '다시 보니 마음이 많이 가라앉았다');
  await page.click('[data-testid="feedback-save"]');
  await h.expect('records', '피드백 저장 → 지난 기록');
  ok((await page.textContent('.rec[data-rec="x1sad01"]')).includes('다시 보니 마음이 많이 가라앉았다'), `[${width}px] [규칙 9] 피드백이 그 기록에 저장되어 보임`);
  // 수정: 처음 단계부터 다시 열고, 끝까지 가면 같은 기록이 고쳐짐
  const nBeforeEdit = await page.evaluate(() => window.__maeum.records().length);
  const tsBefore = await page.evaluate(() => window.__maeum.records().find((r) => r.id === 'x1sad01').ts);
  await page.click('.rec[data-rec="x1sad01"] [data-testid="rec-edit"]');
  await h.expect('situation', '기록 수정: 있었던 일');
  ok(await page.isVisible('[data-testid="edit-note"]') && (await page.inputValue('#situation')) === '지난 기록 1', `[${width}px] [규칙 9] 수정: 고치는 중 안내와 있었던 일이 채워져 있음`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('emotion', '기록 수정: 감정');
  ok((await h.count()) === 1, `[${width}px] [규칙 9] 수정: 고른 감정이 채워져 있음`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('intensity', '기록 수정: 강도');
  ok(!!(await page.$('[data-emotion="sad01"][data-score="6"].selected')), `[${width}px] [규칙 9] 수정: 강도가 채워져 있음`);
  await page.click('[data-emotion="sad01"][data-score="9"]');
  await page.click('[data-testid="nav-next"]');
  await h.expect('cause', '기록 수정: 원인');
  ok(!(await page.isDisabled('[data-testid="nav-next"]')), `[${width}px] [규칙 9] 수정: 원인이 채워져 있음`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('need', '기록 수정: 욕구');
  ok((await h.needCount()) === 1, `[${width}px] [규칙 9] 수정: 욕구가 채워져 있음`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('result', '기록 수정: 마음 카드');
  const edited = await page.evaluate(() => window.__maeum.records());
  const er = edited.find((r) => r.id === 'x1sad01');
  ok(edited.length === nBeforeEdit && er.ts === tsBefore && er.intensity === 9 && er.reflection === '다시 보니 마음이 많이 가라앉았다', `[${width}px] [규칙 9] 수정: 기록 수는 그대로, 같은 기록(날짜·피드백 유지)의 강도가 9로 고쳐짐`);
  await page.click('[data-testid="nav-next"]');
  await h.expect('home', '기록 수정 → 처음 화면');
  await page.click('[data-testid="menu-records"]');
  await page.click('.topbar .top-btn');

  /* 2-12. 기록 옮기기 → 전체 삭제 → 되살리기 */
  await page.click('[data-testid="menu-backup"]');
  await h.expect('backup', '기록 옮기기');
  await h.snap('backup');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-testid="export-download"]')]);
  const backupPath = path.join(SHOTS, `backup-${width}.json`);
  await download.saveAs(backupPath);
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  ok(backup.app === 'maeum-chatgi' && backup.records.length === all11, `[${width}px] 내보낸 파일에 기록 ${all11}개`);
  ok(backup.records.some((r) => Array.isArray(r.needIds) && r.needIds.length === 4 && r.emotions.length === ALLN), `[${width}px] 내보낸 파일에 감정 ${ALLN}개·욕구 4개 기록`);
  const badPath = path.join(SHOTS, `bad-${width}.json`);
  fs.writeFileSync(badPath, '이건 기록 파일이 아니에요');
  await page.setInputFiles('[data-testid="import-file"]', badPath);
  await page.waitForTimeout(200);
  ok((await page.textContent('[data-testid="import-error"]')).includes('기록 파일이 아니에요'), `[${width}px] 엉뚱한 파일은 오류 안내`);
  await page.click('.topbar .top-btn');
  await page.click('[data-testid="delete-all"]');
  await h.expect('deleteConfirm', '삭제 확인');
  await page.click('[data-testid="confirm-delete"]');
  await h.expect('home', '삭제 후 처음 화면');
  ok(!(await page.$('[data-testid="home-stats"]')), `[${width}px] 삭제 후 기록 요약 줄 없음`);
  const mixedFile = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  mixedFile.records.push({ id: 'broken', ts: 'not-a-date', intensity: 99 });
  const mixedPath = path.join(SHOTS, `mixed-${width}.json`);
  fs.writeFileSync(mixedPath, JSON.stringify(mixedFile));
  await page.click('[data-testid="menu-backup"]');
  await page.setInputFiles('[data-testid="import-file"]', mixedPath);
  await h.expect('importConfirm', '불러오기 확인');
  ok((await page.textContent('[data-testid="import-summary"]')).includes(`새 기록은 ${all11}개`) && (await page.textContent('#app')).includes('망가진 기록 1개'), `[${width}px] 새 기록 ${all11}개, 망가진 기록 1개 뺌`);
  await page.click('[data-testid="import-confirm"]');
  await h.expect('home', '불러온 뒤 처음 화면');
  const backMany = await page.evaluate((n) => window.__maeum.records().find((r) => r.emotions && r.emotions.length === n), ALLN);
  ok(!!backMany && backMany.needIds.length === 4, `[${width}px] 불러온 기록에 감정 ${ALLN}개·욕구 4개가 그대로`);
  // 지난 기록 하나 지우기 [규칙 9]
  await page.click('[data-testid="menu-records"]');
  await page.click('.rec[data-rec="x9fear01"] [data-testid="rec-delete"]');
  await h.expect('recordDelete', '기록 하나 지우기');
  await h.snap('record-delete');
  await page.click('[data-testid="nav-back"]');
  await h.expect('records', '지우기 취소');
  ok((await page.$$('.rec')).length === all11, `[${width}px] [규칙 9] "이전"을 누르면 지우지 않음`);
  await page.click('.rec[data-rec="x9fear01"] [data-testid="rec-delete"]');
  await page.click('[data-testid="rec-delete-confirm"]');
  await h.expect('records', '지운 뒤 지난 기록');
  ok((await page.$$('.rec')).length === all11 - 1 && !(await page.$('.rec[data-rec="x9fear01"]')), `[${width}px] [규칙 9] 그 기록 하나만 지워짐 (${all11 - 1}개)`);
  await page.click('.topbar .top-btn');
  await h.expect('home', '지운 뒤 처음 화면');

  /* 2-13. 인터넷 없이 열기 */
  const swReady = await page.evaluate(() => Promise.race([navigator.serviceWorker.ready.then(() => true), new Promise((r) => setTimeout(() => r(false), 5000))]));
  ok(swReady, `[${width}px] service worker 등록됨`);
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 5000 }).catch(() => {});
  await context.setOffline(true);
  let offlineOk = false;
  try {
    await page.reload({ waitUntil: 'load' });
    offlineOk = (await h.screen('home')) === 'home';
  } catch (e) { offlineOk = false; }
  ok(offlineOk, `[${width}px] 인터넷이 끊겨도 앱이 열림`);
  await context.setOffline(false);

  ok(errors.length === 0, `[${width}px] 브라우저 오류 없음 ${errors.join(' / ')}`);
  await context.close();
}

/* ───── 3. 설치 파일 점검 ───── */
function checkPwaFiles() {
  console.log('■ 설치형 웹앱 파일 점검');
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
  ok(m.start_url === './' && m.display === 'standalone', 'manifest: 시작 주소·전체 화면 설정');
  ok(m.name === '감정 및 욕구 찾기', 'manifest: 앱 이름');
  ok(m.icons.some((i) => i.sizes === '192x192') && m.icons.some((i) => i.sizes === '512x512'), 'manifest: 192·512 아이콘');
  m.icons.forEach((i) => ok(fs.existsSync(path.join(ROOT, i.src)), `아이콘 파일 있음: ${i.src}`));
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const files = [...sw.matchAll(/'\.\/([^']*)'/g)].map((x) => x[1]).filter(Boolean);
  files.forEach((f) => ok(fs.existsSync(path.join(ROOT, f)), `sw.js 목록의 파일 있음: ${f}`));
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((x) => x[1]).forEach((f) => {
    ok(files.includes(f), `index.html이 쓰는 파일이 sw.js 목록에 있음: ${f}`);
  });
}

/* ───── 4. 욕구 응답 모으기 스크립트 점검 (tools/needfit-report.js) ───── */
function checkNeedFitReport() {
  console.log('■ 욕구 응답 모으기 점검');
  const tool = require(path.join(ROOT, 'tools', 'needfit-report.js'));
  const r = (id, e, n, f) => ({ id, emotionId: e, needId: n, needFit: f });
  const s = tool.summarize([
    { records: [r('a1', 'sad05', 'grow4', 'no'), r('a2', 'sad05a', 'con6', 'yes'), r('x1', 'fear23', 'con7', 'yes')] },
    { records: [r('b1', 'sad05', 'grow4', 'no'), r('b2', 'sad05', 'con6', 'yes'), r('x1', 'fear23', 'con7', 'yes')] },
    { records: [r('c1', 'sad05', 'grow4', 'no'), r('c2', 'sad05', 'con6', 'yes'), r('c3', 'sad05', 'con2', 'unsure'), r('c4', 'sad05', 'nope', 'yes'),
      { id: 'c5', emotionId: 'sad01', emotions: [{ id: 'sad01' }, { id: 'ang05' }], needId: 'con2', needIds: ['con2', 'res1'], needFit: 'yes' }] }
  ]);
  const sad = s.emotions.find((e) => e.emotionId === 'sad05');
  const row = (id) => sad && sad.rows.find((x) => x.needId === id);
  ok(s.people === 3 && s.answered === 12, `욕구 응답 모으기: 사람 3명, 같은 기록 id는 한 번만, 감정 2개·욕구 2개 기록은 4번 셈 (실제 ${s.answered})`);
  ok(row('con6') && row('con6').yes === 3 && row('con6').suggest === '넣기 후보', '욕구 응답 모으기: 같은 뜻 다른 말(낙담)을 원래 낱말(실망)로 묶고 넣기 후보를 냄');
  ok(row('grow4') && row('grow4').suggest === '빼기 후보', '욕구 응답 모으기: "아니요"가 많은 목록 욕구는 빼기 후보');
  ok(row('con2') && row('con2').suggest === '', '욕구 응답 모으기: "잘 모르겠음"만 있으면 후보 아님');
  ok(s.emotions.some((e) => e.emotionId === 'ang05' && e.rows.some((x) => x.needId === 'res1')), '욕구 응답 모으기: 여러 감정·여러 욕구 기록도 셈');
  ok(tool.toMarkdown(s, tool.loadData().NEED).includes('| 위로(con6) |'), '욕구 응답 모으기: 결과 표에 욕구 이름');
}

(async () => {
  fs.rmSync(SHOTS, { recursive: true, force: true });
  const D = checkData();
  checkPwaFiles();
  checkNeedFitReport();
  const server = await startServer();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  try {
    for (const w of WIDTHS) await runForWidth(browser, base, w, D);
  } finally {
    await browser.close();
    server.close();
  }
  console.log(`\n통과 ${passed}개, 실패 ${failures.length}개`);
  if (failures.length) { console.log('실패 목록:\n- ' + failures.slice(0, 80).join('\n- ')); process.exit(1); }
  console.log('모든 점검 통과 ✅  (화면 캡처: tests/screenshots)');
})().catch((e) => { console.error(e); process.exit(1); });
