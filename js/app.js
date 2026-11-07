/*
  내 마음 찾기 — 게임 동작 코드
  문장과 단어는 data 폴더의 파일에 있어요. 이 파일은 고치지 않아도 돼요.
*/
(function () {
  'use strict';

  var D = window.MAEUM_DATA || {};
  var STORE_KEY = 'maeum-chatgi-v1';
  var app = document.getElementById('app');

  /* ───────── 데이터 점검 ───────── */
  function checkData() {
    var missing = [];
    if (!D.families) missing.push('data/emotions.js');
    if (!D.needs) missing.push('data/needs.js');
    if (!D.text || !D.causes || !D.approaches || !D.needRounds || !D.needsByCause) missing.push('data/questions.js');
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
  var EMO = {};          // id → { id, word, desc, family, hidden, parent, same }
  var FAMILY = {};       // id → family
  var ALL_WORDS = [];    // 도감에 들어가는 감정 전체 (같은 뜻 다른 말 포함)
  function addEmotion(e, f, hidden) {
    var main = { id: e.id, word: e.word, desc: e.desc, ask: e.ask || '', family: f.id, hidden: hidden, parent: null, same: [] };
    EMO[e.id] = main;
    ALL_WORDS.push(main);
    (e.same || []).forEach(function (x) {
      if (!x || !x.id || !x.word) return;
      EMO[x.id] = { id: x.id, word: x.word, desc: x.desc || e.desc, family: f.id, hidden: hidden, parent: e.id, same: [] };
      main.same.push(x.id);
      ALL_WORDS.push(EMO[x.id]);
    });
  }
  D.families.forEach(function (f) {
    FAMILY[f.id] = f;
    f.groups.forEach(function (g) {
      g.emotions.forEach(function (e) { addEmotion(e, f, false); });
    });
    (f.hidden || []).forEach(function (e) { addEmotion(e, f, true); });
  });
  var UNNAMED = D.unnamedEmotion || { id: 'unnamed', word: '이름 붙이기 어려운 감정', desc: '' };
  EMO[UNNAMED.id] = { id: UNNAMED.id, word: UNNAMED.word, desc: UNNAMED.desc, family: 'unknown', hidden: false };
  FAMILY.unknown = { id: 'unknown', label: '이름 붙이기 어려운 쪽', emoji: '☁️', color: '#7A8291' };

  var NEED = {};
  D.needs.forEach(function (n) { NEED[n.id] = n; });
  var UNNAMED_NEED = D.unnamedNeed || { id: 'unnamedNeed', word: '이름 붙이기 어려운 욕구', text: '아직 이름을 찾지 못한 욕구', tip: '' };
  NEED[UNNAMED_NEED.id] = UNNAMED_NEED;

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
    d.records.forEach(function (r) { if (r.id === id) Object.keys(patch).forEach(function (k) { r[k] = patch[k]; }); });
    save(d);
  }
  /* 게임 방법 안내를 본 적이 있는지 (기록과 따로 저장해서 기록을 지워도 다시 안 나와요) */
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
  function introCards() { return Array.isArray(D.intro) ? D.intro.filter(function (c) { return c && c.title; }) : []; }

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
  function internalBack() {
    if (!stack.length) {
      if (current.screen !== 'home') goHome();
      return;
    }
    var prev = stack.pop();
    draft = prev.draft;
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
    situation: 1, family: 2, meter: 2, group: 2, words: 2, wording: 2, compare: 2, search: 2, approach: 2, unnamed: 2,
    intensity: 3, cause: 4, causeOther: 4, need: 5, needGroup: 5, needWords: 5, needCompare: 5, needSearch: 5, needUnnamed: 5, result: 6
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
      el('button', { class: 'top-btn', type: 'button', onclick: back, 'aria-label': '처음 화면으로' }, '← 처음으로'),
      el('span', { class: 'top-step' }, title),
      el('span', { class: 'top-spacer' })
    );
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
  function toast(msg) {
    var t = el('div', { class: 'toast', role: 'status' }, msg);
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 2600);
  }

  /* ───────── 게임 진행 ───────── */
  function startGame() {
    draft = { situation: '', five: 0, path: 'normal', emotionId: null, intensity: null, cause: null, causeText: '', needId: null, needFromReverse: false };
    stack = [];
    go('situation', {});
  }

  function emotionFive() {
    draft.five = (draft.five || 0) + 1;
    if (draft.five <= D.approaches.length) {
      go('approach', { index: draft.five - 1 });
    } else {
      go('unnamed', {});
    }
  }

  /* 비슷한 감정 구별하기: 고른 감정이 들어 있는 첫 번째 줄 (없으면 null) */
  function compareSetFor(id) {
    var sets = D.compareSets || [];
    for (var i = 0; i < sets.length; i++) {
      var ids = (sets[i].ids || []).filter(function (x) { return EMO[x] && EMO[x].ask; });
      if (ids.indexOf(id) !== -1 && ids.length > 1) return [id].concat(ids.filter(function (x) { return x !== id; })).slice(0, 4);
    }
    return null;
  }

  /* 감정은 여러 개(최대 3개)를 체크할 수 있어요.
     draft.picks = 체크한 감정 [{ id, path, exact }]
     "다음"을 누르면 체크한 감정마다 (하나만 골랐을 때만) 비슷한 감정 구별 → 같은 뜻 다른 말을 차례로 묻고 강도로 가요. */
  var MAX_PICKS = 3;
  function picks() { return (draft && draft.picks) || []; }
  function isPicked(id) { return picks().some(function (x) { return x.id === id; }); }
  function togglePick(id, path, exact) {
    if (!draft.picks) draft.picks = [];
    var at = -1;
    draft.picks.forEach(function (x, k) { if (x.id === id) at = k; });
    if (at !== -1) draft.picks.splice(at, 1);
    else if (draft.picks.length >= MAX_PICKS) { toast(T.pickMax || '감정은 3개까지 고를 수 있어요.'); return; }
    else draft.picks.push({ id: id, path: path || null, exact: !!exact });
    refresh();
  }
  /* 체크한 감정 하나를 끝까지 정하기: 화면이 더 필요하면 { screen, params }, 다 정해졌으면 { id } */
  function resolvePick(k) {
    var x = draft.picks[k];
    var dec = (draft.decide && draft.decide[k]) || {};
    var id = x.id;
    if (!x.exact && draft.picks.length === 1 && compareSetFor(id)) {
      if (!dec.compared) return { screen: 'compare', params: { id: id, k: k } };
      id = dec.compared;
    }
    if (!x.exact && EMO[id] && EMO[id].same && EMO[id].same.length) {
      if (!dec.worded || dec.wordedFrom !== id) return { screen: 'wording', params: { id: id, k: k } };
      id = dec.worded;
    }
    return { id: id };
  }
  function processPicks() {
    var out = [];
    for (var k = 0; k < draft.picks.length; k++) {
      var r = resolvePick(k);
      if (r.screen) { go(r.screen, r.params); return; }
      if (out.indexOf(r.id) === -1) out.push(r.id);
    }
    draft.emotions = out;
    draft.emotionId = out[0];
    draft.intensities = draft.intensities || {};
    go('intensity', { index: 0 });
  }
  function pickNext() {
    if (!picks().length) return;
    draft.decide = {};
    draft.path = draft.picks[0].path || draft.path || 'normal';
    processPicks();
  }
  function decide(k, key, value, from) {
    if (!draft.decide) draft.decide = {};
    var d = draft.decide[k] || {};
    if (key === 'compared') d = { compared: value };
    else { d.worded = value; d.wordedFrom = from; }
    draft.decide[k] = d;
    processPicks();
  }

  /* 고른 감정 막대 (화면 위쪽). ✕를 누르면 빼요 */
  function pickBar(showMore) {
    var ps = picks();
    if (!ps.length) return null;
    return el('div', { class: 'pick-bar', 'data-testid': 'pick-bar' },
      el('p', { class: 'pick-title' }, fill(T.pickTitle || '고른 감정 {글}개', { '글': String(ps.length) }) + ' · ' + (T.pickLimit || '3개까지')),
      el('div', { class: 'pick-chips' }, ps.map(function (x) {
        var e = EMO[x.id];
        return el('button', { class: 'pick-chip', type: 'button', 'data-pick': x.id, 'aria-label': e.word + ' 빼기', style: '--accent:' + FAMILY[e.family].color, onclick: function () { togglePick(x.id); } }, e.word + ' ✕');
      })),
      el('div', { class: 'pick-actions' },
        showMore && ps.length < MAX_PICKS ? el('button', { class: 'btn btn-secondary', type: 'button', 'data-testid': 'pick-more', onclick: function () { go('family', {}); } }, T.pickMore || '다른 쪽에서 더 고르기') : null,
        el('button', { class: 'btn btn-primary', type: 'button', 'data-testid': 'pick-next', onclick: pickNext }, T.pickNext || '다음 →')
      )
    );
  }

  function afterCause() {
    if (draft.needFromReverse && draft.needId) finish();
    else go('need', { round: 0 });
  }

  /* 첫 욕구 화면의 보기 4개: 감정별 목록 → 없으면 감정 쪽 × 원인.
     결과 카드에서 "이 욕구가 맞았나요?"에 답한 기록이 있으면 반영해요:
     같은 감정에서 "네"가 많았던 욕구는 앞에, "아니요"가 더 많았던 욕구는 빼요. ("잘 모르겠음"은 그대로) */
  function mainKey(id) { var e = EMO[id]; return e ? (e.parent || e.id) : id; }
  function needFeedback(key) {
    var score = {};
    records().forEach(function (r) {
      if (!r.needFit || !r.needId || mainKey(r.emotionId) !== key) return;
      score[r.needId] = (score[r.needId] || 0) + (r.needFit === 'yes' ? 1 : r.needFit === 'no' ? -1 : 0);
    });
    return score;
  }
  function needCandidates() {
    var e = EMO[draft.emotionId];
    var key = e ? mainKey(e.id) : null;
    var fam = e ? e.family : 'unknown';
    var byFam = D.needsByCause[fam] || D.needsByCause.unknown;
    var byCause = byFam[draft.cause] || byFam.other || [];
    var base = ((D.needsByEmotion || {})[key] || byCause).slice();
    var score = key ? needFeedback(key) : {};
    var liked = Object.keys(score).filter(function (id) { return score[id] > 0 && NEED[id]; }).sort(function (a, b) { return score[b] - score[a]; }).slice(0, 2);
    var out = [];
    function add(id) { if (out.length < 4 && NEED[id] && out.indexOf(id) === -1 && !(score[id] < 0)) out.push(id); }
    liked.forEach(add);
    base.forEach(add);
    byCause.forEach(add);
    (D.needs || []).forEach(function (n) { add(n.id); });
    return out;
  }
  /* 비슷한 욕구 구별하기: 고른 욕구가 든 첫 번째 줄 */
  function needCompareSetFor(id) {
    var sets = D.needCompareSets || [];
    for (var i = 0; i < sets.length; i++) {
      var ids = (sets[i].ids || []).filter(function (x) { return NEED[x] && NEED[x].ask; });
      if (ids.indexOf(id) !== -1 && ids.length > 1) return [id].concat(ids.filter(function (x) { return x !== id; })).slice(0, 4);
    }
    return null;
  }
  function pickNeed(id, exact, compared) {
    if (!exact && !compared && needCompareSetFor(id)) { go('needCompare', { id: id }); return; }
    draft.needId = id;
    finish();
  }
  function needGroups() { return (D.needGroups || []).filter(function (g) { return g && g.needs && g.needs.length; }); }

  function intensityWord(n) {
    var w = D.intensityWords || [];
    return w[n - 1] || '';
  }

  /* 감정 이름 잇기: 서운함 / 서운함과 미안함 / 서운함, 미안함과 착잡함 */
  function joinWords(words) {
    if (words.length <= 1) return words[0] || '';
    var last = words[words.length - 1];
    var rest = words.slice(0, -1);
    return (rest.length > 1 ? rest.slice(0, -1).join(', ') + ', ' : '') + josa(rest[rest.length - 1], '과') + ' ' + last;
  }

  function finish() {
    var before = foundSet();
    var ids = draft.emotions && draft.emotions.length ? draft.emotions : [draft.emotionId];
    var list = ids.map(function (id) {
      var x = EMO[id];
      var n = (draft.intensities && draft.intensities[id]) || draft.intensity;
      return { id: x.id, word: x.word, family: x.family, hidden: !!x.hidden, intensity: n };
    });
    var e = list[0];
    var maxN = list.reduce(function (a, x) { return Math.max(a, x.intensity); }, 0);
    var need = NEED[draft.needId] || UNNAMED_NEED;
    var cause = CAUSE[draft.cause] || CAUSE.other;
    var causeSentence = cause.sentence;
    if (draft.cause === 'other' && draft.causeText && cause.sentenceWithText) {
      causeSentence = fill(cause.sentenceWithText, { '글': draft.causeText });
    }
    var tpl;
    if (need.id === UNNAMED_NEED.id) tpl = T.summaryNoNeed;
    else if (list.every(function (x) { return x.family === 'joy'; })) tpl = T.summaryMet;
    else tpl = T.summaryUnmet;
    var words = list.map(function (x) { return x.word; });
    var summary = fill(tpl, { '원인': causeSentence, '감정': joinWords(words), '강도': intensityWord(maxN), '욕구': need.text, '바람': need.text });
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
      needId: need.id,
      needWord: need.word,
      summary: summary,
      tip: need.tip,
      path: draft.path,
      five: draft.five || 0
    };
    addRecord(rec);
    var isNew = list.some(function (x) { return x.id !== UNNAMED.id && !before[x.id]; });
    stack = [];
    draft = null;
    current = { screen: 'result', params: { id: rec.id, isNew: isNew } };
    render();
  }

  /* ───────── 화면들 ───────── */
  var screens = {};

  screens.home = function () {
    var recs = records();
    var found = Object.keys(foundSet(recs)).length;
    var s = streak();
    var wrap = screen('home', null,
      el('div', { class: 'hero' },
        el('div', { class: 'hero-icon', 'aria-hidden': 'true' }, '💗'),
        el('h1', { class: 'app-title', tabindex: '-1' }, T.appTitle),
        el('p', { class: 'app-sub' }, T.appSubtitle)
      ),
      el('button', { class: 'btn btn-primary btn-big', type: 'button', onclick: startGame, 'data-testid': 'start' }, T.startButton),
      el('p', { class: 'encourage' }, T.homeEncourage),
      el('div', { class: 'stats' },
        statTile('📖', '감정 도감', found + ' / ' + ALL_WORDS.length, 'stat-dex'),
        statTile('🔥', '연속 기록', s + '일', 'stat-streak'),
        statTile('🗂', '전체 기록', recs.length + '개', 'stat-count')
      ),
      el('nav', { class: 'menu' },
        menuBtn('📖', '감정 도감', '찾은 감정 단어 모아 보기', function () { go('dex', {}); }, 'menu-dex'),
        menuBtn('📊', '주간 감정 보고서', '자주 나온 감정과 욕구', function () { go('report', { offset: 0 }); }, 'menu-report'),
        menuBtn('🗂', '지난 기록', '지금까지 만든 마음 카드', function () { go('records', {}); }, 'menu-records'),
        menuBtn('💾', '기록 옮기기', '파일로 저장하기·불러오기', function () { go('backup', {}); }, 'menu-backup'),
        introCards().length ? menuBtn('❓', T.introMenu || '게임 방법', T.introMenuHint || '', function () { go('intro', { page: 0 }); }, 'menu-intro') : null
      ),
      installHelp(),
      el('p', { class: 'privacy' }, T.privacy),
      !storageOK ? el('p', { class: 'warn' }, '이 브라우저에서는 기록이 저장되지 않을 수 있어요. 일반 창(시크릿 창이 아닌 창)으로 열어 주세요.') : null,
      el('button', { class: 'btn btn-danger-outline', type: 'button', onclick: function () { go('deleteConfirm', {}); }, 'data-testid': 'delete-all' }, '기록 전체 삭제')
    );
    return wrap;
  };
  function statTile(icon, label, value, testid) {
    return el('div', { class: 'stat', 'data-testid': testid },
      el('span', { class: 'stat-icon', 'aria-hidden': 'true' }, icon),
      el('span', { class: 'stat-value' }, value),
      el('span', { class: 'stat-label' }, label)
    );
  }
  function menuBtn(icon, label, hint, onClick, testid) {
    return el('button', { class: 'menu-btn', type: 'button', onclick: onClick, 'data-testid': testid },
      el('span', { class: 'menu-icon', 'aria-hidden': 'true' }, icon),
      el('span', { class: 'opt-body' }, el('span', { class: 'opt-label' }, label), el('span', { class: 'opt-hint' }, hint))
    );
  }

  var deferredInstall = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstall = e;
    if (current.screen === 'home') render();
  });
  function installHelp() {
    var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    if (standalone || window.navigator.standalone) return null;
    return el('details', { class: 'install' },
      el('summary', null, '📲 홈 화면에 앱으로 설치하는 방법'),
      deferredInstall ? el('button', {
        class: 'btn btn-primary', type: 'button', onclick: function () {
          deferredInstall.prompt();
          deferredInstall = null;
        }
      }, '지금 설치하기') : null,
      el('p', null, '안드로이드(크롬): 오른쪽 위 ⋮ 메뉴 → "홈 화면에 추가" 또는 "앱 설치"를 누르세요.'),
      el('p', null, '아이폰(사파리): 아래쪽 공유 버튼(네모에 화살표) → "홈 화면에 추가"를 누르세요.'),
      el('p', null, '한 번 연 뒤에는 인터넷이 없어도 열려요.')
    );
  }

  /* 게임 방법 안내 (카드 한 장씩) */
  screens.intro = function (p) {
    var cards = introCards();
    if (!cards.length) { markIntroSeen(); return screens.home(); }
    var i = Math.max(0, Math.min(cards.length - 1, p.page || 0));
    var c = cards[i];
    var last = i === cards.length - 1;
    function done() { markIntroSeen(); goHome(); }
    function page(n) { go('intro', { page: n }, { push: false }); }
    var dots = cards.map(function (x, k) { return el('span', { class: 'dot' + (k <= i ? ' on' : '') }); });
    return screen('intro', { 'data-page': String(i) },
      el('header', { class: 'topbar' },
        el('span', { class: 'top-spacer intro-spacer' }),
        el('span', { class: 'top-step' }, (i + 1) + ' / ' + cards.length),
        el('button', { class: 'top-btn', type: 'button', onclick: done, 'data-testid': 'intro-skip' }, T.introSkip || '건너뛰기')
      ),
      el('div', { class: 'progress', 'aria-hidden': 'true' }, dots),
      el('div', { class: 'soft-card intro-card' },
        c.icon ? el('div', { class: 'soft-icon', 'aria-hidden': 'true' }, c.icon) : null,
        heading(c.title),
        el('p', { class: 'body-text', 'data-testid': 'intro-body' }, c.body || '')
      ),
      el('div', { class: 'intro-nav' },
        i > 0 ? el('button', { class: 'btn btn-secondary', type: 'button', 'data-testid': 'intro-prev', onclick: function () { page(i - 1); } }, T.introPrev || '← 이전') : null,
        el('button', {
          class: 'btn btn-primary btn-big', type: 'button', 'data-testid': last ? 'intro-done' : 'intro-next',
          onclick: last ? done : function () { page(i + 1); }
        }, last ? (T.introDone || '시작할게요') : (T.introNext || '다음 →'))
      )
    );
  };

  screens.situation = function () {
    var ta = el('textarea', {
      id: 'situation', class: 'textarea', rows: '4', maxlength: '200',
      placeholder: T.situationPlaceholder, 'aria-describedby': 'situation-guide'
    });
    ta.value = draft.situation || '';
    var count = el('p', { class: 'counter' }, ta.value.length + ' / 200');
    /* 아무것도 안 적었으면 버튼이 "적지 않고 시작하기"가 돼요 (있었던 일은 적지 않아도 돼요) */
    var nextBtn = el('button', { class: 'btn btn-primary btn-big', type: 'button', onclick: next, 'data-testid': 'next' });
    function label() { nextBtn.textContent = ta.value.trim() ? T.nextButton : (T.situationSkip || T.nextButton); }
    label();
    ta.addEventListener('input', function () { count.textContent = ta.value.length + ' / 200'; label(); });
    function next() {
      var v = ta.value.trim();
      draft.situation = v;
      go('family', {});
    }
    return screen('situation', null, topBar(), progress(),
      heading(T.situationTitle),
      el('p', { class: 'guide', id: 'situation-guide' }, T.situationGuide),
      el('label', { class: 'sr-only', for: 'situation' }, T.situationTitle),
      ta, count,
      nextBtn
    );
  };

  /* 감정 쪽 고르기: 쪽이 4개보다 많아 두 줄로 놓아요. 맨 끝 "잘 모르겠어요"는 다른 화면의 5번과 같은 일을 해요 */
  screens.family = function () {
    var opts = D.families.map(function (f, i) {
      return option(i + 1, f.emoji + ' ' + f.label, f.hint, function () { go('group', { family: f.id }); }, { color: f.color, id: f.id, cls: 'opt-tile', tile: true });
    });
    opts.push(option(D.families.length + 1, T.familyNotSure, T.familyNotSureHint, function () { if (D.moodMeter) go('meter', {}); else emotionFive(); }, { id: 'not-sure', icon: '?', cls: 'opt-five opt-tile', tile: true }));
    return screen('family', null, topBar(), progress(), pickBar(false), situationChip(), heading(T.familyTitle), el('div', { class: 'opts opts-grid' }, opts), searchButton());
  };

  function situationChip() {
    if (!draft || !draft.situation) return null;
    return el('p', { class: 'sit-chip' }, '“' + draft.situation + '”');
  }

  /* 묶음은 한 장에 4개씩 보여 줘요. 묶음이 더 있으면 5번이 "다른 묶음 더 보기"가 되고,
     마지막 장의 5번은 "이 중엔 없어요"(질문 방법 바꾸기)예요. */
  var GROUPS_PER_PAGE = 4;
  screens.group = function (p) {
    var f = FAMILY[p.family];
    var pages = Math.max(1, Math.ceil(f.groups.length / GROUPS_PER_PAGE));
    var pg = Math.min(Math.max(p.page || 0, 0), pages - 1);
    var start = pg * GROUPS_PER_PAGE;
    var opts = f.groups.slice(start, start + GROUPS_PER_PAGE).map(function (g, k) {
      var gi = start + k;
      return option(k + 1, g.label, g.hint, function () { go('words', { family: f.id, group: gi }); }, { color: f.color });
    });
    if (pg < pages - 1) {
      opts.push(option(5, T.groupMore || '다른 묶음 더 보기', T.groupMoreHint || '', function () {
        go('group', { family: f.id, page: pg + 1 });
      }, { id: 'group-more' }));
    } else {
      opts.push(fiveOption());
    }
    var lead = f.emoji + ' ' + f.label + (pages > 1 ? ' (' + (pg + 1) + ' / ' + pages + ')' : '');
    return screen('group', { 'data-family': f.id, 'data-page': String(pg) }, topBar(), progress(), pickBar(false),
      heading(T.groupTitle, lead), el('div', { class: 'opts' }, opts), searchButton());
  };

  screens.words = function (p) {
    var ids, question, small = null, path = null;
    if (p.ids) {
      ids = p.ids; question = p.question; small = p.small || null; path = p.path || null;
    } else {
      var f = FAMILY[p.family];
      ids = f.groups[p.group].emotions.map(function (e) { return e.id; });
      question = T.wordsTitle;
      small = f.emoji + ' ' + f.groups[p.group].label;
    }
    var opts = ids.filter(function (id) { return EMO[id]; }).slice(0, 4).map(function (id, i) {
      var e = EMO[id];
      var on = isPicked(id);
      return option(i + 1, e.word, e.desc, function () { togglePick(id, path, false); },
        { color: FAMILY[e.family].color, id: id, icon: on ? '✓' : null, cls: on ? 'opt-checked' : '', pressed: on });
    });
    opts.push(fiveOption());
    return screen('words', null, topBar(), progress(), pickBar(true), heading(question, small),
      el('p', { class: 'guide' }, T.pickGuide || '맞는 감정을 눌러 체크하세요. 여러 개(3개까지) 골라도 돼요.'),
      el('div', { class: 'opts' }, opts),
      picks().length ? el('button', { class: 'btn btn-primary btn-big', type: 'button', 'data-testid': 'pick-next-bottom', onclick: pickNext }, fill(T.pickNextCount || '고른 감정 {글}개로 다음 →', { '글': String(picks().length) })) : null);
  };

  screens.wording = function (p) {
    var e = EMO[p.id];
    var ids = [e.id].concat(e.same).slice(0, 4);
    var opts = ids.map(function (id, i) {
      var w = EMO[id];
      var hint = id === e.id ? e.desc : fill(T.wordingSameHint || '{감정과} 같은 뜻이에요', { '감정': e.word });
      return option(i + 1, w.word, hint, function () { decide(p.k || 0, 'worded', id, e.id); }, { color: FAMILY[e.family].color, id: id });
    });
    opts.push(fiveOption());
    return screen('wording', { 'data-parent': e.id }, topBar(), progress(),
      heading(T.wordingTitle || '뜻은 같은 말이에요. 평소에 쓰는 말을 골라 보세요.', FAMILY[e.family].emoji + ' ' + e.word),
      T.wordingGuide ? el('p', { class: 'guide' }, T.wordingGuide) : null,
      el('div', { class: 'opts' }, opts));
  };

  /* 비슷한 감정 구별하기 — 감정 이름 대신 "그때 무슨 일이었는지"를 문장으로 견주어 골라요 */
  screens.compare = function (p) {
    var e = EMO[p.id];
    var ids = compareSetFor(p.id) || [p.id];
    var opts = ids.map(function (id, i) {
      var w = EMO[id];
      return option(i + 1, w.ask, '→ ' + w.word, function () { decide(p.k || 0, 'compared', id); },
        { color: FAMILY[w.family].color, id: id, cls: id === p.id ? 'opt-picked' : '' });
    });
    opts.push(fiveOption());
    return screen('compare', { 'data-picked': e.id }, topBar(), progress(),
      heading(T.compareTitle || '비슷한 감정과 견주어 볼게요. 그때 일과 가장 맞는 문장을 골라 보세요.',
        FAMILY[e.family].emoji + ' ' + fill(T.compareLead || '고른 감정: {감정}', { '감정': e.word })),
      el('div', { class: 'opts' }, opts));
  };

  /* ───── 단어로 찾기 ───── */
  function searchButton() {
    return el('button', { class: 'btn btn-secondary search-open', type: 'button', 'data-testid': 'search-open', onclick: function () { go('search', {}); } },
      T.searchButton || '🔍 단어로 찾기');
  }

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
      found.forEach(function (w) { list.appendChild(cfg.item(w)); });
    }
    input.addEventListener('input', function () { if (cfg.keep) draft[cfg.keep] = input.value; show(); });
    input.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); } });
    show();
    return screen(name, null, topBar(), progress(), cfg.bar ? cfg.bar() : null,
      heading(cfg.title),
      el('p', { class: 'guide', id: 'search-guide' }, cfg.guide || ''),
      el('label', { class: 'sr-only', for: 'search-text' }, cfg.title),
      input, info, list
    );
  }
  function searchItem(id, label, hint, color, onClick, on) {
    return el('button', { class: 'search-item' + (on ? ' search-item-checked' : ''), type: 'button', 'data-id': id, 'aria-pressed': on === undefined ? null : String(!!on), style: color ? '--accent:' + color : null, onclick: onClick },
      el('span', { class: 'opt-body' }, el('span', { class: 'opt-label' }, label), el('span', { class: 'opt-hint' }, hint)));
  }

  screens.search = function () {
    return searchScreen('search', {
      title: T.searchTitle || '떠오르는 감정 단어를 적어 보세요',
      guide: T.searchGuide, placeholder: T.searchPlaceholder || '감정 단어 적기',
      suggestLabel: T.searchSuggest || '자주 찾는 감정',
      keep: 'searchText',
      bar: function () { return pickBar(true); },
      suggest: function () { return (D.searchSuggest || []).filter(function (id) { return EMO[id]; }).map(function (id) { return EMO[id]; }); },
      find: searchWords,
      item: function (w) {
        var fam = FAMILY[w.family];
        var head = w.parent ? EMO[w.parent] : null;
        var hint = (head ? fill(T.searchSame || '{감정과} 같은 뜻', { '감정': head.word }) + ' · ' : '') + w.desc;
        var on = isPicked(w.id);
        return searchItem(w.id, (on ? '✓ ' : '') + (w.hidden ? '★ ' : '') + w.word, fam.emoji + ' ' + fam.label + ' · ' + hint, fam.color,
          function () { togglePick(w.id, 'search', true); }, on);
      }
    });
  };

  /* 기분 4칸 (무드 미터 방식): 기분 좋음–나쁨 × 힘이 넘침–빠짐 */
  screens.meter = function () {
    var M = D.moodMeter;
    var opts = M.options.slice(0, 4).map(function (o, i) {
      return option(i + 1, o.label, o.hint, function () {
        go('words', { ids: o.emotions, question: M.wordsQuestion, small: '“' + o.label + '”', path: 'meter' });
      }, { color: o.color, id: 'meter-' + (i + 1), cls: 'opt-tile', tile: true });
    });
    return screen('meter', null, topBar(), progress(), pickBar(false),
      heading(M.question, M.intro),
      el('p', { class: 'guide meter-axis' }, M.axis),
      el('div', { class: 'opts opts-grid meter-grid' }, opts),
      el('div', { class: 'opts' }, fiveOption()));
  };

  screens.approach = function (p) {
    var ap = D.approaches[p.index];
    var opts = ap.options.slice(0, 4).map(function (o, i) {
      return option(i + 1, o.label, null, function () {
        if (o.need) { draft.needId = o.need; draft.needFromReverse = true; }
        else { draft.needId = null; draft.needFromReverse = false; }
        go('words', { ids: o.emotions, question: ap.wordsQuestion, small: '“' + o.label + '”', path: ap.key });
      });
    });
    opts.push(fiveOption());
    return screen('approach', { 'data-approach': ap.key }, topBar(), progress(),
      heading(ap.question, ap.intro), el('div', { class: 'opts' }, opts));
  };

  screens.unnamed = function () {
    return screen('unnamed', null, topBar(), progress(),
      el('div', { class: 'soft-card' },
        el('div', { class: 'soft-icon', 'aria-hidden': 'true' }, '☁️'),
        heading(T.unnamedTitle),
        el('p', { class: 'body-text' }, T.unnamedBody)
      ),
      el('button', {
        class: 'btn btn-primary btn-big', type: 'button', 'data-testid': 'continue',
        onclick: function () { draft.needId = null; draft.needFromReverse = false; draft.picks = [{ id: UNNAMED.id, path: 'unnamed', exact: true }]; pickNext(); }
      }, T.continueButton)
    );
  };

  screens.intensity = function (p) {
    var list = draft.emotions && draft.emotions.length ? draft.emotions : [draft.emotionId];
    var idx = Math.min(Math.max(p.index || 0, 0), list.length - 1);
    var id = list[idx];
    var e = EMO[id];
    if (!draft.intensities) draft.intensities = {};
    var grid = [];
    for (var i = 1; i <= 10; i++) {
      (function (n) {
        grid.push(el('button', {
          class: 'num-btn' + (draft.intensities[id] === n ? ' selected' : ''), type: 'button', 'data-score': String(n),
          'aria-label': n + '점', style: '--lv:' + (n / 10),
          onclick: function () {
            draft.intensities[id] = n;
            if (idx + 1 < list.length) { go('intensity', { index: idx + 1 }); return; }
            draft.intensity = draft.intensities[list[0]];
            go('cause', {});
          }
        }, String(n)));
      })(i);
    }
    return screen('intensity', { 'data-emotion': id }, topBar(), progress(),
      heading(T.intensityTitle, '“' + e.word + '”' + (list.length > 1 ? ' (' + (idx + 1) + ' / ' + list.length + ')' : '')),
      el('p', { class: 'guide' }, T.intensityGuide),
      el('div', { class: 'num-grid' }, grid),
      el('div', { class: 'num-scale', 'aria-hidden': 'true' }, el('span', null, '아주 조금'), el('span', null, '가장 크게'))
    );
  };

  screens.cause = function () {
    var opts = D.causes.slice(0, 5).map(function (c, i) {
      return option(i + 1, c.label, c.hint, function () {
        if (c.id === 'other') { go('causeOther', {}); return; }
        draft.cause = c.id; draft.causeText = '';
        afterCause();
      }, { cls: c.id === 'other' ? 'opt-other' : '' });
    });
    return screen('cause', null, topBar(), progress(), heading(T.causeTitle), el('div', { class: 'opts' }, opts));
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
      el('button', { class: 'btn btn-primary btn-big', type: 'button', onclick: next, 'data-testid': 'next' }, T.continueButton)
    );
  };

  function needLead() {
    var e = EMO[draft.emotionId];
    return '“' + e.word + '” · ' + draft.intensity + '점';
  }
  function needExtras() {
    return [
      el('button', { class: 'btn btn-secondary search-open', type: 'button', 'data-testid': 'need-search-open', onclick: function () { go('needSearch', {}); } }, T.needSearchButton || '🔍 욕구 단어로 찾기'),
      el('button', { class: 'btn btn-secondary', type: 'button', 'data-testid': 'need-skip', onclick: function () { draft.needId = UNNAMED_NEED.id; finish(); } }, T.needSkip || '지금은 넘어가기')
    ];
  }

  screens.need = function () {
    var e = EMO[draft.emotionId];
    var r = D.needRounds[0];
    var q = (e.family === 'joy' && r.questionJoy) ? r.questionJoy : r.question;
    var opts = needCandidates().map(function (id, i) {
      var n = NEED[id];
      return option(i + 1, n.text, n.word, function () { pickNeed(id); }, { id: id });
    });
    opts.push(option(5, T.needMore || '다른 욕구 찾기', T.needMoreHint || '', function () { go('needGroup', { page: 0 }); }, { id: 'need-more' }));
    return screen('need', null, topBar(), progress(), heading(q, needLead()), el('div', { class: 'opts' }, opts), needExtras());
  };

  /* 욕구 쪽 고르기 (한 장에 4쪽) */
  screens.needGroup = function (p) {
    var gs = needGroups();
    var pages = Math.max(1, Math.ceil(gs.length / 4));
    var pg = Math.min(Math.max(p.page || 0, 0), pages - 1);
    var opts = gs.slice(pg * 4, pg * 4 + 4).map(function (g, k) {
      return option(k + 1, (g.emoji ? g.emoji + ' ' : '') + g.label, g.hint, function () { go('needWords', { group: g.id, page: 0 }); }, { id: g.id });
    });
    if (pg < pages - 1) opts.push(option(5, T.needGroupMore || '다른 욕구 쪽 더 보기', T.needGroupMoreHint || '', function () { go('needGroup', { page: pg + 1 }); }, { id: 'need-group-more' }));
    else opts.push(option(5, T.noneOfThese, T.unnamedNeedTitle, function () { go('needUnnamed', {}); }));
    return screen('needGroup', { 'data-page': String(pg) }, topBar(), progress(),
      heading(T.needGroupTitle || '어느 쪽 욕구에 가까웠나요?', needLead() + (pages > 1 ? ' (' + (pg + 1) + ' / ' + pages + ')' : '')),
      el('div', { class: 'opts' }, opts), needExtras());
  };

  /* 욕구 쪽 안의 욕구 (한 장에 4개) */
  screens.needWords = function (p) {
    var g = needGroups().filter(function (x) { return x.id === p.group; })[0];
    var ids = g.needs.filter(function (id) { return NEED[id]; });
    var pages = Math.max(1, Math.ceil(ids.length / 4));
    var pg = Math.min(Math.max(p.page || 0, 0), pages - 1);
    var opts = ids.slice(pg * 4, pg * 4 + 4).map(function (id, k) {
      var n = NEED[id];
      return option(k + 1, n.text, n.word, function () { pickNeed(id); }, { id: id });
    });
    if (pg < pages - 1) opts.push(option(5, T.needWordsMore || '이 쪽 욕구 더 보기', T.needWordsMoreHint || '', function () { go('needWords', { group: g.id, page: pg + 1 }); }, { id: 'need-words-more' }));
    else opts.push(option(5, T.needOtherGroup || '다른 욕구 쪽 보기', T.needOtherGroupHint || '', function () { go('needGroup', { page: 0 }); }, { id: 'need-other-group' }));
    return screen('needWords', { 'data-group': g.id, 'data-page': String(pg) }, topBar(), progress(),
      heading(T.needWordsTitle || '이 중 가장 가까운 욕구를 골라 보세요.', (g.emoji ? g.emoji + ' ' : '') + g.label + (pages > 1 ? ' (' + (pg + 1) + ' / ' + pages + ')' : '')),
      el('div', { class: 'opts' }, opts));
  };

  /* 비슷한 욕구 구별하기 */
  screens.needCompare = function (p) {
    var ids = needCompareSetFor(p.id) || [p.id];
    var opts = ids.map(function (id, i) {
      var n = NEED[id];
      return option(i + 1, n.ask, '→ ' + n.word, function () { pickNeed(id, false, true); }, { id: id, cls: id === p.id ? 'opt-picked' : '' });
    });
    opts.push(option(5, T.needOtherGroup || '다른 욕구 쪽 보기', T.needOtherGroupHint || '', function () { go('needGroup', { page: 0 }); }, { id: 'need-other-group' }));
    return screen('needCompare', { 'data-picked': p.id }, topBar(), progress(),
      heading(T.needCompareTitle || '비슷한 욕구와 견주어 볼게요.', fill(T.needCompareLead || '고른 욕구: {욕구}', { '욕구': NEED[p.id].word })),
      el('div', { class: 'opts' }, opts));
  };

  /* 욕구 단어로 찾기 */
  screens.needSearch = function () {
    return searchScreen('needSearch', {
      title: T.needSearchTitle || '바랐던 것을 단어로 적어 보세요',
      guide: T.needSearchGuide, placeholder: T.needSearchPlaceholder || '욕구 단어 적기',
      suggestLabel: T.needSearchSuggest || '자주 찾는 욕구',
      suggest: function () { return (D.needSearchSuggest || []).filter(function (id) { return NEED[id]; }).map(function (id) { return NEED[id]; }); },
      find: searchNeeds,
      item: function (n) { return searchItem(n.id, n.word, n.text, null, function () { pickNeed(n.id, true); }); }
    });
  };

  screens.needUnnamed = function () {
    return screen('needUnnamed', null, topBar(), progress(),
      el('div', { class: 'soft-card' },
        el('div', { class: 'soft-icon', 'aria-hidden': 'true' }, '🌱'),
        heading(T.unnamedNeedTitle),
        el('p', { class: 'body-text' }, T.unnamedNeedBody)
      ),
      el('button', {
        class: 'btn btn-primary btn-big', type: 'button', 'data-testid': 'continue',
        onclick: function () { draft.needId = UNNAMED_NEED.id; finish(); }
      }, T.continueButton)
    );
  };

  function intensityMeter(n) {
    var cells = [];
    for (var i = 1; i <= 10; i++) cells.push(el('span', { class: 'meter-cell' + (i <= n ? ' on' : '') }));
    return el('div', { class: 'meter', 'aria-hidden': 'true' }, cells);
  }

  screens.result = function (p) {
    var rec = records().filter(function (r) { return r.id === p.id; })[0];
    if (!rec) return screens.home();
    var e = EMO[rec.emotionId] || { word: rec.emotionWord, desc: '', family: rec.family };
    var fam = FAMILY[e.family] || FAMILY.unknown;
    var need = NEED[rec.needId] || { word: rec.needWord, text: '' };
    var found = Object.keys(foundSet()).length;
    var many = recEmotions(rec).length > 1 ? recEmotions(rec) : null;
    return screen('result', null,
      el('header', { class: 'topbar' }, el('span', { class: 'top-spacer' }), el('span', { class: 'top-step' }, '6 / 6 · ' + T.steps[5]), el('span', { class: 'top-spacer' })),
      progress(),
      el('article', { class: 'card', style: '--accent:' + fam.color, 'data-testid': 'result-card' },
        el('p', { class: 'card-date' }, prettyDateTime(rec.ts)),
        el('h1', { class: 'card-title', tabindex: '-1' }, T.resultTitle),
        rec.hidden ? el('p', { class: 'bonus bonus-hidden', 'data-testid': 'hidden-bonus' }, '★ ' + T.hiddenBonus) : null,
        p.isNew ? el('p', { class: 'bonus bonus-new', 'data-testid': 'new-bonus' }, '📖 ' + T.newWordBonus + ' (' + found + ' / ' + ALL_WORDS.length + ')') : null,
        many ? el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, fill(T.resultEmotionsMany || '찾은 감정 {글}개', { '글': String(many.length) })),
          el('p', { class: 'card-emotion', 'data-testid': 'result-emotion' }, many.map(function (x) { return x.word + (x.hidden ? ' ★' : ''); }).join(' + ')),
          el('ul', { class: 'card-multi' }, many.map(function (x) {
            var xf = FAMILY[x.family] || FAMILY.unknown;
            var xe = EMO[x.id];
            return el('li', { class: 'card-multi-item', 'data-testid': 'result-emotion-item', style: '--accent:' + xf.color },
              el('p', { class: 'card-value' }, xf.emoji + ' ' + x.word + (x.hidden ? ' ★' : '') + ' · ' + x.intensity + ' / 10'),
              intensityMeter(x.intensity),
              xe && xe.desc ? el('p', { class: 'card-desc' }, xe.desc) : null);
          }))
        ) : null,
        many ? null : el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, T.resultEmotion),
          el('p', { class: 'card-emotion', 'data-testid': 'result-emotion' }, fam.emoji + ' ' + rec.emotionWord + (rec.hidden ? ' ★' : '')),
          e.desc && rec.emotionId !== UNNAMED.id ? el('p', { class: 'card-desc' }, e.desc) : null
        ),
        many ? null : el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, T.resultIntensity),
          el('p', { class: 'card-value', 'data-testid': 'result-intensity' }, rec.intensity + ' / 10'),
          intensityMeter(rec.intensity)
        ),
        el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, T.resultNeed),
          el('p', { class: 'card-value', 'data-testid': 'result-need' }, need.word),
          need.text && rec.needId !== UNNAMED_NEED.id ? el('p', { class: 'card-desc' }, need.text) : null,
          rec.needId !== UNNAMED_NEED.id ? needFitBox(rec) : null
        ),
        el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, T.resultSummary),
          el('p', { class: 'card-summary', 'data-testid': 'result-summary' }, rec.summary)
        ),
        el('section', { class: 'card-row card-tip' },
          el('h2', { class: 'card-label' }, '🌱 ' + T.resultTip),
          el('p', { class: 'card-text', 'data-testid': 'result-tip' }, rec.tip)
        ),
        rec.reflection ? el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, T.reflectSaved || '내가 남긴 말'),
          el('p', { class: 'card-text', 'data-testid': 'result-reflection' }, rec.reflection)) : null,
        rec.situation ? el('p', { class: 'card-situation' }, '있었던 일: ' + rec.situation) : null
      ),
      reflectBox(rec),
      el('p', { class: 'streak-line', 'data-testid': 'result-streak' }, '🔥 연속 기록 ' + streak() + '일 · 📖 도감 ' + found + ' / ' + ALL_WORDS.length),
      el('button', { class: 'btn btn-primary btn-big', type: 'button', onclick: goHome, 'data-testid': 'home' }, T.homeButton),
      el('button', { class: 'btn btn-secondary', type: 'button', onclick: function () { go('dex', {}); }, 'data-testid': 'to-dex' }, T.dexButton)
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
  /* 2. "그 감정이 나에게 무엇을 말해 주나요?" (적지 않아도 됨) */
  function reflectBox(rec) {
    var ta = el('textarea', { id: 'reflect', class: 'textarea textarea-small', rows: '3', maxlength: '300', placeholder: T.reflectPlaceholder || '', 'data-testid': 'reflect-input' });
    ta.value = rec.reflection || '';
    var count = el('p', { class: 'counter' }, ta.value.length + ' / 300');
    ta.addEventListener('input', function () { count.textContent = ta.value.length + ' / 300'; });
    return el('section', { class: 'report-sec reflect' },
      el('label', { class: 'sec-title', for: 'reflect' }, T.reflectTitle || '그 감정이 나에게 무엇을 말해 주나요?'),
      el('p', { class: 'guide' }, T.reflectGuide || '적지 않아도 돼요.'),
      ta, count,
      el('button', {
        class: 'btn btn-secondary', type: 'button', 'data-testid': 'reflect-save',
        onclick: function () { updateRecord(rec.id, { reflection: ta.value.trim().slice(0, 300) }); refresh(); toast(T.reflectDone || '카드에 저장했어요.'); }
      }, rec.reflection ? (T.reflectUpdate || '고쳐서 저장하기') : (T.reflectSave || '카드에 저장하기'))
    );
  }

  screens.dex = function () {
    var found = foundSet();
    var total = ALL_WORDS.length;
    var nFound = Object.keys(found).length;
    var hiddenTotal = ALL_WORDS.filter(function (w) { return w.hidden; }).length;
    var hiddenFound = ALL_WORDS.filter(function (w) { return w.hidden && found[w.id]; }).length;
    var sections = D.families.map(function (f) {
      var words = ALL_WORDS.filter(function (w) { return w.family === f.id; });
      var got = words.filter(function (w) { return found[w.id]; }).length;
      return el('section', { class: 'dex-family', style: '--accent:' + f.color },
        el('h2', { class: 'dex-head' }, f.emoji + ' ' + f.label + ' ', el('span', { class: 'dex-count' }, got + ' / ' + words.length)),
        el('ul', { class: 'dex-grid' }, words.map(function (w) {
          var on = !!found[w.id];
          return el('li', null, el('button', {
            class: 'dex-chip' + (on ? ' on' : '') + (w.hidden ? ' hidden-word' : ''),
            type: 'button', 'data-id': w.id,
            'aria-label': on ? w.word + ' 자세히 보기' : '아직 못 찾은 감정',
            onclick: function () { openDexDetail(w, f); }
          }, on ? (w.hidden ? '★ ' : '') + w.word : (w.hidden ? '★ ？？？' : '？？？')));
        }))
      );
    });
    return screen('dex', null, simpleTop('감정 도감'),
      heading('감정 도감'),
      el('p', { class: 'dex-total', 'data-testid': 'dex-total' }, total + '개 중 ' + nFound + '개 발견'),
      el('div', { class: 'bar-track big' }, el('div', { class: 'bar-fill', style: 'width:' + Math.round(nFound / total * 100) + '%' })),
      el('p', { class: 'guide' }, '★ 숨은 감정 ' + hiddenFound + ' / ' + hiddenTotal + ' 발견 — "이 중엔 없어요"를 눌러 다른 방법으로 찾을 때 만날 수 있어요.'),
      sections
    );
  };

  /* 같은 뜻 다른 말 안내 (찾은 단어만 보여 줘요) */
  function sameNote(w) {
    var head = w.parent ? EMO[w.parent] : w;
    var others = [head.id].concat(head.same).filter(function (id) { return id !== w.id; });
    if (!others.length) return null;
    var found = foundSet();
    var names = others.map(function (id) { return found[id] ? EMO[id].word : '？？？'; });
    return el('p', { class: 'guide', 'data-testid': 'dex-detail-same' }, '같은 뜻 다른 말: ' + names.join(', '));
  }

  /* 도감 단어를 누르면 나오는 설명 창 */
  function openDexDetail(w, f) {
    closeDexDetail();
    var recs = records().filter(function (r) { return recEmotions(r).some(function (x) { return x.id === w.id; }); });
    var opener = document.activeElement;
    var body;
    if (recs.length) {
      var first = recs.reduce(function (a, r) { return r.ts < a.ts ? r : a; });
      var last = recs.reduce(function (a, r) { return r.ts > a.ts ? r : a; });
      body = [
        el('p', { class: 'sheet-desc', 'data-testid': 'dex-detail-desc' }, w.desc),
        sameNote(w),
        el('dl', { class: 'sheet-facts' },
          el('div', null, el('dt', null, '처음 찾은 날'), el('dd', { 'data-testid': 'dex-detail-first' }, longDate(first.ts))),
          el('div', null, el('dt', null, '찾은 횟수'), el('dd', { 'data-testid': 'dex-detail-count' }, recs.length + '번')),
          recs.length > 1 ? el('div', null, el('dt', null, '가장 최근'), el('dd', null, longDate(last.ts))) : null
        ),
        el('div', { class: 'sheet-last' },
          el('p', { class: 'card-label' }, '가장 최근 한 줄 정리'),
          el('p', { class: 'sheet-summary' }, last.summary)
        )
      ];
    } else {
      body = [
        el('p', { class: 'sheet-desc', 'data-testid': 'dex-detail-desc' }, '아직 못 찾은 감정이에요.'),
        el('p', { class: 'guide' }, w.hidden
          ? '숨은 감정은 "이 중엔 없어요"를 눌러 몸 감각, 하고 싶었던 행동, 옛 경험으로 찾을 때 만날 수 있어요.'
          : f.label + '에서 만날 수 있어요. 게임을 하다 보면 이름이 채워질 거예요.')
      ];
    }
    var title = recs.length ? (w.hidden ? '★ ' : '') + w.word : (w.hidden ? '★ 숨은 감정' : '？？？');
    var closeBtn = el('button', { class: 'btn btn-secondary', type: 'button', 'data-testid': 'dex-detail-close', onclick: closeDexDetail }, '닫기');
    var sheet = el('div', { class: 'sheet-wrap', 'data-testid': 'dex-detail', onclick: function (ev) { if (ev.target === sheet) closeDexDetail(); } },
      el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sheet-title', style: '--accent:' + f.color },
        el('p', { class: 'lead' }, f.emoji + ' ' + f.label + (w.hidden ? ' · 숨은 감정' : '')),
        el('h2', { class: 'sheet-title', id: 'sheet-title', tabindex: '-1' }, title),
        body,
        closeBtn
      )
    );
    sheet._opener = opener;
    app.appendChild(sheet);
    document.body.classList.add('no-scroll');
    try { sheet.querySelector('h2').focus({ preventScroll: true }); } catch (e) { /* 무시 */ }
  }
  function closeDexDetail() {
    var s = app.querySelector('.sheet-wrap');
    if (!s) return false;
    var opener = s._opener;
    s.remove();
    document.body.classList.remove('no-scroll');
    if (opener && opener.focus) { try { opener.focus({ preventScroll: true }); } catch (e) { /* 무시 */ } }
    return true;
  }
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
    var need = countBy(recs, function (r) { return r.needId; }).slice(0, 5);
    var fam = countBy(recs, function (r) { return recEmotions(r).map(function (x) { return x.family; }); });
    var days = {};
    recs.forEach(function (r) { days[r.date] = true; });
    var wordOf = {};
    recs.forEach(function (r) { recEmotions(r).forEach(function (x) { wordOf[x.id] = x.word; }); wordOf['n:' + r.needId] = r.needWord; });
    var distinct = Object.keys(foundSet(recs)).length;
    var mixedN = recs.filter(function (r) { var xs = recEmotions(r); return xs.length > 1 || xs.some(function (x) { return x.family === 'mixed'; }); }).length;
    var pairs = countBy(recs, function (r) {
      if (!r.needId || r.needId === UNNAMED_NEED.id) return [];
      return recEmotions(r).filter(function (x) { return x.id !== UNNAMED.id; }).map(function (x) { return x.id + '>' + r.needId; });
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
        statTile('🌗', '섞인 마음 기록', mixedN + '개', 'report-mixed')
      ),
      el('p', { class: 'guide' }, T.reportDistinctGuide || ''),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '하루 평균 강도'),
        intensityChart(start, recs)),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '자주 나온 감정'),
        bars(emo, function (k) { return (EMO[k] && EMO[k].word) || wordOf[k] || k; }, function (k) { return EMO[k] ? FAMILY[EMO[k].family].color : null; }, 'bars-emotion')),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '자주 나온 욕구'),
        bars(need, function (k) { return (NEED[k] && NEED[k].word) || wordOf['n:' + k] || k; }, null, 'bars-need')),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '자주 함께 나온 감정·욕구'),
        bars(pairs, function (k) { var a = k.split('>'); return ((EMO[a[0]] && EMO[a[0]].word) || wordOf[a[0]] || a[0]) + ' → ' + ((NEED[a[1]] && NEED[a[1]].word) || wordOf['n:' + a[1]] || a[1]); }, null, 'bars-pair')),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '욕구가 맞았나요?'),
        el('p', { class: 'body-text', 'data-testid': 'report-needfit' }, '네 ' + fit.yes + '번 · 아니요 ' + fit.no + '번 · 잘 모르겠음 ' + fit.unsure + '번'),
        el('p', { class: 'guide' }, T.reportFitGuide || '')),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '감정 쪽 나눠 보기'),
        bars(fam, function (k) { var f = FAMILY[k] || FAMILY.unknown; return f.emoji + ' ' + f.label; }, function (k) { return (FAMILY[k] || FAMILY.unknown).color; }, 'bars-family')),
      recs.length ? el('p', { class: 'guide' }, reportComment(emo, need, wordOf)) : null
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
  function reportComment(emo, need, wordOf) {
    var e = emo[0], n = need[0];
    var ew = (EMO[e.key] && EMO[e.key].word) || wordOf[e.key];
    var nw = (NEED[n.key] && NEED[n.key].word) || wordOf['n:' + n.key];
    return '이번 주에는 "' + ew + '"' + (batchim(ew + '"') === 'none' ? '가' : '이') + ' 가장 자주 찾아왔고, "' + nw + '" 욕구가 자주 보였어요.';
  }

  screens.records = function () {
    var recs = records().slice().reverse();
    return screen('records', null, simpleTop('지난 기록'),
      heading('지난 기록', '모두 ' + recs.length + '개'),
      recs.length ? el('ul', { class: 'rec-list' }, recs.map(function (r) {
        var f = FAMILY[r.family] || FAMILY.unknown;
        return el('li', { class: 'rec', style: '--accent:' + f.color },
          el('p', { class: 'rec-date' }, prettyDateTime(r.ts)),
          el('p', { class: 'rec-emotion' }, recEmotions(r).map(function (x) {
            var xf = FAMILY[x.family] || FAMILY.unknown;
            return xf.emoji + ' ' + x.word + (x.hidden ? ' ★' : '') + ' ' + x.intensity + '점';
          }).join(' · ')),
          el('p', { class: 'rec-need' }, '필요했던 것: ' + r.needWord),
          el('p', { class: 'rec-summary' }, r.summary),
          r.reflection ? el('p', { class: 'rec-sit', 'data-testid': 'rec-reflection' }, (T.reflectSaved || '내가 남긴 말') + ': ' + r.reflection) : null,
          r.situation ? el('p', { class: 'rec-sit' }, '있었던 일: ' + r.situation) : null
        );
      })) : el('p', { class: 'guide' }, '아직 기록이 없어요. 처음 화면에서 "시작하기"를 눌러 보세요.')
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
      el('button', {
        class: 'btn btn-danger btn-big', type: 'button', 'data-testid': 'confirm-delete',
        onclick: function () { clearAll(); goHome(); toast('모든 기록을 지웠어요.'); }
      }, '네, 모두 지울게요'),
      el('button', { class: 'btn btn-secondary btn-big', type: 'button', onclick: back, 'data-testid': 'cancel-delete' }, '아니요, 그대로 둘게요')
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
    navigator.share({ files: [file], title: '내 마음 찾기 기록' }).catch(function (e) {
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
    var emotions = Array.isArray(r.emotions) ? r.emotions.slice(0, MAX_PICKS).map(function (x) {
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
      tip: s(r.tip, 300),
      path: s(r.path, 20) || 'normal',
      five: Math.max(0, Math.round(Number(r.five)) || 0)
    };
    if (emotions.length > 1) out.emotions = emotions;
    var reflection = s(r.reflection, 300);
    if (reflection) out.reflection = reflection;
    if (['yes', 'no', 'unsure'].indexOf(r.needFit) !== -1) out.needFit = r.needFit;
    return out;
  }
  function parseBackup(text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { return { error: '이 파일은 "내 마음 찾기" 기록 파일이 아니에요. 내보내기로 저장한 .json 파일을 골라 주세요.' }; }
    var list = Array.isArray(data) ? data : (data && Array.isArray(data.records) ? data.records : null);
    if (!list || (data && !Array.isArray(data) && data.app && data.app !== BACKUP_APP)) {
      return { error: '이 파일은 "내 마음 찾기" 기록 파일이 아니에요. 내보내기로 저장한 .json 파일을 골라 주세요.' };
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
      el('p', { class: 'guide' }, '새 휴대폰으로 옮길 때: 옛 휴대폰에서 "파일로 저장하기" 또는 "다른 앱으로 보내기" → 새 휴대폰에서 그 파일을 받아 "파일 고르기"를 누르세요.')
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
      n ? el('button', {
        class: 'btn btn-primary btn-big', type: 'button', 'data-testid': 'import-confirm',
        onclick: function () {
          var d = load();
          d.records = d.records.concat(p.fresh).sort(function (a, b) { return a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0; });
          save(d);
          pendingImport = null;
          goHome();
          toast('기록 ' + n + '개를 불러왔어요.');
        }
      }, '네, 불러올게요') : null,
      el('button', { class: 'btn btn-secondary btn-big', type: 'button', 'data-testid': 'import-cancel', onclick: function () { pendingImport = null; back(); } }, n ? '아니요, 그만둘게요' : '돌아가기')
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
    if (ev.key === 'Escape' && closeDexDetail()) { ev.preventDefault(); return; }
    if (app.querySelector('.sheet-wrap')) return;
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
  if (!introSeen() && !records().length && introCards().length) current = { screen: 'intro', params: { page: 0 } };

  render();

  /* 인터넷 없이도 열리도록 service worker 등록 */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function (e) { console.warn('service worker 등록 실패', e); });
    });
  }
})();
