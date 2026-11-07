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
    ok(f.groups.length >= 2, `${f.id}: 세부 묶음이 2개 이상이어야 함 (지금 ${f.groups.length}개)`);
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
  ok(D.families.length === 8, `큰 감정 쪽 8개 (지금 ${D.families.length}개)`);
  ok(JSON.stringify(D.families.map((f) => f.id)) === JSON.stringify(['joy', 'sad', 'anger', 'fear', 'shame', 'surprise', 'disgust', 'mixed']), '쪽 id와 순서');
  D.families.forEach((f) => ok(f.label && f.hint && f.emoji && /^#[0-9A-Fa-f]{6}$/.test(f.color), `${f.id}: label/hint/emoji/color`));
  ok(new Set(D.families.map((f) => f.color)).size === D.families.length, '쪽 색이 서로 다름');
  ok(total >= 550, `감정 단어 550개 이상 (지금 ${total}개)`);
  // 섞인 감정: 섞인 마음 쪽에 착잡함·시원섭섭함·애증·고마우면서 미안함이 있음
  {
    const mixed = D.families.find((f) => f.id === 'mixed');
    const mw = mixed ? mixed.groups.flatMap((g) => g.emotions.map((e) => e.word)) : [];
    ['착잡함', '시원섭섭함', '애증', '고마우면서 미안함', '웃픔', '만감이 교차함'].forEach((w) => ok(mw.includes(w), `섞인 마음 쪽에 "${w}"`));
  }
  // 원자료 단어가 모두 게임 단어로 들어갔는지
  const wordSet = new Set(Object.values(emo).map((e) => e.word));
  ok(SOURCE_MAP.length + EXCLUDED_EXPLETIVES === 604, `원자료 단어 수: 대응표 ${SOURCE_MAP.length} + 욕설 ${EXCLUDED_EXPLETIVES} = 604 (무드 미터 100, 부록 504)`);
  SOURCE_MAP.forEach((m) => ok(wordSet.has(m.game), `원자료 "${m.src}"(${m.origin})의 게임 단어 "${m.game}"가 있음`));
  // 처음 만든 id가 그대로 있고, 같은 종류(일반/숨은)에 있는지 (쪽은 옮겨도 됨: 지난 기록의 쪽 값은 앱이 다시 계산함)
  const inGroups = new Set(D.families.flatMap((f) => f.groups.flatMap((g) => g.emotions.map((e) => e.id))));
  const inHidden = new Set(D.families.flatMap((f) => f.hidden.map((e) => e.id)));
  Object.entries(ORIGINAL_IDS).forEach(([fam, c]) => {
    const pre = c.prefix || fam;
    for (let k = 1; k <= c.groups; k++) { const id = pre + String(k).padStart(2, '0'); ok(inGroups.has(id), `처음 id ${id}가 묶음에 그대로 있음`); }
    for (let k = 1; k <= c.hidden; k++) { const id = pre + 'H' + k; ok(inHidden.has(id), `처음 id ${id}가 숨은 감정에 그대로 있음`); }
  });
  // 비슷한 단어가 같은 화면에 함께 나오지 않는지
  const screens = [];
  D.families.forEach((f) => f.groups.forEach((g) => screens.push({ name: `${f.id}/${g.label}`, ids: g.emotions.map((e) => e.id) })));
  D.approaches.forEach((a) => a.options.forEach((o) => screens.push({ name: `접근 ${a.key}/${o.label}`, ids: o.emotions })));
  ok(D.moodMeter && D.moodMeter.options.length === 4, '기분 4칸');
  (D.moodMeter ? D.moodMeter.options : []).forEach((o) => {
    ok(o.label && o.hint && /^#[0-9A-Fa-f]{6}$/.test(o.color), `기분 칸 "${o.label}": label/hint/color`);
    ok(o.emotions.length === 4 && o.emotions.every((id) => emo[id] && !emo[id].hidden && !emo[id].parent), `기분 칸 "${o.label}": 대표 감정 4개`);
    screens.push({ name: `기분 칸 ${o.label}`, ids: o.emotions });
  });
  KEEP_APART.forEach(([a, b]) => {
    ok(!!emo[a] && !!emo[b], `떨어뜨릴 단어 쌍의 id가 있음: ${a}, ${b}`);
    screens.forEach((sc) => ok(!(sc.ids.includes(a) && sc.ids.includes(b)), `같은 화면에 비슷한 단어: ${emo[a] && emo[a].word}·${emo[b] && emo[b].word} (${sc.name})`));
  });
  screens.forEach((sc) => ok(new Set(sc.ids).size === sc.ids.length, `한 화면에 같은 단어 두 번: ${sc.name}`));
  const words = Object.values(emo).map((e) => e.word);
  ok(new Set(words).size === words.length, '감정 단어가 서로 겹치지 않음');
  const need = {};
  D.needs.forEach((n) => { ok(!need[n.id], `욕구 id 중복: ${n.id}`); need[n.id] = n; ok(n.word && n.text && n.tip, `욕구 ${n.id}: word/text/tip 모두 있어야 함`); });
  ok(D.needs.length >= 52, `욕구 단어 52개 이상 (지금 ${D.needs.length}개)`);
  ['con1', 'con2', 'con3', 'con4', 'con5', 'con6', 'res1', 'res2', 'res3', 'res4', 'res5', 'res6', 'saf1', 'saf2', 'saf3', 'saf4', 'saf5', 'saf6',
    'rest1', 'rest2', 'rest3', 'rest4', 'rest5', 'rest6', 'grow1', 'grow2', 'grow3', 'grow4', 'grow5', 'grow6', 'free1', 'free2', 'free3', 'free4', 'free5', 'free6',
    'mean1', 'mean2', 'mean3', 'mean4', 'mean5', 'mean6', 'clar1', 'clar2', 'clar3', 'clar4', 'clar5', 'clar6'].forEach((id) => ok(!!need[id], `처음 욕구 id ${id}가 그대로 있음`));
  // 욕구 쪽: 모든 욕구가 한 쪽에 한 번씩
  const inNeedGroups = D.needGroups.flatMap((g) => g.needs);
  ok(D.needGroups.length === 8 && D.needGroups.every((g) => g.label && g.hint && g.needs.length >= 4), '욕구 쪽 8개, 쪽마다 label/hint, 욕구 4개 이상');
  ok(inNeedGroups.length === D.needs.length && new Set(inNeedGroups).size === D.needs.length && inNeedGroups.every((id) => need[id]), `모든 욕구가 욕구 쪽에 한 번씩 들어감 (${inNeedGroups.length} / ${D.needs.length})`);
  // 감정별 첫 욕구 보기
  Object.entries(D.needsByEmotion).forEach(([eid, list]) => {
    ok(!!emo[eid] && !emo[eid].parent, `needsByEmotion: ${eid}는 대표 감정 id`);
    ok(list.length === 4 && new Set(list).size === 4 && list.every((id) => need[id]), `needsByEmotion.${eid}: 서로 다른 욕구 4개`);
  });
  (D.compareSets || []).forEach((cs) => cs.ids.forEach((id) => ok(!!D.needsByEmotion[id], `구별 질문 감정 ${id}에 감정별 욕구가 있음`)));
  // 비슷한 욕구 구별하기
  const needAsks = new Set();
  D.needCompareSets.forEach((cs) => {
    ok(cs.ids.length === 4 && new Set(cs.ids).size === 4, `욕구 구별 "${cs.name}": 서로 다른 욕구 4개`);
    cs.ids.forEach((id) => { ok(!!(need[id] && need[id].ask), `욕구 구별 "${cs.name}": ${id}에 ask`); if (need[id]) needAsks.add(need[id].ask); });
  });
  ok(needAsks.size === D.needs.filter((n) => n.ask).length, '욕구 구별 문장이 서로 다르고 모두 쓰임');
  ok(D.needSearchSuggest.length >= 4 && D.needSearchSuggest.every((id) => need[id]), '욕구 찾기 추천 id가 모두 있음');
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
  ok(D.needRounds[0].question && D.needRounds[0].questionJoy, '첫 욕구 질문 문장');
  ok(D.families.every((f) => D.needsByCause[f.id]), '모든 감정 쪽에 needsByCause가 있음');
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
      // 위쪽 막대는 화면에 붙어 있어 스크롤하면 내용 위에 겹쳐 보여요. 점검은 맨 위에서 해요
      await page.evaluate(() => window.scrollTo(0, 0));
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
  {
    const homeText = await page.textContent('#app');
    ok(!/109|1577-0199|자살|상담·치료/.test(homeText), `[${width}px] 첫 화면에 상담 전화·안내 문구가 없음`);
  }
  await h.snap('home');

  /* 2-1. 감정 묶음 4개 각각 끝까지 */
  const familyIds = ['joy', 'anger', 'sad', 'fear'];
  for (let i = 0; i < D.families.length; i++) {
    const fi = i + 1; // 1~7번
    const fam = D.families[i];
    const gi = (i % fam.groups.length) + 1;
    const wi = ((i + 2) % 4) + 1;
    const entry = fam.groups[gi - 1].emotions[wi - 1];
    const expectWord = entry.same && entry.same.length ? entry.same[0].word : entry.word;
    await newGame(page, h, `테스트 상황 ${fi}: 친구가 약속에 늦게 와서 한참 기다렸다.`);
    await h.expect('family', `${fam.label} 큰 감정`);
    if (i === 0) {
      await h.snap('family');
      const tiles = await page.$$eval('#app .opts-grid .opt', (els) => els.map((e) => ({ id: e.getAttribute('data-id'), five: e.classList.contains('opt-five') })));
      ok(tiles.length === D.families.length + 1, `[${width}px] 첫 화면 칸 ${D.families.length + 1}개 (쪽 ${D.families.length} + 잘 모르겠어요)`);
      ok(tiles.filter((t) => t.five).map((t) => t.id).join() === 'not-sure', `[${width}px] 첫 화면에서 "이 중엔 없어요" 모양은 "잘 모르겠어요" 칸에만`);
    }
    await h.opt(fi);
    await h.expect('group', `${fam.label} 묶음`);
    await h.snap(`group-${fam.id}`);
    await h.opt(gi);
    await h.expect('words', `${fam.label} 세부 감정`);
    await h.snap(`words-${fam.id}`);
    await h.opt(wi);
    ok((await page.getAttribute(`#app .opt[data-id="${entry.id}"]`, 'aria-pressed')) === 'true', `[${width}px ${fam.label}] 누른 단어에 체크 표시`);
    ok((await page.textContent('[data-testid="pick-bar"]')).includes(entry.word), `[${width}px ${fam.label}] 고른 감정 막대에 "${entry.word}"`);
    if (i === 0) await h.snap('words-checked');
    await page.click('[data-testid="pick-next"]');
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
    await page.click(`[data-score="${3 + i}"]`);
    await h.expect('cause', `${fam.label} 원인`);
    if (i === 0) await h.snap('cause');
    await h.opt((i % 4) + 1); // 원인 1~4
    await h.expect('need', `${fam.label} 욕구`);
    const nq = await h.question();
    ok(nq === (fam.id === 'joy' ? D.needRounds[0].questionJoy : D.needRounds[0].question), `[${width}px ${fam.label}] 욕구 질문 문장`);
    const nl = await optLabels(page);
    const expectNeeds = (D.needsByEmotion[entry.id] || D.needsByCause[fam.id][D.causes[i % 4].id]).map((id) => D.needs.find((n) => n.id === id).text);
    ok(nl.join('|') === expectNeeds.join('|'), `[${width}px ${fam.label}] 첫 욕구 보기 (${entry.word}): ${nl.join(' / ')}`);
    await h.snap(`need-${fam.id}`);
    await h.opt(2);
    await passNeedCompare(page, h);
    await h.expect('result', `${fam.label} 결과 카드`);
    const emoText = await page.textContent('[data-testid="result-emotion"]');
    ok(emoText.includes(expectWord), `[${width}px ${fam.label}] 결과 카드 감정 "${expectWord}" (실제: ${emoText.trim()})`);
    ok((await page.textContent('[data-testid="result-intensity"]')).includes(`${3 + i} / 10`), `[${width}px ${fam.label}] 결과 강도`);
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
  ok((await page.textContent('[data-testid="stat-dex"]')).includes(`${D.families.length} / ${countWords(D)}`), `[${width}px] 도감 ${D.families.length}개 발견 표시`);
  ok((await page.textContent('[data-testid="stat-streak"]')).includes('1일'), `[${width}px] 연속 기록 1일`);

  /* 2-2. 5번을 계속 누르면 접근이 바뀜 → 이름 붙이기 어려운 감정 */
  await newGame(page, h, '그냥 오늘 하루가 이상하게 흘러갔다.');
  await h.expect('family', '5번 연속: 시작');
  const qs = [await h.question()];
  const order = ['body', 'action', 'reverse', 'past'];
  for (let k = 0; k < 4; k++) {
    if (k === 0) {
      await page.click('#app .opt[data-id="not-sure"]');
      await h.expect('meter', '잘 모르겠어요 → 기분 4칸');
      qs.push(await h.question());
      ok((await page.textContent('#app .opt[data-num="5"] .opt-label')).trim() === D.text.noneOfThese, `[${width}px] 기분 4칸 5번은 "이 중엔 없어요"`);
    }
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
  await passNeedCompare(page, h);
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
  await h.opt(1); await page.click('[data-testid="pick-next"]'); await h.expect('intensity', '숨은 감정: 강도');
  await page.click('[data-score="8"]');
  await h.opt(1); await h.expect('need', '욕구 첫 화면');
  ok((await page.textContent('#app .opt[data-num="5"] .opt-label')).trim() === D.text.needMore, `[${width}px] 욕구 첫 화면 5번은 "${D.text.needMore}"`);
  await h.opt(5);
  // 욕구 쪽 고르기: 한 장에 4쪽, 5번으로 다음 장
  const ngPages = Math.ceil(D.needGroups.length / 4);
  for (let pg = 0; pg < ngPages; pg++) {
    await h.expect('needGroup', `욕구 쪽 ${pg + 1}장`);
    const labels = await optLabels(page);
    ok(labels.join('|') === D.needGroups.slice(pg * 4, pg * 4 + 4).map((g) => (g.emoji ? g.emoji + ' ' : '') + g.label).join('|'), `[${width}px] 욕구 쪽 ${pg + 1}장 보기: ${labels.join(', ')}`);
    await h.snap(`need-group-p${pg + 1}`);
    if (pg < ngPages - 1) await h.opt(5);
  }
  // 마지막 장의 1번 쪽 → 그 쪽 욕구 4개씩
  const lastG = D.needGroups[(ngPages - 1) * 4];
  await h.opt(1);
  await h.expect('needWords', '욕구 쪽 안의 욕구');
  const nwPages = Math.ceil(lastG.needs.length / 4);
  for (let pg = 0; pg < nwPages; pg++) {
    await h.expect('needWords', `욕구 ${pg + 1}장`);
    const labels = await optLabels(page);
    ok(labels.join('|') === lastG.needs.slice(pg * 4, pg * 4 + 4).map((id) => D.needs.find((n) => n.id === id).text).join('|'), `[${width}px] "${lastG.label}" 욕구 ${pg + 1}장`);
    await h.snap(`need-words-p${pg + 1}`);
    const five = (await page.textContent('#app .opt[data-num="5"] .opt-label')).trim();
    ok(five === (pg < nwPages - 1 ? D.text.needWordsMore : D.text.needOtherGroup), `[${width}px] 욕구 ${pg + 1}장 5번: ${five}`);
    await h.opt(5);
  }
  // 마지막 장 5번 → 욕구 쪽 1장으로 돌아옴 → 끝 장 5번 → 이름 붙이기 어려운 욕구
  await h.expect('needGroup', '다른 욕구 쪽 보기');
  for (let pg = 0; pg < ngPages; pg++) await h.opt(5);
  await h.expect('needUnnamed', '욕구 쪽 마지막 장 5번: 이름 붙이기 어려운 욕구');
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
  await page.click('#app .opt[data-id="not-sure"]'); await h.opt(5); await h.opt(5); await h.opt(5);
  await h.expect('approach', '반대로 묻기');
  ok((await page.getAttribute('#app > section', 'data-approach')) === 'reverse', `[${width}px] 3회째는 반대로 묻기`);
  await h.opt(2); await h.expect('words', '반대로 묻기 후보');
  await h.opt(1); await page.click('[data-testid="pick-next-bottom"]'); await h.expect('compare', '반대로 묻기: 비슷한 감정 구별');
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
    await page.click('[data-testid="pick-next"]');
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
    await passNeedCompare(page, h);
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
  await h.opt(1); await h.opt(4); await h.opt(1); await page.click('[data-testid="pick-next"]');
  await passToIntensity(page, h);
  await page.click('[data-score="4"]');
  await h.opt(3); await h.opt(1);
  await passNeedCompare(page, h);
  await h.expect('result', '안 적고 시작: 결과 카드');
  ok(!(await page.$('.card-situation')), `[${width}px] 안 적으면 결과 카드에 "있었던 일" 줄이 없음`);
  ok(!/[{}]/.test(await page.textContent('[data-testid="result-summary"]')), `[${width}px] 안 적어도 한 줄 정리 완성`);
  await page.click('[data-testid="home"]');

  /* 2-4e. 욕구 고르기: 단어로 찾기, 비슷한 욕구 구별, 넘어가기 */
  await checkNeeds(page, h, width, D);

  /* 2-4g. 기분 4칸으로 고르기, 결과 카드의 욕구 확인·남길 말, 응답이 다음 욕구 보기에 반영 */
  await checkMeterAndCard(page, h, width, D);

  /* 2-4f. 여러 감정 체크 (섞인 마음) */
  await checkMulti(page, h, width, D);

  /* 2-5. 이전 버튼 */
  await newGame(page, h, '이전 버튼 점검');
  await h.opt(3); await h.expect('group', '이전 버튼: 묶음');
  await h.opt(1); await h.expect('words', '이전 버튼: 세부');
  await page.click('.topbar .top-btn >> nth=0');
  await h.expect('group', '이전 버튼 → 묶음으로 돌아감');
  await page.click('.topbar .top-btn >> nth=1');
  await h.expect('home', '그만하기 → 처음 화면');

  /* 2-6. 상담 전화 안내 화면은 없음: 어떤 글을 적어도 게임이 그대로 진행되고, 그만두면 기록이 늘지 않음 */
  const before26 = await page.evaluate(() => window.__maeum.records().length);
  for (const t of ['너무 힘들어서 죽고 싶다', '유서 깊은 절에 다녀왔다']) {
    await newGame(page, h, t);
    await h.expect('family', `"${t}"을 적어도 그대로 진행`);
    ok(!/109|1577-0199/.test(await page.textContent('#app')), `[${width}px] 상담 전화 번호가 나오지 않음`);
    await page.click('.topbar .top-btn >> nth=1');
  }
  ok(!(await page.$('script[src="data/safety.js"]')), `[${width}px] 위험한 말 목록 파일을 불러오지 않음`);
  {
    const recCount = await page.evaluate(() => window.__maeum.records().length);
    ok(recCount === before26, `[${width}px] 그만둔 게임은 기록에 저장되지 않음 (기록 ${recCount}개)`);
  }

  /* 2-7. 연속 기록·주간 보고서·도감·지난 기록 */
  const base27 = await page.evaluate(() => window.__maeum.records().length);
  await page.evaluate(() => {
    const key = 'maeum-chatgi-v1';
    const d = JSON.parse(localStorage.getItem(key));
    const mk = (daysAgo, emotionId, emotionWord, family, needId, needWord, intensity) => {
      const t = new Date(); t.setDate(t.getDate() - daysAgo); t.setHours(20, 0, 0, 0);
      const p = (n) => (n < 10 ? '0' : '') + n;
      return { id: 'x' + daysAgo + emotionId, ts: t.toISOString(), date: t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate()), situation: '지난 기록 ' + daysAgo, family, emotionId, emotionWord, hidden: false, intensity, cause: 'word', causeText: '', needId, needWord, summary: '요약', tip: '실천', path: 'normal', five: 0 };
    };
    d.records.unshift(mk(1, 'sad01', '서운함', 'sad', 'con2', '알아줌', 6), mk(2, 'sad01', '서운함', 'sad', 'con2', '알아줌', 4), mk(9, 'fear01', '걱정', 'fear', 'saf2', '미리 알기', 5), mk(10, 'fear13', '창피함', 'fear', 'con2', '알아줌', 5));
    localStorage.setItem(key, JSON.stringify(d));
  });
  await page.reload();
  await h.expect('home', '기록 추가 후 처음 화면');
  const all27 = base27 + 4;
  const dexFound = await page.evaluate((ids) => new Set(window.__maeum.records().flatMap((r) => (r.emotions && r.emotions.length ? r.emotions.map((x) => x.id) : [r.emotionId])).filter((id) => ids.includes(id))).size, allEmotionIds(D));
  ok((await page.evaluate(() => window.__maeum.found())) === dexFound, `[${width}px] 도감 수 = 기록의 서로 다른 감정 수 (${dexFound})`);
  ok((await page.evaluate(() => window.__maeum.records().find((r) => r.emotionId === 'fear13').family)) === 'shame', `[${width}px] 옛 기록(창피함, 불안·두려움 쪽)의 쪽 값이 부끄러움·미안함 쪽으로 맞춰짐`);
  ok((await page.textContent('[data-testid="stat-streak"]')).includes('3일'), `[${width}px] 연속 기록 3일 (오늘·어제·그제)`);
  await page.click('[data-testid="menu-report"]');
  await h.expect('report', '주간 보고서');
  ok((await page.textContent('[data-testid="report-count"]')).includes(`${all27 - 2}개`), `[${width}px] 이번 주 기록 ${all27 - 2}개`);
  const topEmotion = await page.textContent('[data-testid="bars-emotion"] .bar-row >> nth=0');
  const week = await page.evaluate((ids) => {
    const t = new Date(); t.setDate(t.getDate() - 6);
    const p = (n) => (n < 10 ? '0' : '') + n;
    const sk = t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate());
    const recs = window.__maeum.records().filter((r) => r.date >= sk);
    const em = (r) => (r.emotions && r.emotions.length ? r.emotions : [{ id: r.emotionId, family: r.family }]);
    const cnt = {};
    recs.forEach((r) => em(r).forEach((x) => { cnt[x.id] = (cnt[x.id] || 0) + 1; }));
    return {
      top: Math.max(...Object.values(cnt)),
      distinct: new Set(recs.flatMap((r) => em(r).map((x) => x.id)).filter((id) => ids.includes(id))).size,
      mixed: recs.filter((r) => em(r).length > 1 || em(r).some((x) => x.family === 'mixed')).length,
      yes: recs.filter((r) => r.needFit === 'yes').length, no: recs.filter((r) => r.needFit === 'no').length, unsure: recs.filter((r) => r.needFit === 'unsure').length
    };
  }, allEmotionIds(D));
  ok(topEmotion.includes(`${week.top}번`), `[${width}px] 가장 자주 나온 감정 막대 ${week.top}번 (실제: ${topEmotion.trim()})`);
  ok((await page.textContent('[data-testid="report-distinct"]')).includes(`${week.distinct}개`), `[${width}px] 서로 다른 감정 ${week.distinct}개`);
  ok((await page.textContent('[data-testid="report-mixed"]')).includes(`${week.mixed}개`) && week.mixed >= 2, `[${width}px] 섞인 마음 기록 ${week.mixed}개`);
  ok((await page.$$('[data-testid="intensity-chart"] .chart-day')).length === 7 && !!(await page.$('[data-testid="intensity-chart"] svg .chart-dot')), `[${width}px] 하루 평균 강도 그래프 (7일, 점 있음)`);
  const lastDay = (await page.textContent('[data-testid="intensity-chart"] .chart-day >> nth=6')).trim();
  ok(/\d\.\d$/.test(lastDay), `[${width}px] 오늘 칸에 평균 강도 숫자 (${lastDay})`);
  ok((await page.$$('[data-testid="bars-pair"] .bar-row')).length >= 3 && (await page.textContent('[data-testid="bars-pair"]')).includes('→'), `[${width}px] 자주 함께 나온 감정·욕구 짝`);
  ok((await page.textContent('[data-testid="report-needfit"]')).includes(`네 ${week.yes}번 · 아니요 ${week.no}번 · 잘 모르겠음 ${week.unsure}번`) && week.yes >= 1 && week.no >= 1, `[${width}px] 욕구 응답 수 (네 ${week.yes}, 아니요 ${week.no})`);
  ok((await page.$$('[data-testid="bars-need"] .bar-row')).length >= 3, `[${width}px] 욕구 막대그래프`);
  ok((await page.$$('[data-testid="bars-family"] .bar-row')).length >= 4, `[${width}px] 감정 쪽 막대그래프`);
  await h.snap('report');
  await page.click('.week-nav button >> nth=0');
  ok((await page.textContent('[data-testid="report-count"]')).includes('2개'), `[${width}px] 지난주 보고서 기록 2개 (9일 전 걱정, 10일 전 창피함)`);
  await page.click('.topbar .top-btn');
  await h.expect('home', '보고서 → 처음 화면');
  await page.click('[data-testid="menu-dex"]');
  await h.expect('dex', '감정 도감');
  const dexTotal = await page.textContent('[data-testid="dex-total"]');
  ok(dexTotal.includes(`${countWords(D)}개 중 ${dexFound}개 발견`), `[${width}px] 도감 "${countWords(D)}개 중 ${dexFound}개 발견" (실제: ${dexTotal})`);
  ok((await page.$$('.dex-family')).length === D.families.length, `[${width}px] 도감에 쪽 ${D.families.length}개`);
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
  ok((await page.$$('.rec')).length === all27, `[${width}px] 지난 기록 ${all27}개 표시`);
  ok((await page.textContent('[data-testid="rec-reflection"]')).includes('쉬지 않고 달려 왔다'), `[${width}px] 지난 기록에 남긴 말이 나옴`);
  ok((await page.$$eval('.rec', (els) => els.some((e) => e.textContent.includes('🙈 창피함')))), `[${width}px] 옛 창피함 기록이 부끄러움·미안함 쪽 표시로 나옴`);
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
  ok(backup.app === 'maeum-chatgi' && backup.records.length === all27, `[${width}px] 내보낸 파일에 기록 ${all27}개 (실제 ${backup.records && backup.records.length})`);
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
  ok((await page.evaluate(() => window.__maeum.records().length)) === all27, `[${width}px] 취소하면 기록 그대로`);
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
  ok((await page.textContent('[data-testid="import-summary"]')).includes(`새 기록은 ${all27}개`), `[${width}px] 새 기록 ${all27}개`);
  ok((await page.textContent('#app')).includes('망가진 기록 1개'), `[${width}px] 망가진 기록은 빼고 알려 줌`);
  await h.snap('import-confirm');
  await page.click('[data-testid="import-confirm"]');
  await h.expect('home', '불러온 뒤 처음 화면');
  ok((await page.textContent('[data-testid="stat-count"]')).includes(`${all27}개`), `[${width}px] 불러온 뒤 기록 ${all27}개`);
  ok((await page.textContent('[data-testid="stat-dex"]')).includes(`${dexFound} /`), `[${width}px] 불러온 뒤 도감 ${dexFound}개`);
  ok((await page.textContent('[data-testid="stat-streak"]')).includes('3일'), `[${width}px] 불러온 뒤 연속 기록 3일`);
  await page.reload();
  ok((await page.textContent('[data-testid="stat-count"]')).includes(`${all27}개`), `[${width}px] 새로 열어도 불러온 기록이 남아 있음`);
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
  ok((await page.getAttribute('.search-item >> nth=0', 'aria-pressed')) === 'true', `[${width}px] 찾은 단어를 누르면 체크 표시`);
  ok((await page.inputValue('[data-testid="search-input"]')) === '부끄러웠다', `[${width}px] 체크해도 적은 글이 남아 있음`);
  await page.click('[data-testid="pick-next"]');
  await h.expect('intensity', '단어로 찾기 → 강도 (같은 뜻·구별 화면 건너뜀)');
  await page.click('[data-score="5"]');
  await h.opt(1);
  await h.expect('need', '단어로 찾기 → 욕구');
  await h.opt(1);
  await passNeedCompare(page, h);
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
/* 여러 감정 체크: 섞인 마음 쪽 착잡함·복잡미묘함 + 기쁨 쪽 기쁨 → 3개, 4번째는 막힘, ✕로 빼고 다시 넣기, 강도 3번, 결과 카드 */
async function checkMeterAndCard(page, h, width, D) {
  const M = D.moodMeter;
  const needText = (id) => D.needs.find((n) => n.id === id).text;
  const toNeed = async (sit, score) => {
    await newGame(page, h, sit);
    await page.click('#app .opt[data-id="not-sure"]');
    await h.expect('meter', '기분 4칸');
    await h.opt(3); // 기분 나쁘고 힘이 빠져요
    await h.expect('words', '기분 4칸 → 단어');
    await h.opt(M.options[2].emotions.indexOf('sad13') + 1); // 지침
    await page.click('[data-testid="pick-next"]');
    await passToIntensity(page, h);
    await page.click(`[data-score="${score}"]`);
    await h.opt(1);
    await h.expect('need', '기분 4칸 → 욕구');
    return optLabels(page);
  };
  // 1회: 4칸 보기, 단어, 첫 욕구 → "아니요", 남길 말 저장
  await newGame(page, h, '기분 4칸 보기 점검');
  await page.click('#app .opt[data-id="not-sure"]');
  await h.expect('meter', '기분 4칸 화면');
  ok((await optLabels(page)).join('|') === M.options.map((o) => o.label).join('|'), `[${width}px] 기분 4칸 보기`);
  await h.snap('meter');
  await h.opt(3);
  ok((await optLabels(page)).join('|') === M.options[2].emotions.map((id) => findEmo(D, id).word).join('|'), `[${width}px] 기분 칸 단어 4개`);
  await page.click('.topbar .top-btn >> nth=1');
  const n1 = await toNeed('기분 4칸 점검 1', 6);
  ok(n1.join('|') === D.needsByEmotion.sad13.map(needText).join('|'), `[${width}px] 첫 욕구 보기(응답 전): ${n1.join(' / ')}`);
  await h.opt(1); await passNeedCompare(page, h);
  await h.expect('result', '기분 4칸 → 결과 카드');
  let rec = await page.evaluate(() => { const r = window.__maeum.records(); return r[r.length - 1]; });
  ok(rec.path === 'meter' && rec.emotionId === 'sad13' && rec.needId === D_first(D), `[${width}px] 기록 경로 meter, 감정 sad13, 욕구 ${rec.needId}`);
  await page.click('[data-testid="need-fit-no"]');
  ok((await page.getAttribute('[data-testid="need-fit-no"]', 'aria-pressed')) === 'true' && (await page.getAttribute('[data-testid="need-fit-yes"]', 'aria-pressed')) === 'false', `[${width}px] "아니요" 눌림 표시`);
  ok(await page.isVisible('[data-testid="need-fit-note"]'), `[${width}px] 응답 안내 문장`);
  await page.fill('[data-testid="reflect-input"]', '쉬지 않고 달려 왔다는 신호 같다.');
  await page.click('[data-testid="reflect-save"]');
  ok((await page.textContent('[data-testid="result-reflection"]')).includes('쉬지 않고 달려 왔다'), `[${width}px] 남긴 말이 결과 카드에 나옴`);
  ok((await page.textContent('[data-testid="reflect-save"]')).trim() === D.text.reflectUpdate, `[${width}px] 저장 뒤 버튼은 "${D.text.reflectUpdate}"`);
  rec = await page.evaluate(() => { const r = window.__maeum.records(); return r[r.length - 1]; });
  ok(rec.needFit === 'no' && rec.reflection === '쉬지 않고 달려 왔다는 신호 같다.', `[${width}px] 기록에 욕구 응답·남긴 말 저장`);
  await h.snap('result-fit-reflect');
  await page.click('[data-testid="home"]');
  // 2회: "아니요" 한 욕구는 빠짐 → 첫 보기 고르고 "네"
  const n2 = await toNeed('기분 4칸 점검 2', 5);
  ok(n2.length === 4 && !n2.includes(needText(D.needsByEmotion.sad13[0])), `[${width}px] "아니요" 한 욕구는 첫 보기에서 빠짐: ${n2.join(' / ')}`);
  const second = D.needsByEmotion.sad13[1];
  await h.opt(n2.indexOf(needText(second)) + 1); await passNeedCompare(page, h);
  await h.expect('result', '2회 결과 카드');
  await page.click('[data-testid="need-fit-yes"]');
  await page.click('[data-testid="home"]');
  // 3회: "네" 한 욕구가 맨 앞, 이번엔 잘 모르겠음
  const n3 = await toNeed('기분 4칸 점검 3', 4);
  ok(n3[0] === needText(second) && !n3.includes(needText(D.needsByEmotion.sad13[0])), `[${width}px] "네" 한 욕구가 맨 앞: ${n3.join(' / ')}`);
  await h.opt(1); await passNeedCompare(page, h);
  await h.expect('result', '3회 결과 카드');
  await page.click('[data-testid="need-fit-unsure"]');
  ok((await page.getAttribute('[data-testid="need-fit-unsure"]', 'aria-pressed')) === 'true', `[${width}px] "잘 모르겠음" 눌림 표시`);
  await page.click('[data-testid="home"]');
}
function D_first(D) { return D.needsByEmotion.sad13[0]; }

async function checkMulti(page, h, width, D) {
  const pickCount = async () => {
    const t = await page.textContent('[data-testid="pick-bar"] .pick-title').catch(() => '');
    const m = t.match(/(\d+)개/);
    return m ? Number(m[1]) : 0;
  };
  await newGame(page, h, '졸업식이 끝나고 친구들과 헤어졌다.');
  await h.expect('family', '여러 감정: 큰 감정');
  await page.click('#app .opt[data-id="mixed"]');
  await h.expect('group', '여러 감정: 섞인 마음 쪽 묶음');
  await h.opt(1);
  await h.expect('words', '여러 감정: 섞인 마음 단어');
  await h.opt(1);
  ok((await pickCount()) === 1, `[${width}px] 착잡함 체크 → 1개`);
  await h.opt(1);
  ok(!(await page.$('[data-testid="pick-bar"]')), `[${width}px] 다시 누르면 체크가 풀림`);
  await h.opt(1); await h.opt(2);
  ok((await pickCount()) === 2, `[${width}px] 착잡함·복잡미묘함 체크 → 2개`);
  ok((await page.textContent('[data-testid="pick-next-bottom"]')).includes('2개'), `[${width}px] 아래 "다음" 버튼에 2개`);
  await h.snap('multi-words');
  await page.click('[data-testid="pick-more"]');
  await h.expect('family', '여러 감정: 다른 쪽에서 더 고르기');
  ok((await pickCount()) === 2, `[${width}px] 첫 화면에도 고른 감정 막대`);
  await h.snap('multi-family');
  await page.click('[data-pick="mix01"]');
  ok((await pickCount()) === 1, `[${width}px] 막대의 ✕로 복잡미묘함 빼기 → 1개`);
  await page.click('#app .opt[data-id="mixed"]'); await h.opt(1);
  ok((await page.getAttribute('#app .opt[data-id="sad45"]', 'aria-pressed')) === 'true', `[${width}px] 다시 와도 착잡함은 체크된 채로 있음`);
  await h.opt(2);
  await page.click('[data-testid="pick-more"]');
  await page.click('#app .opt[data-id="joy"]'); await h.opt(1);
  await h.expect('words', '여러 감정: 기쁨 쪽 단어');
  await h.opt(1);
  ok((await pickCount()) === 3, `[${width}px] 기쁨까지 3개`);
  await h.opt(2);
  ok((await pickCount()) === 3, `[${width}px] 4번째는 체크되지 않음 (3개까지)`);
  ok((await page.getAttribute('#app .opt[data-num="2"]', 'aria-pressed')) === 'false', `[${width}px] 4번째 단어는 체크 표시 없음`);
  await page.click('[data-testid="pick-next"]');
  // 여러 개를 고르면 구별 화면은 건너뛰고, 같은 뜻 다른 말만 차례로
  const wordings = [];
  for (let k = 0; k < 3; k++) {
    await h.expect('wording', `여러 감정: 같은 뜻 다른 말 ${k + 1}`);
    wordings.push(await page.getAttribute('#app > section', 'data-parent'));
    await h.opt(k === 1 ? 2 : 1);
  }
  ok(wordings.join() === 'sad45,mix01,joy28', `[${width}px] 같은 뜻 다른 말을 고른 차례대로 (${wordings.join()})`);
  const scores = [7, 4, 2];
  const intensityWords = [];
  for (let k = 0; k < 3; k++) {
    await h.expect('intensity', `여러 감정: 강도 ${k + 1}`);
    intensityWords.push(await page.getAttribute('#app > section', 'data-emotion'));
    ok((await page.textContent('#app .lead')).includes(`(${k + 1} / 3)`), `[${width}px] 강도 ${k + 1} / 3 표시`);
    if (k === 0) await h.snap('multi-intensity');
    await page.click(`[data-score="${scores[k]}"]`);
  }
  ok(intensityWords.join() === 'sad45,mix01a,joy28', `[${width}px] 감정마다 강도를 물음 (${intensityWords.join()})`);
  await h.expect('cause', '여러 감정: 원인');
  await h.opt(3);
  await h.expect('need', '여러 감정: 욕구');
  const firstNeed = (await optLabels(page))[0];
  ok(firstNeed === D.needs.find((n) => n.id === D.needsByEmotion.sad45[0]).text, `[${width}px] 첫 욕구 보기는 첫 감정(착잡함) 기준`);
  await h.opt(1);
  await passNeedCompare(page, h);
  await h.expect('result', '여러 감정: 결과 카드');
  ok((await page.textContent('[data-testid="result-emotion"]')).includes('착잡함 + 미묘함 + 기쁨'), `[${width}px] 결과 카드에 감정 3개`);
  ok((await page.$$('[data-testid="result-emotion-item"]')).length === 3, `[${width}px] 감정마다 강도 줄 3개`);
  const items = await page.$$eval('[data-testid="result-emotion-item"] .card-value', (els) => els.map((e) => e.textContent));
  ok(items[0].includes('7 / 10') && items[1].includes('4 / 10') && items[2].includes('2 / 10'), `[${width}px] 감정별 강도 ${items.join(' / ')}`);
  const summary = await page.textContent('[data-testid="result-summary"]');
  ok(summary.includes('착잡함, 미묘함과 기쁨을') && summary.includes('필요했어요'), `[${width}px] 한 줄 정리에 세 감정: ${summary}`);
  await h.snap('result-multi');
  const rec = await page.evaluate(() => { const r = window.__maeum.records(); return r[r.length - 1]; });
  ok(rec.emotionId === 'sad45' && rec.emotions.length === 3 && rec.intensity === 7 && rec.emotions[2].family === 'joy', `[${width}px] 기록: 첫 감정 sad45, 감정 3개, 강도 7`);
  await page.click('[data-testid="home"]');
}

function allEmotionIds(D) {
  const out = [];
  D.families.forEach((f) => {
    f.groups.forEach((g) => g.emotions.forEach((e) => { out.push(e.id); (e.same || []).forEach((x) => out.push(x.id)); }));
    f.hidden.forEach((e) => { out.push(e.id); (e.same || []).forEach((x) => out.push(x.id)); });
  });
  return out;
}
/* 욕구를 고른 뒤 비슷한 욕구 구별 화면이 나오면 1번(고른 욕구)을 골라 넘어감 */
async function passNeedCompare(page, h) {
  if ((await h.screen('result')) === 'needCompare') await h.opt(1);
}
const needById = (D, id) => D.needs.find((n) => n.id === id);

/* 욕구 고르기: 단어로 찾기 → 결과 카드, 비슷한 욕구 구별로 다른 욕구 고르기, 넘어가기 */
async function checkNeeds(page, h, width, D) {
  const toNeed = async (sit, wi) => {
    await newGame(page, h, sit);
    await h.opt(1); await h.opt(4); await h.opt(wi); await page.click('[data-testid="pick-next"]'); // 기쁨 / 편안하고 마음이 놓여요 / 2~4번 단어 (같은 감정이 겹치지 않게)
    await passToIntensity(page, h);
    await page.click('[data-score="5"]');
    await h.opt(5); // 원인: 다른 것 (글 없이)
    await page.click('[data-testid="next"]');
    await h.expect('need', '욕구 첫 화면');
  };
  // ① 욕구 단어로 찾기
  await toNeed('욕구 찾기 점검', 2);
  await page.click('[data-testid="need-search-open"]');
  await h.expect('needSearch', '욕구 단어로 찾기');
  const sugg = await page.$$eval('.search-item', (els) => els.map((e) => e.getAttribute('data-id')));
  ok(sugg.join('|') === D.needSearchSuggest.join('|'), `[${width}px] 욕구 찾기: 빈칸이면 핵심 욕구 추천`);
  const fsz = await page.$eval('[data-testid="search-input"]', (e) => parseFloat(getComputedStyle(e).fontSize));
  ok(fsz >= 16, `[${width}px] 욕구 찾기 입력칸 글자 ${fsz}px`);
  const cases = [['인정받고 싶었다', '노력 인정'], ['위로받고 싶었어요', '위로'], ['사과', '진심 어린 사과'], ['존중받고 싶다', '존중'], ['안전하고 싶었다', '안전함'], ['혼자', '혼자만의 시간']];
  for (const [q, w] of cases) {
    await page.fill('[data-testid="search-input"]', q);
    const first = (await page.textContent('.search-item >> nth=0 >> .opt-label', { timeout: 2000 }).catch(() => '')).trim();
    ok(first === w, `[${width}px] 욕구 찾기 "${q}" → 첫 결과 "${w}" (실제 ${first})`);
  }
  await page.fill('[data-testid="search-input"]', '인정받고 싶었다');
  await h.snap('need-search');
  await page.click('.search-item >> nth=0');
  await h.expect('result', '욕구 찾기 → 결과 카드 (구별 화면 건너뜀)');
  ok((await page.textContent('[data-testid="result-need"]')).includes('노력 인정'), `[${width}px] 찾은 욕구 "노력 인정"이 결과 카드에 나옴`);
  await page.click('[data-testid="home"]');
  // ② 비슷한 욕구 구별: 욕구 쪽 → 이어짐 → 들어 줌 → 구별 화면에서 위로를 고름
  await toNeed('욕구 구별 점검', 3);
  await h.opt(5);
  await h.expect('needGroup', '욕구 쪽');
  const gi = D.needGroups.findIndex((g) => g.needs.includes('con1'));
  await h.opt(gi + 1);
  await h.expect('needWords', '이어짐 욕구');
  await h.opt(D.needGroups[gi].needs.indexOf('con1') + 1);
  await h.expect('needCompare', '비슷한 욕구 구별');
  const set = D.needCompareSets.find((c) => c.ids.includes('con1')).ids;
  const order = ['con1', ...set.filter((x) => x !== 'con1')];
  const labels = await optLabels(page);
  ok(labels.join('|') === order.map((id) => needById(D, id).ask).join('|'), `[${width}px] 욕구 구별 문장: ${labels.join(' / ')}`);
  await h.snap('need-compare');
  await h.opt(order.indexOf('con6') + 1);
  await h.expect('result', '욕구 구별 → 결과 카드');
  ok((await page.textContent('[data-testid="result-need"]')).includes('위로'), `[${width}px] 구별 문장으로 고른 "위로"가 결과 카드에 나옴`);
  ok((await page.textContent('[data-testid="result-summary"]')).includes(needById(D, 'con6').text.slice(0, 6)), `[${width}px] 한 줄 정리에 고른 욕구 문장`);
  await page.click('[data-testid="home"]');
  // ③ 지금은 넘어가기
  await toNeed('욕구 넘어가기 점검', 4);
  await page.click('[data-testid="need-skip"]');
  await h.expect('result', '욕구 넘어가기 → 결과 카드');
  ok((await page.textContent('[data-testid="result-need"]')).includes('이름 붙이기 어려운 욕구'), `[${width}px] 넘어가면 "이름 붙이기 어려운 욕구"로 저장`);
  await page.click('[data-testid="home"]');
}

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
