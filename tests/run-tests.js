/*
  자동 점검 — 휴대폰 크기 화면(너비 360·390·430px)에서 게임을 처음부터 끝까지 눌러 봐요.
  실행: node tests/run-tests.js
  (Playwright와 Chromium이 설치된 컴퓨터에서 실행해요. 화면 캡처는 tests/screenshots 폴더에 저장돼요.)
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
/* 처음 만든 감정 id 88개 (지난 기록·도감과 연결돼 있어 지우거나 다른 쪽·숨은 감정으로 옮기면 안 됨) */
const ORIGINAL_IDS = {
  joy: { groups: 16, hidden: 6 }, sad: { groups: 16, hidden: 6 }, anger: { groups: 16, hidden: 6, prefix: 'ang' }, fear: { groups: 16, hidden: 6 }
};
/* 같은 화면(묶음 하나, 또는 5번 질문의 보기 하나)에 함께 나오면 안 되는 비슷한 단어 쌍
   근거와 구분 기준: docs/emotion-words-research.md 3·4번 */
const KEEP_APART = [
  ['joy01', 'joy03'], ['joy09', 'joy10'], ['joy11', 'joy12'], ['joy28', 'joy29'], ['joy14', 'joy32'], ['joy17', 'joy20'], ['joy02', 'joyH5'], ['joy06', 'joyH3'],
  ['sad02', 'sad04'], ['sad06', 'sad08'], ['sad13', 'sad14'], ['sad14', 'sad15'], ['sadH1', 'sadH6'], ['sadH1', 'sad11'], ['sadH1', 'sad04'], ['sad01', 'angH5'],
  ['sad20', 'sadH2'], ['sad21', 'sadH3'], ['sad30', 'sadH5'], ['sad24', 'angH1'], ['sad27', 'angH1'],
  ['ang01', 'ang03'], ['ang01', 'ang04'], ['ang03', 'ang04'], ['ang09', 'ang12'], ['ang06', 'ang15'], ['ang16', 'angH3'], ['ang27', 'angH2'],
  ['fear01', 'fear02'], ['fear01', 'fear03'], ['fear01', 'fear04'], ['fear02', 'fear03'], ['fear02', 'fear04'], ['fear03', 'fear04'],
  ['fear05', 'fear06'], ['fear05', 'fear07'], ['fear06', 'fear07'], ['fear10', 'fear11'], ['fear15', 'fear16'], ['fear09', 'fear12'],
  ['fear01', 'fear31'], ['fear14', 'fear29'], ['fear26', 'fearH2'], ['fear26', 'fearH1'], ['fear24', 'fearH2'],
  ['fear28', 'sad25'],
  ['joy17', 'joy33'], ['joy05', 'joy41'], ['joy07', 'joy42'], ['joy08', 'joy42'], ['joy01', 'joy35'], ['joy36', 'joyH3'],
  ['sad13', 'sad53'], ['sad29', 'sad50'], ['sad52', 'angH6'], ['sad28', 'sad52'], ['sad31', 'sad37'], ['sad15', 'sad51'],
  ['ang01', 'ang39'], ['ang19', 'ang29'], ['ang32', 'ang33'], ['ang23', 'ang34'], ['ang38', 'sad51'], ['ang37', 'angH2'],
  ['fear05', 'fear42'], ['fear02', 'fear41'], ['fear24', 'fear33'], ['fear24', 'fear34'], ['fear26', 'fear38'], ['fear38', 'fearH1'],
  ['fear39', 'fearH2'], ['fear35', 'ang17']
];
/* 원자료(무드 미터, 손선주 외 2012 부록) 단어 → 게임 단어 대응표. 욕설·비하어 26개는 저장소에 적지 않고 개수만 확인 */
const SOURCE_MAP = JSON.parse(fs.readFileSync(path.join(__dirname, 'source-word-map.json'), 'utf8'));
const EXCLUDED_EXPLETIVES = 26;
function checkData() {
  console.log('■ 데이터 파일 점검');
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const f of ['emotions.js', 'needs.js', 'questions.js', 'safety.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'), ctx, { filename: f });
  }
  const D = ctx.window.MAEUM_DATA;
  const emo = {};
  let total = 0, hidden = 0;
  // 같은 뜻 다른 말: 0~3개, id는 원래 id + a·b·c
  function checkSame(e) {
    const same = e.same || [];
    ok(same.length <= 3, `${e.id}: 같은 뜻 다른 말은 3개까지 (지금 ${same.length}개)`);
    same.forEach((x) => ok(x.word && /^[a-z]+H?\d+[a-c]$/.test(x.id) && x.id.slice(0, -1) === e.id, `${e.id}: 같은 뜻 다른 말 id/word 확인 (${x.id})`));
  }
  function addSame(e, isHidden) {
    (e.same || []).forEach((x) => { ok(!emo[x.id], `감정 id 중복: ${x.id}`); emo[x.id] = { ...x, desc: e.desc, hidden: isHidden, parent: e.id }; total++; });
  }
  D.families.forEach((f) => {
    ok(f.groups.length >= 4, `${f.id}: 세부 묶음이 4개 이상이어야 함 (지금 ${f.groups.length}개)`);
    ok(new Set(f.groups.map((g) => g.label)).size === f.groups.length, `${f.id}: 묶음 이름이 서로 겹치지 않음`);
    f.groups.forEach((g) => {
      ok(g.label && g.hint, `${f.id}/${g.label}: 묶음 label/hint 모두 있어야 함`);
      ok(g.emotions.length === 4, `${f.id}/${g.label}: 감정이 4개여야 함`);
      g.emotions.forEach((e) => ok(e.word && e.desc, `${e.id}: word/desc 모두 있어야 함`));
      g.emotions.forEach((e) => checkSame(e));
      g.emotions.forEach((e) => { ok(!emo[e.id], `감정 id 중복: ${e.id}`); emo[e.id] = { ...e, hidden: false }; total++; addSame(e, false); });
    });
    f.hidden.forEach((e) => { ok(!emo[e.id], `감정 id 중복: ${e.id}`); emo[e.id] = { ...e, hidden: true }; total++; hidden++; checkSame(e); addSame(e, true); });
  });
  ok(D.families.length === 4, '큰 감정 쪽 4개');
  ok(total >= 500, `감정 단어 500개 이상 (지금 ${total}개)`);
  // 원자료 단어가 모두 게임 단어로 들어갔는지
  const wordSet = new Set(Object.values(emo).map((e) => e.word));
  ok(SOURCE_MAP.length + EXCLUDED_EXPLETIVES === 604, `원자료 단어 수: 대응표 ${SOURCE_MAP.length} + 욕설 ${EXCLUDED_EXPLETIVES} = 604 (무드 미터 100, 부록 504)`);
  SOURCE_MAP.forEach((m) => ok(wordSet.has(m.game), `원자료 "${m.src}"(${m.origin})의 게임 단어 "${m.game}"가 있음`));
  // 처음 만든 id가 그대로 있고, 같은 쪽·같은 종류(일반/숨은)에 있는지
  Object.entries(ORIGINAL_IDS).forEach(([fam, c]) => {
    const pre = c.prefix || fam;
    const famObj = D.families.find((f) => f.id === fam);
    const inGroups = new Set(famObj.groups.flatMap((g) => g.emotions.map((e) => e.id)));
    const inHidden = new Set(famObj.hidden.map((e) => e.id));
    for (let k = 1; k <= c.groups; k++) { const id = pre + String(k).padStart(2, '0'); ok(inGroups.has(id), `처음 id ${id}가 ${fam} 묶음에 그대로 있음`); }
    for (let k = 1; k <= c.hidden; k++) { const id = pre + 'H' + k; ok(inHidden.has(id), `처음 id ${id}가 ${fam} 숨은 감정에 그대로 있음`); }
  });
  // 비슷한 단어가 같은 화면에 함께 나오지 않는지
  const screens = [];
  D.families.forEach((f) => f.groups.forEach((g) => screens.push({ name: `${f.id}/${g.label}`, ids: g.emotions.map((e) => e.id) })));
  D.approaches.forEach((a) => a.options.forEach((o) => screens.push({ name: `접근 ${a.key}/${o.label}`, ids: o.emotions })));
  KEEP_APART.forEach(([a, b]) => {
    ok(!!emo[a] && !!emo[b], `떨어뜨릴 단어 쌍의 id가 있음: ${a}, ${b}`);
    screens.forEach((sc) => ok(!(sc.ids.includes(a) && sc.ids.includes(b)), `같은 화면에 비슷한 단어: ${emo[a] && emo[a].word}·${emo[b] && emo[b].word} (${sc.name})`));
  });
  screens.forEach((sc) => ok(new Set(sc.ids).size === sc.ids.length, `한 화면에 같은 단어 두 번: ${sc.name}`));
  const words = Object.values(emo).map((e) => e.word);
  ok(new Set(words).size === words.length, '감정 단어가 서로 겹치지 않음');
  const need = {};
  D.needs.forEach((n) => { ok(!need[n.id], `욕구 id 중복: ${n.id}`); need[n.id] = n; ok(n.word && n.text && n.tip, `욕구 ${n.id}: word/text/tip 모두 있어야 함`); });
  ok(D.needs.length >= 40, `욕구 단어 40개 이상 (지금 ${D.needs.length}개)`);
  ok(new Set(D.needs.map((n) => n.word)).size === D.needs.length, '욕구 단어가 서로 겹치지 않음');
  // 접근 방법이 가리키는 감정이 실제로 있는지
  ok(D.approaches.length === 4, '5번 접근 방법 4가지');
  ok(new Set(D.approaches.map((a) => a.question)).size === 4, '접근 질문 4개가 서로 다름');
  const reachableHidden = new Set();
  D.approaches.forEach((a) => {
    ok(a.options.length === 4, `접근 ${a.key}: 보기 4개`);
    a.options.forEach((o) => {
      ok(o.emotions.length === 4, `접근 ${a.key}/${o.label}: 감정 4개`);
      o.emotions.forEach((id) => { ok(!!emo[id], `접근 ${a.key}: 없는 감정 id ${id}`); if (emo[id] && emo[id].hidden) reachableHidden.add(id); });
      if (o.need) ok(!!need[o.need], `접근 ${a.key}: 없는 욕구 id ${o.need}`);
    });
  });
  ok(reachableHidden.size === hidden, `숨은 감정 ${hidden}개 모두 찾을 수 있음 (찾을 수 있는 것 ${reachableHidden.size}개)`);
  Object.entries(D.needsByCause).forEach(([fam, m]) => {
    D.causes.forEach((c) => {
      ok(Array.isArray(m[c.id]) && m[c.id].length === 4, `needsByCause.${fam}.${c.id}: 4개`);
      (m[c.id] || []).forEach((id) => ok(!!need[id], `needsByCause.${fam}.${c.id}: 없는 욕구 id ${id}`));
    });
  });
  D.needRounds.slice(1).forEach((r, i) => r.pool.forEach((id) => ok(!!need[id], `needRounds[${i + 1}]: 없는 욕구 id ${id}`)));
  ok(new Set(D.needRounds.map((r) => r.question)).size === D.needRounds.length, '욕구 질문이 서로 다름');
  // 비슷한 감정 구별하기: 줄마다 감정 4개, 모두 일반 감정이고 구별 질문(ask)이 있음
  ok(Array.isArray(D.compareSets) && D.compareSets.length >= 8, `구별 질문 줄 8개 이상 (지금 ${D.compareSets && D.compareSets.length}개)`);
  const asks = new Set();
  (D.compareSets || []).forEach((cs) => {
    ok(cs.ids.length === 4 && new Set(cs.ids).size === 4, `구별 질문 "${cs.name}": 서로 다른 감정 4개`);
    cs.ids.forEach((id) => {
      ok(!!emo[id] && !emo[id].hidden && !emo[id].parent, `구별 질문 "${cs.name}": ${id}는 묶음에 있는 대표 단어`);
      ok(!!(emo[id] && emo[id].ask), `구별 질문 "${cs.name}": ${id}에 ask 문장이 있음`);
      if (emo[id] && emo[id].ask) asks.add(emo[id].ask);
    });
  });
  const askCount = Object.values(emo).filter((e) => e.ask).length;
  ok(asks.size === askCount, `구별 질문 문장이 서로 다르고 모두 쓰임 (${asks.size} / ${askCount})`);
  ok((D.searchSuggest || []).length >= 4 && D.searchSuggest.every((id) => emo[id]), '단어로 찾기 추천 감정 id가 모두 있음');
  // 핵심 감정이 각 쪽 묶음 고르기 1장(앞 묶음 4개)에 있음
  const firstPage = new Set(D.families.flatMap((f) => f.groups.slice(0, 4).flatMap((g) => g.emotions.map((e) => e.word))));
  ['기쁨', '행복함', '슬픔', '상실감', '죄책감', '화남', '분노', '역겨움', '두려움', '불안함', '수치심', '깜짝 놀람'].forEach((w) => ok(firstPage.has(w), `핵심 감정 "${w}"이 묶음 고르기 1장에 있음`));
  ok(D.causes.length === 5, '원인 보기 5개');
  ok(Array.isArray(D.intro) && D.intro.length === 3, `게임 방법 안내 카드 3장 (지금 ${D.intro && D.intro.length}장)`);
  (D.intro || []).forEach((c, i) => ok(c.title && c.body, `게임 방법 안내 ${i + 1}번째 카드: title/body 모두 있어야 함`));
  console.log(`  감정 ${total}개(숨은 감정 ${hidden}개), 욕구 ${D.needs.length}개`);
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
    // 설명 창이 열려 있으면 그 창 안만 점검 (뒤 화면은 가려져 있음)
    const root = document.querySelector('#app .sheet') || document.querySelector('#app');
    root.querySelectorAll('*').forEach((el) => {
      if (!visible(el)) return;
      const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) return;
      leaves.push(el);
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 16) out.push(`글자 16px 미만(${fs}px): "${el.textContent.trim().slice(0, 20)}"`);
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.left < -1) out.push(`화면 밖으로 나감: "${el.textContent.trim().slice(0, 20)}" (${Math.round(r.left)}~${Math.round(r.right)})`);
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible') out.push(`글자 잘림: "${el.textContent.trim().slice(0, 20)}"`);
    });
    // 글자끼리 겹침
    const rects = leaves.map((el) => {
      // 실제 글자 영역 (Range) 기준
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
    // 누르는 버튼 크기
    root.querySelectorAll('button, a.phone, summary').forEach((b) => {
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
      const cur = await page.getAttribute('#app > section', 'data-screen').catch(() => null);
      return cur;
    },
    async expect(name, label) {
      const cur = await this.screen(name);
      ok(cur === name, `[${width}px ${label}] 화면이 "${name}"이어야 하는데 "${cur}"`);
      return cur === name;
    },
    async opt(n) { await page.click(`#app > section .opt[data-num="${n}"]`); },
    async question() { return (await page.textContent('#app h1')).trim(); },
    async snap(name) {
      await layoutCheck(page, `${width}px ${name}`);
      if (seen.has(name)) return;
      seen.add(name);
      shotNo++;
      await page.screenshot({ path: path.join(dir, `${String(shotNo).padStart(2, '0')}-${name}.png`), fullPage: !(await page.$('.sheet-wrap')) });
    }
  };
}

async function newGame(page, h, situation) {
  await page.click('[data-testid="start"]');
  await h.expect('situation', '상황 입력');
  await page.fill('#situation', situation);
  await page.click('[data-testid="next"]');
}

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

  await page.goto(base + '/index.html');

  /* 2-0. 처음 열면 게임 방법 안내가 한 번만 나옴 */
  await h.expect('intro', '처음 열면 게임 방법 안내');
  const introTitles = [];
  for (let k = 0; k < D.intro.length; k++) {
    ok((await page.getAttribute('#app > section', 'data-page')) === String(k), `[${width}px] 안내 ${k + 1}번째 장`);
    introTitles.push(await h.question());
    ok((await page.textContent('[data-testid="intro-body"]')).trim() === D.intro[k].body, `[${width}px] 안내 ${k + 1}번째 장 문장이 data와 같음`);
    ok(!!(await page.$('[data-testid="intro-prev"]')) === (k > 0), `[${width}px] 안내 ${k + 1}번째 장 이전 버튼 ${k > 0 ? '있음' : '없음'}`);
    await h.snap(`intro-${k + 1}`);
    if (k < D.intro.length - 1) await page.click('[data-testid="intro-next"]');
  }
  ok(introTitles.join('|') === D.intro.map((c) => c.title).join('|'), `[${width}px] 안내 제목이 차례대로 나옴`);
  await page.click('[data-testid="intro-prev"]');
  ok((await page.getAttribute('#app > section', 'data-page')) === String(D.intro.length - 2), `[${width}px] 안내 이전 버튼`);
  await page.click('[data-testid="intro-next"]');
  await page.click('[data-testid="intro-done"]');
  await h.expect('home', '안내 끝 → 처음 화면');
  await page.reload();
  await h.expect('home', '안내를 본 뒤 다시 열면 바로 처음 화면');
  // 처음 화면 메뉴에서 다시 보기 → 건너뛰기
  await page.click('[data-testid="menu-intro"]');
  await h.expect('intro', '메뉴에서 게임 방법 다시 보기');
  await page.click('[data-testid="intro-next"]');
  await page.click('[data-testid="intro-skip"]');
  await h.expect('home', '건너뛰기 → 처음 화면');
  // 건너뛰기만 해도 다시 안 나옴 (새 창)
  {
    const p2 = await context.newPage();
    await p2.goto(base + '/index.html');
    await p2.evaluate(() => localStorage.removeItem('maeum-chatgi-intro-seen'));
    await p2.reload();
    await p2.waitForSelector('#app > [data-screen="intro"]', { timeout: 4000 }).catch(() => {});
    await p2.click('[data-testid="intro-skip"]');
    await p2.reload();
    ok((await p2.getAttribute('#app > section', 'data-screen')) === 'home', `[${width}px] 건너뛰기를 눌러도 다음부터 안내가 안 나옴`);
    await p2.close();
  }
  await h.expect('home', '처음 화면');
  const disclaimer = await page.textContent('[data-testid="disclaimer"]');
  ok(disclaimer.includes('상담·치료를 대신하지 않습니다'), `[${width}px] 첫 화면 안내 문구`);
  await h.snap('home');

  /* 2-1. 감정 묶음 4개 각각 끝까지 */
  const familyIds = ['joy', 'anger', 'sad', 'fear'];
  for (let i = 0; i < 4; i++) {
    const fi = i + 1; // 1~4번
    const fam = D.families[i];
    const gi = (i % 4) + 1;
    const wi = ((i + 2) % 4) + 1;
    const entry = fam.groups[gi - 1].emotions[wi - 1];
    const expectWord = entry.same && entry.same.length ? entry.same[0].word : entry.word;
    await newGame(page, h, `테스트 상황 ${fi}: 친구가 약속에 늦게 와서 한참 기다렸다.`);
    await h.expect('family', `${fam.label} 큰 감정`);
    if (i === 0) await h.snap('family');
    await h.opt(fi);
    await h.expect('group', `${fam.label} 묶음`);
    await h.snap(`group-${fam.id}`);
    await h.opt(gi);
    await h.expect('words', `${fam.label} 세부 감정`);
    await h.snap(`words-${fam.id}`);
    await h.opt(wi);
    const cset = compareSet(D, entry.id);
    if (cset) {
      // 비슷한 감정 구별하기: 고른 감정이 1번, 보기 문장은 ask
      await h.expect('compare', `${fam.label} 비슷한 감정 구별`);
      ok((await page.getAttribute('#app > section', 'data-picked')) === entry.id, `[${width}px ${fam.label}] 구별 화면의 고른 감정`);
      const cl = await optLabels(page);
      ok(cl.join('|') === cset.map((id) => findEmo(D, id).ask).join('|'), `[${width}px ${fam.label}] 구별 질문 보기: ${cl.join(' / ')}`);
      await h.snap(`compare-${fam.id}`);
      await h.opt(1);
    }
    if (entry.same && entry.same.length) {
      // 같은 뜻 다른 말 고르기: 원래 단어 + 같은 뜻 단어가 차례대로 나오고, 5번은 "이 중엔 없어요"
      await h.expect('wording', `${fam.label} 같은 뜻 다른 말`);
      const wl = await optLabels(page);
      ok(wl.join('|') === [entry.word, ...entry.same.map((x) => x.word)].join('|'), `[${width}px ${fam.label}] 같은 뜻 다른 말 보기: ${wl.join(', ')}`);
      ok((await page.textContent('#app .opt[data-num="5"] .opt-label')).trim() === D.text.noneOfThese, `[${width}px ${fam.label}] 같은 뜻 화면 5번`);
      await h.snap(`wording-${fam.id}`);
      await h.opt(2);
    }
    await h.expect('intensity', `${fam.label} 강도`);
    if (i === 0) await h.snap('intensity');
    await page.click(`[data-score="${6 + i}"]`);
    await h.expect('cause', `${fam.label} 원인`);
    if (i === 0) await h.snap('cause');
    await h.opt(fi); // 원인 1~4
    await h.expect('need', `${fam.label} 욕구`);
    const nq = await h.question();
    ok(nq === (fam.id === 'joy' ? D.needRounds[0].questionJoy : D.needRounds[0].question), `[${width}px ${fam.label}] 욕구 질문 문장`);
    await h.snap(`need-${fam.id}`);
    await h.opt(2);
    await h.expect('result', `${fam.label} 결과 카드`);
    const emoText = await page.textContent('[data-testid="result-emotion"]');
    ok(emoText.includes(expectWord), `[${width}px ${fam.label}] 결과 카드 감정 "${expectWord}" (실제: ${emoText.trim()})`);
    ok((await page.textContent('[data-testid="result-intensity"]')).includes(`${6 + i} / 10`), `[${width}px ${fam.label}] 결과 강도`);
    const summary = await page.textContent('[data-testid="result-summary"]');
    ok(summary.length > 10 && !/[{}]/.test(summary), `[${width}px ${fam.label}] 한 줄 정리 완성: ${summary}`);
    ok(summary.includes(josaCheck(expectWord)), `[${width}px ${fam.label}] 조사(을/를) 맞춤: ${summary}`);
    ok((await page.textContent('[data-testid="result-tip"]')).trim().length > 5, `[${width}px ${fam.label}] 작은 실천 제안`);
    ok((await page.textContent('[data-testid="result-need"]')).trim().length > 0, `[${width}px ${fam.label}] 욕구`);
    ok(await page.isVisible('[data-testid="new-bonus"]'), `[${width}px ${fam.label}] 새 감정 발견 표시`);
    await h.snap(`result-${fam.id}`);
    await page.click('[data-testid="home"]');
    await h.expect('home', `${fam.label} 후 처음 화면`);
  }
  ok((await page.textContent('[data-testid="stat-dex"]')).includes(`4 / ${countWords(D)}`), `[${width}px] 도감 4개 발견 표시`);
  ok((await page.textContent('[data-testid="stat-streak"]')).includes('1일'), `[${width}px] 연속 기록 1일`);

  /* 2-2. 5번을 계속 누르면 접근이 바뀜 → 이름 붙이기 어려운 감정 */
  await newGame(page, h, '그냥 오늘 하루가 이상하게 흘러갔다.');
  await h.expect('family', '5번 연속: 시작');
  const qs = [await h.question()];
  const order = ['body', 'action', 'reverse', 'past'];
  for (let k = 0; k < 4; k++) {
    await h.opt(5);
    await h.expect('approach', `5번 ${k + 1}회`);
    const ap = await page.getAttribute('#app > section', 'data-approach');
    ok(ap === order[k], `[${width}px] 5번 ${k + 1}회째 접근은 ${order[k]} (실제 ${ap})`);
    qs.push(await h.question());
    await h.snap(`approach-${order[k]}`);
  }
  ok(new Set(qs).size === qs.length, `[${width}px] 5번 누를 때마다 질문이 모두 다름`);
  await h.opt(5);
  await h.expect('unnamed', '5번 5회: 이름 붙이기 어려운 감정');
  await h.snap('unnamed');
  await page.click('[data-testid="continue"]');
  await h.expect('intensity', '이름 없는 감정 강도');
  await page.click('[data-score="3"]');
  await h.opt(2);
  await h.expect('need', '이름 없는 감정 욕구');
  await h.opt(1);
  await h.expect('result', '이름 없는 감정 결과');
  ok((await page.textContent('[data-testid="result-emotion"]')).includes('이름 붙이기 어려운 감정'), `[${width}px] 이름 붙이기 어려운 감정으로 저장`);
  await h.snap('result-unnamed');
  await page.click('[data-testid="home"]');

  /* 2-2b. 묶음 고르기 여러 장 */
  await checkGroupPages(page, h, width, D);

  /* 2-3. 세부 감정에서 5번 → 몸 감각 → 숨은 감정 발견 + 욕구 5번 연속 */
  await newGame(page, h, '친구들이 나만 빼고 놀러 갔다는 걸 알았다.');
  await h.opt(2); await h.expect('group', '숨은 감정: 묶음');
  await h.opt(1); await h.expect('words', '숨은 감정: 세부');
  await h.opt(5); await h.expect('approach', '숨은 감정: 몸 감각');
  ok((await page.getAttribute('#app > section', 'data-approach')) === 'body', `[${width}px] 세부 감정에서 5번 → 몸 감각 질문`);
  await h.opt(2); await h.expect('words', '숨은 감정: 몸 감각 후보');
  await h.snap('words-from-body');
  await h.opt(1); await h.expect('intensity', '숨은 감정: 강도');
  await page.click('[data-score="8"]');
  await h.opt(1); await h.expect('need', '욕구 1회차');
  const needQs = [await h.question()];
  const needOpts = [await optLabels(page)];
  for (let r = 1; r <= 3; r++) {
    await h.opt(5);
    await h.expect('need', `욕구 5번 ${r}회`);
    needQs.push(await h.question());
    needOpts.push(await optLabels(page));
    await h.snap(`need-round${r + 1}`);
  }
  ok(new Set(needQs).size === 4, `[${width}px] 욕구 질문 4개가 모두 다름`);
  const flat = needOpts.flat();
  ok(new Set(flat).size === flat.length, `[${width}px] 욕구 보기가 회차마다 겹치지 않음`);
  await h.opt(5);
  await h.expect('needUnnamed', '욕구 5번 4회: 이름 붙이기 어려운 바람');
  await h.snap('need-unnamed');
  await page.click('[data-testid="continue"]');
  await h.expect('result', '숨은 감정 결과');
  ok(await page.isVisible('[data-testid="hidden-bonus"]'), `[${width}px] 숨은 감정 발견 보너스 표시`);
  ok((await page.textContent('[data-testid="result-emotion"]')).includes('서글픔'), `[${width}px] 숨은 감정 "서글픔"`);
  ok((await page.textContent('[data-testid="result-need"]')).includes('이름 붙이기 어려운 욕구'), `[${width}px] 이름 붙이기 어려운 욕구로 저장`);
  await h.snap('result-hidden');
  await page.click('[data-testid="home"]');

  /* 2-4. 3회째(반대로 묻기) → 욕구를 먼저 고르면 욕구 단계를 건너뜀, 원인 "다른 것" 직접 입력 */
  await newGame(page, h, '모둠 과제를 혼자 다 했는데 발표 점수는 똑같이 받았다.');
  await h.opt(5); await h.opt(5); await h.opt(5);
  await h.expect('approach', '반대로 묻기');
  ok((await page.getAttribute('#app > section', 'data-approach')) === 'reverse', `[${width}px] 3회째는 반대로 묻기`);
  await h.opt(2); await h.expect('words', '반대로 묻기 후보');
  await h.opt(1); await h.expect('compare', '반대로 묻기: 비슷한 감정 구별');
  ok((await page.getAttribute('#app > section', 'data-picked')) === 'ang05', `[${width}px] 반대로 묻기 → "억울함" 구별 화면`);
  await h.opt(1); await h.expect('wording', '반대로 묻기: 같은 뜻 다른 말');
  ok((await page.getAttribute('#app > section', 'data-parent')) === 'ang05', `[${width}px] 반대로 묻기 → "억울함"의 같은 뜻 다른 말 화면`);
  await h.opt(1); await h.expect('intensity', '반대로 묻기 강도');
  await page.click('[data-score="9"]');
  await h.opt(5); await h.expect('causeOther', '원인 직접 입력');
  await h.snap('cause-other');
  await page.fill('#cause-text', '점수 나누는 방식');
  await page.click('[data-testid="next"]');
  await h.expect('result', '반대로 묻기 결과 (욕구 단계 건너뜀)');
  ok((await page.textContent('[data-testid="result-need"]')).includes('공평함'), `[${width}px] 반대로 묻기에서 고른 욕구 "공평함"`);
  ok((await page.textContent('[data-testid="result-summary"]')).includes('"점수 나누는 방식" 때문에'), `[${width}px] 직접 적은 원인이 한 줄 정리에 들어감`);
  await page.click('[data-testid="home"]');

  /* 2-4b. 단어로 찾기 → 고르기 → 결과 카드 */
  await checkSearch(page, h, width, D);

  /* 2-4c. 비슷한 감정 구별: 수치심을 골랐다가 구별 질문으로 죄책감을 고름 */
  await newGame(page, h, '내가 맡은 일을 빠뜨려서 친구가 대신 혼났다.');
  {
    const fi = D.families.findIndex((f) => f.groups.some((g) => g.emotions.some((e) => e.id === 'fear23')));
    const gi = D.families[fi].groups.findIndex((g) => g.emotions.some((e) => e.id === 'fear23'));
    await h.opt(fi + 1);
    for (let k = 0; k < Math.floor(gi / 4); k++) await h.opt(5);
    await h.opt((gi % 4) + 1);
    await h.expect('words', '구별: 단어');
    const wi = D.families[fi].groups[gi].emotions.findIndex((e) => e.id === 'fear23');
    await h.opt(wi + 1);
    await h.expect('compare', '구별: 수치심');
    const cset = compareSet(D, 'fear23');
    const gi2 = cset.indexOf('sad20');
    await h.opt(gi2 + 1);
    await passToIntensity(page, h);
    await h.expect('intensity', '구별: 죄책감 강도');
    ok((await page.textContent('#app .lead')).includes('죄책감'), `[${width}px] 구별 질문으로 고른 "죄책감"이 강도 화면에 나옴`);
    await page.click('[data-score="7"]');
    await h.opt(1);
    await h.expect('need', '구별: 욕구');
    await h.opt(1);
    await h.expect('result', '구별: 결과 카드');
    ok((await page.textContent('[data-testid="result-emotion"]')).includes('죄책감'), `[${width}px] 결과 카드 "죄책감"`);
    await page.click('[data-testid="home"]');
  }

  /* 2-4d. 있었던 일을 적지 않고 시작 */
  await page.click('[data-testid="start"]');
  await h.expect('situation', '안 적고 시작: 상황 입력');
  ok((await page.textContent('[data-testid="next"]')).trim() === D.text.situationSkip, `[${width}px] 아무것도 안 적으면 버튼이 "${D.text.situationSkip}"`);
  await page.fill('#situation', '조금 적어 봄');
  ok((await page.textContent('[data-testid="next"]')).trim() === D.text.nextButton, `[${width}px] 글을 적으면 버튼이 "${D.text.nextButton}"`);
  await page.fill('#situation', '   ');
  await h.snap('situation-empty');
  await page.click('[data-testid="next"]');
  await h.expect('family', '안 적고 시작: 큰 감정');
  ok(!(await page.$('.sit-chip')), `[${width}px] 안 적으면 있었던 일 표시가 없음`);
  await h.opt(1); await h.opt(4); await h.opt(1);
  await passToIntensity(page, h);
  await page.click('[data-score="4"]');
  await h.opt(3); await h.opt(1);
  await h.expect('result', '안 적고 시작: 결과 카드');
  ok(!(await page.$('.card-situation')), `[${width}px] 안 적으면 결과 카드에 "있었던 일" 줄이 없음`);
  ok(!/[{}]/.test(await page.textContent('[data-testid="result-summary"]')), `[${width}px] 안 적어도 한 줄 정리 완성`);
  await page.click('[data-testid="home"]');

  /* 2-5. 이전 버튼 */
  await newGame(page, h, '이전 버튼 점검');
  await h.opt(3); await h.expect('group', '이전 버튼: 묶음');
  await h.opt(1); await h.expect('words', '이전 버튼: 세부');
  await page.click('.topbar .top-btn >> nth=0');
  await h.expect('group', '이전 버튼 → 묶음으로 돌아감');
  await page.click('.topbar .top-btn >> nth=1');
  await h.expect('home', '그만하기 → 처음 화면');

  /* 2-6. 위험 표현 → 안내 화면 */
  for (const t of ['너무 힘들어서 죽고 싶다', '자 해 하고 싶은 생각이 들었다', '그냥 사라지고 싶어요', '살기 싫다']) {
    await newGame(page, h, t);
    const ok1 = await h.expect('crisis', `위험 표현 "${t}"`);
    if (ok1) {
      const body = await page.textContent('#app');
      ok(body.includes('109') && body.includes('1577-0199'), `[${width}px] 안내 화면에 109·1577-0199 표시 ("${t}")`);
      ok((await page.getAttribute('[data-testid="phone-109"]', 'href')) === 'tel:109', `[${width}px] 109 전화 연결 링크`);
      ok((await page.getAttribute('[data-testid="phone-1577-0199"]', 'href')) === 'tel:15770199', `[${width}px] 1577-0199 전화 연결 링크`);
      ok((await page.$$('#app .opt')).length === 0 && (await page.$$('.topbar')).length === 0, `[${width}px] 안내 화면에서는 게임이 멈춤`);
      await h.snap('crisis');
      await page.click('[data-testid="home"]');
      await h.expect('home', '안내 화면 → 처음 화면');
    }
  }
  const recCount = await page.evaluate(() => window.__maeum.records().length);
  ok(recCount === 10, `[${width}px] 위험 표현은 기록에 저장되지 않음 (기록 ${recCount}개)`);
  for (const t of ['배고파 죽겠다 진짜', '유서 깊은 절에 다녀왔다']) {
    await newGame(page, h, t);
    await h.expect('family', `일상 표현 "${t}"은 그대로 진행`);
    await page.click('.topbar .top-btn >> nth=1');
  }
  await newGame(page, h, '원인 칸 위험 표현 점검');
  await h.opt(1); await h.opt(1); await h.opt(1);
  await passToIntensity(page, h);
  await page.click('[data-score="5"]');
  await h.opt(5);
  await page.fill('#cause-text', '죽고 싶어서');
  await page.click('[data-testid="next"]');
  await h.expect('crisis', '원인 칸 위험 표현');
  await page.click('[data-testid="home"]');

  /* 2-7. 연속 기록·주간 보고서·도감·지난 기록 */
  await page.evaluate(() => {
    const key = 'maeum-chatgi-v1';
    const d = JSON.parse(localStorage.getItem(key));
    const mk = (daysAgo, emotionId, emotionWord, family, needId, needWord, intensity) => {
      const t = new Date(); t.setDate(t.getDate() - daysAgo); t.setHours(20, 0, 0, 0);
      const p = (n) => (n < 10 ? '0' : '') + n;
      return { id: 'x' + daysAgo + emotionId, ts: t.toISOString(), date: t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate()), situation: '지난 기록 ' + daysAgo, family, emotionId, emotionWord, hidden: false, intensity, cause: 'word', causeText: '', needId, needWord, summary: '요약', tip: '실천', path: 'normal', five: 0 };
    };
    d.records.unshift(mk(1, 'sad01', '서운함', 'sad', 'con2', '알아줌', 6), mk(2, 'sad01', '서운함', 'sad', 'con2', '알아줌', 4), mk(9, 'fear01', '걱정', 'fear', 'saf2', '미리 알기', 5));
    localStorage.setItem(key, JSON.stringify(d));
  });
  await page.reload();
  await h.expect('home', '기록 추가 후 처음 화면');
  ok((await page.textContent('[data-testid="stat-streak"]')).includes('3일'), `[${width}px] 연속 기록 3일 (오늘·어제·그제)`);
  await page.click('[data-testid="menu-report"]');
  await h.expect('report', '주간 보고서');
  ok((await page.textContent('[data-testid="report-count"]')).includes('12개'), `[${width}px] 이번 주 기록 12개`);
  const topEmotion = await page.textContent('[data-testid="bars-emotion"] .bar-row >> nth=0');
  ok(topEmotion.includes('서운함') && topEmotion.includes('2번'), `[${width}px] 가장 자주 나온 감정 막대 "서운함 2번" (실제: ${topEmotion.trim()})`);
  ok((await page.$$('[data-testid="bars-need"] .bar-row')).length >= 3, `[${width}px] 욕구 막대그래프`);
  ok((await page.$$('[data-testid="bars-family"] .bar-row')).length >= 4, `[${width}px] 감정 쪽 막대그래프`);
  await h.snap('report');
  await page.click('.week-nav button >> nth=0');
  ok((await page.textContent('[data-testid="report-count"]')).includes('1개'), `[${width}px] 지난주 보고서 기록 1개`);
  await page.click('.topbar .top-btn');
  await h.expect('home', '보고서 → 처음 화면');
  await page.click('[data-testid="menu-dex"]');
  await h.expect('dex', '감정 도감');
  const dexTotal = await page.textContent('[data-testid="dex-total"]');
  ok(dexTotal.includes(`${countWords(D)}개 중 ${DEX_FOUND}개 발견`), `[${width}px] 도감 "${countWords(D)}개 중 ${DEX_FOUND}개 발견" (실제: ${dexTotal})`);
  await h.snap('dex');
  // 도감 단어를 누르면 설명·처음 찾은 날·찾은 횟수가 나옴
  await page.click('.dex-chip[data-id="sad01"]');
  ok(await page.isVisible('[data-testid="dex-detail"]'), `[${width}px] 도감 단어 누르면 설명 창이 열림`);
  ok((await page.textContent('#sheet-title')).includes('서운함'), `[${width}px] 설명 창 제목 "서운함"`);
  ok((await page.textContent('[data-testid="dex-detail-desc"]')).includes(findEmo(D, 'sad01').desc), `[${width}px] 설명 창에 감정 설명`);
  ok((await page.textContent('[data-testid="dex-detail-count"]')).includes('2번'), `[${width}px] 찾은 횟수 2번`);
  const firstDay = await page.evaluate(() => { const t = new Date(); t.setDate(t.getDate() - 2); return t.getFullYear() + '년 ' + (t.getMonth() + 1) + '월 ' + t.getDate() + '일'; });
  ok((await page.textContent('[data-testid="dex-detail-first"]')) === firstDay, `[${width}px] 처음 찾은 날 ${firstDay}`);
  await h.snap('dex-detail');
  await page.click('[data-testid="dex-detail-close"]');
  ok(!(await page.isVisible('[data-testid="dex-detail"]')), `[${width}px] 닫기 버튼으로 설명 창 닫힘`);
  await page.click('.dex-chip[data-id="joyH1"]');
  ok((await page.textContent('[data-testid="dex-detail-desc"]')).includes('아직 못 찾은'), `[${width}px] 못 찾은 숨은 감정은 이름을 감춤`);
  ok(!(await page.textContent('[data-testid="dex-detail"]')).includes('벅참'), `[${width}px] 못 찾은 감정의 이름이 드러나지 않음`);
  await h.snap('dex-detail-locked');
  await page.keyboard.press('Escape');
  ok(!(await page.isVisible('[data-testid="dex-detail"]')), `[${width}px] Esc 키로 설명 창 닫힘`);
  await page.click('.topbar .top-btn');
  await page.click('[data-testid="menu-records"]');
  await h.expect('records', '지난 기록');
  ok((await page.$$('.rec')).length === 13, `[${width}px] 지난 기록 13개 표시`);
  await h.snap('records');
  await page.click('.topbar .top-btn');

  /* 2-8. 기록 옮기기: 내보내기 */
  await page.click('[data-testid="menu-backup"]');
  await h.expect('backup', '기록 옮기기');
  await h.snap('backup');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-testid="export-download"]')]);
  const backupPath = path.join(SHOTS, `backup-${width}.json`);
  await download.saveAs(backupPath);
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  ok(backup.app === 'maeum-chatgi' && backup.records.length === 13, `[${width}px] 내보낸 파일에 기록 13개 (실제 ${backup.records && backup.records.length})`);
  ok(/^maeum-chatgi-backup-\d{4}-\d{2}-\d{2}\.json$/.test(download.suggestedFilename()), `[${width}px] 파일 이름 ${download.suggestedFilename()}`);
  // 같은 파일을 다시 불러오면 모두 건너뜀
  await page.setInputFiles('[data-testid="import-file"]', backupPath);
  await h.expect('importConfirm', '같은 파일 불러오기');
  ok((await page.textContent('[data-testid="import-summary"]')).includes('새 기록은 0개'), `[${width}px] 이미 있는 기록은 건너뜀`);
  ok(!(await page.$('[data-testid="import-confirm"]')), `[${width}px] 새 기록이 없으면 불러오기 버튼 없음`);
  await page.click('[data-testid="import-cancel"]');
  await h.expect('backup', '불러오기 취소');
  // 엉뚱한 파일은 거절
  const badPath = path.join(SHOTS, `bad-${width}.json`);
  fs.writeFileSync(badPath, '이건 기록 파일이 아니에요');
  await page.setInputFiles('[data-testid="import-file"]', badPath);
  await page.waitForTimeout(200);
  ok((await page.textContent('[data-testid="import-error"]')).includes('기록 파일이 아니에요'), `[${width}px] 엉뚱한 파일은 오류 안내`);
  await h.expect('backup', '엉뚱한 파일 후에도 같은 화면');
  await page.click('.topbar .top-btn');

  /* 2-9. 기록 전체 삭제 */
  await page.click('[data-testid="delete-all"]');
  await h.expect('deleteConfirm', '삭제 확인');
  await h.snap('delete-confirm');
  await page.click('[data-testid="cancel-delete"]');
  await h.expect('home', '삭제 취소');
  ok((await page.evaluate(() => window.__maeum.records().length)) === 13, `[${width}px] 취소하면 기록 그대로`);
  await page.click('[data-testid="delete-all"]');
  await page.click('[data-testid="confirm-delete"]');
  await h.expect('home', '삭제 후 처음 화면');
  ok((await page.textContent('[data-testid="stat-count"]')).includes('0개'), `[${width}px] 삭제 후 기록 0개`);
  ok((await page.textContent('[data-testid="stat-dex"]')).includes('0 /'), `[${width}px] 삭제 후 도감 0개`);
  ok((await page.evaluate(() => localStorage.getItem('maeum-chatgi-v1'))) === null, `[${width}px] 휴대폰 저장소에서도 지워짐`);

  /* 2-10. 지운 뒤 파일을 불러와 되살리기 (휴대폰을 바꾼 경우와 같음) */
  // 일부 기록을 망가뜨린 파일도 나머지는 불러와야 함
  const mixed = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  mixed.records.push({ id: 'broken', ts: 'not-a-date', intensity: 99 });
  const mixedPath = path.join(SHOTS, `mixed-${width}.json`);
  fs.writeFileSync(mixedPath, JSON.stringify(mixed));
  await page.click('[data-testid="menu-backup"]');
  ok(await page.isDisabled('[data-testid="export-download"]'), `[${width}px] 기록이 없으면 저장 버튼이 꺼짐`);
  await page.setInputFiles('[data-testid="import-file"]', mixedPath);
  await h.expect('importConfirm', '지운 뒤 불러오기');
  ok((await page.textContent('[data-testid="import-summary"]')).includes('새 기록은 13개'), `[${width}px] 새 기록 13개`);
  ok((await page.textContent('#app')).includes('망가진 기록 1개'), `[${width}px] 망가진 기록은 빼고 알려 줌`);
  await h.snap('import-confirm');
  await page.click('[data-testid="import-confirm"]');
  await h.expect('home', '불러온 뒤 처음 화면');
  ok((await page.textContent('[data-testid="stat-count"]')).includes('13개'), `[${width}px] 불러온 뒤 기록 13개`);
  ok((await page.textContent('[data-testid="stat-dex"]')).includes(`${DEX_FOUND} /`), `[${width}px] 불러온 뒤 도감 ${DEX_FOUND}개`);
  ok((await page.textContent('[data-testid="stat-streak"]')).includes('3일'), `[${width}px] 불러온 뒤 연속 기록 3일`);
  await page.reload();
  ok((await page.textContent('[data-testid="stat-count"]')).includes('13개'), `[${width}px] 새로 열어도 불러온 기록이 남아 있음`);
  // 삭제 화면에서 먼저 저장하기 안내
  await page.click('[data-testid="delete-all"]');
  ok(await page.isVisible('[data-testid="delete-export"]'), `[${width}px] 삭제 전에 파일로 저장하기 안내`);
  await page.click('[data-testid="delete-export"]');
  await h.expect('backup', '삭제 화면 → 기록 옮기기');
  await page.click('.topbar .top-btn');
  await page.click('.topbar .top-btn');
  await h.expect('home', '기록 옮기기 → 삭제 화면 → 처음 화면');

  /* 2-10b. 기록이 이미 있는 사람에게는 안내를 자동으로 띄우지 않음 */
  await page.evaluate(() => localStorage.removeItem('maeum-chatgi-intro-seen'));
  await page.reload();
  await h.expect('home', '기록이 있으면 안내 없이 처음 화면');
  await page.evaluate(() => localStorage.setItem('maeum-chatgi-intro-seen', '1'));

  /* 2-11. 인터넷 없이 열기 (service worker) */
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

