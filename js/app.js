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
    if (!D.safety) missing.push('data/safety.js');
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
  var EMO = {};          // id → { id, word, desc, family, hidden }
  var FAMILY = {};       // id → family
  var ALL_WORDS = [];    // 도감에 들어가는 감정 전체
  D.families.forEach(function (f) {
    FAMILY[f.id] = f;
    f.groups.forEach(function (g) {
      g.emotions.forEach(function (e) {
        EMO[e.id] = { id: e.id, word: e.word, desc: e.desc, family: f.id, hidden: false };
        ALL_WORDS.push(EMO[e.id]);
      });
    });
    (f.hidden || []).forEach(function (e) {
      EMO[e.id] = { id: e.id, word: e.word, desc: e.desc, family: f.id, hidden: true };
      ALL_WORDS.push(EMO[e.id]);
    });
  });
  var UNNAMED = D.unnamedEmotion || { id: 'unnamed', word: '이름 붙이기 어려운 감정', desc: '' };
  EMO[UNNAMED.id] = { id: UNNAMED.id, word: UNNAMED.word, desc: UNNAMED.desc, family: 'unknown', hidden: false };
  FAMILY.unknown = { id: 'unknown', label: '이름 붙이기 어려운 쪽', emoji: '☁️', color: '#7A8291' };

  var NEED = {};
  D.needs.forEach(function (n) { NEED[n.id] = n; });
  var UNNAMED_NEED = D.unnamedNeed || { id: 'unnamedNeed', word: '이름 붙이기 어려운 바람', text: '아직 이름을 찾지 못한 바람', tip: '' };
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
    return String(tpl).replace(/\{(원인|감정|강도|바람|글)(을|를|이|가|은|는|과|와|으로|로)?\}/g, function (all, name, j) {
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
  function clearAll() {
    memoryStore = { version: 1, records: [] };
    try { window.localStorage.removeItem(STORE_KEY); } catch (e) { /* 무시 */ }
  }

  function foundSet(recs) {
    var s = {};
    (recs || records()).forEach(function (r) { if (EMO[r.emotionId] && r.emotionId !== UNNAMED.id) s[r.emotionId] = true; });
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

  /* ───────── 위험 표현 찾기 ───────── */
  function isRisky(text) {
    var s = String(text || '').replace(/[\s.,!?~…·'"“”‘’()\-_]/g, '');
    (D.safety.exceptions || []).forEach(function (x) { s = s.split(x).join(''); });
    return (D.safety.keywords || []).some(function (k) { return k && s.indexOf(k) !== -1; });
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
    situation: 1, family: 2, group: 2, words: 2, approach: 2, unnamed: 2,
    intensity: 3, cause: 4, causeOther: 4, need: 5, needUnnamed: 5, result: 6
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
      class: 'opt' + (num === 5 ? ' opt-five' : '') + (opts.cls ? ' ' + opts.cls : ''),
      type: 'button',
      'data-num': String(num),
      'data-id': opts.id || null,
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

  function pickEmotion(id, path) {
    draft.emotionId = id;
    if (path) draft.path = path;
    go('intensity', {});
  }

  function afterCause() {
    if (draft.needFromReverse && draft.needId) finish();
    else go('need', { round: 0 });
  }

  function needCandidates(round) {
    var fam = EMO[draft.emotionId] ? EMO[draft.emotionId].family : 'unknown';
    var byFam = D.needsByCause[fam] || D.needsByCause.unknown;
    var first = (byFam[draft.cause] || byFam.other || []).slice(0, 4);
    var shown = first.slice();
    var lists = [first];
    for (var r = 1; r < D.needRounds.length; r++) {
      var pool = D.needRounds[r].pool || [];
      var pick = pool.filter(function (id) { return NEED[id] && shown.indexOf(id) === -1; }).slice(0, 4);
      if (pick.length < 4) {
        D.needs.forEach(function (n) { if (pick.length < 4 && shown.indexOf(n.id) === -1 && pick.indexOf(n.id) === -1) pick.push(n.id); });
      }
      shown = shown.concat(pick);
      lists.push(pick);
    }
    return lists[round] || [];
  }

  function intensityWord(n) {
    var w = D.intensityWords || [];
    return w[n - 1] || '';
  }

  function finish() {
    var before = foundSet();
    var e = EMO[draft.emotionId];
    var need = NEED[draft.needId] || UNNAMED_NEED;
    var cause = CAUSE[draft.cause] || CAUSE.other;
    var causeSentence = cause.sentence;
    if (draft.cause === 'other' && draft.causeText && cause.sentenceWithText) {
      causeSentence = fill(cause.sentenceWithText, { '글': draft.causeText });
    }
    var tpl;
    if (need.id === UNNAMED_NEED.id) tpl = T.summaryNoNeed;
    else if (e.family === 'joy') tpl = T.summaryMet;
    else tpl = T.summaryUnmet;
    var summary = fill(tpl, { '원인': causeSentence, '감정': e.word, '강도': intensityWord(draft.intensity), '바람': need.text });
    var now = new Date();
    var rec = {
      id: 'r' + now.getTime() + Math.floor(Math.random() * 1000),
      ts: now.toISOString(),
      date: dateKey(now),
      situation: draft.situation,
      family: e.family,
      emotionId: e.id,
      emotionWord: e.word,
      hidden: !!e.hidden,
      intensity: draft.intensity,
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
    var isNew = e.id !== UNNAMED.id && !before[e.id];
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
      el('p', { class: 'notice', role: 'note', 'data-testid': 'disclaimer' }, T.disclaimer),
      el('button', { class: 'btn btn-primary btn-big', type: 'button', onclick: startGame, 'data-testid': 'start' }, T.startButton),
      el('p', { class: 'encourage' }, T.homeEncourage),
      el('div', { class: 'stats' },
        statTile('📖', '감정 도감', found + ' / ' + ALL_WORDS.length, 'stat-dex'),
        statTile('🔥', '연속 기록', s + '일', 'stat-streak'),
        statTile('🗂', '전체 기록', recs.length + '개', 'stat-count')
      ),
      el('nav', { class: 'menu' },
        menuBtn('📖', '감정 도감', '찾은 감정 단어 모아 보기', function () { go('dex', {}); }, 'menu-dex'),
        menuBtn('📊', '주간 감정 보고서', '자주 나온 감정과 바람', function () { go('report', { offset: 0 }); }, 'menu-report'),
        menuBtn('🗂', '지난 기록', '지금까지 만든 마음 카드', function () { go('records', {}); }, 'menu-records')
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

  screens.situation = function () {
    var ta = el('textarea', {
      id: 'situation', class: 'textarea', rows: '4', maxlength: '200',
      placeholder: T.situationPlaceholder, 'aria-describedby': 'situation-guide'
    });
    ta.value = draft.situation || '';
    var err = el('p', { class: 'error', role: 'alert' });
    var count = el('p', { class: 'counter' }, ta.value.length + ' / 200');
    ta.addEventListener('input', function () { count.textContent = ta.value.length + ' / 200'; err.textContent = ''; });
    function next() {
      var v = ta.value.trim();
      if (!v) { err.textContent = T.situationEmpty; ta.focus(); return; }
      if (isRisky(v)) { stack = []; draft = null; current = { screen: 'crisis', params: {} }; render(); return; }
      draft.situation = v;
      go('family', {});
    }
    return screen('situation', null, topBar(), progress(),
      heading(T.situationTitle),
      el('p', { class: 'guide', id: 'situation-guide' }, T.situationGuide),
      el('label', { class: 'sr-only', for: 'situation' }, T.situationTitle),
      ta, count, err,
      el('button', { class: 'btn btn-primary btn-big', type: 'button', onclick: next, 'data-testid': 'next' }, T.nextButton)
    );
  };

  screens.family = function () {
    var opts = D.families.map(function (f, i) {
      return option(i + 1, f.emoji + ' ' + f.label, f.hint, function () { go('group', { family: f.id }); }, { color: f.color, id: f.id });
    });
    opts.push(fiveOption(T.familyNotSure, T.familyNotSureHint));
    return screen('family', null, topBar(), progress(), situationChip(), heading(T.familyTitle), el('div', { class: 'opts' }, opts));
  };

  function situationChip() {
    if (!draft || !draft.situation) return null;
    return el('p', { class: 'sit-chip' }, '“' + draft.situation + '”');
  }

  screens.group = function (p) {
    var f = FAMILY[p.family];
    var opts = f.groups.map(function (g, i) {
      return option(i + 1, g.label, g.hint, function () { go('words', { family: f.id, group: i }); }, { color: f.color });
    });
    opts.push(fiveOption());
    return screen('group', { 'data-family': f.id }, topBar(), progress(),
      heading(T.groupTitle, f.emoji + ' ' + f.label), el('div', { class: 'opts' }, opts));
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
      return option(i + 1, e.word, e.desc, function () { pickEmotion(id, path); }, { color: FAMILY[e.family].color, id: id });
    });
    opts.push(fiveOption());
    return screen('words', null, topBar(), progress(), heading(question, small), el('div', { class: 'opts' }, opts));
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
        onclick: function () { draft.needId = null; draft.needFromReverse = false; pickEmotion(UNNAMED.id, 'unnamed'); }
      }, T.continueButton)
    );
  };

  screens.intensity = function () {
    var e = EMO[draft.emotionId];
    var grid = [];
    for (var i = 1; i <= 10; i++) {
      (function (n) {
        grid.push(el('button', {
          class: 'num-btn' + (draft.intensity === n ? ' selected' : ''), type: 'button', 'data-score': String(n),
          'aria-label': n + '점', style: '--lv:' + (n / 10),
          onclick: function () { draft.intensity = n; go('cause', {}); }
        }, String(n)));
      })(i);
    }
    return screen('intensity', null, topBar(), progress(),
      heading(T.intensityTitle, '“' + e.word + '”'),
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
      if (v && isRisky(v)) { stack = []; draft = null; current = { screen: 'crisis', params: {} }; render(); return; }
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

  screens.need = function (p) {
    var round = p.round || 0;
    var e = EMO[draft.emotionId];
    var r = D.needRounds[round];
    var q = (e.family === 'joy' && r.questionJoy) ? r.questionJoy : r.question;
    var opts = needCandidates(round).map(function (id, i) {
      var n = NEED[id];
      return option(i + 1, n.text, null, function () { draft.needId = id; finish(); }, { id: id });
    });
    opts.push(option(5, T.noneOfThese, T.noneOfTheseHint, function () {
      if (round + 1 < D.needRounds.length) go('need', { round: round + 1 });
      else go('needUnnamed', {});
    }));
    return screen('need', { 'data-round': String(round) }, topBar(), progress(),
      heading(q, '“' + e.word + '” · ' + draft.intensity + '점'), el('div', { class: 'opts' }, opts));
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
    return screen('result', null,
      el('header', { class: 'topbar' }, el('span', { class: 'top-spacer' }), el('span', { class: 'top-step' }, '6 / 6 · ' + T.steps[5]), el('span', { class: 'top-spacer' })),
      progress(),
      el('article', { class: 'card', style: '--accent:' + fam.color, 'data-testid': 'result-card' },
        el('p', { class: 'card-date' }, prettyDateTime(rec.ts)),
        el('h1', { class: 'card-title', tabindex: '-1' }, T.resultTitle),
        rec.hidden ? el('p', { class: 'bonus bonus-hidden', 'data-testid': 'hidden-bonus' }, '★ ' + T.hiddenBonus) : null,
        p.isNew ? el('p', { class: 'bonus bonus-new', 'data-testid': 'new-bonus' }, '📖 ' + T.newWordBonus + ' (' + found + ' / ' + ALL_WORDS.length + ')') : null,
        el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, T.resultEmotion),
          el('p', { class: 'card-emotion', 'data-testid': 'result-emotion' }, fam.emoji + ' ' + rec.emotionWord + (rec.hidden ? ' ★' : '')),
          e.desc && rec.emotionId !== UNNAMED.id ? el('p', { class: 'card-desc' }, e.desc) : null
        ),
        el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, T.resultIntensity),
          el('p', { class: 'card-value', 'data-testid': 'result-intensity' }, rec.intensity + ' / 10'),
          intensityMeter(rec.intensity)
        ),
        el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, T.resultNeed),
          el('p', { class: 'card-value', 'data-testid': 'result-need' }, need.word),
          need.text && rec.needId !== UNNAMED_NEED.id ? el('p', { class: 'card-desc' }, need.text) : null
        ),
        el('section', { class: 'card-row' },
          el('h2', { class: 'card-label' }, T.resultSummary),
          el('p', { class: 'card-summary', 'data-testid': 'result-summary' }, rec.summary)
        ),
        el('section', { class: 'card-row card-tip' },
          el('h2', { class: 'card-label' }, '🌱 ' + T.resultTip),
          el('p', { class: 'card-text', 'data-testid': 'result-tip' }, rec.tip)
        ),
        el('p', { class: 'card-situation' }, '있었던 일: ' + rec.situation)
      ),
      el('p', { class: 'streak-line', 'data-testid': 'result-streak' }, '🔥 연속 기록 ' + streak() + '일 · 📖 도감 ' + found + ' / ' + ALL_WORDS.length),
      el('button', { class: 'btn btn-primary btn-big', type: 'button', onclick: goHome, 'data-testid': 'home' }, T.homeButton),
      el('button', { class: 'btn btn-secondary', type: 'button', onclick: function () { go('dex', {}); }, 'data-testid': 'to-dex' }, T.dexButton)
    );
  };

  screens.crisis = function () {
    var S = D.safety;
    return screen('crisis', null,
      el('div', { class: 'crisis' },
        el('div', { class: 'soft-icon', 'aria-hidden': 'true' }, '🤝'),
        el('h1', { class: 'title', tabindex: '-1' }, S.title),
        el('p', { class: 'body-text' }, S.body),
        el('div', { class: 'phones' }, S.phones.map(function (ph) {
          return el('a', { class: 'phone', href: 'tel:' + ph.number.replace(/[^0-9]/g, ''), 'data-testid': 'phone-' + ph.number },
            el('span', { class: 'phone-name' }, '📞 ' + ph.name),
            el('span', { class: 'phone-number' }, ph.number),
            ph.note ? el('span', { class: 'phone-note' }, ph.note + ' · 눌러서 전화하기') : null
          );
        })),
        el('p', { class: 'emergency' }, S.emergency),
        el('p', { class: 'notice' }, S.notice)
      ),
      el('button', { class: 'btn btn-secondary btn-big', type: 'button', onclick: goHome, 'data-testid': 'home' }, S.homeButton)
    );
  };

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
          return el('li', { class: 'dex-chip' + (on ? ' on' : '') + (w.hidden ? ' hidden-word' : ''), title: on ? w.desc : '아직 못 찾았어요' },
            on ? (w.hidden ? '★ ' : '') + w.word : (w.hidden ? '★ ？？？' : '？？？'));
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

  function countBy(list, keyFn) {
    var m = {};
    list.forEach(function (x) { var k = keyFn(x); if (k) m[k] = (m[k] || 0) + 1; });
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
    var emo = countBy(recs, function (r) { return r.emotionId; }).slice(0, 5);
    var need = countBy(recs, function (r) { return r.needId; }).slice(0, 5);
    var fam = countBy(recs, function (r) { return r.family; });
    var days = {};
    recs.forEach(function (r) { days[r.date] = true; });
    var wordOf = {};
    recs.forEach(function (r) { wordOf[r.emotionId] = r.emotionWord; wordOf['n:' + r.needId] = r.needWord; });
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
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '자주 나온 감정'),
        bars(emo, function (k) { return (EMO[k] && EMO[k].word) || wordOf[k] || k; }, function (k) { return EMO[k] ? FAMILY[EMO[k].family].color : null; }, 'bars-emotion')),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '자주 나온 바람'),
        bars(need, function (k) { return (NEED[k] && NEED[k].word) || wordOf['n:' + k] || k; }, null, 'bars-need')),
      el('section', { class: 'report-sec' }, el('h2', { class: 'sec-title' }, '감정 쪽 나눠 보기'),
        bars(fam, function (k) { var f = FAMILY[k] || FAMILY.unknown; return f.emoji + ' ' + f.label; }, function (k) { return (FAMILY[k] || FAMILY.unknown).color; }, 'bars-family')),
      recs.length ? el('p', { class: 'guide' }, reportComment(emo, need, wordOf)) : null
    );
  };
  function reportComment(emo, need, wordOf) {
    var e = emo[0], n = need[0];
    var ew = (EMO[e.key] && EMO[e.key].word) || wordOf[e.key];
    var nw = (NEED[n.key] && NEED[n.key].word) || wordOf['n:' + n.key];
    return '이번 주에는 "' + ew + '"' + (batchim(ew + '"') === 'none' ? '가' : '이') + ' 가장 자주 찾아왔고, "' + nw + '"에 대한 바람이 자주 보였어요.';
  }

  screens.records = function () {
    var recs = records().slice().reverse();
    return screen('records', null, simpleTop('지난 기록'),
      heading('지난 기록', '모두 ' + recs.length + '개'),
      recs.length ? el('ul', { class: 'rec-list' }, recs.map(function (r) {
        var f = FAMILY[r.family] || FAMILY.unknown;
        return el('li', { class: 'rec', style: '--accent:' + f.color },
          el('p', { class: 'rec-date' }, prettyDateTime(r.ts)),
          el('p', { class: 'rec-emotion' }, f.emoji + ' ' + r.emotionWord + (r.hidden ? ' ★' : '') + ' · ' + r.intensity + '점'),
          el('p', { class: 'rec-need' }, '필요했던 것: ' + r.needWord),
          el('p', { class: 'rec-summary' }, r.summary),
          el('p', { class: 'rec-sit' }, '있었던 일: ' + r.situation)
        );
      })) : el('p', { class: 'guide' }, '아직 기록이 없어요. 처음 화면에서 "시작하기"를 눌러 보세요.')
    );
  };

  screens.deleteConfirm = function () {
    return screen('deleteConfirm', null, simpleTop('기록 전체 삭제'),
      heading('기록을 모두 지울까요?'),
      el('p', { class: 'body-text' }, '마음 카드 ' + records().length + '개, 감정 도감, 연속 기록, 주간 보고서가 모두 지워져요. 지운 기록은 되살릴 수 없어요.'),
      el('button', {
        class: 'btn btn-danger btn-big', type: 'button', 'data-testid': 'confirm-delete',
        onclick: function () { clearAll(); goHome(); toast('모든 기록을 지웠어요.'); }
      }, '네, 모두 지울게요'),
      el('button', { class: 'btn btn-secondary btn-big', type: 'button', onclick: back, 'data-testid': 'cancel-delete' }, '아니요, 그대로 둘게요')
    );
  };

  /* ───────── 그리기 ───────── */
  function render() {
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
    window.scrollTo(0, 0);
    var h = app.querySelector('h1');
    if (h) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
  }

  /* 컴퓨터에서 숫자 1~5 키로도 고를 수 있어요 */
  document.addEventListener('keydown', function (ev) {
    if (ev.target && (ev.target.tagName === 'TEXTAREA' || ev.target.tagName === 'INPUT')) return;
    if (/^[1-5]$/.test(ev.key)) {
      var b = app.querySelector('.opt[data-num="' + ev.key + '"]');
      if (b) { ev.preventDefault(); b.click(); }
    }
  });

  /* 테스트에서 쓰는 창구 (화면 동작에는 영향 없음) */
  window.__maeum = {
    isRisky: isRisky, josa: josa, fill: fill, streak: streak,
    totalWords: function () { return ALL_WORDS.length; },
    totalNeeds: function () { return D.needs.length; },
    records: function () { return records(); }
  };

  render();

  /* 인터넷 없이도 열리도록 service worker 등록 */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function (e) { console.warn('service worker 등록 실패', e); });
    });
  }
})();
