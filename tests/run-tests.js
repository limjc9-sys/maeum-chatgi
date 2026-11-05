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
  D.families.forEach((f) => {
    ok(f.groups.length === 4, `${f.id}: 세부 묶음이 4개여야 함`);
    f.groups.forEach((g) => {
      ok(g.emotions.length === 4, `${f.id}/${g.label}: 감정이 4개여야 함`);
      g.emotions.forEach((e) => { ok(!emo[e.id], `감정 id 중복: ${e.id}`); emo[e.id] = { ...e, hidden: false }; total++; });
    });
    f.hidden.forEach((e) => { ok(!emo[e.id], `감정 id 중복: ${e.id}`); emo[e.id] = { ...e, hidden: true }; total++; hidden++; });
  });
  ok(D.families.length === 4, '감정 묶음 4개');
  ok(total >= 80, `세부 감정 단어 80개 이상 (지금 ${total}개)`);
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
  ok(D.causes.length === 5, '원인 보기 5개');
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
    document.querySelectorAll('#app *').forEach((el) => {
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
    document.querySelectorAll('#app button, #app a.phone, #app summary').forEach((b) => {
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
      await page.screenshot({ path: path.join(dir, `${String(shotNo).padStart(2, '0')}-${name}.png`), fullPage: true });
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
    const expectWord = fam.groups[gi - 1].emotions[wi - 1].word;
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
  ok((await page.textContent('[data-testid="result-need"]')).includes('이름 붙이기 어려운 바람'), `[${width}px] 이름 붙이기 어려운 바람으로 저장`);
  await h.snap('result-hidden');
  await page.click('[data-testid="home"]');

  /* 2-4. 3회째(반대로 묻기) → 욕구를 먼저 고르면 욕구 단계를 건너뜀, 원인 "다른 것" 직접 입력 */
  await newGame(page, h, '모둠 과제를 혼자 다 했는데 발표 점수는 똑같이 받았다.');
  await h.opt(5); await h.opt(5); await h.opt(5);
  await h.expect('approach', '반대로 묻기');
  ok((await page.getAttribute('#app > section', 'data-approach')) === 'reverse', `[${width}px] 3회째는 반대로 묻기`);
  await h.opt(2); await h.expect('words', '반대로 묻기 후보');
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
  ok(recCount === 7, `[${width}px] 위험 표현은 기록에 저장되지 않음 (기록 ${recCount}개)`);
  for (const t of ['배고파 죽겠다 진짜', '유서 깊은 절에 다녀왔다']) {
    await newGame(page, h, t);
    await h.expect('family', `일상 표현 "${t}"은 그대로 진행`);
    await page.click('.topbar .top-btn >> nth=1');
  }
  await newGame(page, h, '원인 칸 위험 표현 점검');
  await h.opt(1); await h.opt(1); await h.opt(1);
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
  ok((await page.textContent('[data-testid="report-count"]')).includes('9개'), `[${width}px] 이번 주 기록 9개`);
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
  ok(dexTotal.includes(`${countWords(D)}개 중 8개 발견`), `[${width}px] 도감 "${countWords(D)}개 중 8개 발견" (실제: ${dexTotal})`);
  await h.snap('dex');
  await page.click('.topbar .top-btn');
  await page.click('[data-testid="menu-records"]');
  await h.expect('records', '지난 기록');
  ok((await page.$$('.rec')).length === 10, `[${width}px] 지난 기록 10개 표시`);
  await h.snap('records');
  await page.click('.topbar .top-btn');

  /* 2-8. 기록 전체 삭제 */
  await page.click('[data-testid="delete-all"]');
  await h.expect('deleteConfirm', '삭제 확인');
  await h.snap('delete-confirm');
  await page.click('[data-testid="cancel-delete"]');
  await h.expect('home', '삭제 취소');
  ok((await page.evaluate(() => window.__maeum.records().length)) === 10, `[${width}px] 취소하면 기록 그대로`);
  await page.click('[data-testid="delete-all"]');
  await page.click('[data-testid="confirm-delete"]');
  await h.expect('home', '삭제 후 처음 화면');
  ok((await page.textContent('[data-testid="stat-count"]')).includes('0개'), `[${width}px] 삭제 후 기록 0개`);
  ok((await page.textContent('[data-testid="stat-dex"]')).includes('0 /'), `[${width}px] 삭제 후 도감 0개`);
  ok((await page.evaluate(() => localStorage.getItem('maeum-chatgi-v1'))) === null, `[${width}px] 휴대폰 저장소에서도 지워짐`);

  /* 2-9. 인터넷 없이 열기 (service worker) */
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

function countWords(D) {
  return D.families.reduce((a, f) => a + f.groups.length * 4 + f.hidden.length, 0);
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
