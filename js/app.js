/*
  © 2026 Jaecheol, LIM. All rights reserved. Unauthorized copying or distribution is prohibited.
  감정 및 욕구 찾기 — 화면 동작 코드
  문장과 낱말은 data 폴더의 파일에 있어요. 이 파일은 고치지 않아도 돼요.
  지켜야 할 설계 규칙: docs/design-rules.md
*/
(function () {
  'use strict';

  var D = window.MAEUM_DATA || {};
  var STORE_KEY = 'maeum-chatgi-v1';
  var app = document.getElementById('app');

  /* ───────── 데이터 점검 ───────── */
  function checkData() {
    var missing = [];
    if (!D.quadrants) missing.push('data/emotions.js');
    if (!D.needs || !D.needCategories) missing.push('data/needs.js');
    if (!D.text || !D.causes || !D.approaches) missing.push('data/questions.js');
    return missing;
  }

  var missing = checkData();
  if (missing.length) {
    app.innerHTML = '';
    app.appendChild(el('section', { class: 'screen', 'data-screen': 'data-error' },
      el('h1', { class: 'title' }, '데이터 파일에 문제가 있어요'),
      el('p', { class: 'body-text' }, '다음 파일을 고치다가 따옴표나 쉼표가 빠졌을 수 있어요. 마지막으로 고친 부분을 다시 확인해 주세요.'),
      el('ul', { class: 'plain-list' }, missing.map(function (m) { return el('li', null, m); }))
    ));
    return;
  }

  var T = D.text;

  /* ───────── 찾아보기용 목록 ───────── */
  var EMO = {};          // id → { id, word, desc, family(기분 칸 id), cat(범주 id), hidden, parent, same }
  var FAMILY = {};       // 기분 칸 id → { id, label, short, emoji, color, met }
  var CAT = {};          // 감정 범주 id → { id, label, quad, ids(같은 뜻 다른 말 포함) }
  var ALL_WORDS = [];    // 도감에 들어가는 감정 전체 (같은 뜻 다른 말 포함)
  var QUAD_EMOJI = { yellow: '🟡', green: '🟢', red: '🔴', blue: '🔵' };
  function addEmotion(e, q, cat, list) {
    var main = { id: e.id, word: e.word, desc: e.desc, ask: e.ask || '', family: q.id, cat: cat ? cat.id : null, hidden: !!e.hidden, parent: null, same: [] };
    EMO[e.id] = main;
    if (list) list.push(main);
    if (cat) CAT[cat.id].ids.push(e.id);
    (e.same || []).forEach(function (x) {
      if (!x || !x.id || !x.word) return;
      EMO[x.id] = { id: x.id, word: x.word, desc: x.desc || e.desc, family: q.id, cat: cat ? cat.id : null, hidden: !!e.hidden, parent: e.id, same: [] };
      main.same.push(x.id);
      if (list) list.push(EMO[x.id]);
      if (cat) CAT[cat.id].ids.push(x.id);
    });
  }
  D.quadrants.forEach(function (q) {
    FAMILY[q.id] = { id: q.id, label: q.name + ' · ' + q.label, short: q.name, emoji: QUAD_EMOJI[q.id] || '●', color: q.color, met: !!q.met };
    q.categories.forEach(function (c) {
      CAT[c.id] = { id: c.id, label: c.label, quad: q.id, ids: [] };
      c.emotions.forEach(function (e) { addEmotion(e, q, c, ALL_WORDS); });
    });
  });
  FAMILY.retired = { id: 'retired', label: '예전 낱말', short: '예전', emoji: '◽', color: '#8A93A3', met: false };
  (D.retiredEmotions || []).forEach(function (e) { addEmotion(e, FAMILY.retired, null, null); });
  var UNNAMED = D.unnamedEmotion || { id: 'unnamed', word: '이름 붙이기 어려운 감정', desc: '' };
  EMO[UNNAMED.id] = { id: UNNAMED.id, word: UNNAMED.word, desc: UNNAMED.desc, family: 'unknown', hidden: false, same: [] };
  FAMILY.unknown = { id: 'unknown', label: '이름 붙이기 어려운 감정', short: '?', emoji: '☁️', color: '#7A8291', met: false };
  function famOf(e) { return (e && FAMILY[e.family]) || FAMILY.unknown; }

  var NEED = {};
  D.needs.forEach(function (n) { NEED[n.id] = n; });
  var UNNAMED_NEED = D.unnamedNeed || { id: 'unnamedNeed', word: '이름 붙이기 어려운 욕구', text: '아직 이름을 찾지 못한 욕구', tip: '' };
  NEED[UNNAMED_NEED.id] = UNNAMED_NEED;
  var NCAT = {}, NEED_CAT_OF = {};
  D.needCategories.forEach(function (c) { NCAT[c.id] = c; c.needs.forEach(function (id) { NEED_CAT_OF[id] = c.id; }); });

  var CAUSE = {};
  D.causes.forEach(function (c) { CAUSE[c.id] = c; });

  /* ───────── 작은 도구들 ───────── */
  function el(tag, props) {
    var n = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(n, arguments[i]);
    return n;
  }
  function append(n, kid) {
    if (kid === null || kid === undefined || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { append(n, k); }); return; }
    n.appendChild(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseKey(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function prettyDate(d) { return (d.getMonth() + 1) + '월 ' + d.getDate() + '일'; }
  function prettyDateTime(iso) {
    var d = new Date(iso);
    var days = ['일', '월', '화', '수', '목', '금', '토'];
    return d.getFullYear() + '년 ' + prettyDate(d) + ' (' + days[d.getDay()] + ') ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /* 받침에 따라 을/를, 이/가 등을 고르기 */
  function batchim(word) {
    var s = String(word).replace(/[\s"'”’」』)\].,!?…·]+$/, '');
    if (!s) return null;
    var c = s.charCodeAt(s.length - 1);
    if (c >= 0xAC00 && c <= 0xD7A3) {
      var j = (c - 0xAC00) % 28;
      if (j === 0) return 'none';
      return j === 8 ? 'rieul' : 'yes';
    }
    var digit = { '0': 'yes', '1': 'rieul', '2': 'none', '3': 'yes', '4': 'none', '5': 'none', '6': 'yes', '7': 'rieul', '8': 'rieul', '9': 'none' };
    var last = s.charAt(s.length - 1);
    return digit[last] || null;
  }
  var JOSA = { '을': ['을', '를'], '를': ['을', '를'], '이': ['이', '가'], '가': ['이', '가'], '은': ['은', '는'], '는': ['은', '는'], '과': ['과', '와'], '와': ['과', '와'], '으로': ['으로', '로'], '로': ['으로', '로'] };
  function josa(word, j) {
    var pair = JOSA[j];
    if (!pair) return word + j;
    var b = batchim(word);
    if (b === null) return word + pair[0] + '(' + pair[1] + ')';
    if (pair[0] === '으로') return word + (b === 'yes' ? '으로' : '로');
    return word + (b === 'none' ? pair[1] : pair[0]);
  }
  function fill(tpl, vals) {
    return String(tpl).replace(/\{(원인|감정|강도|욕구|바람|글)(을|를|이|가|은|는|과|와|으로|로)?\}/g, function (all, name, j) {
      var v = vals[name];
      if (v === undefined) return all;
      return j ? josa(v, j) : v;
    });
  }

  /* ───────── 저장 ───────── */
  var memoryStore = null;
  var storageOK = true;
  function load() {
    if (memoryStore) return memoryStore;
    var data = { version: 1, records: [] };
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.records)) data = parsed;
      }
    } catch (e) { storageOK = false; }
    /* 감정이 다른 쪽으로 옮겨 갔으면 지난 기록의 쪽 값도 지금 데이터에 맞춰요 (id는 그대로) */
    data.records.forEach(function (r) {
      if (r && EMO[r.emotionId] && EMO[r.emotionId].family !== 'unknown') r.family = EMO[r.emotionId].family;
      if (r && Array.isArray(r.emotions)) r.emotions.forEach(function (x) { if (x && EMO[x.id] && EMO[x.id].family !== 'unknown') x.family = EMO[x.id].family; });
    });
    memoryStore = data;
    return data;
  }
  function save(data) {
    memoryStore = data;
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(data)); storageOK = true; }
    catch (e) { storageOK = false; }
  }
  function records() { return load().records; }
  function addRecord(r) { var d = load(); d.records.push(r); save(d); }
  function updateRecord(id, patch) {
    var d = load();
    d.records.forEach(function (r) { if (r.id === id) Object.keys(patch).forEach(function (k) { if (patch[k] === undefined) delete r[k]; else r[k] = patch[k]; }); });
    save(d);
  }
  /* 사용 방법을 본 적이 있는지 (기록과 따로 저장해서 기록을 지워도 다시 안 나와요) */
  var INTRO_KEY = 'maeum-chatgi-intro-seen';
  var introSeenMemory = false;
  function introSeen() {
    if (introSeenMemory) return true;
    try { return window.localStorage.getItem(INTRO_KEY) === '1'; } catch (e) { return false; }
  }
  function markIntroSeen() {
    introSeenMemory = true;
    try { window.localStorage.setItem(INTRO_KEY, '1'); } catch (e) { /* 무시 */ }
  }

  var BIG_KEY = 'maeum-chatgi-bigtext';
  function bigText() {
    try { return window.localStorage.getItem(BIG_KEY) === '1'; } catch (e) { return document.documentElement.classList.contains('big-text'); }
  }
  function setBigText(on) {
    try { if (on) window.localStorage.setItem(BIG_KEY, '1'); else window.localStorage.removeItem(BIG_KEY); } catch (e) { /* 무시 */ }
    document.documentElement.classList.toggle('big-text', !!on);
  }
  document.documentElement.classList.toggle('big-text', bigText());
  function clearAll() {
    memoryStore = { version: 1, records: [] };
    try { window.localStorage.removeItem(STORE_KEY); } catch (e) { /* 무시 */ }
  }

  /* 기록 하나에 든 감정들. 여러 감정을 고른 기록은 emotions 목록이 있고, 옛 기록은 감정 하나예요 */
  function recEmotions(r) {
    if (r && Array.isArray(r.emotions) && r.emotions.length) return r.emotions;
    return [{ id: r.emotionId, word: r.emotionWord, family: r.family, hidden: !!r.hidden, intensity: r.intensity }];
  }
  function foundSet(recs) {
    var s = {};
    (recs || records()).forEach(function (r) {
      recEmotions(r).forEach(function (x) { if (EMO[x.id] && x.id !== UNNAMED.id) s[x.id] = true; });
    });
    return s;
  }
  function streak() {
    var days = {};
    records().forEach(function (r) { days[r.date] = true; });
    var today = new Date();
    var d = today;
    if (!days[dateKey(d)]) {
      d = addDays(today, -1);
      if (!days[dateKey(d)]) return 0;
    }
    var n = 0;
    while (days[dateKey(d)]) { n++; d = addDays(d, -1); }
    return n;
  }

  /* ───────── 화면 이동 ───────── */
  var current = { screen: 'home', params: {} };
  var draft = null;
  var stack = [];

  function go(screen, params, opts) {
    opts = opts || {};
    if (opts.push !== false) {
      stack.push({ screen: current.screen, params: current.params, draft: draft ? clone(draft) : null });
      try { history.pushState({ maeum: stack.length }, ''); } catch (e) { /* 무시 */ }
    }
    current = { screen: screen, params: params || {} };
    render();
  }
  function goHome() {
    stack = [];
    draft = null;
    current = { screen: 'home', params: {} };
    render();
  }
  /* 이전 단계로 돌아가도 남겨 두는 것: 적은 글, 고른 감정·강도·보류·뺀 감정·원인·욕구, 만든 마음 카드 (docs/design-rules.md 6번) */
  var CARRY = ['situation', 'picks', 'pathOf', 'lastPick', 'intensities', 'held', 'removed', 'cause', 'causeText',
    'needs', 'lastNeed', 'hintNeeds', 'searchText', 'needSearchText', 'recordId', 'thoughts', 'bodyPicks',
    'bodyLevels', 'fit', 'emoBody', 'bodyText'];
  function internalBack() {
    if (!stack.length) {
      if (current.screen !== 'home') goHome();
      return;
    }
    var prev = stack.pop();
    /* 이전 화면으로 가도 고른 감정·강도·욕구는 그대로 둬요 (찾기 화면에서 고른 것이 사라지지 않게) */
    var keep = draft;
    draft = prev.draft;
    if (keep && draft) CARRY.forEach(function (k) { if (keep[k] !== undefined) draft[k] = keep[k]; });
    current = { screen: prev.screen, params: prev.params };
    if (current.screen === 'home') { draft = null; stack = []; }
    render();
  }
  function back() {
    if (stack.length) { history.back(); } else { internalBack(); }
  }
  window.addEventListener('popstate', function () { internalBack(); });

  /* ───────── 공통 화면 조각 ───────── */
  var STEP_OF = {
    situation: 1, emotion: 2, words: 2, search: 2, thought: 2, thoughtFeel: 2, approach: 2, bodyWords: 2, unnamed: 2,
    intensity: 3, cause: 4, causeOther: 4, need: 5, needSearch: 5, result: 6
  };

  function topBar() {
    var step = STEP_OF[current.screen];
    var label = step ? step + ' / 6 · ' + T.steps[step - 1] : '';
    return el('header', { class: 'topbar' },
      el('button', { class: 'top-btn', type: 'button', onclick: back, 'aria-label': '이전 화면' }, '← 이전'),
      el('span', { class: 'top-step' }, label),
      el('button', { class: 'top-btn', type: 'button', onclick: goHome, 'aria-label': '그만하고 처음 화면으로' }, '그만하기')
    );
  }
  function progress() {
    var step = STEP_OF[current.screen] || 0;
    var dots = [];
    for (var i = 1; i <= 6; i++) dots.push(el('span', { class: 'dot' + (i <= step ? ' on' : '') }));
    return el('div', { class: 'progress', 'aria-hidden': 'true' }, dots);
  }
  function simpleTop(title) {
    return el('header', { class: 'topbar' },
      el('button', { class: 'top-btn', type: 'button', onclick: back, 'aria-label': '이전 화면' }, '← 이전'),
      el('span', { class: 'top-step' }, title),
      el('span', { class: 'top-spacer' })
    );
  }
  /* 아래쪽 이동 막대 — 처음 화면을 뺀 모든 화면에 같은 모양으로 붙어요 (docs/design-rules.md 8번)
     왼쪽 "← 이전"(흰 단추), 오른쪽 "다음 →"(파란 단추). 두 단추는 크기·자리가 늘 같아요.
     cfg.next = { label, onClick, disabled, testid, kind: 'danger' | 'guide' } */
  function navBar(cfg) {
    cfg = cfg || {};
    var b = cfg.back || {};
    var n = cfg.next || {};
    return [
      el('div', { class: 'navbar-space', 'aria-hidden': 'true' }),
      el('nav', { class: 'navbar', 'aria-label': '화면 이동', 'data-testid': 'navbar' },
        el('button', { class: 'nav-btn nav-back', type: 'button', 'data-testid': b.testid || 'nav-back', onclick: b.onClick || back }, '← ' + (b.label || T.navBack || '이전')),
        el('button', {
          class: 'nav-btn nav-next' + (n.kind ? ' nav-' + n.kind : ''), type: 'button', 'data-testid': n.testid || 'nav-next',
          disabled: !!n.disabled, onclick: n.onClick || null
        }, (n.label || T.navNext || '다음') + (n.kind === 'danger' ? '' : ' →'))
      )
    ];
  }
  /* 처음 화면에서 연 화면(도감·보고서·지난 기록·기록 옮기기)의 이동 막대 */
  function menuNav() {
    return navBar({ next: { label: T.navNewRecord || '새 기록 시작', onClick: startGame } });
  }
  function option(num, label, hint, onClick, opts) {
    opts = opts || {};
    return el('button', {
      class: 'opt' + (num === 5 && !opts.tile ? ' opt-five' : '') + (opts.cls ? ' ' + opts.cls : ''),
      type: 'button',
      'data-num': String(num),
      'data-id': opts.id || null,
      'aria-pressed': opts.pressed === undefined ? null : String(!!opts.pressed),
      style: opts.color ? '--accent:' + opts.color : null,
      onclick: onClick
    },
      el('span', { class: 'opt-num', 'aria-hidden': 'true' }, opts.icon || String(num)),
      el('span', { class: 'opt-body' },
        el('span', { class: 'opt-label' }, label),
        hint ? el('span', { class: 'opt-hint' }, hint) : null
      )
    );
  }
  function fiveOption(label, hint) {
    return option(5, label || T.noneOfThese, hint || T.noneOfTheseHint, emotionFive);
  }
  function screen(name, attrs) {
    var props = { class: 'screen', 'data-screen': name };
    Object.keys(attrs || {}).forEach(function (k) { props[k] = attrs[k]; });
    var kids = Array.prototype.slice.call(arguments, 2);
    return el.apply(null, ['section', props].concat(kids));
  }
  function heading(text, small) {
    return el('div', { class: 'heading' },
      small ? el('p', { class: 'lead' }, small) : null,
      el('h1', { class: 'title', tabindex: '-1' }, text)
    );
  }
  /* 번호 붙은 묶음 제목 (감정·욕구 고르기 화면을 1 → 2 → 3 차례로 보이게) */
  function secHead(num, title, hint) {
    return el('div', { class: 'sec-head' },
      el('h2', { class: 'sec-title' }, el('span', { class: 'sec-num', 'aria-hidden': 'true' }, String(num)), el('span', null, title)),
      hint ? el('p', { class: 'guide' }, hint) : null);
  }
  /* "다른 방법" 줄 단추 (그림 · 이름 · 한 줄 설명 · ›) */
  function wayBtn(icon, title, hint, onClick, testid) {
    return el('button', { class: 'way', type: 'button', onclick: onClick, 'data-testid': testid },
      el('span', { class: 'way-icon', 'aria-hidden': 'true' }, icon),
      el('span', { class: 'way-body' }, el('span', { class: 'way-title' }, title), hint ? el('span', { class: 'way-hint' }, hint) : null),
      el('span', { class: 'way-go', 'aria-hidden': 'true' }, '›'));
  }
  function toast(msg) {
    var t = el('div', { class: 'toast', role: 'status' }, msg);
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 2600);
  }

  /* ───────── 진행 ───────── */
  function startGame() {
    draft = {
      situation: '', five: 0, path: 'normal', picks: [], pathOf: {}, intensities: {},
      cause: null, causeText: '', needs: [], hintNeeds: [], held: [], removed: [], recordId: null,
      openQuad: null, thoughts: [], bodyPicks: [], lastPick: null, openNeedCat: null, lastNeed: null,
      bodyLevels: {}, fit: {}, emoBody: {}, bodyText: ''
    };
    stack = [];
    go('situation', {});
  }

  /* 지난 기록 고치기: 그 기록을 처음 단계부터 다시 열어요. 끝까지 가면 같은 기록이 고쳐져요 */
  function editRecord(r) {
    var list = recEmotions(r).filter(function (x) { return EMO[x.id]; });
    var held = (r.held || []).filter(function (x) { return EMO[x.id]; }).map(function (x) { return x.id; });
    var intens = {};
    list.forEach(function (x) { intens[x.id] = x.intensity; });
    var ids = list.map(function (x) { return x.id; });
    draft = {
      situation: r.situation || '', five: 0, path: r.path || 'normal',
      picks: ids.concat(held.filter(function (id) { return ids.indexOf(id) === -1; })), pathOf: {}, intensities: intens,
      cause: CAUSE[r.cause] ? r.cause : null, causeText: r.causeText || '',
      needs: recNeeds(r).filter(function (id) { return NEED[id] && id !== UNNAMED_NEED.id; }), hintNeeds: [],
      held: held, removed: [], recordId: r.id, editTs: r.ts,
      openQuad: null, thoughts: [], lastPick: null, openNeedCat: null, lastNeed: null,
      bodyPicks: (r.body || []).map(function (x) { return x.id; }).filter(function (id) { return BODY[id]; }),
      bodyLevels: (r.body || []).reduce(function (a, x) { if (BODY[x.id] && x.level) a[x.id] = x.level; return a; }, {}),
      fit: clone(r.fit || {}), emoBody: clone(r.emoBody || {}), bodyText: ''
    };
    go('situation', {});
  }
  function editNote() {
    if (!draft || !draft.editTs) return null;
    return el('p', { class: 'edit-note', 'data-testid': 'edit-note' }, '✏️ ' + prettyDateTime(draft.editTs) + ' ' + (T.editNote || '기록을 고치는 중이에요. 끝까지 가면 이 기록이 고쳐져요.'));
  }
  function deleteRecord(id) {
    var d = load();
    d.records = d.records.filter(function (r) { return r.id !== id; });
    save(d);
  }
  /* "잘 모르겠어요"·"이 중엔 없어요": 다음 질문 방법으로 가요.
     세는 값(five)은 화면을 옮긴 뒤에 바꿔요. 그래야 이전으로 돌아왔을 때 앞 화면의 값이 그대로 남아요 */
  function emotionFive() {
    var n = (draft.five || 0) + 1;
    if (n <= D.approaches.length) go('approach', { index: n - 1 });
    else go('unnamed', {});
    draft.five = n;
  }
  /* "몸의 느낌으로 찾기": 몸의 느낌 화면으로 바로 가요. 거기서 "이 중엔 없어요"를 누르면 다음 방법(행동)으로 이어져요 */
  function bodyOpen() {
    go('approach', { index: 0 });
    draft.five = 1;
  }

  /* 감정 고르기 — 개수 제한이 없어요. 한 칸·한 범주에서만 고르게 하지 않아요 (docs/design-rules.md 1번)
     draft.picks = 고른 감정 id (고른 차례) */
  function picks() { return (draft && draft.picks) || []; }
  function isPicked(id) { return picks().indexOf(id) !== -1; }
  function togglePick(id, path) {
    if (!draft.picks) draft.picks = [];
    if (!draft.pathOf) draft.pathOf = {};
    var at = draft.picks.indexOf(id);
    if (at !== -1) {
      draft.picks.splice(at, 1);
      if (draft.lastPick === id) draft.lastPick = null;
    } else {
      draft.picks.push(id);
      draft.lastPick = id;
      draft.pathOf[id] = path || 'normal';
    }
    refresh();
  }
  function heldIds() { return (draft && draft.held) || []; }
  /* 강도를 고르는 감정 = 고른 감정에서 보류한 것을 뺀 것 */
  function activeEmotions() {
    var ids = draft.emotions && draft.emotions.length ? draft.emotions : (draft.emotionId ? [draft.emotionId] : []);
    return ids.filter(function (id) { return EMO[id] && heldIds().indexOf(id) === -1; });
  }
  function pickNext() {
    if (!picks().length) return;
    draft.emotions = picks().slice();
    draft.held = heldIds().filter(function (id) { return isPicked(id); });
    draft.removed = ((draft && draft.removed) || []).filter(function (id) { return !isPicked(id); });
    draft.emotionId = draft.emotions[0];
    draft.path = (draft.pathOf && draft.pathOf[draft.emotionId]) || 'normal';
    if (!draft.intensities) draft.intensities = {};
    go('intensity', {});
  }

  /* 고른 감정 막대 (위쪽에 붙어 있어요). 낱말 옆 ✕를 누르면 빼요 */
  function pickBar() {
    var ps = picks();
    if (!ps.length) return null; /* 아무것도 안 골랐을 때는 막대를 숨겨 첫 화면을 단순하게 둬요 */
    return el('div', { class: 'pick-bar', 'data-testid': 'pick-bar' },
      el('div', { class: 'pick-head' },
        el('p', { class: 'pick-title' }, fill(T.pickTitle || '고른 감정 {글}개', { '글': String(ps.length) }))
      ),
      ps.length ? el('div', { class: 'pick-chips' }, ps.map(function (id) {
        var e = EMO[id];
        return el('button', { class: 'pick-chip', type: 'button', 'data-pick': id, 'aria-label': e.word + ' 빼기', style: '--accent:' + famOf(e).color, onclick: function () { togglePick(id); } }, e.word + ' ✕');
      })) : null
    );
  }

  function afterCause() { go('need', {}); }

  /* 욕구 후보: "네"였던 욕구 → 생각이 섞인 말·5번 경로에서 나온 욕구 → 감정별 목록 → 감정 범주별 목록.
     "아니요"가 더 많았던 욕구는 빼요. ("잘 모르겠음"은 그대로) 경향일 뿐 정답이 아니에요. */
  function mainKey(id) { var e = EMO[id]; return e ? (e.parent || e.id) : id; }
  function recNeeds(r) {
    if (r && Array.isArray(r.needIds) && r.needIds.length) return r.needIds;
    return r && r.needId ? [r.needId] : [];
  }
  function needFeedback(key) {
    var score = {};
    records().forEach(function (r) {
      if (!r.needFit) return;
      if (!recEmotions(r).some(function (x) { return mainKey(x.id) === key; })) return;
      recNeeds(r).forEach(function (nid) {
        score[nid] = (score[nid] || 0) + (r.needFit === 'yes' ? 1 : r.needFit === 'no' ? -1 : 0);
      });
    });
    return score;
  }
  var MAX_SUGGEST = 12;
  function needCandidates() {
    var ids = activeEmotions();
    var keys = ids.map(mainKey);
    var scores = keys.map(needFeedback);
    var bad = {}, out = [];
    scores.forEach(function (sc) { Object.keys(sc).forEach(function (id) { if (sc[id] < 0) bad[id] = true; }); });
    function add(id) { if (out.length < MAX_SUGGEST && NEED[id] && id !== UNNAMED_NEED.id && out.indexOf(id) === -1 && !bad[id]) out.push(id); }
    scores.forEach(function (sc) { Object.keys(sc).filter(function (id) { return sc[id] > 0; }).sort(function (a, b) { return sc[b] - sc[a]; }).forEach(add); });
    (draft.hintNeeds || []).forEach(add);
    thoughtNeedIds().forEach(add);
    keys.forEach(function (k) { ((D.needsByEmotion || {})[k] || []).forEach(add); });
    ids.forEach(function (id) { var e = EMO[id]; if (e.cat) ((D.needsByCategory || {})[e.cat] || []).forEach(add); });
    return out;
  }

  /* 욕구 고르기 — 개수 제한 없음. draft.needs = 고른 욕구 id */
  function needPicks() { return (draft && draft.needs) || []; }
  function isNeedPicked(id) { return needPicks().indexOf(id) !== -1; }
  function toggleNeed(id) {
    if (!draft.needs) draft.needs = [];
    var at = draft.needs.indexOf(id);
    if (at !== -1) { draft.needs.splice(at, 1); if (draft.lastNeed === id) draft.lastNeed = null; }
    else { draft.needs.push(id); draft.lastNeed = id; }
    refresh();
  }

  function intensityWord(n) {
    var w = D.intensityWords || [];
    return w[n - 1] || '';
  }

  /* 이름 잇기: 서운함 / 서운함과 미안함 / 서운함, 미안함과 착잡함 */
  function joinWords(words) {
    if (words.length <= 1) return words[0] || '';
    var last = words[words.length - 1];
    var rest = words.slice(0, -1);
    return (rest.length > 1 ? rest.slice(0, -1).join(', ') + ', ' : '') + josa(rest[rest.length - 1], '과') + ' ' + last;
  }

  function finish() {
    var editing = draft.recordId && records().some(function (r) { return r.id === draft.recordId; });
    var before = foundSet(records().filter(function (r) { return r.id !== draft.recordId; }));
    var ids = activeEmotions();
    if (!ids.length) ids = [draft.emotionId];
    var held = heldIds().filter(function (id) { return EMO[id]; }).map(function (id) { return { id: id, word: EMO[id].word }; });
    var list = ids.map(function (id) {
      var x = EMO[id];
      var n = (draft.intensities && draft.intensities[id]) || draft.intensity || 1;
      return { id: x.id, word: x.word, family: x.family, hidden: !!x.hidden, intensity: n };
    });
    var e = list[0];
    var maxN = list.reduce(function (a, x) { return Math.max(a, x.intensity); }, 0);
    var nids = needPicks().filter(function (id) { return NEED[id] && id !== UNNAMED_NEED.id; });
    var needs = nids.map(function (id) { return NEED[id]; });
    var cause = CAUSE[draft.cause] || CAUSE.other;
    var causeSentence = cause.sentence;
    if (draft.cause === 'other' && draft.causeText && cause.sentenceWithText) {
      causeSentence = fill(cause.sentenceWithText, { '글': draft.causeText });
    }
    var tpl;
    if (!needs.length) tpl = T.summaryNoNeed;
    else if (list.every(function (x) { return famOf(x).met; })) tpl = T.summaryMet;
    else tpl = T.summaryUnmet;
    var needPhrase = needs.length === 1 ? needs[0].text : joinWords(needs.map(function (n) { return n.word; }));
    var summary = fill(tpl, { '원인': causeSentence, '감정': joinWords(list.map(function (x) { return x.word; })), '강도': intensityWord(maxN), '욕구': needPhrase, '바람': needPhrase });
    var first = needs[0];
    var now = new Date();
    var rec = {
      id: 'r' + now.getTime() + Math.floor(Math.random() * 1000),
      ts: now.toISOString(),
      date: dateKey(now),
      situation: draft.situation,
      family: e.family,
      emotionId: e.id,
      emotionWord: e.word,
      hidden: list.some(function (x) { return x.hidden; }),
      intensity: e.intensity,
      emotions: list,
      cause: draft.cause,
      causeText: draft.causeText || '',
      needId: first ? first.id : UNNAMED_NEED.id,
      needWord: first ? needs.map(function (n) { return n.word; }).join(', ') : UNNAMED_NEED.word,
      summary: summary,
      path: draft.path,
      five: draft.five || 0
    };
    rec.needIds = nids.length > 1 ? nids : undefined;
    rec.held = held.length ? held : undefined;
    /* 몸의 느낌(세기 포함)·감정별 몸의 곳·"몸의 느낌에 대 보면" 답 (docs/body-reactions.md 5-6(1)(2)(4)(7)) */
    var bps = bodyPicks();
    rec.body = bps.length ? bps.map(function (id) {
      var lv = (draft.bodyLevels || {})[id];
      return { id: id, label: BODY[id].label, area: BODY[id].area, level: lv || undefined };
    }) : undefined;
    var eb = {}, ft = {};
    list.forEach(function (x) {
      var a = ((draft.emoBody || {})[x.id] || []).filter(function (aid) { return AREA[aid]; });
      if (a.length) eb[x.id] = a;
      var v = (draft.fit || {})[x.id];
      if (v === 'exact' || v === 'close') ft[x.id] = v;
    });
    rec.emoBody = Object.keys(eb).length ? eb : undefined;
    rec.fit = Object.keys(ft).length ? ft : undefined;
    if (editing) {
      /* 마음 카드에서 이전으로 돌아가 고친 뒤 다시 만들면: 새 기록을 더하지 않고 같은 카드를 고쳐요.
         처음 만든 날짜·시각과 "고른 욕구가 맞았나요?" 답은 그대로 둬요 */
      var patch = {};
      Object.keys(rec).forEach(function (k) { if (k !== 'id' && k !== 'ts' && k !== 'date') patch[k] = rec[k]; });
      updateRecord(draft.recordId, patch);
    } else {
      addRecord(rec);
      draft.recordId = rec.id;
    }
    var isNew = list.some(function (x) { return x.id !== UNNAMED.id && !before[x.id]; });
    go('result', { id: draft.recordId, isNew: isNew });
  }

  /* ───────── 화면들 ───────── */
  var screens = {};

  screens.home = function () {
    var recs = records();
    var found = Object.keys(foundSet(recs)).length;
    var s = streak();
    return screen('home', null,
      el('div', { class: 'home-top' },
        el('button', {
          class: 'text-size' + (bigText() ? ' on' : ''), type: 'button', 'aria-pressed': String(bigText()), 'data-testid': 'big-text',
          onclick: function () { setBigText(!bigText()); refresh(); }
        }, el('span', { class: 'text-size-mark', 'aria-hidden': 'true' }, bigText() ? '✓' : '가'), ' ' + (T.bigText || '글자 크게')),
        el('button', { class: 'guide-link', type: 'button', onclick: function () { go('guide', {}); }, 'data-testid': 'menu-guide' }, T.guideButton || '사용 방법')
      ),
      el('div', { class: 'hero' },
        el('h1', { class: 'app-title', tabindex: '-1' }, T.appTitle),
        el('p', { class: 'app-sub' }, T.appSubtitle)
      ),
      el('button', { class: 'btn btn-primary btn-big btn-start', type: 'button', onclick: startGame, 'data-testid': 'start' }, T.startButton),
      el('p', { class: 'encourage' }, T.homeEncourage),
      el('div', { class: 'home-foot' },
        /* 기록 요약 한 줄: 기록이 있을 때만, 메뉴 바로 위 아래쪽에 */
        recs.length ? el('p', { class: 'home-stats', 'data-testid': 'home-stats' },
          el('span', { 'data-testid': 'stat-count' }, fill(T.statRecords || '기록 {글}개', { '글': String(recs.length) })), ' · ',
          el('span', { 'data-testid': 'stat-dex' }, fill(T.statDex || '도감 {글}', { '글': found + ' / ' + ALL_WORDS.length })), ' · ',
          el('span', { 'data-testid': 'stat-streak' }, fill(T.statStreak || '연속 {글}일', { '글': String(s) }))
        ) : null,
        /* 메뉴 4개는 한 줄로 */
        el('nav', { class: 'menu-row', 'aria-label': '메뉴' },
          menuBtn('📖', T.menuDex || '감정 도감', function () { go('dex', {}); }, 'menu-dex'),
          menuBtn('📊', T.menuReport || '주간 보고서', function () { go('report', { offset: 0 }); }, 'menu-report'),
          menuBtn('📋', T.menuRecords || '지난 기록', function () { go('records', {}); }, 'menu-records'),
          menuBtn('💾', T.menuBackup || '기록 옮기기', function () { go('backup', {}); }, 'menu-backup')
        ),
        el('p', { class: 'privacy' }, T.privacy),
        !storageOK ? el('p', { class: 'warn' }, '이 브라우저에서는 기록이 저장되지 않을 수 있어요. 일반 창(시크릿 창이 아닌 창)으로 열어 주세요.') : null,
        el('button', { class: 'btn btn-quiet-danger', type: 'button', onclick: function () { go('deleteConfirm', {}); }, 'data-testid': 'delete-all' }, '기록 전체 삭제'),
        /* 저작권 표시: 흐릿한 영어로 작게 (docs/design-rules.md 2번) */
        el('p', { class: 'copyright', 'data-testid': 'copyright', lang: 'en' }, T.copyright || '© 2026 Jaecheol, LIM. All rights reserved.')
      )
    );
  };
  function statTile(icon, label, value, testid) {
    return el('div', { class: 'stat', 'data-testid': testid },
      el('span', { class: 'stat-icon', 'aria-hidden': 'true' }, icon),
      el('span', { class: 'stat-value' }, value),
      el('span', { class: 'stat-label' }, label)
    );
  }
  function menuBtn(icon, label, onClick, testid) {
    return el('button', { class: 'menu-btn', type: 'button', onclick: onClick, 'data-testid': testid },
      el('span', { class: 'menu-icon', 'aria-hidden': 'true' }, icon),
      el('span', { class: 'menu-label' }, label)
    );
  }

  var deferredInstall = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstall = e;
    if (current.screen === 'guide') refresh();
  });
  /* 홈 화면에 설치하는 방법 (사용 방법 화면 안에 있어요) */
  /* 앱 주소: 지금 열린 주소에서 파일 이름·뒤 표시를 뺀 것 */
  function appAddress() {
    var u = location.origin + location.pathname.replace(/[^/]*$/, '');
    return /^https?:/.test(u) ? u : 'https://limjc9-sys.github.io/maeum-chatgi/';
  }
  function copyAddress() {
    var a = appAddress();
    var done = function () { toast((D.guide.install || {}).copied || '주소를 복사했어요.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(a).then(done, function () { window.prompt('주소를 길게 눌러 복사하세요', a); });
    } else {
      window.prompt('주소를 길게 눌러 복사하세요', a);
    }
  }
  function installPart(part, kind, open) {
    var I = D.guide.install || {};
    return el('details', { class: 'install-part', 'data-testid': 'install-' + kind, open: open ? '' : null },
      el('summary', null, (kind === 'ios' ? '🍎 ' : '🤖 ') + part.title),
      el('ol', { class: 'install-steps' }, part.steps.map(function (t) { return el('li', null, t); })),
      part.trouble && part.trouble.length ? el('div', { class: 'install-trouble' },
        el('p', { class: 'install-trouble-title' }, '❓ ' + (I.troubleTitle || '안 될 때')),
        el('ul', null, part.trouble.map(function (t) { return el('li', null, t); }))) : null);
  }
  /* 홈 화면에 앱으로 설치하는 방법 (사용 방법 화면 안). 휴대폰 종류에 맞는 쪽을 먼저 펼쳐요 */
  function installHelp() {
    var I = (D.guide || {}).install || {};
    var ua = navigator.userAgent || '';
    var isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    var isAndroid = /Android/i.test(ua);
    var inApp = /KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\//i.test(ua);
    var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone;
    return el('details', { class: 'install', 'data-testid': 'install-help' },
      el('summary', null, '📲 ' + (T.installTitle || '홈 화면에 앱으로 설치하는 방법')),
      standalone ? el('p', { class: 'install-ok' }, '✅ 이미 홈 화면에 설치해서 쓰고 있어요.') : null,
      deferredInstall ? el('button', {
        class: 'btn btn-guide', type: 'button', onclick: function () {
          deferredInstall.prompt();
          deferredInstall = null;
        }
      }, '지금 설치하기') : null,
      el('p', { class: 'install-warn' + (inApp ? ' now' : ''), 'data-testid': 'install-warn' }, '⚠️ ' + (inApp ? '지금 메신저 안의 화면이에요. ' : '') + (I.warn || '')),
      el('div', { class: 'install-addr' },
        el('p', { class: 'install-addr-label' }, I.address || '앱 주소'),
        el('p', { class: 'install-addr-url', 'data-testid': 'install-address' }, appAddress()),
        el('button', { class: 'btn btn-secondary', type: 'button', 'data-testid': 'install-copy', onclick: copyAddress }, '📋 ' + (I.copy || '주소 복사하기'))),
      I.android ? installPart(I.android, 'android', isAndroid) : null,
      I.ios ? installPart(I.ios, 'ios', isIOS) : null,
      el('ul', { class: 'install-after' }, (I.after || []).map(function (t) { return el('li', null, '✅ ' + t); }))
    );
  }

  /* 사용 방법 (처음 열 때 한 번 나와요. 처음 화면 오른쪽 위 "사용 방법"으로 다시 볼 수 있어요) */
  screens.guide = function () {
    var G = D.guide || { sections: [], references: [] };
    markIntroSeen();
    return screen('guide', null,
      el('header', { class: 'topbar' },
        el('button', { class: 'top-btn', type: 'button', onclick: back, 'aria-label': '이전 화면', 'data-testid': 'guide-back' }, '← 이전'),
        el('span', { class: 'top-step' }, T.guideTitle || '사용 방법'),
        el('span', { class: 'top-spacer' })
      ),
      el('div', { class: 'guide-hero' },
        el('h1', { class: 'title', tabindex: '-1' }, T.guideTitle || '사용 방법'),
        el('p', { class: 'guide-note' }, T.disclaimer || '')
      ),
      el('ol', { class: 'guide-list' }, (G.sections || []).map(function (sec) {
        return el('li', { class: 'guide-item', 'data-testid': 'guide-section' },
          el('span', { class: 'guide-icon', 'aria-hidden': 'true' }, sec.icon || '•'),
          el('div', { class: 'guide-text' },
            el('h2', { class: 'guide-item-title' }, sec.title),
            el('p', { class: 'guide-body' }, sec.body)));
      })),
      installHelp(),
      el('details', { class: 'refs', 'data-testid': 'guide-refs' },
        el('summary', null,
          el('span', { class: 'refs-title' }, '📚 ' + (T.refsTitle || '참고한 자료')),
          el('span', { class: 'refs-open' }, (T.refsOpen || '눌러서 보기') + ' · ' + (G.references || []).reduce(function (a, g) { return a + g.items.length; }, 0) + '개')),
        (G.references || []).map(function (g) {
          return el('div', { class: 'ref-group' },
            el('h3', { class: 'ref-head' }, g.group),
            el('ul', { class: 'ref-list' }, g.items.map(function (it) { return el('li', { class: 'ref-item' }, it); })));
        }),
        T.refsNote ? el('p', { class: 'guide' }, T.refsNote) : null
      ),
      navBar({ back: { label: T.navHome || '처음으로' }, next: { label: T.navStart || '시작하기', onClick: startGame, kind: 'guide' } })
    );
  };

  screens.situation = function () {
    var ta = el('textarea', {
      id: 'situation', class: 'textarea', rows: '4', maxlength: '200',
      placeholder: T.situationPlaceholder, 'aria-describedby': 'situation-guide'
    });
    ta.value = draft.situation || '';
    var count = el('p', { class: 'counter' }, ta.value.length + ' / 200');
    /* 적은 글은 바로 draft에 넣어 둬요 (이전 단계로 갔다 와도 남게) */
    ta.addEventListener('input', function () { count.textContent = ta.value.length + ' / 200'; draft.situation = ta.value.trim(); });
    function next() {
      draft.situation = ta.value.trim();
      go('emotion', {});
    }
    return screen('situation', null, topBar(), progress(),
      editNote(),
      heading(T.situationTitle),
      el('p', { class: 'guide', id: 'situation-guide' }, T.situationGuide),
      el('label', { class: 'sr-only', for: 'situation' }, T.situationTitle),
      ta, count,
      navBar({ next: { onClick: next } })
    );
  };

  /* 감정 고르기 — 한 화면에서 핵심 감정·기분 4칸·생각이 섞인 말·낱말로 찾기로 모두 골라요.
     개수 제한, 한 칸에서만 고르기, 건너뛰기가 없어요. 고른 감정은 칸을 오가도 그대로 남아요 (docs/design-rules.md 1번) */
  function chip(id, path) {
    var e = EMO[id];
    var on = isPicked(id);
    return el('button', {
      class: 'chip' + (on ? ' on' : '') + (e.parent ? ' chip-same' : ''), type: 'button', 'data-id': id, 'aria-pressed': String(on),
      style: '--accent:' + famOf(e).color, onclick: function () { togglePick(id, path); }
    }, (on ? '✓ ' : '') + e.word);
  }
  /* 방금 고른 낱말의 뜻 (고른 곳 바로 아래에 나와요) */
  function lastPickNote(ids) {
    var id = draft.lastPick;
    if (!id || ids.indexOf(id) === -1 || !isPicked(id)) return null;
    var e = EMO[id];
    return el('p', { class: 'pick-note', 'data-testid': 'pick-note', style: '--accent:' + famOf(e).color },
      el('strong', { class: 'pick-note-word' }, '✓ ' + e.word), ' ' + (e.desc || ''));
  }
  /* 상대가 나에게 한 일 — 여러 개 골라요. draft.thoughts = 고른 말의 thoughtWords 번호 (고른 차례) */
  function thoughtPicks() { return (draft && draft.thoughts) || []; }
  function toggleThought(i, keepOn) {
    if (!(D.thoughtWords || [])[i]) return;
    if (!draft.thoughts) draft.thoughts = [];
    var at = draft.thoughts.indexOf(i);
    if (at === -1) draft.thoughts.push(i);
    else if (!keepOn) draft.thoughts.splice(at, 1);
    if (!keepOn) refresh();
  }
  /* 고른 말들이 가리키는 것을 모아요. 여러 말이 함께 가리킬수록 앞에 와요 */
  function gather(lists) {
    var count = {}, first = {}, n = 0;
    lists.forEach(function (list) {
      list.forEach(function (id) {
        if (count[id] === undefined) { count[id] = 0; first[id] = n++; }
        count[id]++;
      });
    });
    return Object.keys(count).sort(function (a, b) { return count[b] - count[a] || first[a] - first[b]; });
  }
  function thoughtFeelIds() {
    return gather(thoughtPicks().map(function (i) { return D.thoughtWords[i].feelings; })).filter(function (id) { return EMO[id]; });
  }
  function thoughtNeedIds() {
    if (!draft) return [];
    return gather(thoughtPicks().filter(function (i) { return D.thoughtWords[i]; }).map(function (i) { return D.thoughtWords[i].needs; })).filter(function (id) { return NEED[id]; });
  }

  /* 감정 고르기 — 1 핵심 감정 → 2 기분 4칸 → 3 다른 방법, 세 묶음으로 단순하게 (docs/design-rules.md 1·5번) */
  screens.emotion = function () {
    var core = (D.coreEmotions || []).filter(function (id) { return EMO[id]; });
    var faces = D.coreFaces || {};
    var quadTiles = D.quadrants.map(function (q) {
      var open = draft.openQuad === q.id;
      var n = picks().filter(function (id) { return EMO[id] && EMO[id].family === q.id; }).length;
      return el('button', {
        class: 'quad' + (open ? ' open' : ''), type: 'button', 'data-quad': q.id, 'aria-expanded': String(open), style: '--accent:' + q.color,
        'aria-label': q.name + ' 칸, ' + q.label + (n ? ', ' + n + '개 고름' : ''),
        onclick: function () { draft.openQuad = open ? null : q.id; refresh(); }
      },
        el('span', { class: 'quad-top' },
          el('span', { class: 'quad-face', 'aria-hidden': 'true' }, q.face || FAMILY[q.id].emoji),
          n ? el('span', { class: 'quad-count' }, '✓' + n) : null),
        el('span', { class: 'quad-name' }, q.label),
        el('span', { class: 'quad-hint' }, String(q.hint).replace(/ · /g, '\u00A0· ')));
    });
    var openQ = D.quadrants.filter(function (q) { return q.id === draft.openQuad; })[0];
    var panel = openQ ? el('div', { class: 'quad-panel', 'data-testid': 'quad-panel', 'data-quad': openQ.id, style: '--accent:' + openQ.color },
      el('h3', { class: 'panel-title' }, (openQ.face || '') + ' ' + openQ.name + ' · ' + openQ.label),
      openQ.categories.map(function (c) {
        var ids = CAT[c.id].ids;
        return el('div', { class: 'cat', 'data-cat': c.id },
          el('h4', { class: 'cat-title' }, c.label),
          el('div', { class: 'chips' }, ids.map(function (id) { return chip(id); })),
          lastPickNote(ids));
      }),
      el('button', { class: 'btn btn-secondary', type: 'button', 'data-testid': 'quad-close', onclick: function () { draft.openQuad = null; refresh(); } }, T.quadClose || '접기')
    ) : null;

    var n = picks().length;
    return screen('emotion', null, topBar(), progress(), pickBar(), situationChip(),
      heading(T.emotionTitle),
      el('p', { class: 'guide' }, T.emotionGuide),
      el('section', { class: 'sec', 'data-testid': 'quads' },
        secHead(1, T.quadTitle, T.quadGuide),
        el('div', { class: 'quad-grid' }, quadTiles),
        panel
      ),
      el('section', { class: 'sec core', 'data-testid': 'core' },
        secHead(2, T.coreTitle || '핵심 감정으로 찾기', T.coreHint),
        el('div', { class: 'core-grid' }, core.map(function (id) {
          var e = EMO[id], on = isPicked(id);
          return el('button', {
            class: 'core-chip' + (on ? ' on' : ''), type: 'button', 'data-id': id, 'aria-pressed': String(on),
            style: '--accent:' + famOf(e).color, onclick: function () { togglePick(id, 'core'); }
          },
            el('span', { class: 'core-face', 'aria-hidden': 'true' }, on ? '✓' : (faces[id] || '•')),
            el('span', { class: 'core-word' }, e.word));
        })),
        lastPickNote(core)
      ),
      el('section', { class: 'sec', 'data-testid': 'ways' },
        secHead(3, T.waysTitle || '다른 방법으로 찾기', T.waysHint),
        el('div', { class: 'ways' },
          wayBtn('🔍', T.searchWay || '낱말로 찾기', T.searchWayHint, function () { go('search', {}); }, 'search-open'),
          wayBtn('💬', T.thoughtWay || '상대가 나에게 한 일로 찾기', T.thoughtWayHint, function () { go('thought', {}); }, 'thought-open'),
          wayBtn('💓', T.bodyWay || '몸의 느낌으로 찾기', T.bodyWayHint, bodyOpen, 'body-open'),
          wayBtn('🤔', T.notSure, T.notSureHint, emotionFive, 'not-sure'))
      ),
      pickNav()
    );
  };

  /* "무시당한" 같은 말(생각이 섞인 말)로 찾기 — 따로 한 화면. 고른 감정은 감정 고르기 화면과 함께 써요 */
  function thoughtGroups() {
    var tws = D.thoughtWords || [];
    var used = {};
    function find(words) {
      return (words || []).map(function (w) {
        for (var i = 0; i < tws.length; i++) if (tws[i].word === w) { used[i] = true; return i; }
        return -1;
      }).filter(function (i) { return i !== -1; });
    }
    var groups = (D.thoughtGroups || []).map(function (g) {
      return { id: g.id, label: g.label, idx: find(g.words), acts: find(g.acts) };
    });
    var rest = tws.map(function (t, i) { return i; }).filter(function (i) { return !used[i]; });
    if (rest.length) groups.push({ id: 'etc', label: '그 밖의 말', idx: rest, acts: [] });
    return groups;
  }
  screens.thought = function () {
    var tws = D.thoughtWords || [];
    var tp = thoughtPicks();
    function tchip(i) {
      var on = tp.indexOf(i) !== -1;
      return el('button', { class: 'chip chip-thought' + (on ? ' on' : ''), type: 'button', 'data-thought': String(i), 'aria-pressed': String(on), onclick: function () { toggleThought(i); } }, (on ? '✓ ' : '') + tws[i].word);
    }
    function row(label, idx, kind) {
      if (!idx.length) return null;
      return el('div', { class: 'trow', 'data-trow': kind },
        el('p', { class: 'trow-label' }, label),
        el('div', { class: 'chips' }, idx.map(tchip)));
    }
    return screen('thought', null, topBar(), progress(), pickBar(),
      heading(T.thoughtTitle),
      el('p', { class: 'guide' }, T.thoughtGuide),
      thoughtGroups().map(function (g, gi) {
        return el('section', { class: 'tgroup', 'data-tgroup': g.id },
          el('h2', { class: 'tgroup-title' }, el('span', { class: 'tgroup-num', 'aria-hidden': 'true' }, String(gi + 1)), el('span', null, g.label)),
          row(T.thoughtWordsLabel || '떠오르는 생각', g.idx, 'words'),
          row(T.thoughtActsLabel || '있었던 일', g.acts, 'acts'));
      }),
      tp.length ? el('p', { class: 'sel-count', 'data-testid': 'thought-count' }, '✓ ' + fill(T.thoughtPicked || '고른 말 {글}개', { '글': String(tp.length) })) : null,
      navBar({ next: { onClick: function () { go('thoughtFeel', {}); }, disabled: !tp.length } })
    );
  };

  /* 고른 말들 밑에 있을 수 있는 감정·욕구를 한꺼번에 보여 줘요 */
  screens.thoughtFeel = function () {
    var tws = D.thoughtWords || [];
    var feels = thoughtFeelIds();
    var needs = thoughtNeedIds();
    return screen('thoughtFeel', null, topBar(), progress(), pickBar(),
      heading(T.thoughtFeelTitle, thoughtPicks().map(function (i) { return '“' + tws[i].word + '”'; }).join(' · ')),
      el('p', { class: 'guide' }, T.thoughtFeelGuide),
      el('div', { class: 'thought-card', 'data-testid': 'thought-card' },
        el('p', { class: 'guide' }, T.thoughtFeelings),
        el('div', { class: 'chips', 'data-testid': 'thought-feelings' }, feels.map(function (id) { return chip(id, 'thought'); })),
        lastPickNote(feels),
        el('p', { class: 'guide' }, T.thoughtNeeds),
        el('p', { class: 'thought-needs', 'data-testid': 'thought-needs' }, needs.map(function (id) { return NEED[id].word; }).join(' · '))),
      pickNav()
    );
  };

  function situationChip() {
    if (!draft || !draft.situation) return null;
    return el('p', { class: 'sit-chip' }, '“' + draft.situation + '”');
  }

  /* 5번 경로(몸 느낌·행동·욕구·옛 경험)에서 고른 장면의 감정 낱말 */
  screens.words = function (p) {
    var ids = (p.ids || []).filter(function (id) { return EMO[id]; }).slice(0, 4);
    var opts = ids.map(function (id, i) {
      var e = EMO[id];
      var on = isPicked(id);
      return option(i + 1, e.word, e.desc, function () { togglePick(id, p.path); },
        { color: famOf(e).color, id: id, icon: on ? '✓' : null, cls: on ? 'opt-checked' : '', pressed: on });
    });
    opts.push(fiveOption());
    var n = picks().length;
    return screen('words', null, topBar(), progress(), pickBar(), heading(p.question, p.small),
      el('p', { class: 'guide' }, T.wordsGuide || ''),
      el('div', { class: 'opts' }, opts),
      pickNav());
  };

  /* ───── 단어로 찾기 ───── */

  /* 한글 글자 나누기·붙이기 (받침 떼기, 모음 바꾸기에 써요) */
  function syl(ch) {
    var c = ch.charCodeAt(0) - 0xAC00;
    if (c < 0 || c > 11171) return null;
    return { cho: Math.floor(c / 588), jung: Math.floor((c % 588) / 28), jong: c % 28 };
  }
  function mk(x) { return String.fromCharCode(0xAC00 + x.cho * 588 + x.jung * 28 + x.jong); }
  function dropJong(w, jongs) {
    var last = syl(w.charAt(w.length - 1));
    if (!last || jongs.indexOf(last.jong) === -1) return null;
    last.jong = 0;
    return w.slice(0, -1) + mk(last);
  }
  /* 적은 말에서 끝말(했다·웠어요 등)을 떼어 낸 줄기들 */
  var ENDINGS = ['스러웠어요', '스러웠다', '스러워요', '스러워서', '스럽다', '스러움', '했어요', '했었다', '합니다', '했다', '하다', '해요', '해서', '했던', '하고', '하게',
    '웠어요', '웠다', '워요', '워서', '었어요', '았어요', '었다', '았다', '어요', '아요', '어서', '아서', '이다',
    '했어', '웠어', '었어', '았어', '해', '다', '요', '함', '음', '움', '됨', '받', '하'];
  function queryStems(q) {
    var bases = [q];
    var wish = q.indexOf('고싶'); // 인정받고 싶었다 → 인정받
    if (wish > 0) bases.push(q.slice(0, wish));
    var out = bases.slice();
    bases.forEach(function (b) {
      ENDINGS.forEach(function (end) {
        if (b.length > end.length && b.slice(-end.length) === end) out.push(b.slice(0, -end.length));
      });
    });
    out.slice().forEach(function (v) { // 끝말을 한 번 더 떼기 (인정받 → 인정)
      ENDINGS.forEach(function (end) {
        if (v.length > end.length + 1 && v.slice(-end.length) === end) out.push(v.slice(0, -end.length));
      });
    });
    out.slice().forEach(function (v) {
      var d = dropJong(v, [20, 16]); // ㅆ·ㅁ 받침 떼기 (놀랐 → 놀라, 놀람 → 놀라)
      if (d) out.push(d);
    });
    out.slice().forEach(function (v) {
      var last = syl(v.charAt(v.length - 1));
      if (last && last.jong === 0 && (last.jung === 4 || last.jung === 0)) { // 슬퍼 → 슬프, 아파 → 아프
        last.jung = 18;
        out.push(v.slice(0, -1) + mk(last));
      }
    });
    return out.filter(function (v, i) { return v && out.indexOf(v) === i; });
  }
  function squash(t) { return String(t || '').replace(/[\s.,!?~…·'"“”‘’()]/g, ''); }
  /* items: { word, desc } 목록. 감정과 욕구 모두 이 도구로 찾아요 */
  function searchList(items, text) {
    var q = squash(text);
    if (!q) return [];
    var stems = queryStems(q);
    var hits = [];
    items.forEach(function (w, order) {
      var k = squash(w.word);
      var kStem = dropJong(k, [16]) || k; // 놀람 → 놀라, 슬픔 → 슬프
      var tokens = String(w.word).split(/\s+/).filter(function (t) { return t.length >= 2; });
      var score = 0;
      if (k === q) score = 100;
      else if (k.indexOf(q) === 0) score = 90;
      else if (k.indexOf(q) !== -1 && q.length >= 2) score = 70;
      else {
        stems.forEach(function (v) {
          if (k === v + '함' || k === v + '음' || k === v + '움') score = Math.max(score, 68); // 편 → 편함
          else if (v.length >= 2 && (k.indexOf(v) === 0 || kStem === v)) score = Math.max(score, 65);
          else if (v.length === 1 && (k === v || kStem === v)) score = Math.max(score, 65);
          else if (k.length >= 2 && v.indexOf(k) === 0) score = Math.max(score, 60); // 짜증났다 → 짜증
          else if (kStem.length >= 2 && v.indexOf(kStem) === 0) score = Math.max(score, 55);
          else if (v.length >= 2 && tokens.some(function (t) { return v.indexOf(t) === 0 || t.indexOf(v) === 0; })) score = Math.max(score, 50); // 인정받 → 노력 인정
        });
      }
      if (!score && q.length >= 2 && String(w.desc || '').replace(/\s/g, '').indexOf(q) !== -1) score = 20;
      if (!score && stems.some(function (v) { return v.length >= 2 && String(w.desc || '').replace(/\s/g, '').indexOf(v) !== -1; })) score = 15;
      if (score) hits.push({ w: w, score: score - (w.parent ? 1 : 0), order: order });
    });
    hits.sort(function (a, b) { return b.score - a.score || a.order - b.order; });
    return hits.slice(0, 12).map(function (h) { return h.w; });
  }
  function searchWords(text) { return searchList(ALL_WORDS, text); }
  var NEED_ITEMS = null;
  function searchNeeds(text) {
    if (!NEED_ITEMS) NEED_ITEMS = D.needs.map(function (n) { return { id: n.id, word: n.word, desc: n.text }; });
    return searchList(NEED_ITEMS, text).map(function (x) { return NEED[x.id]; });
  }

  /* 찾기 화면 틀 (감정 찾기·욕구 찾기가 함께 써요) */
  function searchScreen(name, cfg) {
    var input = el('input', {
      id: 'search-text', class: 'input', type: 'search', maxlength: '20', autocomplete: 'off', enterkeyhint: 'search',
      placeholder: cfg.placeholder, 'aria-describedby': 'search-guide', 'data-testid': 'search-input'
    });
    if (cfg.keep) input.value = draft[cfg.keep] || '';
    var info = el('p', { class: 'guide', 'aria-live': 'polite', 'data-testid': 'search-info' });
    var list = el('div', { class: 'search-list', 'data-testid': 'search-results' });
    function show() {
      var v = input.value;
      list.innerHTML = '';
      var found;
      if (!squash(v)) {
        info.textContent = cfg.suggestLabel;
        found = cfg.suggest();
      } else {
        found = cfg.find(v);
        info.textContent = found.length ? fill(T.searchResults || '찾은 단어 {글}개', { '글': String(found.length) }) : (T.searchNone || '맞는 단어를 못 찾았어요.');
      }
      if (cfg.extra) cfg.extra(v).forEach(function (node) { list.appendChild(node); });
      found.forEach(function (w) { list.appendChild(cfg.item(w)); });
    }
    input.addEventListener('input', function () { if (cfg.keep) draft[cfg.keep] = input.value; show(); });
    input.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); } });
    show();
    return screen(name, null, topBar(), progress(), cfg.bar ? cfg.bar() : null,
      heading(cfg.title),
      el('p', { class: 'guide', id: 'search-guide' }, cfg.guide || ''),
      el('label', { class: 'sr-only', for: 'search-text' }, cfg.title),
      input, info, list,
      cfg.after ? cfg.after() : null
    );
  }
  function searchItem(id, label, hint, color, onClick, on) {
    return el('button', { class: 'search-item' + (on ? ' search-item-checked' : ''), type: 'button', 'data-id': id, 'aria-pressed': on === undefined ? null : String(!!on), style: color ? '--accent:' + color : null, onclick: onClick },
      el('span', { class: 'opt-body' }, el('span', { class: 'opt-label' }, label), el('span', { class: 'opt-hint' }, hint)));
  }

  screens.search = function () {
    return searchScreen('search', {
      title: T.searchTitle || '떠오르는 감정 낱말을 적어 보세요',
      guide: T.searchGuide, placeholder: T.searchPlaceholder || '감정 낱말 적기',
      suggestLabel: T.searchSuggest || '자주 찾는 감정',
      keep: 'searchText',
      bar: pickBar,
      suggest: function () { return (D.searchSuggest || []).filter(function (id) { return EMO[id]; }).map(function (id) { return EMO[id]; }); },
      find: searchWords,
      extra: function (v) {
        if (!squash(v)) return [];
        var items = (D.thoughtWords || []).map(function (t, i) { return { word: t.word.replace(/\s*\(.*\)\s*/g, ''), desc: '', i: i }; });
        return bodyLinks(v).concat(searchList(items, v).slice(0, 2).map(function (x) {
          var t = D.thoughtWords[x.i];
          return el('button', {
            class: 'search-item search-thought', type: 'button', 'data-testid': 'search-thought', 'data-thought': String(x.i),
            onclick: function () { toggleThought(x.i, true); go('thought', {}); }
          }, el('span', { class: 'opt-body' }, el('span', { class: 'opt-label' }, '💬 “' + t.word + '” →'), el('span', { class: 'opt-hint' }, T.thoughtSearchHint || '')));
        }));
      },
      item: function (w) {
        var fam = famOf(w);
        var head = w.parent ? EMO[w.parent] : null;
        var where = fam.emoji + ' ' + fam.short + (w.cat && CAT[w.cat] ? ' · ' + CAT[w.cat].label : '');
        var hint = where + ' · ' + (head ? fill(T.searchSame || '{감정과} 같은 뜻', { '감정': head.word }) + ' · ' : '') + w.desc;
        var on = isPicked(w.id);
        return searchItem(w.id, (on ? '✓ ' : '') + w.word, hint, fam.color,
          function () { togglePick(w.id, 'search'); }, on);
      },
      after: pickNav
    });
  };

  /* 몸의 느낌 — 몸의 곳별 느낌을 여러 개 골라요. draft.bodyPicks = 고른 느낌 id (고른 차례) */
  var BODY = {};
  D.approaches.forEach(function (ap) { (ap.parts || []).forEach(function (pt) { pt.feelings.forEach(function (f) { BODY[f.id] = f; }); }); });
  function bodyPicks() { return ((draft && draft.bodyPicks) || []).filter(function (id) { return BODY[id]; }); }
  function toggleBody(id) {
    if (!draft.bodyPicks) draft.bodyPicks = [];
    var at = draft.bodyPicks.indexOf(id);
    if (at === -1) draft.bodyPicks.push(id); else draft.bodyPicks.splice(at, 1);
    refresh();
  }
  function addBody(id) {
    if (!draft.bodyPicks) draft.bodyPicks = [];
    if (draft.bodyPicks.indexOf(id) === -1) draft.bodyPicks.push(id);
  }
  /* 몸의 곳(12곳)·느낌의 결(10계열) — data/questions.js의 bodyAreas·bodyTextures */
  var AREA = {};
  (D.bodyAreas || []).forEach(function (x) { AREA[x.id] = x; });
  var TEX = {};
  (D.bodyTextures || []).forEach(function (x) { TEX[x.id] = x; });
  var BODY_PARTS = (D.approaches[0] && D.approaches[0].parts) || [];
  function allBody() { return Object.keys(BODY).map(function (id) { return BODY[id]; }); }
  /* 몸의 느낌 화면 단계: 쉽게(6곳·4계열) / 자세히(몸 그림 12곳·10계열) / 적어서 찾기 (5-6(8)). 고른 단계는 휴대폰에 남아요 */
  var BODYMODE_KEY = 'maeum-chatgi-bodymode';
  function bodyMode() {
    var m = 'easy';
    try { m = window.localStorage.getItem(BODYMODE_KEY) || 'easy'; } catch (e) { /* 무시 */ }
    return (D.bodyModes || []).some(function (x) { return x.id === m; }) ? m : 'easy';
  }
  function setBodyMode(m) {
    try { window.localStorage.setItem(BODYMODE_KEY, m); } catch (e) { /* 무시 */ }
  }
  function bchip(f) {
    var on = bodyPicks().indexOf(f.id) !== -1;
    return el('button', { class: 'chip chip-body' + (on ? ' on' : ''), type: 'button', 'data-body': f.id, 'aria-pressed': String(on), onclick: function () { toggleBody(f.id); } }, (on ? '✓ ' : '') + f.label);
  }
  function toggleIn(key, id) {
    var o = (draft[key] || []).slice();
    var at = o.indexOf(id);
    if (at === -1) o.push(id); else o.splice(at, 1);
    draft[key] = o;
  }
  /* 접었다 펴는 묶음 (곳 6묶음·12곳·사전이 함께 써요) */
  function foldBox(kind, id, title, sub, feelings, openKey, extra) {
    var isOpen = (draft[openKey] || []).indexOf(id) !== -1;
    var bp = bodyPicks();
    var n = feelings.filter(function (f) { return bp.indexOf(f.id) !== -1; }).length;
    var attrs = { class: 'bpart' + (isOpen ? ' open' : '') };
    attrs['data-' + kind] = id;
    return el('section', attrs,
      el('button', {
        class: 'bpart-head', type: 'button', 'aria-expanded': String(isOpen), 'data-testid': kind + '-' + id,
        onclick: function () { toggleIn(openKey, id); refresh(); }
      },
        el('span', { class: 'bpart-body' }, el('span', { class: 'bpart-name' }, title), sub ? el('span', { class: 'bpart-where' }, sub) : null),
        n ? el('span', { class: 'bpart-count' }, '✓' + n) : null,
        el('span', { class: 'toggle-mark', 'aria-hidden': 'true' }, isOpen ? '−' : '+')),
      isOpen ? (extra ? extra() : el('div', { class: 'chips bpart-chips' }, feelings.map(bchip))) : null);
  }
  /* 느낌의 결로 찾기: 결을 누르면 그 결의 느낌이 곳과 상관없이 모여요 */
  function texFilter(list) {
    var cur = draft.bodyTex && list.some(function (t) { return t.id === draft.bodyTex; }) ? draft.bodyTex : null;
    var feels = cur ? allBody().filter(function (f) { return f.tex === cur; }) : [];
    return el('section', { class: 'tex-box', 'data-testid': 'tex-box' },
      el('p', { class: 'trow-label' }, T.bodyTexTitle || '느낌의 결로 찾기'),
      el('div', { class: 'chips' }, list.map(function (t) {
        var on = cur === t.id;
        return el('button', {
          class: 'chip chip-tex' + (on ? ' on' : ''), type: 'button', 'data-tex': t.id, 'aria-pressed': String(on),
          onclick: function () { draft.bodyTex = on ? null : t.id; refresh(); }
        }, t.icon + ' ' + t.label);
      })),
      cur ? el('div', { class: 'tex-panel', 'data-testid': 'tex-panel' },
        el('p', { class: 'guide' }, fill(T.bodyTexGuide || '“{글}” 느낌이에요.', { '글': TEX[cur].label })),
        el('div', { class: 'chips' }, feels.map(bchip))) : null);
  }
  /* 몸 그림 (12곳). 누르면 아래 그 곳의 느낌이 펼쳐져요. 고른 느낌이 있는 곳은 색이 칠해져요 */
  function bodyFigure() {
    var NS = 'http://www.w3.org/2000/svg';
    var bp = bodyPicks();
    var picked = {};
    bp.forEach(function (id) { picked[BODY[id].area] = true; });
    var open = draft.openAreas || [];
    function mk(tag, attrs) {
      var n = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      return n;
    }
    function tapArea(id) {
      if (open.indexOf(id) === -1) toggleIn('openAreas', id);
      refresh();
      var sec = app.querySelector('[data-barea="' + id + '"]');
      if (sec && sec.scrollIntoView) { try { sec.scrollIntoView({ block: 'nearest' }); } catch (e) { /* 무시 */ } }
    }
    var LABELS = {
      head: ['L', 22, 70], face: ['L', 60, 66], neck: ['L', 98, 88], chest: ['L', 146, 62], belly: ['L', 202, 62],
      eyes: ['R', 44, 134], mouth: ['R', 80, 128], back: ['R', 112, 152], arms: ['R', 150, 172], pit: ['R', 174, 138], legs: ['R', 258, 134]
    };
    var leaders = mk('g', { class: 'fig-leaders', 'aria-hidden': 'true' });
    function region(id, shapes) {
      var g = mk('g', {
        class: 'fig-area' + (['head', 'eyes', 'face', 'mouth'].indexOf(id) !== -1 ? ' fig-head' : '') + (picked[id] ? ' picked' : '') + (open.indexOf(id) !== -1 ? ' open' : ''),
        'data-area': id, role: 'button', tabindex: '0', 'aria-label': AREA[id].label + (picked[id] ? ', 고른 느낌 있음' : '')
      });
      shapes.forEach(function (sh) { g.appendChild(mk(sh[0], sh[1])); });
      var lb = LABELS[id];
      if (lb) {
        var left = lb[0] === 'L';
        var t = mk('text', { x: left ? 18 : 182, y: lb[1], 'text-anchor': left ? 'end' : 'start', class: 'fig-label', 'data-fig-label': id });
        t.textContent = AREA[id].label;
        g.appendChild(t);
        leaders.appendChild(mk('line', { x1: left ? 21 : 179, y1: lb[1] - 5, x2: lb[2], y2: lb[1] - 5 }));
      }
      g.addEventListener('click', function () { tapArea(id); });
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tapArea(id); } });
      return g;
    }
    var svg = mk('svg', { viewBox: '0 0 320 300', class: 'body-fig', role: 'group', 'aria-label': T.bodyFigLabel || '몸 그림' });
    var defs = mk('defs', {});
    var clip = mk('clipPath', { id: 'fig-head-clip' });
    clip.appendChild(mk('rect', { x: 64, y: 6, width: 72, height: 80, rx: 34 }));
    defs.appendChild(clip);
    svg.appendChild(defs);
    var root = svg; /* 그림을 가운데로 옮기고(양옆에 곳 이름), 그 안에 곳을 그려요 */
    svg = mk('g', { transform: 'translate(60,0)' });
    root.appendChild(svg);
    var headBand = function (y, h) { return ['rect', { x: 64, y: y, width: 72, height: h, 'clip-path': 'url(#fig-head-clip)' }]; };
    svg.appendChild(region('head', [headBand(6, 26)]));
    svg.appendChild(region('eyes', [headBand(32, 16)]));
    svg.appendChild(region('face', [headBand(48, 16)]));
    svg.appendChild(region('mouth', [headBand(64, 22)]));
    svg.appendChild(region('neck', [['rect', { x: 88, y: 86, width: 24, height: 14, rx: 4 }]]));
    svg.appendChild(region('back', [['path', { d: 'M46,114 Q50,100 70,100 L130,100 Q150,100 154,114 L154,122 L46,122 Z' }]]));
    svg.appendChild(region('chest', [['rect', { x: 62, y: 122, width: 76, height: 38 }]]));
    svg.appendChild(region('pit', [['rect', { x: 62, y: 160, width: 76, height: 18 }]]));
    svg.appendChild(region('belly', [['rect', { x: 62, y: 178, width: 76, height: 38, rx: 8 }]]));
    svg.appendChild(region('arms', [
      ['rect', { x: 28, y: 122, width: 22, height: 96, rx: 11 }], ['circle', { cx: 39, cy: 228, r: 11 }],
      ['rect', { x: 150, y: 122, width: 22, height: 96, rx: 11 }], ['circle', { cx: 161, cy: 228, r: 11 }]]));
    svg.appendChild(region('legs', [
      ['rect', { x: 66, y: 218, width: 30, height: 70, rx: 12 }], ['rect', { x: 104, y: 218, width: 30, height: 70, rx: 12 }]]));
    var deco = mk('g', { class: 'fig-deco', 'aria-hidden': 'true' });
    deco.appendChild(mk('rect', { x: 64, y: 6, width: 72, height: 80, rx: 34, class: 'fig-outline' }));
    deco.appendChild(mk('circle', { cx: 86, cy: 40, r: 3.5 }));
    deco.appendChild(mk('circle', { cx: 114, cy: 40, r: 3.5 }));
    deco.appendChild(mk('path', { d: 'M88,72 Q100,80 112,72', class: 'fig-line' }));
    svg.appendChild(deco);
    svg.insertBefore(leaders, svg.firstChild);
    var shown = open.filter(function (id) { return AREA[id]; }).map(function (id) { return AREA[id].label; });
    return el('div', { class: 'fig-wrap', 'data-testid': 'body-figure' }, root,
      el('button', {
        class: 'chip fig-whole' + (picked.whole ? ' on' : ''), type: 'button', 'data-area': 'whole', 'aria-pressed': String(open.indexOf('whole') !== -1),
        onclick: function () { tapArea('whole'); }
      }, '🧍 ' + AREA.whole.label),
      el('p', { class: 'fig-note', 'data-testid': 'fig-note' }, shown.length ? (T.bodyFigOpen || '펼친 곳') + ': ' + shown.join(' · ') : (T.bodyFigGuide || '몸 그림에서 느껴진 곳을 누르세요.')));
  }
  /* 적어서 찾기: 몸 표현을 적으면 맞는 느낌이 나오고, 아래에 관용 표현 사전이 있어요 */
  function bodyWrite() {
    var input = el('input', {
      class: 'input', type: 'search', maxlength: '30', autocomplete: 'off', enterkeyhint: 'search', id: 'body-write',
      placeholder: T.bodyWritePlaceholder || '예) 가슴이 답답해', 'data-testid': 'body-write-input'
    });
    input.value = draft.bodyText || '';
    var box = el('div', { class: 'chips', 'data-testid': 'body-write-results' });
    var info = el('p', { class: 'guide', 'aria-live': 'polite' });
    function show() {
      box.innerHTML = '';
      var v = input.value;
      if (!squash(v)) { info.textContent = T.bodyWriteGuide || ''; return; }
      var ids = bodyMatch(v, 12);
      info.textContent = ids.length ? fill(T.bodyWriteFound || '맞는 몸의 느낌 {글}개', { '글': String(ids.length) }) : (T.bodyWriteNone || '맞는 몸 표현을 못 찾았어요.');
      ids.forEach(function (id) { box.appendChild(bchip(BODY[id])); });
    }
    input.addEventListener('input', function () { draft.bodyText = input.value; show(); });
    input.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); } });
    show();
    return [
      el('label', { class: 'sr-only', for: 'body-write' }, T.bodyWritePlaceholder || '몸 표현 적기'),
      input, info, box,
      el('h2', { class: 'sec-title dict-title' }, T.bodyDictTitle || '몸 관용 표현 사전'),
      el('p', { class: 'guide' }, T.bodyDictGuide || ''),
      el('div', { class: 'bpart-list' }, BODY_PARTS.map(function (pt) {
        return foldBox('bdict', pt.id, pt.label, pt.where, pt.feelings, 'openDict', function () {
          return el('ul', { class: 'dict-list' }, pt.feelings.map(function (f) {
            return el('li', { class: 'dict-item' }, bchip(f), el('p', { class: 'dict-idioms' }, f.idioms.join(' · ')));
          }));
        });
      }))
    ];
  }
  /* 몸의 느낌 — 단계 탭 3개, 처음에는 곳만 보이고 누르면 느낌이 펼쳐져요 (짧고 중립적으로, 5-6(5)) */
  function bodyScreen(ap, p) {
    var bp = bodyPicks();
    var mode = bodyMode();
    var tabs = el('div', { class: 'body-modes', role: 'tablist', 'data-testid': 'body-modes' }, (D.bodyModes || []).map(function (m) {
      var on = m.id === mode;
      return el('button', {
        class: 'body-mode' + (on ? ' on' : ''), type: 'button', role: 'tab', 'aria-selected': String(on), 'data-body-mode': m.id,
        onclick: function () { setBodyMode(m.id); refresh(); }
      }, el('span', { class: 'body-mode-name' }, m.label), el('span', { class: 'body-mode-hint' }, m.hint));
    }));
    var content;
    if (mode === 'detail') {
      content = [
        bodyFigure(),
        texFilter(D.bodyTextures || []),
        el('div', { class: 'bpart-list' }, (D.bodyAreas || []).map(function (ar) {
          return foldBox('barea', ar.id, ar.label, null, allBody().filter(function (f) { return f.area === ar.id; }), 'openAreas');
        }))
      ];
    } else if (mode === 'write') {
      content = bodyWrite();
    } else {
      content = [
        texFilter((D.bodyTextures || []).filter(function (t) { return t.basic; })),
        el('div', { class: 'bpart-list' }, ap.parts.map(function (pt) {
          return foldBox('bpart', pt.id, pt.label, pt.where, pt.feelings, 'openParts');
        }))
      ];
    }
    return screen('approach', { 'data-approach': ap.key, 'data-body-mode': mode }, topBar(), progress(), pickBar(), situationChip(),
      heading(ap.question, ap.intro),
      el('p', { class: 'guide' }, mode === 'write' ? (T.bodyWriteLead || ap.guide) : (mode === 'detail' ? (T.bodyDetailLead || ap.guide) : ap.guide)),
      tabs,
      content,
      bp.length ? el('p', { class: 'sel-count', 'data-testid': 'body-count' }, '✓ ' + fill(T.bodyPicked || '고른 몸의 느낌 {글}개', { '글': String(bp.length) })) : null,
      el('div', { class: 'opts' }, fiveOption()),
      navBar({ next: { onClick: function () { go('bodyWords', { index: p.index }); }, disabled: !bp.length } })
    );
  }
  /* 적은 말과 맞는 몸의 느낌 id (관용 표현으로 찾아요) */
  var BODY_IDIOMS = null;
  function bodyMatch(v, max) {
    var q = squash(v);
    if (q.length < 2) return [];
    if (!BODY_IDIOMS) {
      BODY_IDIOMS = [];
      Object.keys(BODY).forEach(function (id) {
        (BODY[id].idioms || []).forEach(function (t) { BODY_IDIOMS.push({ id: id, core: squash(t).replace(/다$/, '') }); });
      });
    }
    var found = [];
    BODY_IDIOMS.forEach(function (x) {
      var c = x.core, c1 = c.slice(0, -1);
      var hit = q.indexOf(c) === 0 || (q.length >= 3 && c.indexOf(q) === 0) || (c1.length >= 3 && q.indexOf(c1) === 0);
      if (hit && found.indexOf(x.id) === -1) found.push(x.id);
    });
    return found.slice(0, max || 3);
  }
  /* 낱말로 찾기 → 몸의 느낌. "가슴이 답답해", "속이 타"처럼 몸 관용 표현을 적으면 이어 줘요 (docs/body-reactions.md 5-6(3)) */
  function bodyLinks(v) {
    return bodyMatch(v, 3).map(function (id) {
      return el('button', {
        class: 'search-item search-body', type: 'button', 'data-testid': 'search-body', 'data-body': id,
        onclick: function () { addBody(id); go('bodyWords', { index: 0 }); }
      }, el('span', { class: 'opt-body' }, el('span', { class: 'opt-label' }, '💓 “' + BODY[id].label + '” →'), el('span', { class: 'opt-hint' }, T.bodySearchHint || '')));
    });
  }
  /* 몸의 느낌 세기: 약·중·강 (고르지 않아도 돼요, 5-6(1)) */
  function levelRow(id) {
    var cur = (draft.bodyLevels || {})[id] || 0;
    return el('div', { class: 'blevel', 'data-level-for': id },
      el('span', { class: 'blevel-label' }, T.bodyLevelLabel || '느낌의 세기'),
      (D.bodyLevels || []).map(function (lv) {
        var on = cur === lv.n;
        return el('button', {
          class: 'blevel-btn' + (on ? ' on' : ''), type: 'button', 'data-level': String(lv.n), 'aria-pressed': String(on),
          onclick: function () {
            if (!draft.bodyLevels) draft.bodyLevels = {};
            if (on) delete draft.bodyLevels[id]; else draft.bodyLevels[id] = lv.n;
            refresh();
          }
        }, lv.label);
      }));
  }
  /* 포커싱 방식 확인: 고른 낱말을 몸의 느낌에 대 보면 맞나요? 꼭 맞음 / 비슷함 / 다름 (5-6(4))
     "다름"이면 그 낱말을 풀고 가까운 낱말을 다시 보여 줘요 */
  function fitRow(eid, card) {
    if (!eid || !EMO[eid]) return null;
    var cur = (draft.fit || {})[eid];
    var choices = [['exact', T.bodyFitExact || '꼭 맞음'], ['close', T.bodyFitClose || '비슷함'], ['diff', T.bodyFitDiff || '다름']];
    return el('div', { class: 'fit-box body-fit', 'data-testid': 'body-fit', 'data-fit-for': eid },
      el('p', { class: 'fit-q' }, fill(T.bodyFitQ || '{감정을} 이 몸의 느낌에 대 보면 맞나요?', { '감정': EMO[eid].word })),
      el('div', { class: 'fit-btns' }, choices.map(function (c) {
        var on = cur === c[0];
        return el('button', {
          class: 'fit-btn' + (on ? ' on' : ''), type: 'button', 'data-fit': c[0], 'aria-pressed': String(on),
          onclick: function () {
            if (!draft.fit) draft.fit = {};
            if (c[0] === 'diff') {
              delete draft.fit[eid];
              draft.nearFor = { card: card, of: eid };
              if (isPicked(eid)) { togglePick(eid); return; }
            } else if (on) delete draft.fit[eid];
            else draft.fit[eid] = c[0];
            refresh();
          }
        }, c[1]);
      })));
  }
  /* 가까운 낱말: 같은 범주의 다른 낱말 (그 카드에 이미 있는 것은 빼고 6개까지) */
  function nearWords(eid, skip) {
    var e = EMO[eid];
    if (!e || !e.cat || !CAT[e.cat]) return [];
    return CAT[e.cat].ids.filter(function (id) { return id !== eid && EMO[id] && !EMO[id].parent && skip.indexOf(id) === -1; }).slice(0, 6);
  }
  /* 강도 화면: 감정마다 "몸 어디에서 느껴졌나요?" — 펼쳐서 곳을 골라요. 고르지 않아도 돼요 (5-6(2) 양방향).
     몸의 느낌으로 고른 감정에는 묻지 않아요(이미 몸에서 찾았으니까요) */
  function emoBodyBox(id) {
    if (id === UNNAMED.id || !(D.bodyAreas || []).length) return null;
    if (draft.pathOf && draft.pathOf[id] === 'body') return null;
    var open = (draft.emoBodyOpen || []).indexOf(id) !== -1;
    var areas = ((draft.emoBody || {})[id] || []).filter(function (a) { return AREA[a]; });
    return el('div', { class: 'emobody' + (open ? ' open' : ''), 'data-emobody-box': id },
      el('button', {
        class: 'emobody-toggle', type: 'button', 'data-emobody': id, 'aria-expanded': String(open),
        onclick: function () { toggleIn('emoBodyOpen', id); refresh(); }
      }, (T.emoBodyQ || '💓 몸 어디에서 느껴졌나요?') + (areas.length ? ' · ' + areas.map(function (a) { return AREA[a].label; }).join(', ') : ''),
        el('span', { class: 'toggle-mark', 'aria-hidden': 'true' }, open ? '−' : '+')),
      open ? el('p', { class: 'guide' }, T.emoBodyHint || '') : null,
      open ? el('div', { class: 'chips' }, D.bodyAreas.map(function (a) {
        var on = areas.indexOf(a.id) !== -1;
        return el('button', {
          class: 'chip chip-body' + (on ? ' on' : ''), type: 'button', 'data-emoarea': a.id, 'aria-pressed': String(on),
          onclick: function () {
            if (!draft.emoBody) draft.emoBody = {};
            var cur = (draft.emoBody[id] || []).slice();
            var at = cur.indexOf(a.id);
            if (at === -1) cur.push(a.id); else cur.splice(at, 1);
            if (cur.length) draft.emoBody[id] = cur; else delete draft.emoBody[id];
            refresh();
          }
        }, (on ? '✓ ' : '') + a.label);
      })) : null);
  }
  /* 기록의 몸의 느낌 줄 ("가슴이 두근거렸어요(강)") */
  function levelLabel(n) { var x = (D.bodyLevels || []).filter(function (lv) { return lv.n === n; })[0]; return x ? x.label : ''; }
  function bodyLine(r) {
    return (r.body || []).map(function (b) { return b.label + (b.level ? '(' + levelLabel(b.level) + ')' : ''); }).join(' · ');
  }
  function emoBodyLines(r) {
    var eb = r.emoBody || {};
    return recEmotions(r).filter(function (x) { return eb[x.id] && eb[x.id].length; }).map(function (x) {
      return x.word + ' — ' + eb[x.id].map(function (a) { return AREA[a] ? AREA[a].label : a; }).join(' · ');
    });
  }
  /* 가슴 답답함·치밀어 오름·열감이 여러 주(3주 이상, 최근 6주 안) 기록되면 진단명 없이 안내해요 (5-6(6)) */
  var REPEAT_BODY = ['b-chest-tight', 'b-chest-rise', 'b-hot', 'b-head-hot'];
  function bodyRepeat() {
    var today = parseKey(dateKey(new Date()));
    var weeks = {};
    records().forEach(function (r) {
      if (!r.date || !(r.body || []).some(function (b) { return REPEAT_BODY.indexOf(b.id) !== -1; })) return;
      var ago = Math.round((today - parseKey(r.date)) / 86400000);
      if (ago >= 0 && ago < 42) weeks[Math.floor(ago / 7)] = true;
    });
    return Object.keys(weeks).length >= 3;
  }
  function repeatNote() {
    return bodyRepeat() ? el('p', { class: 'care-note', 'data-testid': 'repeat-note' }, 'ⓘ ' + (T.bodyRepeatNote || '이런 몸 반응이 자주 이어지면 상담이나 진료를 받아 보는 것도 방법이에요.')) : null;
  }
  /* 고른 몸의 느낌마다 이어질 수 있는 감정 낱말 (개수 제한 없이 체크) */
  screens.bodyWords = function (p) {
    var ap = D.approaches[p.index || 0];
    var care = bodyPicks().some(function (id) { return BODY[id].care; });
    return screen('bodyWords', null, topBar(), progress(), pickBar(), situationChip(),
      heading(ap.wordsQuestion),
      el('p', { class: 'guide' }, ap.wordsGuide || T.wordsGuide || ''),
      care && ap.careNote ? el('p', { class: 'care-note', 'data-testid': 'care-note' }, 'ⓘ ' + ap.careNote) : null,
      (function () {
        var noted = false; /* 같은 감정이 여러 느낌에 나와도 뜻과 확인은 한 번만 보여 줘요 */
        return bodyPicks().map(function (id) {
          var f = BODY[id];
          var ids = f.emotions.filter(function (eid) { return EMO[eid]; });
          var near = draft.nearFor && draft.nearFor.card === id ? nearWords(draft.nearFor.of, ids) : [];
          var note = noted ? null : lastPickNote(ids.concat(near));
          if (note) noted = true;
          return el('div', { class: 'thought-card body-card', 'data-body-card': id },
            el('p', { class: 'thought-head' }, '“' + f.label + '”'),
            levelRow(id),
            f.ask ? el('p', { class: 'body-ask', 'data-testid': 'body-ask' }, '🤔 ' + f.ask) : null,
            el('div', { class: 'chips' }, ids.map(function (eid) { return chip(eid, ap.key); })),
            near.length ? el('div', { class: 'near-box', 'data-testid': 'near-box' },
              el('p', { class: 'guide' }, fill(T.bodyNearTitle || '{감정과} 가까운 낱말이에요.', { '감정': EMO[draft.nearFor.of].word })),
              el('div', { class: 'chips' }, near.map(function (eid) { return chip(eid, ap.key); }))) : null,
            note,
            note ? fitRow(draft.lastPick, id) : null);
        });
      })(),
      el('div', { class: 'opts' }, fiveOption()),
      pickNav());
  };

  screens.approach = function (p) {
    var ap = D.approaches[p.index];
    if (ap.parts) return bodyScreen(ap, p);
    var opts = ap.options.slice(0, 4).map(function (o, i) {
      return option(i + 1, o.label, null, function () {
        /* "욕구부터 거꾸로" 경로에서 고른 욕구는 욕구 단계의 후보 맨 앞에 나와요 */
        if (o.need && NEED[o.need]) {
          if (!draft.hintNeeds) draft.hintNeeds = [];
          if (draft.hintNeeds.indexOf(o.need) === -1) draft.hintNeeds.unshift(o.need);
        }
        go('words', { ids: o.emotions, question: ap.wordsQuestion, small: '“' + o.label + '”', path: ap.key });
      });
    });
    opts.push(fiveOption());
    return screen('approach', { 'data-approach': ap.key }, topBar(), progress(), pickBar(),
      heading(ap.question, ap.intro), el('div', { class: 'opts' }, opts), pickNav());
  };

  screens.unnamed = function () {
    return screen('unnamed', null, topBar(), progress(),
      el('div', { class: 'soft-card' },
        el('div', { class: 'soft-icon', 'aria-hidden': 'true' }, '☁️'),
        heading(T.unnamedTitle),
        el('p', { class: 'body-text' }, T.unnamedBody)
      ),
      navBar({ next: { onClick: function () { draft.picks = picks().length ? picks() : [UNNAMED.id]; if (!draft.pathOf) draft.pathOf = {}; draft.pathOf[UNNAMED.id] = 'unnamed'; pickNext(); } } })
    );
  };

  /* 강도 — 고른 감정을 한 화면에 모두 보여 주고, 감정 낱말을 크고 진하게 강조해요 (docs/design-rules.md 3번) */
  function holdEmotion(id) {
    if (!draft.held) draft.held = [];
    if (draft.held.indexOf(id) === -1) draft.held.push(id);
    refresh();
  }
  function removeEmotion(id) {
    draft.emotions = (draft.emotions || []).filter(function (x) { return x !== id; });
    draft.picks = picks().filter(function (x) { return x !== id; });
    draft.held = heldIds().filter(function (x) { return x !== id; });
    if (!draft.removed) draft.removed = [];
    if (draft.removed.indexOf(id) === -1) draft.removed.push(id);
    refresh();
  }
  function restoreEmotion(id) {
    draft.held = heldIds().filter(function (x) { return x !== id; });
    if ((draft.removed || []).indexOf(id) !== -1) {
      draft.removed = draft.removed.filter(function (x) { return x !== id; });
      if (!isPicked(id)) draft.picks.push(id);
      if ((draft.emotions || []).indexOf(id) === -1) draft.emotions.push(id);
    }
    refresh();
  }
  function restoreList(kind, ids, title, guide) {
    if (!ids.length) return null;
    return el('section', { class: 'int-aside', 'data-testid': kind },
      el('h2', { class: 'sec-title' }, title + ' ' + ids.length + '개'),
      el('p', { class: 'guide' }, guide),
      el('div', { class: 'chips' }, ids.map(function (id) {
        var e = EMO[id];
        return el('button', {
          class: 'chip chip-restore', type: 'button', 'data-restore': id, style: '--accent:' + famOf(e).color,
          'aria-label': e.word + ' ' + (T.intensityRestore || '되살리기'), onclick: function () { restoreEmotion(id); }
        }, '↺ ' + e.word);
      })));
  }
  screens.intensity = function () {
    var list = activeEmotions();
    if (!draft.intensities) draft.intensities = {};
    var left = list.filter(function (id) { return !draft.intensities[id]; }).length;
    var blocks = list.map(function (id) {
      var e = EMO[id];
      var f = famOf(e);
      var cur = draft.intensities[id] || 0;
      var grid = [];
      for (var i = 1; i <= 10; i++) {
        (function (n) {
          grid.push(el('button', {
            class: 'num-btn' + (cur === n ? ' selected' : ''), type: 'button', 'data-score': String(n), 'data-emotion': id,
            'aria-label': e.word + ' ' + n + '점', 'aria-pressed': String(cur === n), style: '--lv:' + (n / 10),
            onclick: function () { draft.intensities[id] = n; refresh(); }
          }, String(n)));
        })(i);
      }
      return el('section', { class: 'int-block' + (cur ? ' done' : ''), 'data-emotion-block': id, style: '--accent:' + f.color },
        el('div', { class: 'int-head' },
          el('p', { class: 'int-word', 'data-testid': 'int-word' }, e.word),
          el('p', { class: 'int-value', 'data-testid': 'int-value' }, cur ? cur + '점 · ' + intensityWord(cur) : '?')
        ),
        e.desc && id !== UNNAMED.id ? el('p', { class: 'int-desc' }, e.desc) : null,
        el('div', { class: 'num-grid' }, grid),
        id !== UNNAMED.id ? el('div', { class: 'int-actions' },
          el('button', { class: 'int-act', type: 'button', 'data-hold': id, 'aria-label': e.word + ' 보류', onclick: function () { holdEmotion(id); } }, '⏸ ' + (T.intensityHold || '보류')),
          el('button', { class: 'int-act int-act-remove', type: 'button', 'data-remove': id, 'aria-label': e.word + ' 빼기', onclick: function () { removeEmotion(id); } }, '✕ ' + (T.intensityRemove || '빼기'))
        ) : null,
        emoBodyBox(id)
      );
    });
    var held = heldIds().filter(function (id) { return EMO[id]; });
    var removed = ((draft && draft.removed) || []).filter(function (id) { return EMO[id]; });
    return screen('intensity', null, topBar(), progress(),
      heading(T.intensityTitle),
      el('p', { class: 'guide' }, T.intensityGuide),
      blocks,
      list.length ? null : el('p', { class: 'warn', 'data-testid': 'int-none' }, T.intensityNone || '강도를 고를 감정이 없어요.'),
      restoreList('held-list', held, T.heldTitle || '보류한 감정', T.heldGuide || ''),
      restoreList('removed-list', removed, T.removedTitle || '뺀 감정', T.removedGuide || ''),
      left ? el('p', { class: 'guide', 'data-testid': 'int-left' }, fill(T.intensityLeft || '아직 {글}개를 고르지 않았어요', { '글': String(left) })) : null,
      navBar({ next: { disabled: !!left || !list.length, onClick: function () { draft.intensity = draft.intensities[list[0]]; go('cause', {}); } } })
    );
  };

  screens.cause = function () {
    var opts = D.causes.slice(0, 5).map(function (c, i) {
      var on = draft.cause === c.id;
      return option(i + 1, c.label, c.id === 'other' && on && draft.causeText ? '"' + draft.causeText + '"' : c.hint, function () {
        if (c.id === 'other') { go('causeOther', {}); return; }
        draft.cause = c.id; draft.causeText = '';
        refresh();
      }, { cls: (c.id === 'other' ? 'opt-other' : '') + (on ? ' opt-checked' : ''), icon: on ? '✓' : null, pressed: on, id: c.id });
    });
    return screen('cause', null, topBar(), progress(), heading(T.causeTitle),
      el('p', { class: 'guide' }, T.causeGuide || ''),
      el('div', { class: 'opts' }, opts),
      navBar({ next: { disabled: !draft.cause, onClick: afterCause } }));
  };

  screens.causeOther = function () {
    var input = el('input', { id: 'cause-text', class: 'input', type: 'text', maxlength: '60', placeholder: T.causeOtherPlaceholder });
    input.value = draft.causeText || '';
    function next() {
      var v = input.value.trim();
      draft.cause = 'other'; draft.causeText = v;
      afterCause();
    }
    input.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') next(); });
    return screen('causeOther', null, topBar(), progress(),
      heading(T.causeOtherTitle),
      el('p', { class: 'guide' }, T.causeOtherGuide),
      el('label', { class: 'sr-only', for: 'cause-text' }, T.causeOtherTitle),
      input,
      navBar({ next: { onClick: next } })
    );
  };

  /* 욕구 고르기 — 한 화면에서 후보·14범주·낱말로 찾기로 모두 골라요. 개수 제한 없음 (docs/design-rules.md 1번) */
  function needLead() {
    return activeEmotions().map(function (id) {
      return EMO[id].word + ' ' + (draft.intensities[id] || '') + '점';
    }).join(' · ');
  }
  function needChip(id) {
    var n = NEED[id];
    var on = isNeedPicked(id);
    return el('button', { class: 'chip chip-need' + (on ? ' on' : ''), type: 'button', 'data-need': id, 'aria-pressed': String(on), onclick: function () { toggleNeed(id); } },
      (on ? '✓ ' : '') + n.word);
  }
  function lastNeedNote(ids) {
    var id = draft.lastNeed;
    if (!id || ids.indexOf(id) === -1 || !isNeedPicked(id)) return null;
    return el('p', { class: 'pick-note pick-note-need', 'data-testid': 'need-note' }, el('strong', { class: 'pick-note-word' }, '✓ ' + NEED[id].word), ' ' + (NEED[id].text || ''));
  }
  function needBar() {
    var ps = needPicks();
    if (!ps.length) return null;
    return el('div', { class: 'pick-bar pick-bar-need', 'data-testid': 'need-bar' },
      el('div', { class: 'pick-head' },
        el('p', { class: 'pick-title' }, fill(T.needPickTitle || '고른 욕구 {글}개', { '글': String(ps.length) }))
      ),
      ps.length ? el('div', { class: 'pick-chips' }, ps.map(function (id) {
        return el('button', { class: 'pick-chip', type: 'button', 'data-need-pick': id, 'aria-label': NEED[id].word + ' 빼기', onclick: function () { toggleNeed(id); } }, NEED[id].word + ' ✕');
      })) : null
    );
  }
  function needNav() {
    return navBar({ next: { label: T.navMakeCard || '마음 카드 만들기', onClick: finish } });
  }
  function pickNav() {
    return navBar({ next: { onClick: pickNext, disabled: !picks().length } });
  }

  screens.need = function () {
    var met = activeEmotions().every(function (id) { return famOf(EMO[id]).met; });
    var cand = needCandidates();
    var cats = D.needCategories.map(function (c) {
      var open = draft.openNeedCat === c.id;
      var n = needPicks().filter(function (id) { return NEED_CAT_OF[id] === c.id; }).length;
      var ids = c.needs.filter(function (id) { return NEED[id]; });
      return el('div', { class: 'ncat' + (open ? ' open' : ''), 'data-ncat': c.id },
        el('button', {
          class: 'ncat-head', type: 'button', 'aria-expanded': String(open),
          onclick: function () { draft.openNeedCat = open ? null : c.id; refresh(); }
        },
          el('span', { class: 'ncat-text' },
            el('span', { class: 'ncat-label' }, c.label, n ? el('span', { class: 'ncat-count' }, ' ✓' + n) : null),
            el('span', { class: 'ncat-hint' }, c.hint)),
          el('span', { class: 'toggle-mark', 'aria-hidden': 'true' }, open ? '−' : '+')),
        open ? el('div', { class: 'ncat-body' }, el('div', { class: 'chips' }, ids.map(needChip)), lastNeedNote(ids)) : null);
    });
    var num = 0;
    return screen('need', null, topBar(), progress(), needBar(),
      heading(met ? (T.needTitleMet || T.needTitle) : T.needTitle, needLead()),
      el('p', { class: 'guide' }, T.needGuide),
      cand.length ? el('section', { class: 'sec', 'data-testid': 'need-suggest' },
        secHead(++num, T.needSuggestTitle, T.needSuggestHint),
        el('div', { class: 'chips' }, cand.map(needChip)),
        lastNeedNote(cand)) : null,
      el('section', { class: 'sec' },
        secHead(++num, T.needCatTitle, T.needCatGuide),
        el('div', { class: 'ncat-list' }, cats)),
      el('section', { class: 'sec' },
        secHead(++num, T.needWaysTitle || '다른 방법'),
        el('div', { class: 'ways' },
          wayBtn('🔍', T.needSearchButton || '욕구 낱말로 찾기', T.needSearchWayHint, function () { go('needSearch', {}); }, 'need-search-open'))),
      needPicks().length ? null : el('p', { class: 'guide', 'data-testid': 'need-none-note' }, T.needNoneNote || ''),
      needNav()
    );
  };

  /* 욕구 낱말로 찾기 */
  screens.needSearch = function () {
    return searchScreen('needSearch', {
      title: T.needSearchTitle || '바랐던 것을 낱말로 적어 보세요',
      guide: T.needSearchGuide, placeholder: T.needSearchPlaceholder || '욕구 낱말 적기',
      suggestLabel: T.needSearchSuggest || '자주 찾는 욕구',
      keep: 'needSearchText',
      bar: needBar,
      suggest: function () { return (D.needSearchSuggest || []).filter(function (id) { return NEED[id]; }).map(function (id) { return NEED[id]; }); },
      find: searchNeeds,
      item: function (n) {
        var on = isNeedPicked(n.id);
        var c = NCAT[NEED_CAT_OF[n.id]];
        return searchItem(n.id, (on ? '✓ ' : '') + n.word, (c ? c.label + ' · ' : '') + n.text, null, function () { toggleNeed(n.id); }, on);
      },
      after: needNav
    });
  };

  function intensityMeter(n) {
    var cells = [];
    for (var i = 1; i <= 10; i++) cells.push(el('span', { class: 'meter-cell' + (i <= n ? ' on' : '') }));
    return el('div', { class: 'meter', 'aria-hidden': 'true' }, cells);
  }

  screens.result = function (p) {
    var rec = records().filter(function (r) { return r.id === p.id; })[0];
    if (!rec) return screens.home();
    var fam = famOf(EMO[rec.emotionId] || { family: rec.family });
    var list = recEmotions(rec);
    var nids = recNeeds(rec).filter(function (id) { return id !== UNNAMED_NEED.id; });
    var needWords = nids.length ? nids.map(function (id) { return (NEED[id] && NEED[id].word) || id; }).join(' · ') : rec.needWord;
    var one = nids.length === 1 ? NEED[nids[0]] : null;
    var found = Object.keys(foundSet()).length;
    return screen('result', null,
      topBar(),
      progress(),
      el('article', { class: 'card', style: '--accent:' + fam.color, 'data-testid': 'result-card' },
        el('p', { class: 'card-date' }, prettyDateTime(rec.ts)),
        el('h1', { class: 'card-title', tabindex: '-1' }, T.resultTitle),
        p.isNew ? el('p', { class: 'bonus bonus-new', 'data-testid': 'new-bonus' }, '📖 ' + T.newWordBonus + ' (' + found + ' / ' + ALL_WORDS.length + ')') : null,
        el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, list.length > 1 ? fill(T.resultEmotionsMany || '찾은 감정 {글}개', { '글': String(list.length) }) : T.resultEmotion),
          el('p', { class: 'card-emotion', 'data-testid': 'result-emotion' }, list.map(function (x) { return x.word; }).join(' + ')),
          el('ul', { class: 'card-multi' }, list.map(function (x) {
            var xf = famOf(EMO[x.id] || x);
            var xe = EMO[x.id];
            return el('li', { class: 'card-multi-item', 'data-testid': 'result-emotion-item', style: '--accent:' + xf.color },
              el('p', { class: 'card-value' }, el('strong', { class: 'card-word' }, x.word), ' · ' + x.intensity + ' / 10'),
              intensityMeter(x.intensity),
              xe && xe.desc && x.id !== UNNAMED.id ? el('p', { class: 'card-desc' }, xe.desc) : null);
          })),
          rec.held && rec.held.length ? el('p', { class: 'card-held', 'data-testid': 'result-held' },
            el('strong', null, (T.resultHeld || '보류한 감정') + ': '), rec.held.map(function (x) { return x.word; }).join(' · ')) : null
        ),
        el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, T.resultNeed),
          el('p', { class: 'card-value card-need', 'data-testid': 'result-need' }, needWords),
          one && one.text ? el('p', { class: 'card-desc' }, one.text) : null,
          nids.length ? needFitBox(rec) : null
        ),
        el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, T.resultSummary),
          el('p', { class: 'card-summary', 'data-testid': 'result-summary' }, rec.summary)
        ),
        (rec.body && rec.body.length) || emoBodyLines(rec).length ? el('section', { class: 'card-row', 'data-testid': 'result-body' },
          el('h2', { class: 'card-label' }, T.resultBody || '몸의 느낌'),
          rec.body && rec.body.length ? el('p', { class: 'card-value', 'data-testid': 'result-body-feel' }, bodyLine(rec)) : null,
          emoBodyLines(rec).map(function (t) { return el('p', { class: 'card-desc', 'data-testid': 'result-emobody' }, t); })) : null,
        rec.situation ? el('p', { class: 'card-situation' }, '있었던 일: ' + rec.situation) : null,
        rec.body && rec.body.length ? repeatNote() : null,
        T.resultNote ? el('p', { class: 'card-note', 'data-testid': 'result-note' }, T.resultNote) : null
      ),
      el('p', { class: 'guide', 'data-testid': 'result-back-note' }, T.resultBackNote || ''),
      el('p', { class: 'streak-line', 'data-testid': 'result-streak' }, '🔥 연속 기록 ' + streak() + '일 · 📖 도감 ' + found + ' / ' + ALL_WORDS.length),
      el('button', { class: 'btn btn-secondary', type: 'button', onclick: function () { go('dex', {}); }, 'data-testid': 'to-dex' }, '📖 ' + (T.dexButton || '감정 도감 보기')),
      navBar({ next: { label: T.navDone || '처음 화면으로', onClick: goHome } })
    );
  };

  /* 6. "이 욕구가 맞았나요?" 네 / 아니요 / 잘 모르겠음 */
  function needFitBox(rec) {
    var choices = [['yes', T.needFitYes || '네'], ['no', T.needFitNo || '아니요'], ['unsure', T.needFitUnsure || '잘 모르겠음']];
    return el('div', { class: 'fit-box' },
      el('p', { class: 'fit-q' }, T.needFitQuestion || '이 욕구가 맞았나요?'),
      el('div', { class: 'fit-btns' }, choices.map(function (c) {
        var on = rec.needFit === c[0];
        return el('button', {
          class: 'fit-btn' + (on ? ' on' : ''), type: 'button', 'data-testid': 'need-fit-' + c[0], 'aria-pressed': String(on),
          onclick: function () { updateRecord(rec.id, { needFit: on ? '' : c[0] }); refresh(); }
        }, c[1]);
      })),
      rec.needFit ? el('p', { class: 'guide', 'data-testid': 'need-fit-note' }, T.needFitNote || '답은 기록에 남아 다음 욕구 보기를 고칠 때 쓰여요.') : null
    );
  }
  /* 감정 도감 — 기분 4칸 가운데 하나를 고르면 그 칸의 감정 목록이 나와요.
     낱말을 누르면 바로 아래에 쉬운 설명(뜻, 이럴 때 느껴요, 같은 뜻 다른 말, 어디에 있나요, 내 기록)이 펼쳐져요 */
  var DEX = { quad: null, open: null, q: '' };
  /* 비슷한 말: 같은 뜻 다른 말을 먼저, 모자라면 같은 범주의 다른 낱말로 3개까지 */
  function similarWords(w) {
    var out = (w.same || []).map(function (id) { return EMO[id] && EMO[id].word; }).filter(Boolean);
    if (out.length < 3 && w.cat && CAT[w.cat]) {
      CAT[w.cat].ids.forEach(function (id) {
        var x = EMO[id];
        if (out.length < 3 && x && !x.parent && x.id !== w.id && out.indexOf(x.word) === -1) out.push(x.word);
      });
    }
    return out;
  }
  /* 반대말: data/emotions.js의 antonyms (낱말별 → 없으면 범주별) */
  function antonymWords(w) {
    var A = D.antonyms || {};
    var byWord = A.byWord || {}, byCat = A.byCategory || {};
    if (Object.prototype.hasOwnProperty.call(byWord, w.id)) return byWord[w.id];
    return byCat[w.cat] || [];
  }
  function dexExplain(w) {
    var f = famOf(w);
    var sim = similarWords(w);
    var ant = antonymWords(w);
    function row(label, value, testid) {
      return el('div', { class: 'dex-row' }, el('dt', null, label), el('dd', { 'data-testid': testid }, value));
    }
    return el('dl', { class: 'dex-explain', 'data-testid': 'dex-explain', style: '--accent:' + f.color },
      row(T.dexMeaning || '뜻', w.desc, 'dex-meaning'),
      row(T.dexSimilar || '비슷한 말', sim.length ? sim.join(', ') : (T.dexNone || '없어요'), 'dex-similar'),
      row(T.dexOpposite || '반대말', ant.length ? ant.join(', ') : (T.dexNoOpposite || '뚜렷한 반대말이 없어요'), 'dex-opposite'));
  }
  function dexRow(w, found, wide) {
    var open = DEX.open === w.id;
    var got = [w.id].concat(w.same || []).some(function (id) { return found[id]; });
    return el('li', { class: 'dex-item' + (open ? ' open' : '') + (wide ? ' wide' : ''), style: '--accent:' + famOf(w).color },
      el('button', {
        class: 'dex-word', type: 'button', 'data-dex': w.id, 'aria-expanded': String(open),
        'aria-label': w.word + (open ? ' 설명 접기' : ' 설명 보기'),
        onclick: function () { DEX.open = open ? null : w.id; refresh(); }
      },
        el('span', { class: 'dex-mark', 'aria-hidden': 'true' }, got ? '✓' : ''),
        el('span', { class: 'dex-name' }, w.word),
        el('span', { class: 'toggle-mark', 'aria-hidden': 'true' }, open ? '−' : '+')));
  }
  /* 2개씩 나란히 놓고, 펼친 설명은 그 줄 바로 아래에 한 줄 전체로 넣어요 (짝이 흐트러지지 않게) */
  function dexItems(ids, found) {
    var out = [];
    ids.forEach(function (id, i) {
      out.push(dexRow(EMO[id], found, i === ids.length - 1 && ids.length % 2 === 1));
      var rowEnd = i % 2 === 1 || i === ids.length - 1;
      if (rowEnd) {
        var openId = [ids[i - (i % 2)], ids[i - (i % 2) + 1]].filter(function (x) { return x && x === DEX.open; })[0];
        if (openId) out.push(el('li', { class: 'dex-exp-li', style: '--accent:' + famOf(EMO[openId]).color }, dexExplain(EMO[openId])));
      }
    });
    return out;
  }
  screens.dex = function () {
    var found = foundSet();
    var total = ALL_WORDS.length;
    var nFound = Object.keys(found).length;
    if (!DEX.quad) DEX.quad = D.quadrants[0].id;
    var q = D.quadrants.filter(function (x) { return x.id === DEX.quad; })[0] || D.quadrants[0];
    var tabs = el('div', { class: 'dex-tabs', role: 'tablist' }, D.quadrants.map(function (x) {
      var on = x.id === q.id;
      var words = ALL_WORDS.filter(function (w) { return w.family === x.id; });
      var got = words.filter(function (w) { return found[w.id]; }).length;
      return el('button', {
        class: 'dex-tab' + (on ? ' on' : ''), type: 'button', role: 'tab', 'aria-selected': String(on), 'data-dex-tab': x.id, style: '--accent:' + x.color,
        onclick: function () { DEX.quad = x.id; DEX.open = null; refresh(); }
      }, el('span', { class: 'dex-tab-dot', 'aria-hidden': 'true' }), el('span', { class: 'dex-tab-name' }, x.name), el('span', { class: 'dex-tab-count' }, got + '/' + words.length));
    }));
    var list = el('div', { class: 'dex-list' }, q.categories.map(function (c) {
      var mains = CAT[c.id].ids.filter(function (id) { return !EMO[id].parent; });
      return el('section', { class: 'dex-cat', 'data-cat': c.id },
        el('h3', { class: 'dex-cat-title' }, c.label + ' (' + mains.length + ')'),
        el('ul', { class: 'dex-items' }, dexItems(mains, found)));
    }));
    return screen('dex', null, simpleTop('감정 도감'),
      heading('감정 도감', T.dexLead || '감정 낱말을 누르면 뜻과 쓰임이 나와요'),
      el('p', { class: 'dex-total', 'data-testid': 'dex-total' }, total + '개 중 ' + nFound + '개를 골라 봤어요'),
      el('div', { class: 'bar-track big' }, el('div', { class: 'bar-fill', style: 'width:' + Math.round(nFound / total * 100) + '%' })),
      el('p', { class: 'guide' }, T.dexGuide || ''),
      (D.bodyQuiz || []).length ? el('button', { class: 'btn btn-secondary quiz-open', type: 'button', 'data-testid': 'quiz-open', onclick: function () { QUIZ.pick = {}; go('bodyQuiz', { i: 0 }); } }, T.quizButton || '💓 몸 느낌 연습') : null,
      tabs,
      el('h2', { class: 'sec-title dex-quad-title', style: '--accent:' + q.color }, q.name + ' · ' + q.label),
      list,
      menuNav()
    );
  };

  /* 몸 느낌 연습 (변별 연습, 5-6(8)) — 같은 몸의 느낌이 상황에 따라 다른 감정이 될 수 있음을 익혀요. 점수는 없어요 */
  var QUIZ = { pick: {} };
  screens.bodyQuiz = function (p) {
    var list = D.bodyQuiz || [];
    var i = Math.max(0, Math.min(list.length - 1, p.i || 0));
    var c = list[i];
    var f = BODY[c.body] || { label: c.body };
    var picked = QUIZ.pick[i];
    var last = i === list.length - 1;
    var ans = EMO[c.answer];
    return screen('bodyQuiz', null, simpleTop(T.quizTitle || '몸 느낌 연습'),
      heading(T.quizTitle || '같은 몸의 느낌, 다른 감정', T.quizLead || ''),
      el('p', { class: 'quiz-step', 'data-testid': 'quiz-step' }, (i + 1) + ' / ' + list.length),
      el('div', { class: 'thought-card body-card quiz-card', 'data-testid': 'quiz-card' },
        el('p', { class: 'quiz-sit' }, '📍 ' + c.situation),
        el('p', { class: 'thought-head' }, '💓 “' + f.label + '”'),
        el('p', { class: 'guide' }, T.quizQ || '이 상황이라면 어느 감정에 가까울까요?'),
        el('div', { class: 'chips' }, c.options.filter(function (id) { return EMO[id]; }).map(function (id) {
          var on = picked === id;
          return el('button', {
            class: 'chip' + (on ? ' on' : ''), type: 'button', 'data-quiz-opt': id, 'aria-pressed': String(on), style: '--accent:' + famOf(EMO[id]).color,
            onclick: function () { QUIZ.pick[i] = id; refresh(); }
          }, (on ? '✓ ' : '') + EMO[id].word);
        })),
        picked ? el('p', { class: 'pick-note', 'data-testid': 'quiz-feedback', style: '--accent:' + famOf(ans).color },
          (picked !== c.answer ? (T.quizOther || '') + ' ' : '') + fill(T.quizFeedback || '이 상황이라면 흔히 “{글}”에 가까워요.', { '글': ans.word })) : null),
      navBar({ next: { label: last ? (T.quizDone || '감정 도감으로') : (T.quizNext || '다음 카드'), testid: 'nav-next', onClick: function () { if (last) back(); else go('bodyQuiz', { i: i + 1 }, { push: false }); } } })
    );
  };

  function longDate(iso) {
    var d = new Date(iso);
    return d.getFullYear() + '년 ' + prettyDate(d);
  }

  function countBy(list, keyFn) {
    var m = {};
    list.forEach(function (x) { var ks = keyFn(x); (Array.isArray(ks) ? ks : [ks]).forEach(function (k) { if (k) m[k] = (m[k] || 0) + 1; }); });
    return Object.keys(m).map(function (k) { return { key: k, n: m[k] }; }).sort(function (a, b) { return b.n - a.n; });
  }
  function bars(items, labelFn, colorFn, testid) {
    if (!items.length) return el('p', { class: 'guide' }, '아직 기록이 없어요.');
    var max = items[0].n;
    return el('ul', { class: 'bars', 'data-testid': testid }, items.map(function (it) {
      return el('li', { class: 'bar-row' },
        el('div', { class: 'bar-top' }, el('span', { class: 'bar-label' }, labelFn(it.key)), el('span', { class: 'bar-n' }, it.n + '번')),
        el('div', { class: 'bar-track' }, el('div', { class: 'bar-fill', style: 'width:' + Math.max(8, Math.round(it.n / max * 100)) + '%;' + (colorFn ? 'background:' + colorFn(it.key) : '') }))
      );
    }));
  }

  screens.report = function (p) {
    var offset = p.offset || 0;
    var end = addDays(new Date(), -7 * offset);
    var start = addDays(end, -6);
    var sk = dateKey(start), ek = dateKey(end);
    var recs = records().filter(function (r) { return r.date >= sk && r.date <= ek; });
    var avg = recs.length ? (recs.reduce(function (a, r) { return a + r.intensity; }, 0) / recs.length) : 0;
    var emo = countBy(recs, function (r) { return recEmotions(r).map(function (x) { return x.id; }); }).slice(0, 5);
    var need = countBy(recs, function (r) { return recNeeds(r); }).slice(0, 5);
    var fam = countBy(recs, function (r) { return recEmotions(r).map(function (x) { return x.family; }); });
    var days = {};
    recs.forEach(function (r) { days[r.date] = true; });
    var wordOf = {};
    recs.forEach(function (r) { recEmotions(r).forEach(function (x) { wordOf[x.id] = x.word; }); var ns = recNeeds(r); if (ns.length === 1) wordOf['n:' + ns[0]] = r.needWord; });
    var distinct = Object.keys(foundSet(recs)).length;
    var mixedN = recs.filter(function (r) { return recEmotions(r).length > 1; }).length;
    var pairs = countBy(recs, function (r) {
      var ns = recNeeds(r).filter(function (id) { return id !== UNNAMED_NEED.id; });
      var out = [];
      recEmotions(r).filter(function (x) { return x.id !== UNNAMED.id; }).forEach(function (x) { ns.forEach(function (nid) { out.push(x.id + '>' + nid); }); });
      return out;
    }).slice(0, 5);
    var fit = { yes: 0, no: 0, unsure: 0 };
    recs.forEach(function (r) { if (fit[r.needFit] !== undefined) fit[r.needFit]++; });
    return screen('report', null, simpleTop('주간 감정 보고서'),
      heading('주간 감정 보고서', prettyDate(start) + ' ~ ' + prettyDate(end)),
      el('div', { class: 'week-nav' },
        el('button', { class: 'btn btn-secondary', type: 'button', onclick: function () { go('report', { offset: offset + 1 }, { push: false }); } }, '◀ 지난주'),
        el('button', { class: 'btn btn-secondary', type: 'button', disabled: offset === 0, onclick: function () { go('report', { offset: offset - 1 }, { push: false }); } }, '다음 주 ▶')
      ),
      el('div', { class: 'stats' },
        statTile('📝', '기록', recs.length + '개', 'report-count'),
        statTile('📅', '기록한 날', Object.keys(days).length + '일', 'report-days'),
        statTile('🌡', '평균 강도', recs.length ? avg.toFixed(1) : '-', 'report-avg')
      ),
      el('div', { class: 'stats stats-two' },
        statTile('🎨', '서로 다른 감정', distinct + '개', 'report-distinct'),
        statTile('🌗', '여러 감정 기록', mixedN + '개', 'report-mixed')
      ),
      el('p', { class: 'guide' }, T.reportDistinctGuide || ''),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '하루 평균 강도'),
        intensityChart(start, recs)),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '자주 나온 감정'),
        bars(emo, function (k) { return (EMO[k] && EMO[k].word) || wordOf[k] || k; }, function (k) { return EMO[k] ? famOf(EMO[k]).color : null; }, 'bars-emotion')),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '자주 나온 욕구'),
        bars(need, function (k) { return (NEED[k] && NEED[k].word) || wordOf['n:' + k] || k; }, null, 'bars-need')),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '자주 함께 나온 감정·욕구'),
        bars(pairs, function (k) { var a = k.split('>'); return ((EMO[a[0]] && EMO[a[0]].word) || wordOf[a[0]] || a[0]) + ' → ' + ((NEED[a[1]] && NEED[a[1]].word) || wordOf['n:' + a[1]] || a[1]); }, null, 'bars-pair')),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '욕구가 맞았나요?'),
        el('p', { class: 'body-text', 'data-testid': 'report-needfit' }, '네 ' + fit.yes + '번 · 아니요 ' + fit.no + '번 · 잘 모르겠음 ' + fit.unsure + '번'),
        el('p', { class: 'guide' }, T.reportFitGuide || '')),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '기분 4칸 나눠 보기'),
        bars(fam, function (k) { var f = FAMILY[k] || FAMILY.unknown; return f.emoji + ' ' + f.label; }, function (k) { return (FAMILY[k] || FAMILY.unknown).color; }, 'bars-family')),
      recs.length ? el('p', { class: 'guide' }, reportComment(emo, need, wordOf)) : null,
      bodyPatternSec(end),
      offset === 0 ? repeatNote() : null,
      menuNav()
    );
  };
  /* 하루 평균 강도 꺾은선 (그날 기록에 든 모든 감정의 강도 평균) */
  function intensityChart(start, recs) {
    var names = ['일', '월', '화', '수', '목', '금', '토'];
    var pts = [];
    for (var i = 0; i < 7; i++) {
      var d = addDays(start, i), k = dateKey(d);
      var vals = [];
      recs.filter(function (r) { return r.date === k; }).forEach(function (r) { recEmotions(r).forEach(function (x) { vals.push(x.intensity); }); });
      pts.push({ day: names[d.getDay()], v: vals.length ? vals.reduce(function (a, b) { return a + b; }, 0) / vals.length : null });
    }
    var W = 280, H = 120, xs = function (i) { return 20 + i * 40; }, ys = function (v) { return 110 - v * 10; };
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('class', 'chart');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '하루 평균 강도: ' + pts.map(function (p) { return p.day + ' ' + (p.v === null ? '기록 없음' : p.v.toFixed(1)); }).join(', '));
    [0, 5, 10].forEach(function (v) {
      var g = document.createElementNS(svgNS, 'line');
      g.setAttribute('x1', 10); g.setAttribute('x2', W - 10); g.setAttribute('y1', ys(v)); g.setAttribute('y2', ys(v));
      g.setAttribute('class', 'chart-grid');
      svg.appendChild(g);
    });
    for (var j = 1; j < 7; j++) {
      if (pts[j].v === null || pts[j - 1].v === null) continue;
      var ln = document.createElementNS(svgNS, 'line');
      ln.setAttribute('x1', xs(j - 1)); ln.setAttribute('y1', ys(pts[j - 1].v)); ln.setAttribute('x2', xs(j)); ln.setAttribute('y2', ys(pts[j].v));
      ln.setAttribute('class', 'chart-line');
      svg.appendChild(ln);
    }
    pts.forEach(function (p, i) {
      if (p.v === null) return;
      var c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', xs(i)); c.setAttribute('cy', ys(p.v)); c.setAttribute('r', 5);
      c.setAttribute('class', 'chart-dot');
      svg.appendChild(c);
    });
    return el('div', { class: 'chart-wrap', 'data-testid': 'intensity-chart' }, svg,
      el('div', { class: 'chart-days', 'aria-hidden': 'true' }, pts.map(function (p) {
        return el('span', { class: 'chart-day' }, el('span', null, p.day), el('span', { class: 'chart-v' }, p.v === null ? '-' : p.v.toFixed(1)));
      })));
  }
  /* 몸의 느낌 경향: 최근 4주 동안 같은 기록에서 함께 고른 감정과 몸의 느낌·곳 (5-6(7)). 2번 이상인 것만, 3개까지 */
  function bodyPatternSec(end) {
    var sk = dateKey(addDays(end, -27)), ek = dateKey(end);
    var recs = records().filter(function (r) { return r.date >= sk && r.date <= ek; });
    var words = {};
    var pairs = countBy(recs, function (r) {
      var out = {};
      recEmotions(r).filter(function (x) { return x.id !== UNNAMED.id; }).forEach(function (x) {
        words[x.id] = x.word;
        (r.body || []).forEach(function (b) { words['b:' + b.id] = b.label; out[x.id + '>b:' + b.id] = true; });
        ((r.emoBody || {})[x.id] || []).forEach(function (a) { out[x.id + '>a:' + a] = true; });
      });
      return Object.keys(out);
    }).filter(function (it) { return it.n >= 2; }).slice(0, 3);
    return el('section', { class: 'report-sec', 'data-testid': 'report-body' },
      el('h2', { class: 'sec-title' }, T.reportBodyTitle || '몸의 느낌 경향 (최근 4주)'),
      pairs.length ? el('ul', { class: 'plain-list' }, pairs.map(function (it) {
        var k = it.key.split('>');
        var ew = (EMO[k[0]] && EMO[k[0]].word) || words[k[0]] || k[0];
        var t = k[1].slice(0, 2) === 'b:'
          ? fill(T.reportBodyFeel || '{감정을} 고른 날에는 주로 “{글}”를 함께 골랐어요', { '감정': ew, '글': (BODY[k[1].slice(2)] && BODY[k[1].slice(2)].label) || words[k[1]] || k[1] })
          : fill(T.reportBodyArea || '{감정을} 고른 날에는 주로 {글}에서 느꼈어요', { '감정': ew, '글': (AREA[k[1].slice(2)] && AREA[k[1].slice(2)].label) || k[1] });
        return el('li', { 'data-testid': 'report-body-line' }, t + ' (' + it.n + '번)');
      })) : el('p', { class: 'guide', 'data-testid': 'report-body-few' }, T.reportBodyFew || '아직 경향을 말하기에는 기록이 적어요.'),
      el('p', { class: 'guide' }, T.reportBodyGuide || '경향일 뿐 정답은 아니에요.'));
  }
  function reportComment(emo, need, wordOf) {
    var e = emo[0], n = need[0];
    var ew = (EMO[e.key] && EMO[e.key].word) || wordOf[e.key];
    var nw = (NEED[n.key] && NEED[n.key].word) || wordOf['n:' + n.key];
    return '이번 주에는 "' + ew + '"' + (batchim(ew + '"') === 'none' ? '가' : '이') + ' 가장 자주 찾아왔고, "' + nw + '" 욕구가 자주 보였어요.';
  }

  function recSummaryBlock(r) {
    return [
      el('p', { class: 'rec-date' }, prettyDateTime(r.ts)),
      el('p', { class: 'rec-emotion' }, recEmotions(r).map(function (x) {
        var xf = famOf(EMO[x.id] || x);
        return xf.emoji + ' ' + x.word + ' ' + x.intensity + '점';
      }).join(' · ')),
      r.held && r.held.length ? el('p', { class: 'rec-sit' }, (T.resultHeld || '보류한 감정') + ': ' + r.held.map(function (x) { return x.word; }).join(' · ')) : null,
      r.body && r.body.length ? el('p', { class: 'rec-sit', 'data-testid': 'rec-body' }, '💓 ' + bodyLine(r)) : null,
      el('p', { class: 'rec-need' }, '필요했던 것: ' + r.needWord),
      el('p', { class: 'rec-summary' }, r.summary),
      r.situation ? el('p', { class: 'rec-sit' }, '있었던 일: ' + r.situation) : null
    ];
  }
  screens.records = function () {
    var recs = records().slice().reverse();
    return screen('records', null, simpleTop('지난 기록'),
      heading('지난 기록', '모두 ' + recs.length + '개'),
      recs.length ? el('p', { class: 'guide' }, T.recordsGuide || '') : null,
      recs.length ? el('ul', { class: 'rec-list' }, recs.map(function (r) {
        var f = famOf(EMO[r.emotionId] || { family: r.family });
        return el('li', { class: 'rec', style: '--accent:' + f.color, 'data-rec': r.id },
          recSummaryBlock(r),
          r.reflection ? el('p', { class: 'rec-feedback', 'data-testid': 'rec-reflection' }, el('strong', null, '💬 ' + (T.feedbackLabel || '내 피드백') + ': '), r.reflection) : null,
          el('div', { class: 'rec-actions' },
            el('button', { class: 'rec-act', type: 'button', 'data-testid': 'rec-edit', 'aria-label': prettyDateTime(r.ts) + ' 기록 고치기', onclick: function () { editRecord(r); } }, '✏️ ' + (T.recEdit || '수정')),
            el('button', { class: 'rec-act', type: 'button', 'data-testid': 'rec-feedback', 'aria-label': prettyDateTime(r.ts) + ' 기록에 피드백 쓰기', onclick: function () { go('feedback', { id: r.id }); } }, '💬 ' + (T.recFeedback || '피드백')),
            el('button', { class: 'rec-act rec-act-danger', type: 'button', 'data-testid': 'rec-delete', 'aria-label': prettyDateTime(r.ts) + ' 기록 지우기', onclick: function () { go('recordDelete', { id: r.id }); } }, '🗑 ' + (T.recDelete || '삭제'))
          )
        );
      })) : el('p', { class: 'guide' }, '아직 기록이 없어요. 아래 "새 기록 시작"을 눌러 보세요.'),
      menuNav()
    );
  };

  /* 지난 기록에 내가 쓰는 피드백 */
  screens.feedback = function (p) {
    var r = records().filter(function (x) { return x.id === p.id; })[0];
    if (!r) return screens.records();
    var ta = el('textarea', { id: 'feedback', class: 'textarea', rows: '5', maxlength: '500', placeholder: T.feedbackPlaceholder || '', 'data-testid': 'feedback-input' });
    ta.value = r.reflection || '';
    var count = el('p', { class: 'counter' }, ta.value.length + ' / 500');
    ta.addEventListener('input', function () { count.textContent = ta.value.length + ' / 500'; });
    function saveIt() {
      updateRecord(r.id, { reflection: ta.value.trim().slice(0, 500) || undefined });
      toast(T.feedbackDone || '피드백을 저장했어요.');
      back();
    }
    var f = famOf(EMO[r.emotionId] || { family: r.family });
    return screen('feedback', null, simpleTop(T.feedbackTitle || '피드백 쓰기'),
      heading(T.feedbackTitle || '이 기록에 피드백 쓰기'),
      el('div', { class: 'rec', style: '--accent:' + f.color }, recSummaryBlock(r)),
      el('label', { class: 'sec-title', for: 'feedback' }, T.feedbackQuestion || '지금 다시 보니 어떤가요?'),
      el('ul', { class: 'feedback-hints' }, (T.feedbackHints || []).map(function (h) { return el('li', null, h); })),
      ta, count,
      navBar({ next: { label: T.feedbackSave || '저장하기', onClick: saveIt, testid: 'feedback-save' } })
    );
  };

  /* 지난 기록 하나 지우기 */
  screens.recordDelete = function (p) {
    var r = records().filter(function (x) { return x.id === p.id; })[0];
    if (!r) return screens.records();
    var f = famOf(EMO[r.emotionId] || { family: r.family });
    return screen('recordDelete', null, simpleTop('기록 지우기'),
      heading('이 기록을 지울까요?'),
      el('div', { class: 'rec', style: '--accent:' + f.color }, recSummaryBlock(r)),
      el('p', { class: 'body-text' }, '지운 기록은 되살릴 수 없어요. 도감·연속 기록·주간 보고서도 이 기록을 빼고 다시 계산돼요.'),
      navBar({ next: { label: '지우기', kind: 'danger', testid: 'rec-delete-confirm', onClick: function () { deleteRecord(r.id); toast('기록을 지웠어요.'); back(); } } })
    );
  };

  screens.deleteConfirm = function () {
    return screen('deleteConfirm', null, simpleTop('기록 전체 삭제'),
      heading('기록을 모두 지울까요?'),
      el('p', { class: 'body-text' }, '마음 카드 ' + records().length + '개, 감정 도감, 연속 기록, 주간 보고서가 모두 지워져요. 지운 기록은 되살릴 수 없어요.'),
      records().length ? el('div', { class: 'tip-box' },
        el('p', null, '지우기 전에 기록을 파일로 저장해 둘 수 있어요. 나중에 그 파일을 불러오면 되살릴 수 있어요.'),
        el('button', { class: 'btn btn-secondary', type: 'button', 'data-testid': 'delete-export', onclick: function () { go('backup', {}); } }, '💾 먼저 파일로 저장하기')
      ) : null,
      navBar({ next: { label: '모두 지우기', kind: 'danger', testid: 'confirm-delete', onClick: function () { clearAll(); goHome(); toast('모든 기록을 지웠어요.'); } } })
    );
  };

  /* ───────── 기록 옮기기 (내보내기·불러오기) ───────── */
  var BACKUP_APP = 'maeum-chatgi';
  var pendingImport = null;

  function backupFile() {
    var payload = { app: BACKUP_APP, version: 1, exportedAt: new Date().toISOString(), count: records().length, records: records() };
    var name = 'maeum-chatgi-backup-' + dateKey(new Date()) + '.json';
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    return { name: name, blob: blob };
  }
  function downloadBackup() {
    if (!records().length) { toast('저장할 기록이 아직 없어요.'); return; }
    var f = backupFile();
    var url = URL.createObjectURL(f.blob);
    var a = el('a', { href: url, download: f.name, class: 'sr-only' }, f.name);
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
    toast('기록 ' + records().length + '개를 파일로 저장했어요.');
  }
  function canShareFile() {
    try {
      var test = new File(['{}'], 'test.json', { type: 'application/json' });
      return !!(navigator.share && navigator.canShare && navigator.canShare({ files: [test] }));
    } catch (e) { return false; }
  }
  function shareBackup() {
    if (!records().length) { toast('보낼 기록이 아직 없어요.'); return; }
    var f = backupFile();
    var file = new File([f.blob], f.name, { type: 'application/json' });
    navigator.share({ files: [file], title: '감정 및 욕구 찾기 기록' }).catch(function (e) {
      if (e && e.name === 'AbortError') return;
      downloadBackup();
    });
  }

  function cleanRecord(r) {
    if (!r || typeof r !== 'object') return null;
    function s(v, max) { return typeof v === 'string' ? v.slice(0, max) : ''; }
    var d = new Date(s(r.ts, 40));
    if (isNaN(d.getTime())) return null;
    var intensity = Math.round(Number(r.intensity));
    if (!(intensity >= 1 && intensity <= 10)) return null;
    var emotionId = s(r.emotionId, 40);
    var known = EMO[emotionId];
    var emotionWord = s(r.emotionWord, 40) || (known && known.word);
    if (!emotionWord) return null;
    var needId = s(r.needId, 40);
    var needWord = s(r.needWord, 40) || (NEED[needId] && NEED[needId].word) || UNNAMED_NEED.word;
    var emotions = Array.isArray(r.emotions) ? r.emotions.slice(0, 100).map(function (x) {
      if (!x || typeof x !== 'object') return null;
      var id = s(x.id, 40), k = EMO[id], n = Math.round(Number(x.intensity));
      var word = s(x.word, 40) || (k && k.word);
      if (!word || !(n >= 1 && n <= 10)) return null;
      return { id: id || 'imported', word: word, family: k ? k.family : (FAMILY[x.family] ? x.family : 'unknown'), hidden: k ? k.hidden : x.hidden === true, intensity: n };
    }).filter(Boolean) : [];
    var out = {
      id: s(r.id, 60) || ('r' + d.getTime() + emotionId),
      ts: d.toISOString(),
      date: /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : dateKey(d),
      situation: s(r.situation, 200),
      family: known ? known.family : (FAMILY[r.family] ? r.family : 'unknown'),
      emotionId: emotionId || 'imported',
      emotionWord: emotionWord,
      hidden: known ? known.hidden : r.hidden === true,
      intensity: intensity,
      cause: CAUSE[r.cause] ? r.cause : 'other',
      causeText: s(r.causeText, 60),
      needId: needId || UNNAMED_NEED.id,
      needWord: needWord,
      summary: s(r.summary, 400),
      path: s(r.path, 20) || 'normal',
      five: Math.max(0, Math.round(Number(r.five)) || 0)
    };
    if (emotions.length > 1) out.emotions = emotions;
    var needIds = Array.isArray(r.needIds) ? r.needIds.filter(function (x) { return typeof x === 'string' && x && x.length <= 40; }).slice(0, 100) : [];
    if (needIds.length > 1) out.needIds = needIds;
    var reflection = s(r.reflection, 500);
    if (reflection) out.reflection = reflection;
    var held = Array.isArray(r.held) ? r.held.slice(0, 100).map(function (x) {
      if (!x || typeof x !== 'object') return null;
      var id = s(x.id, 40), word = s(x.word, 40) || (EMO[id] && EMO[id].word);
      return word ? { id: id || 'imported', word: word } : null;
    }).filter(Boolean) : [];
    if (held.length) out.held = held;
    if (['yes', 'no', 'unsure'].indexOf(r.needFit) !== -1) out.needFit = r.needFit;
    var body = Array.isArray(r.body) ? r.body.slice(0, 60).map(function (x) {
      if (!x || typeof x !== 'object') return null;
      var id = s(x.id, 40), label = s(x.label, 60) || (BODY[id] && BODY[id].label);
      if (!label) return null;
      var o = { id: id || 'imported', label: label };
      if (AREA[x.area]) o.area = x.area;
      var lv = Math.round(Number(x.level));
      if (lv >= 1 && lv <= 3) o.level = lv;
      return o;
    }).filter(Boolean) : [];
    if (body.length) out.body = body;
    function areaMap(m, ok) {
      var o = {};
      if (m && typeof m === 'object' && !Array.isArray(m)) Object.keys(m).slice(0, 100).forEach(function (k) { var v = ok(m[k]); if (k.length <= 40 && v) o[k] = v; });
      return Object.keys(o).length ? o : null;
    }
    var eb = areaMap(r.emoBody, function (v) { var a = Array.isArray(v) ? v.filter(function (x) { return AREA[x]; }).slice(0, 12) : []; return a.length ? a : null; });
    if (eb) out.emoBody = eb;
    var ft = areaMap(r.fit, function (v) { return v === 'exact' || v === 'close' ? v : null; });
    if (ft) out.fit = ft;
    return out;
  }
  function parseBackup(text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { return { error: '이 파일은 "감정 및 욕구 찾기" 기록 파일이 아니에요. 내보내기로 저장한 .json 파일을 골라 주세요.' }; }
    var list = Array.isArray(data) ? data : (data && Array.isArray(data.records) ? data.records : null);
    if (!list || (data && !Array.isArray(data) && data.app && data.app !== BACKUP_APP)) {
      return { error: '이 파일은 "감정 및 욕구 찾기" 기록 파일이 아니에요. 내보내기로 저장한 .json 파일을 골라 주세요.' };
    }
    var clean = list.map(cleanRecord).filter(Boolean);
    if (!clean.length) return { error: '파일 안에 불러올 수 있는 기록이 없어요.' };
    return { records: clean, broken: list.length - clean.length };
  }
  function handleImportFile(file, errBox) {
    errBox.textContent = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { errBox.textContent = '파일이 너무 커요. 내보내기로 저장한 파일이 맞는지 확인해 주세요.'; return; }
    var reader = new FileReader();
    reader.onload = function () {
      var res = parseBackup(String(reader.result || ''));
      if (res.error) { errBox.textContent = res.error; return; }
      var have = {};
      records().forEach(function (r) { have[r.id] = true; });
      var fresh = [];
      res.records.forEach(function (r) { if (!have[r.id]) { have[r.id] = true; fresh.push(r); } });
      pendingImport = { total: res.records.length, fresh: fresh, broken: res.broken, name: file.name };
      go('importConfirm', {});
    };
    reader.onerror = function () { errBox.textContent = '파일을 읽지 못했어요. 다시 골라 주세요.'; };
    reader.readAsText(file);
  }

  screens.backup = function () {
    var n = records().length;
    var err = el('p', { class: 'error', role: 'alert', 'data-testid': 'import-error' });
    var input = el('input', { type: 'file', accept: '.json,application/json', class: 'sr-only', id: 'import-file', 'data-testid': 'import-file', tabindex: '-1' });
    input.addEventListener('change', function () { handleImportFile(input.files && input.files[0], err); input.value = ''; });
    return screen('backup', null, simpleTop('기록 옮기기'),
      heading('기록 옮기기', '휴대폰을 바꾸거나 기록을 지우기 전에'),
      el('section', { class: 'report-sec' },
        el('h2', { class: 'sec-title' }, '1. 파일로 내보내기'),
        el('p', { class: 'body-text' }, '지금 기록 ' + n + '개를 파일 하나로 저장해요. 도감·연속 기록·주간 보고서는 기록에서 다시 계산되니 함께 옮겨져요.'),
        el('button', { class: 'btn btn-primary', type: 'button', 'data-testid': 'export-download', onclick: downloadBackup, disabled: !n }, '💾 파일로 저장하기'),
        canShareFile() ? el('button', { class: 'btn btn-secondary', type: 'button', 'data-testid': 'export-share', onclick: shareBackup, disabled: !n }, '📤 다른 앱으로 보내기 (메일·드라이브 등)') : null,
        el('p', { class: 'guide' }, '⚠️ 파일 안에는 적은 글이 그대로 들어 있어요. 다른 사람에게 보내지 않도록 조심하세요.')
      ),
      el('section', { class: 'report-sec' },
        el('h2', { class: 'sec-title' }, '2. 파일 불러오기'),
        el('p', { class: 'body-text' }, '내보낸 파일을 고르면 그 안의 기록을 이 휴대폰에 더해요. 지금 있는 기록은 지워지지 않고, 이미 있는 기록은 건너뛰어요.'),
        el('button', { class: 'btn btn-secondary', type: 'button', 'data-testid': 'import-pick', onclick: function () { input.click(); } }, '📂 파일 고르기'),
        input,
        err
      ),
      el('p', { class: 'guide' }, '새 휴대폰으로 옮길 때: 옛 휴대폰에서 "파일로 저장하기" 또는 "다른 앱으로 보내기" → 새 휴대폰에서 그 파일을 받아 "파일 고르기"를 누르세요.'),
      menuNav()
    );
  };

  screens.importConfirm = function () {
    var p = pendingImport;
    if (!p) return screens.backup();
    var n = p.fresh.length;
    var lines = [
      el('p', { class: 'body-text', 'data-testid': 'import-summary' }, '파일에서 기록 ' + p.total + '개를 찾았어요. 그중 새 기록은 ' + n + '개, 이미 있는 기록은 ' + (p.total - n) + '개예요.'),
      p.broken ? el('p', { class: 'guide' }, '내용이 망가진 기록 ' + p.broken + '개는 뺐어요.') : null
    ];
    return screen('importConfirm', null, simpleTop('기록 불러오기'),
      heading(n ? '새 기록 ' + n + '개를 더할까요?' : '모두 이미 있는 기록이에요'),
      lines,
      n ? el('p', { class: 'guide' }, '지금 이 휴대폰에 있는 기록 ' + records().length + '개는 그대로 남아요.') : null,
      navBar({
        back: { onClick: function () { pendingImport = null; back(); } },
        next: n ? {
          label: '불러오기', testid: 'import-confirm', onClick: function () {
            var d = load();
            d.records = d.records.concat(p.fresh).sort(function (a, b) { return a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0; });
            save(d);
            pendingImport = null;
            goHome();
            toast('기록 ' + n + '개를 불러왔어요.');
          }
        } : { label: T.navDone || '처음 화면으로', onClick: function () { pendingImport = null; goHome(); } }
      })
    );
  };

  /* ───────── 그리기 ───────── */
  /* 체크처럼 같은 화면을 다시 그릴 때: 스크롤 위치와 누른 버튼을 그대로 둬요 */
  function refresh() {
    var y = window.scrollY;
    var a = document.activeElement;
    var key = a && a.getAttribute ? (a.getAttribute('data-id') ? '[data-id="' + a.getAttribute('data-id') + '"]' : (a.getAttribute('data-testid') ? '[data-testid="' + a.getAttribute('data-testid') + '"]' : null)) : null;
    render(true);
    window.scrollTo(0, y);
    if (key) { var b = app.querySelector(key); if (b) { try { b.focus({ preventScroll: true }); } catch (e) { /* 무시 */ } } }
  }
  function render(keep) {
    document.body.classList.remove('no-scroll');
    var fn = screens[current.screen] || screens.home;
    var node;
    try {
      node = fn(current.params || {});
    } catch (err) {
      console.error(err);
      node = screen('data-error', null,
        el('h1', { class: 'title' }, '화면을 그리다가 문제가 생겼어요'),
        el('p', { class: 'body-text' }, '데이터 파일의 이름표(id)가 바뀌었을 수 있어요. 처음 화면으로 돌아가 다시 해 보세요.'),
        el('button', { class: 'btn btn-primary btn-big', type: 'button', onclick: goHome }, '처음 화면으로'));
    }
    app.innerHTML = '';
    app.appendChild(node);
    document.body.setAttribute('data-current', current.screen);
    if (keep === true) return;
    window.scrollTo(0, 0);
    var h = app.querySelector('h1');
    if (h) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
  }

  /* 컴퓨터에서 숫자 1~9 키로도 고를 수 있어요 */
  document.addEventListener('keydown', function (ev) {
    if (ev.target && (ev.target.tagName === 'TEXTAREA' || ev.target.tagName === 'INPUT')) return;
    if (/^[1-9]$/.test(ev.key)) {
      var b = app.querySelector('.opt[data-num="' + ev.key + '"]');
      if (b) { ev.preventDefault(); b.click(); }
    }
  });

  /* 테스트에서 쓰는 창구 (화면 동작에는 영향 없음) */
  window.__maeum = {
    josa: josa, fill: fill, streak: streak,
    totalWords: function () { return ALL_WORDS.length; },
    totalNeeds: function () { return D.needs.length; },
    records: function () { return records(); },
    searchWords: function (t) { return searchWords(t).map(function (w) { return w.word; }); },
    searchNeeds: function (t) { return searchNeeds(t).map(function (n) { return n.word; }); },
    found: function () { return Object.keys(foundSet()).length; }
  };

  /* 처음 여는 사람(기록도 없고 안내도 안 본 사람)에게만 게임 방법 안내를 먼저 보여 줘요 */
  if (!introSeen() && !records().length) current = { screen: 'guide', params: {} };

  render();

  /* 인터넷 없이도 열리도록 service worker 등록 */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function (e) { console.warn('service worker 등록 실패', e); });
    });
  }
})();
