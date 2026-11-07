/*
  욕구 응답 모으기 — 여러 사람이 "기록 옮기기 → 파일로 저장하기"로 보낸 기록 파일(.json)을 모아,
  감정별로 "이 욕구가 맞았나요?" 응답(네·아니요·잘 모르겠음)을 세고
  data/needs.js의 needsByEmotion(감정별 첫 욕구 4개)을 고칠 후보를 보여 줘요.

  실행: node tools/needfit-report.js 기록1.json 기록2.json ... > 결과.md
  - 파일 하나 = 사람 한 명으로 셈 (같은 사람이 여러 번 보냈으면 한 파일만 넣으세요)
  - 같은 기록 id가 여러 파일에 있으면 한 번만 셈
  - 앱처럼, 기록의 첫 감정(emotionId)을 대표 단어로 묶어 셈 (낙담 → 실망)
  - 이 스크립트는 후보만 보여 줘요. needsByEmotion은 사람이 보고 직접 고쳐요.

  후보 기준 (작성자 설계, 사용 기록이 쌓이면 다시 정할 것):
  - 빼기 후보: 지금 목록에 있는 욕구인데, "아니요"가 "네"보다 많고 "아니요"라고 답한 사람이 MIN_PEOPLE명 이상
  - 넣기 후보: 지금 목록에 없는 욕구인데, "네"가 "아니요"의 2배 이상이고 "네"라고 답한 사람이 MIN_PEOPLE명 이상
*/
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const MIN_PEOPLE = Number(process.env.MIN_PEOPLE || 3);
const ROOT = path.resolve(__dirname, '..');

function loadData() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const f of ['emotions.js', 'needs.js', 'questions.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'), ctx, { filename: f });
  }
  const D = ctx.window.MAEUM_DATA;
  const EMO = {}, NEED = {};
  const addEmo = (e) => {
    EMO[e.id] = { word: e.word, parent: null };
    (e.same || []).forEach((x) => { EMO[x.id] = { word: x.word, parent: e.id }; });
  };
  (D.families || []).forEach((f) => {
    (f.groups || []).forEach((g) => g.emotions.forEach(addEmo));
    (f.hidden || []).forEach(addEmo);
  });
  (D.needs || []).forEach((n) => { NEED[n.id] = n.word; });
  return { D, EMO, NEED };
}

function readRecords(file) {
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return { error: '읽을 수 없는 파일' }; }
  const list = Array.isArray(data) ? data : (data && Array.isArray(data.records) ? data.records : null);
  if (!list || (data && !Array.isArray(data) && data.app && data.app !== 'maeum-chatgi')) return { error: '"내 마음 찾기" 기록 파일이 아님' };
  return { records: list };
}

function summarize(files, data) {
  const { D, EMO, NEED } = data || loadData();
  const mainKey = (id) => (EMO[id] ? (EMO[id].parent || id) : id);
  const seen = new Set();
  const table = {};   // 감정 → 욕구 → { yes, no, unsure, yesPeople:Set, noPeople:Set }
  const skipped = [];
  let people = 0, answered = 0;
  files.forEach((f, i) => {
    const r = f.records ? f : readRecords(f);
    if (r.error) { skipped.push(`${f}: ${r.error}`); return; }
    people++;
    const who = 'p' + i;
    r.records.forEach((rec) => {
      if (!rec || ['yes', 'no', 'unsure'].indexOf(rec.needFit) === -1 || !rec.needId || !NEED[rec.needId]) return;
      const id = rec.id ? String(rec.id) : null;
      if (id && seen.has(id)) return;
      if (id) seen.add(id);
      const key = mainKey(rec.emotionId);
      if (!EMO[key]) return;
      const row = ((table[key] = table[key] || {})[rec.needId] = table[key][rec.needId] || { yes: 0, no: 0, unsure: 0, yesPeople: new Set(), noPeople: new Set() });
      row[rec.needFit]++;
      if (rec.needFit === 'yes') row.yesPeople.add(who);
      if (rec.needFit === 'no') row.noPeople.add(who);
      answered++;
    });
  });
  const result = [];
  Object.keys(table).sort().forEach((key) => {
    const current = (D.needsByEmotion || {})[key] || null;
    const rows = Object.keys(table[key]).map((nid) => {
      const x = table[key][nid];
      const inList = !!(current && current.indexOf(nid) !== -1);
      let suggest = '';
      if (current && inList && x.no > x.yes && x.noPeople.size >= MIN_PEOPLE) suggest = '빼기 후보';
      if (current && !inList && x.yes >= 2 * x.no && x.yesPeople.size >= MIN_PEOPLE) suggest = '넣기 후보';
      return { needId: nid, need: NEED[nid], yes: x.yes, no: x.no, unsure: x.unsure, yesPeople: x.yesPeople.size, noPeople: x.noPeople.size, inList, suggest };
    }).sort((a, b) => (b.yes - b.no) - (a.yes - a.no) || b.yes - a.yes);
    result.push({ emotionId: key, emotion: EMO[key].word, hasList: !!current, current: current || [], rows });
  });
  return { people, answered, skipped, minPeople: MIN_PEOPLE, emotions: result };
}

function toMarkdown(s, NEED) {
  const out = [];
  out.push('# 욕구 응답 모음', '');
  out.push(`- 파일(사람) ${s.people}개, 욕구 응답 ${s.answered}개, 후보 기준 인원 ${s.minPeople}명`);
  if (s.skipped.length) out.push('- 읽지 못한 파일: ' + s.skipped.join(' / '));
  out.push('- "목록"은 지금 needsByEmotion에 있는 욕구 ✓. 목록이 없는 감정은 needsByCause(감정 쪽 × 원인)를 써서 후보를 내지 않아요.', '');
  s.emotions.forEach((e) => {
    out.push(`## ${e.emotion} (${e.emotionId})`);
    out.push(e.hasList ? '지금 목록: ' + e.current.map((id) => `${NEED[id] || id}(${id})`).join(', ') : '지금 목록: 없음');
    out.push('', '| 욕구 | 목록 | 네 | 아니요 | 잘 모르겠음 | 네 사람 | 아니요 사람 | 후보 |', '|---|---|---|---|---|---|---|---|');
    e.rows.forEach((r) => out.push(`| ${r.need}(${r.needId}) | ${r.inList ? '✓' : ''} | ${r.yes} | ${r.no} | ${r.unsure} | ${r.yesPeople} | ${r.noPeople} | ${r.suggest} |`));
    out.push('');
  });
  return out.join('\n');
}

if (require.main === module) {
  const files = process.argv.slice(2);
  if (!files.length) { console.error('사용법: node tools/needfit-report.js 기록1.json 기록2.json ...'); process.exit(1); }
  const data = loadData();
  process.stdout.write(toMarkdown(summarize(files, data), data.NEED) + '\n');
}

module.exports = { loadData, summarize, toMarkdown };