async function checkGroupPages(page, h, width, D) {
  /* 묶음이 4개를 넘으면 5번으로 다음 묶음 장을 보고, 마지막 장의 5번은 질문 방법 바꾸기 */
  for (let fi = 0; fi < D.families.length; fi++) {
    const fam = D.families[fi];
    const pages = Math.ceil(fam.groups.length / 4);
    await newGame(page, h, `묶음 넘기기 ${fam.label}: 오늘 있었던 일.`);
    await h.expect('family', `${fam.label} 묶음 넘기기: 큰 감정`);
    await h.opt(fi + 1);
    for (let pg = 0; pg < pages; pg++) {
      await h.expect('group', `${fam.label} 묶음 ${pg + 1}장`);
      ok((await page.getAttribute('#app > section', 'data-page')) === String(pg), `[${width}px ${fam.label}] 묶음 ${pg + 1}장 표시`);
      const labels = await optLabels(page);
      ok(labels.join('|') === fam.groups.slice(pg * 4, pg * 4 + 4).map((g) => g.label).join('|'), `[${width}px ${fam.label}] 묶음 ${pg + 1}장의 보기가 data 순서와 같음`);
      const five = (await page.textContent('#app .opt[data-num="5"] .opt-label')).trim();
      ok(five === (pg < pages - 1 ? D.text.groupMore : D.text.noneOfThese), `[${width}px ${fam.label}] 묶음 ${pg + 1}장 5번 글자: ${five}`);
      await h.snap(`group-${fam.id}-p${pg + 1}`);
      if (pg < pages - 1) await h.opt(5);
    }
    // 마지막 장의 1번 묶음 → 그 묶음의 단어 4개
    const lastStart = (pages - 1) * 4;
    await h.opt(1);
    await h.expect('words', `${fam.label} 마지막 장 묶음의 단어`);
    const words = await optLabels(page);
    ok(words.join('|') === fam.groups[lastStart].emotions.map((e) => e.word).join('|'), `[${width}px ${fam.label}] 뒷장 묶음 "${fam.groups[lastStart].label}" 단어가 나옴`);
    await h.snap(`words-${fam.id}-p${pages}`);
    // 이전 → 마지막 장으로 돌아와 5번 → 첫 번째 질문 방법(몸 감각). 묶음 넘기기는 5번 횟수에 안 셈
    await page.click('#app .top-btn');
    await h.expect('group', `${fam.label} 이전 버튼으로 묶음 마지막 장`);
    ok((await page.getAttribute('#app > section', 'data-page')) === String(pages - 1), `[${width}px ${fam.label}] 이전 버튼으로 같은 장에 돌아옴`);
    await h.opt(5);
    await h.expect('approach', `${fam.label} 묶음 마지막 장 5번`);
    ok((await page.getAttribute('#app > section', 'data-approach')) === 'body', `[${width}px ${fam.label}] 묶음 마지막 장 5번 → 몸 감각 질문`);
    await page.click('#app .top-btn[aria-label="그만하고 처음 화면으로"]');
    await h.expect('home', `${fam.label} 묶음 넘기기 후 처음 화면`);
  }
}

/* 단어로 찾기: 끝말이 붙은 말(부끄러웠다·미안했다·놀랐다)과 같은 뜻 다른 말까지 찾고, 고르면 결과 카드까지 */
async function checkSearch(page, h, width, D) {
  await newGame(page, h, '발표하다가 말을 더듬어서 얼굴이 빨개졌다.');
  await h.expect('family', '단어로 찾기: 큰 감정');
  await page.click('[data-testid="search-open"]');
  await h.expect('search', '단어로 찾기 화면');
  const fsz = await page.$eval('[data-testid="search-input"]', (e) => parseFloat(getComputedStyle(e).fontSize));
  ok(fsz >= 16, `[${width}px] 찾기 입력칸 글자 ${fsz}px (16px 이상)`);
  const sugg = await page.$$eval('.search-item', (els) => els.map((e) => e.getAttribute('data-id')));
  ok(sugg.join('|') === D.searchSuggest.join('|'), `[${width}px] 아무것도 안 적으면 핵심 감정 추천이 나옴`);
  await h.snap('search-empty');
  const cases = [['부끄러웠다', '부끄러움'], ['미안했다', '미안함'], ['놀랐다', '놀람'], ['슬펐다', '슬픔'], ['화났다', '화남'], ['수치', '수치심'], ['낙담', '낙담']];
  for (const [q, w] of cases) {
    await page.fill('[data-testid="search-input"]', q);
    const first = (await page.textContent('.search-item >> nth=0 >> .opt-label')).trim();
    ok(first.replace('★ ', '') === w, `[${width}px] "${q}" → 첫 결과 "${w}" (실제 ${first})`);
  }
  await page.fill('[data-testid="search-input"]', '쀍쀍');
  ok((await page.$$('.search-item')).length === 0 && (await page.textContent('[data-testid="search-info"]')).trim() === D.text.searchNone, `[${width}px] 맞는 단어가 없으면 안내`);
  await page.fill('[data-testid="search-input"]', '부끄러웠다');
  ok((await page.textContent('.search-item >> nth=0 >> .opt-hint')).includes('창피함'), `[${width}px] 같은 뜻 다른 말 결과에 대표 단어 표시`);
  await h.snap('search-results');
  await page.click('.search-item >> nth=0');
  await h.expect('intensity', '단어로 찾기 → 강도 (같은 뜻·구별 화면 건너뜀)');
  await page.click('[data-score="5"]');
  await h.opt(1);
  await h.expect('need', '단어로 찾기 → 욕구');
  await h.opt(1);
  await h.expect('result', '단어로 찾기 → 결과 카드');
  ok((await page.textContent('[data-testid="result-emotion"]')).includes('부끄러움'), `[${width}px] 찾은 단어 "부끄러움"이 결과 카드에 나옴`);
  const rec = await page.evaluate(() => { const r = window.__maeum.records(); return r[r.length - 1]; });
  ok(rec.emotionId === 'fear13a' && rec.path === 'search', `[${width}px] 찾은 단어 기록 id·경로 (${rec.emotionId}, ${rec.path})`);
  await page.click('[data-testid="home"]');
  // 묶음 화면에서도 찾기를 열 수 있음
  await newGame(page, h, '묶음 화면에서 찾기');
  await h.opt(2);
  await h.expect('group', '묶음 화면');
  await page.click('[data-testid="search-open"]');
  await h.expect('search', '묶음 화면 → 단어로 찾기');
  await page.click('.topbar .top-btn >> nth=1');
  await h.expect('home', '단어로 찾기 → 그만하기');
}

/* 묶음에서 단어를 고른 뒤 구별 화면·같은 뜻 화면이 나오면 1번을 골라 강도 화면까지 감 */
async function passToIntensity(page, h) {
  for (let k = 0; k < 3; k++) {
    const cur = await h.screen('intensity');
    if (cur === 'compare' || cur === 'wording') await h.opt(1); else return;
  }
}
function findEmo(D, id) {
  for (const f of D.families) {
    for (const g of f.groups) for (const e of g.emotions) if (e.id === id) return e;
    for (const e of f.hidden) if (e.id === id) return e;
  }
  return null;
}
function compareSet(D, id) {
  for (const cs of D.compareSets || []) if (cs.ids.includes(id)) return [id, ...cs.ids.filter((x) => x !== id)];
  return null;
}
/* 2-7에서 도감에 든 서로 다른 단어 수: 4쪽 4개 + 숨은 1 + 반대로 1 + 찾기 1 + 구별 1 + 안 적고 1 + 이름 없음 제외 + 지난 기록 2(서운함·걱정) */
const DEX_FOUND = 11;

function countWords(D) {
  const n = (e) => 1 + (e.same || []).length;
  return D.families.reduce((a, f) => a + f.groups.reduce((b, g) => b + g.emotions.reduce((c, e) => c + n(e), 0), 0) + f.hidden.reduce((c, e) => c + n(e), 0), 0);
}
function josaCheck(word) {
  const c = word.charCodeAt(word.length - 1);
  const has = c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0;
  return word + (has ? '을' : '를');
}
async function optLabels(page) {
  return page.$$eval('#app .opt:not([data-num="5"]) .opt-label', (els) => els.map((e) => e.textContent.trim()));
}

/* ───── 3. 설치 파일 점검 ───── */
function checkPwaFiles() {
  console.log('■ 설치형 웹앱 파일 점검');
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
  ok(m.start_url === './' && m.display === 'standalone', 'manifest: 시작 주소·전체 화면 설정');
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

(async () => {
  fs.rmSync(SHOTS, { recursive: true, force: true });
  const D = checkData();
  checkPwaFiles();
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
  if (failures.length) { console.log('실패 목록:\n- ' + failures.join('\n- ')); process.exit(1); }
  console.log('모든 점검 통과 ✅  (화면 캡처: tests/screenshots)');
})().catch((e) => { console.error(e); process.exit(1); });
