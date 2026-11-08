/*
  ───────────────────────────────────────────────
  질문·안내 문장 파일 (questions.js)
  ───────────────────────────────────────────────
  - 따옴표 ' ' 안의 글자만 고치세요.
  - id, need, emotions, pool 처럼 영어·숫자로 된 이름표는 고치지 마세요.
  - 문장 속 { } 표시는 앱이 알맞은 말로 바꿔 넣는 곳이에요. 지우지 마세요.
      {원인}   → "그 사람의 말에서" 같은 말
      {감정을} → "서운함을" / "짜증을" (을·를은 앱이 알아서 맞춰요)
      {강도}   → "많이" 같은 말
      {욕구가} → "들어 주는 것이" (이·가는 앱이 알아서 맞춰요)
*/
window.MAEUM_DATA = window.MAEUM_DATA || {};

window.MAEUM_DATA.text = {
  appTitle: '감정 및 욕구 찾기',
  appSubtitle: '오늘 있었던 일에서 내 감정의 이름과 그 밑의 욕구를 찾아요',
  privacy: '기록은 이 휴대폰 안에만 저장돼요. 어디로도 보내지 않아요.',
  copyright: '© 2026 Jaecheol, LIM. All rights reserved.',
  startButton: '시작하기',
  guideButton: '사용 방법',
  bigText: '글자 크게',
  disclaimer: '감정 낱말을 익히고 내 마음을 살펴보는 도구예요. 진단이나 검사가 아니에요.',

  /* 아래쪽 이동 막대 (모든 화면에 같은 모양: 왼쪽 "← 이전", 오른쪽 "다음 →") */
  navBack: '이전',
  navNext: '다음',
  navMakeCard: '카드 만들기',
  navDone: '처음 화면으로',
  navStart: '시작하기',
  navHome: '처음으로',
  navNewRecord: '새 기록 시작',

  /* 단계 이름 (화면 위쪽에 나와요) */
  steps: ['있었던 일', '감정 고르기', '강도', '원인', '욕구', '마음 카드'],

  /* ① 상황 입력 */
  situationTitle: '오늘 어떤 일이 있었나요?',
  situationGuide: '있었던 일을 1~3줄로 짧게 적어 주세요. 적지 않고 바로 시작해도 돼요.',
  situationPlaceholder: '예) 친구가 약속 시간에 30분이나 늦게 왔다.',
  situationSkip: '적지 않고 시작하기',
  nextButton: '다음',

  /* ② 감정 고르기 (한 화면에서 모두 골라요. 개수 제한 없음) */
  emotionTitle: '그때 어떤 감정이 있었나요?',
  emotionGuide: '①에서 먼저 찾고, ②·③으로 더 찾아요. 어느 방법으로 고른 감정이든 위쪽에 함께 모여요. 몇 개를 골라도 괜찮고, 다시 누르면 풀려요.',
  quadTitle: '기분 4칸으로 찾기',
  quadGuide: '먼저 그때 기분과 가장 가까운 칸을 누르세요. 그 칸의 감정 낱말이 펼쳐져요.',
  quadClose: '접기',
  coreTitle: '핵심 감정으로 찾기',
  coreHint: '많은 사람이 자주 느끼는 감정이에요. 바로 떠오르면 여기서 누르세요. 누르면 뜻이 나와요.',
  waysTitle: '다른 방법으로 찾기',
  waysHint: '①·②에서 찾기 어려울 때 써요.',
  searchWay: '낱말로 찾기',
  searchWayHint: '떠오르는 감정 낱말을 적어서 찾아요',
  thoughtWay: '상대가 나에게 한 일로 찾기',
  thoughtWayHint: '"무시당했다", "내 말을 끊었다"처럼 상대가 한 일이 먼저 떠오를 때',
  thoughtTitle: '상대가 나에게 한 일 가운데 떠오르는 말을 모두 누르세요',
  thoughtGuide: '"무시당했다", "버림받았다" 같은 말은 감정이 아니라 "상대가 나에게 이렇게 했다"는 생각이에요. 묶음마다 떠오르는 생각과 있었던 일이 있어요. 맞는 말을 모두 누르고 "다음"을 누르면, 그 밑에 있을 수 있는 감정을 한꺼번에 보여 드려요.',
  thoughtWordsLabel: '떠오르는 생각',
  thoughtActsLabel: '있었던 일',
  thoughtPicked: '고른 말 {글}개',
  thoughtSearchHint: '상대가 나에게 한 일에 대한 생각이에요. 누르면 이 말을 골라 둔 채로 이어져요.',
  thoughtFeelTitle: '고른 일 밑에는 이런 감정이 있었을 수 있어요',
  thoughtFeelGuide: '고른 말이 여럿 가리키는 감정부터 보여 드려요. 경향일 뿐 정답은 아니에요.',
  thoughtFeelings: '맞는 것 같은 감정을 모두 누르세요.',
  thoughtNeeds: '이런 욕구가 중요했을 수 있어요. 욕구 단계에서 먼저 보여 드려요.',
  notSure: '잘 모르겠어요',
  notSureHint: '몸의 느낌, 하고 싶었던 행동, 바랐던 것을 차례로 물어봐요',
  bodyWay: '몸의 느낌으로 찾기',
  bodyWayHint: '"가슴이 답답했다", "얼굴이 화끈거렸다"처럼 몸이 먼저 느껴질 때',
  bodySearchHint: '몸의 느낌이에요. 누르면 이 느낌에 이어지는 감정을 보여 드려요.',
  /* 몸의 느낌 화면 (docs/body-reactions.md 5-6) */
  bodyDetailLead: '몸 그림에서 느껴진 곳을 누르면 아래에 그 곳의 느낌이 펼쳐져요. 느낌의 결(뜨거움·조임 등)로 찾아도 돼요. 맞는 느낌을 모두 누르세요.',
  bodyWriteLead: '"가슴이 답답해", "속이 타요"처럼 몸 표현을 적어 보세요. 관용 표현 사전에서 찾아도 돼요. 맞는 느낌을 모두 누르세요.',
  bodyTexTitle: '느낌의 결로 찾기',
  bodyTexGuide: '“{글}” 느낌을 모았어요. 결을 다시 누르면 닫혀요.',
  bodyFigLabel: '몸 그림. 느껴진 곳을 누르세요',
  bodyFigGuide: '몸 그림에서 느껴진 곳을 누르세요. 아래 목록에서 눌러도 돼요.',
  bodyFigOpen: '펼친 곳',
  bodyWritePlaceholder: '예) 가슴이 답답해, 속이 타요',
  bodyWriteGuide: '몸 표현을 적으면 맞는 몸의 느낌이 나와요.',
  bodyWriteFound: '맞는 몸의 느낌 {글}개',
  bodyWriteNone: '맞는 몸 표현을 못 찾았어요. 다른 말로 적거나 아래 관용 표현 사전에서 찾아보세요.',
  bodyDictTitle: '몸 관용 표현 사전',
  bodyDictGuide: '몸의 곳을 누르면 느낌과 그 느낌을 말하는 관용 표현이 나와요. 느낌을 누르면 골라져요.',
  bodyLevelLabel: '느낌의 세기',
  bodyFitQ: '{감정을} 이 몸의 느낌에 대 보면 맞나요?',
  bodyFitExact: '꼭 맞음',
  bodyFitClose: '비슷함',
  bodyFitDiff: '다름',
  bodyNearTitle: '{감정과} 가까운 낱말이에요. 더 맞는 것이 있으면 누르세요.',
  emoBodyQ: '💓 몸 어디에서 느껴졌나요?',
  emoBodyHint: '고르지 않아도 돼요. 여러 곳을 골라도 돼요.',
  resultBody: '몸의 느낌',
  bodyRepeatNote: '가슴 답답함·치밀어 오름·열감을 여러 주에 걸쳐 기록했어요. 이런 몸 반응이 자주 이어지면 상담이나 진료를 받아 보는 것도 방법이에요.',
  reportBodyTitle: '몸의 느낌 경향 (최근 4주)',
  reportBodyFeel: '{감정을} 고른 날에는 주로 “{글}”를 함께 골랐어요',
  reportBodyArea: '{감정을} 고른 날에는 주로 {글}에서 느꼈어요',
  reportBodyFew: '아직 경향을 말하기에는 기록이 적어요. 같은 감정과 몸의 느낌을 두 번 넘게 함께 고르면 여기에 나와요.',
  reportBodyGuide: '경향일 뿐 정답은 아니에요.',
  quizButton: '💓 몸 느낌 연습: 같은 느낌, 다른 감정',
  quizTitle: '같은 몸의 느낌, 다른 감정',
  quizLead: '같은 몸의 느낌도 상황에 따라 다른 감정이 될 수 있어요. 점수는 없어요.',
  quizQ: '이 상황이라면 어느 감정에 가까울까요?',
  quizFeedback: '이 상황이라면 흔히 “{글}”에 가까워요. 같은 몸의 느낌도 상황에 따라 다른 감정이 될 수 있고, 사람마다 다를 수 있어요.',
  quizOther: '고른 것과 달라도 괜찮아요.',
  quizNext: '다음 카드',
  quizDone: '감정 도감으로',
  bodyPicked: '고른 몸의 느낌 {글}개',
  pickTitle: '고른 감정 {글}개',
  pickEmpty: '아직 고른 감정이 없어요. 낱말을 눌러 체크하세요.',
  pickNext: '다음 →',
  backToEmotion: '← 감정 고르기 화면으로',
  pickNextCount: '고른 감정 {글}개로 다음 →',
  pickedLast: '방금 고른 감정',
  noneOfThese: '이 중엔 없어요',
  noneOfTheseHint: '다른 방법으로 물어볼게요',
  wordsGuide: '그런 것 같은 감정을 모두 눌러 체크하세요.',

  /* 단어로 찾기 */
  searchButton: '낱말로 찾기',
  searchTitle: '떠오르는 감정 낱말을 적어 보세요',
  searchGuide: '예) 부끄러웠다, 미안함, 놀람, 서운해요',
  searchPlaceholder: '감정 낱말 적기',
  searchSuggest: '자주 찾는 감정',
  searchResults: '찾은 낱말 {글}개',
  searchNone: '맞는 낱말을 못 찾았어요. 다른 말로 적거나, 기분 4칸을 열어 찾아보세요.',
  searchSame: '{감정과} 같은 뜻',
  searchBack: '← 감정 고르기로 돌아가기',

  /* ③ 강도 */
  intensityTitle: '감정마다 크기를 골라 주세요',
  intensityGuide: '1은 아주 조금, 10은 아주 크게예요. 잘못 고른 것 같은 감정은 "빼기", 잘 모르겠으면 "보류"를 누르세요.',
  intensityLeft: '아직 {글}개를 고르지 않았어요',
  intensityHold: '보류',
  intensityRemove: '빼기',
  intensityRestore: '되살리기',
  heldTitle: '보류한 감정',
  heldGuide: '강도 없이 마음 카드에 따로 적혀요. 되살리면 다시 강도를 고를 수 있어요.',
  removedTitle: '뺀 감정',
  removedGuide: '고른 감정에서 뺐어요. 잘못 뺐다면 되살리세요.',
  intensityNone: '강도를 고를 감정이 없어요. 위에서 되살리거나 이전 단계에서 감정을 골라 주세요.',
  resultHeld: '보류한 감정',
  intensityNext: '다음 →',

  /* ④ 원인 */
  causeTitle: '그 마음은 무엇 때문에 생겼을까요?',
  causeGuide: '가장 가까운 것 하나를 누르고, 아래 "다음"을 누르세요.',
  causeOtherTitle: '어떤 것이었는지 적고 싶다면 적어 주세요.',
  causeOtherGuide: '안 적고 넘어가도 괜찮아요.',
  causeOtherPlaceholder: '예) 갑자기 비가 와서',

  /* ⑤ 욕구 고르기 (한 화면에서 모두 골라요. 개수 제한 없음) */
  needTitle: '그 순간 무엇이 있었다면 괜찮았을까요?',
  needTitleMet: '그 마음은 어떤 욕구가 채워져서 생겼을까요?',
  needGuide: '맞는 것 같은 욕구를 모두 누르세요. 몇 개를 골라도 괜찮아요.',
  needSuggestTitle: '먼저 살펴볼 욕구',
  needSuggestHint: '고른 감정과 함께 흔히 보이는 욕구예요. 경향일 뿐 정답은 아니에요. 누르면 뜻이 나와요.',
  needCatTitle: '욕구 14범주에서 더 찾기',
  needCatGuide: '범주를 누르면 그 범주의 욕구 낱말이 펼쳐져요.',
  needWaysTitle: '다른 방법',
  needSearchWayHint: '바랐던 것을 적어서 찾아요',
  needPickTitle: '고른 욕구 {글}개',
  needPickEmpty: '아직 고른 욕구가 없어요.',
  needNoneNote: '욕구를 고르지 않아도 "카드 만들기"를 누를 수 있어요. 욕구는 나중에 찾아도 돼요.',
  needSearchButton: '욕구 낱말로 찾기',
  needSearchTitle: '바랐던 것을 낱말로 적어 보세요',
  needSearchGuide: '예) 인정받고 싶었다, 위로, 쉬고 싶었다, 사과',
  needSearchPlaceholder: '욕구 낱말 적기',
  needSearchSuggest: '자주 찾는 욕구',
  needSearchBack: '← 욕구 고르기로 돌아가기',

  /* ⑥ 마음 카드 */
  resultTitle: '오늘의 마음 카드',
  resultEmotion: '찾은 감정',
  resultEmotionsMany: '찾은 감정 {글}개',
  resultNote: '지금 고른 말은 이 순간의 해석이에요. 감정은 섞이고 바뀔 수 있어요.',
  needFitQuestion: '고른 욕구가 맞았나요?',
  needFitYes: '네',
  needFitNo: '아니요',
  needFitUnsure: '잘 모르겠음',
  needFitNote: '답은 기록에 남아요. 같은 감정을 다시 고르면 욕구 후보 차례에 반영돼요.',
  resultBackNote: '고치고 싶으면 왼쪽 위 "← 이전"으로 돌아가세요. 고른 것은 그대로 남고, 다시 만들면 이 카드가 고쳐져요.',
  reflectSaved: '내가 남긴 말',
  reportDistinctGuide: '서로 다른 감정 = 이번 주 기록에 나온 감정 낱말 수. 여러 감정 기록 = 감정을 2개 이상 고른 기록.',
  reportFitGuide: '마음 카드의 "고른 욕구가 맞았나요?"에 답한 횟수예요. "아니요"가 많았던 욕구는 같은 감정의 욕구 후보에서 빠져요.',
  resultIntensity: '강도',
  resultNeed: '필요했던 것',
  resultSummary: '한 줄 정리',
  newWordBonus: '새 감정 낱말을 찾았어요. 도감에 채워졌어요.',
  homeButton: '처음 화면으로',
  dexButton: '감정 도감 보기',

  /* 한 줄 정리 문장 */
  summaryUnmet: '{원인} {감정을} {강도} 느꼈고, 마음 깊은 곳에서는 {욕구가} 필요했어요.',
  summaryMet: '{원인} {감정을} {강도} 느꼈어요. {욕구가} 채워졌기 때문이에요.',
  summaryNoNeed: '{원인} {감정을} {강도} 느꼈어요. 그 밑에 있는 욕구는 아직 찾는 중이에요.',

  /* 이름 붙이기 어려운 감정 */
  unnamedTitle: '지금은 이름 붙이기 어려운 감정이에요',
  unnamedBody: '괜찮아요. 모든 감정에 바로 이름이 붙지는 않아요. 오늘 마음은 "지금은 이름 붙이기 어려운 감정"으로 저장해 둘게요. 시간이 지나면 이름이 떠오를 수도 있어요.',
  continueButton: '계속하기',

  /* 지난 기록: 수정·피드백·삭제 */
  recordsGuide: '기록마다 아래 단추로 고치거나(수정), 다시 보며 나에게 남길 말을 쓰거나(피드백), 지울(삭제) 수 있어요.',
  recEdit: '수정',
  recFeedback: '피드백',
  recDelete: '삭제',
  editNote: '기록을 고치는 중이에요. 끝까지 가면 새 기록이 생기지 않고 이 기록이 고쳐져요.',
  feedbackLabel: '내 피드백',
  feedbackTitle: '피드백 쓰기',
  feedbackQuestion: '지금 다시 보니 어떤가요?',
  feedbackHints: ['그때 고른 감정과 욕구가 지금 보아도 맞나요?', '그 뒤에 마음이나 일이 어떻게 바뀌었나요?', '다음에 비슷한 일이 생기면 어떻게 하고 싶나요?'],
  feedbackPlaceholder: '떠오르는 대로 적어 보세요. 나만 보는 글이에요.',
  feedbackSave: '저장하기',
  feedbackDone: '피드백을 저장했어요.',

  /* 감정 도감 */
  dexLead: '감정 낱말을 누르면 뜻과 쓰임이 나와요',
  dexGuide: '기분 4칸 가운데 하나를 누르면 그 칸의 감정이 범주별로 나와요. 낱말의 + 단추를 누르면 뜻, 비슷한 말, 반대말이 나와요. ✓는 내가 골라 본 감정이에요.',
  dexMeaning: '뜻',
  dexSimilar: '비슷한 말',
  dexOpposite: '반대말',
  dexNone: '없어요',
  dexNoOpposite: '뚜렷한 반대말이 없어요 (두 마음이 섞인 말이에요)',

  /* 처음 화면 */
  homeEncourage: '정답은 없어요. 떠오르는 대로 골라도 괜찮아요.',
  menuDex: '감정 도감',
  menuReport: '주간 보고서',
  menuRecords: '지난 기록',
  menuBackup: '기록 옮기기',
  statRecords: '기록 {글}개',
  statDex: '도감 {글}',
  statStreak: '연속 {글}일',

  /* 사용 방법 (처음 열 때 한 번 나와요. 처음 화면 오른쪽 위 "사용 방법"으로 다시 볼 수 있어요) */
  guideTitle: '사용 방법',
  guideClose: '처음 화면으로',
  installTitle: '홈 화면에 앱으로 설치하는 방법',
  refsTitle: '이 앱을 설계할 때 참고한 자료',
  refsOpen: '눌러서 보기',
  refsNote: '서지는 조사자료(docs 폴더)에 정리한 내용을 따랐어요. 감정 낱말의 칸·범주 배치와 감정-욕구 연결은 위 자료를 바탕으로 한 작성자의 추정이며, 확정된 규칙이 아니에요.'
};

/* 사용 방법 화면 (위에서부터 차례대로 나와요) */
window.MAEUM_DATA.guide = {
  sections: [
    { icon: '🧭', title: '이 앱은', body: '오늘 있었던 일에서 내 감정의 이름을 찾고, 그 감정 밑에 있는 욕구를 살펴보는 도구예요. 진단이나 검사가 아니에요. 정답도 없어요.' },
    { icon: '①', title: '있었던 일 적기', body: '1~3줄로 적어요. 적지 않고 시작해도 돼요.' },
    { icon: '②', title: '감정 고르기', body: '세 방법은 위에서 아래로 서로 돕는 차례예요. ① 기분 4칸으로 찾기: 먼저 그때 기분과 가장 가까운 칸(노랑·초록·빨강·파랑)을 눌러 펼쳐요. ② 핵심 감정으로 찾기: 많은 사람이 자주 느끼는 6개(수치심·죄책감·분노·두려움·상실감·슬픔)가 바로 떠오르면 눌러요. ③ 다른 방법으로 찾기: ①·②에서 찾기 어려우면 낱말을 적어 찾거나, "무시당했다", "내 말을 끊었다"처럼 상대가 나에게 한 일로 찾거나(여러 개 고르면 그 밑의 감정이 한꺼번에 나와요), "가슴이 답답했다"처럼 몸의 느낌으로 찾거나, "잘 모르겠어요"를 써요. 몸의 느낌으로 찾기에는 단계가 셋 있어요(들어올 때마다 "쉽게"부터 보여요). "쉽게"는 몸 6곳과 느낌의 결 4가지, "자세히"는 몸 그림 12곳과 결 10가지, "적어서 찾기"는 몸 표현을 적거나 관용 표현 사전에서 찾아요. 느낌을 여러 개 고르면, 고른 느낌마다 세기(약·중·강)를 고를 수 있고 이어질 수 있는 감정을 보여 줘요. 낱말을 고르면 "몸의 느낌에 대 보면 맞나요?"(꼭 맞음·비슷함·다름)를 묻고, "다름"이면 가까운 낱말을 다시 보여 줘요. 같은 느낌도 상황에 따라 다른 감정일 수 있어서, 그 일을 떠올리며 골라요. 낱말로 찾기에 "속이 타요"처럼 적어도 이어져요. "잘 모르겠어요"는 몸의 느낌 → 하고 싶었던 행동 → 바랐던 것 → 옛 경험 차례로 물어봐요. 어느 방법으로 고른 감정이든 위쪽에 함께 모이고, 몇 개를 골라도 괜찮아요. 누르면 뜻이 나오고, 다시 누르면 풀려요.' },
    { icon: '③', title: '강도', body: '고른 감정마다 1~10 가운데 크기를 골라요. 한 화면에 모두 나와요. 잘못 고른 것 같은 감정은 "빼기", 잘 모르겠는 감정은 "보류"를 누르세요. 보류한 감정은 강도 없이 마음 카드에 따로 적히고, 둘 다 "되살리기"로 되돌릴 수 있어요. 감정마다 "몸 어디에서 느껴졌나요?"를 눌러 몸의 곳을 골라 둘 수도 있어요(고르지 않아도 돼요).' },
    { icon: '④', title: '원인', body: '그 마음이 무엇 때문에 생겼는지 가장 가까운 것 하나를 누르고 "다음"을 눌러요.' },
    { icon: '⑤', title: '욕구 고르기', body: '감정과 같은 차례예요. 1. 고른 감정과 함께 흔히 보이는 욕구가 먼저 나와요(경향일 뿐 정답은 아니에요). 2. 욕구 14범주를 펼쳐 더 찾아요. 3. 낱말로 찾을 수도 있어요. 맞는 것 같은 욕구는 몇 개든 모두 누르세요. 고르지 않고 "카드 만들기"를 눌러도 돼요.' },
    { icon: '⑥', title: '마음 카드', body: '감정·강도·욕구·한 줄 정리가 카드로 남아요. 고른 욕구가 맞았는지 답하면 다음에 욕구 후보 차례가 바뀌어요.' },
    { icon: '←', title: '이전·다음 단추', body: '처음 화면을 뺀 모든 화면 맨 아래에 같은 모양의 단추 두 개가 있어요. 왼쪽 "← 이전"(흰 단추)은 바로 앞 화면으로, 오른쪽 "다음 →"(파란 단추)은 다음 단계로 가요. 마음 카드에서도 이전으로 돌아갈 수 있어요. 돌아가도 적은 글, 고른 감정·강도·보류·원인·욕구는 지워지지 않고 그대로 남아요. 고친 뒤 다시 앞으로 가면 이어서 할 수 있고, 마음 카드에서 돌아가 고친 뒤 다시 만들면 새 카드가 하나 더 생기지 않고 같은 카드가 고쳐져요. 화면 위쪽 "그만하기"를 누르면 처음 화면으로 가요.' },
    { icon: '📖', title: '도감·보고서·기록', body: '감정 도감: 기분 4칸별로 모든 감정 낱말이 두 줄씩 나란히 있고, + 단추를 누르면 뜻·비슷한 말·반대말이 펼쳐져요. 도감 위쪽 "몸 느낌 연습"에서는 같은 몸의 느낌이 상황에 따라 어떤 감정이 되는지 카드로 연습해요(점수 없음). 주간 보고서에는 최근 4주 동안 감정과 함께 자주 고른 몸의 느낌이 경향으로 나와요. 주간 보고서: 자주 나온 감정과 욕구를 볼 수 있어요. 지난 기록: 기록마다 수정(처음 단계부터 고쳐 같은 기록에 저장), 피드백(다시 보며 나에게 남기는 글), 삭제 단추가 있어요. 기록은 이 휴대폰 안에만 저장되고, 기록 옮기기로 파일에 담아 옮길 수 있어요.' },
    { icon: '가', title: '글자가 작으면', body: '처음 화면 왼쪽 위 "글자 크게"를 누르면 모든 화면의 글자와 버튼이 커져요. 다시 누르면 보통 크기로 돌아와요.' }
  ],
  /* 홈 화면에 앱으로 설치하는 방법 (초등학생도 따라 할 수 있게). 휴대폰 종류에 맞는 쪽이 먼저 펼쳐져요 */
  install: {
    warn: '카톡 같은 메신저에서 주소를 누르면 "메신저 안의 화면"으로 열려요. 거기서는 설치가 안 돼요. 안드로이드는 "크롬", 아이폰은 "사파리"로 열어야 해요.',
    address: '앱 주소',
    copy: '주소 복사하기',
    copied: '주소를 복사했어요. 크롬이나 사파리 주소 칸에 붙여 넣으세요.',
    android: {
      title: '안드로이드(갤럭시 등)',
      steps: [
        '위의 앱 주소를 복사해요. ("주소 복사하기"를 누르거나, 주소를 손가락으로 꾹 누르고 "복사")',
        '휴대폰에서 "크롬" 앱을 열어요. (동그란 빨강·노랑·초록 공 모양 아이콘)',
        '맨 위 주소 칸을 누르고, 꾹 눌러 "붙여넣기"를 한 다음 이동해요.',
        '앱 화면이 나오면, 오른쪽 위 점 3개(⋮)를 눌러요.',
        '"홈 화면에 추가" 또는 "앱 설치"를 눌러요.',
        '작은 창이 나오면 "설치"(또는 "추가")를 눌러요.',
        '휴대폰 첫 화면에 「감정 및 욕구 찾기」 아이콘이 생겼어요!'
      ],
      trouble: [
        '"홈 화면에 추가"가 안 보이면: 크롬이 아닌 다른 곳에서 연 거예요. 1번부터 다시 해 보세요.',
        '크롬이 없으면: "삼성 인터넷"을 열고 주소를 붙여 넣은 다음, 아래쪽 줄 3개(≡) → "현재 페이지 추가" → "홈 화면"을 눌러요.'
      ]
    },
    ios: {
      title: '아이폰',
      steps: [
        '위의 앱 주소를 복사해요. ("주소 복사하기"를 누르거나, 주소를 손가락으로 꾹 누르고 "복사")',
        '아이폰에서 "사파리" 앱을 열어요. (파란 나침반 모양 아이콘)',
        '주소 칸을 누르고, 꾹 눌러 "붙여넣기 및 이동"을 눌러요.',
        '앱 화면이 나오면, "공유" 단추를 눌러요. (네모에서 위로 화살표가 나온 모양) 안 보이면 아래쪽 점 3개(···)를 먼저 누르면 "공유"가 나와요.',
        '나온 목록을 위로 밀어 올려서 "홈 화면에 추가"를 눌러요.',
        '오른쪽 위 "추가"를 눌러요.',
        '아이폰 첫 화면에 「감정 및 욕구 찾기」 아이콘이 생겼어요!'
      ],
      trouble: [
        '"홈 화면에 추가"가 안 보이면: 사파리가 아닌 다른 곳에서 연 거예요. 1번부터 다시 해 보세요.',
        '목록에 없으면 맨 아래 "작업 편집"을 눌러 "홈 화면에 추가"를 찾아 넣어요.'
      ]
    },
    troubleTitle: '안 될 때',
    after: [
      '앞으로는 꼭 이 아이콘을 눌러서 쓰세요. 기록은 연 곳(크롬·사파리·메신저 안의 화면)마다 따로 저장돼요.',
      '한 번 연 뒤에는 인터넷이 없어도 열려요.',
      '내 기록은 내 휴대폰 안에만 저장돼요. 아무에게도 보내지지 않아요.',
      '메뉴 이름과 위치는 휴대폰 종류와 판에 따라 조금 다를 수 있어요.'
    ]
  },
  references: [
    { group: '감정과 욕구의 언어', items: [
      'Rosenberg, M. B. (2015). Nonviolent Communication: A Language of Life (3rd ed.). PuddleDancer Press. [한국어판: 『비폭력대화』, 캐서린 한 옮김, 한국NVC출판사]',
      'Center for Nonviolent Communication (2005). Feelings Inventory · Needs Inventory. cnvc.org',
      '한국NVC센터. 느낌 목록 · 욕구 목록.'
    ] },
    { group: '기분 4칸 (쾌-불쾌 × 에너지)', items: [
      'Russell, J. A. (1980). A circumplex model of affect. Journal of Personality and Social Psychology, 39(6), 1161–1178.',
      'Brackett, M. (2019). Permission to Feel. Celadon Books. [한국어판: 『감정의 발견』, 북라이프] · Yale Center for Emotional Intelligence, RULER와 무드 미터'
    ] },
    { group: '감정 범주와 정서 입자도', items: [
      'Ekman, P. (1992). An argument for basic emotions. Cognition and Emotion, 6(3–4), 169–200.',
      'Plutchik, R. (2001). The nature of emotions. American Scientist, 89(4), 344–350.',
      'Willcox, G. (1982). The Feeling Wheel. Transactional Analysis Journal, 12(4), 274–276.',
      'Barrett, L. F. (2017). How Emotions Are Made. Houghton Mifflin Harcourt.',
      'Kashdan, T. B., Barrett, L. F., & McKnight, P. E. (2015). Unpacking emotion differentiation. Current Directions in Psychological Science, 24(1), 10–16.',
      'Lieberman, M. D., et al. (2007). Putting feelings into words. Psychological Science, 18(5), 421–428.'
    ] },
    { group: '여러 감정을 함께 고르는 근거', items: [
      'Berrios, R., Totterdell, P., & Kellett, S. (2015). Eliciting mixed emotions: a meta-analysis comparing models, types, and measures. Frontiers in Psychology, 6, 428.',
      'Larsen, J. T., & McGraw, A. P. (2011). Further evidence for mixed emotions. Journal of Personality and Social Psychology, 100(6), 1095–1110.'
    ] },
    { group: '욕구 이론', items: [
      'Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits. Psychological Inquiry, 11(4), 227–268.',
      'Tay, L., & Diener, E. (2011). Needs and subjective well-being around the world. Journal of Personality and Social Psychology, 101(2), 354–365.',
      'Max-Neef, M. A. (1991). Human Scale Development. Apex Press.',
      'Young, J. E., Klosko, J. S., & Weishaar, M. E. (2003). Schema Therapy: A Practitioner\'s Guide. Guilford Press.',
      'Gottman, J. (1997). Raising an Emotionally Intelligent Child. Simon & Schuster.'
    ] },
    { group: '한국어 감정 낱말 연구', items: [
      '박인조·민경환 (2005). 한국어 감정단어의 목록 작성과 차원 탐색. 한국심리학회지: 사회 및 성격, 19(1), 109–129.',
      '손선주·박미숙·박지은·손진훈 (2012). 한국어 감정표현단어의 추출과 범주화. 감성과학, 15(1), 105–120.',
      '홍영지·남예은·이윤형 (2016). 정서가, 각성가 및 구체성 평정을 통한 한국어 정서단어 목록 개발. 인지과학, 27(3), 377–406.'
    ] },
    { group: '몸의 반응', items: [
      'Nummenmaa, L., Glerean, E., Hari, R., & Hietanen, J. K. (2014). Bodily maps of emotions. PNAS, 111(2), 646–651.',
      'Nummenmaa, L., Hari, R., Hietanen, J. K., & Glerean, E. (2018). Maps of subjective feelings. PNAS, 115(37), 9198–9203.',
      'Jung, W. M., Ryu, Y., Lee, Y. S., Wallraven, C., & Chae, Y. (2017). Role of interoceptive accuracy in topographical changes in emotion-induced bodily sensations. PLoS ONE, 12(9), e0183211.',
      '박소영·주은선 (2019). 한국적 정서표현의 특징에 관한 탐색적 연구. 한국심리학회지: 일반, 38(1), 25–52.',
      'Craig, A. D. (2002). How do you feel? Interoception: the sense of the physiological condition of the body. Nature Reviews Neuroscience, 3, 655–666.',
      'Ventura-Bort, C., Wendt, J., & Weymar, M. (2021). The role of interoceptive sensibility and emotional conceptualization for the experience of emotions. Frontiers in Psychology, 12, 712418.',
      'Trevisan, D. A., Tsheringla, S., & McPartland, J. C. (2023). On the relation between interoceptive attention and health anxiety. Cogent Psychology.',
      'Gendlin, E. T. (1981). Focusing. Bantam Books.'
    ] },
    { group: '앱 설계·효과 연구', items: [
      'Chernev, A., Böckenholt, U., & Goodman, J. (2015). Choice overload: A conceptual review and meta-analysis. Journal of Consumer Psychology, 25(2), 333–358.',
      'Linardon, J., et al. (2019). The efficacy of app-supported smartphone interventions for mental health problems: a meta-analysis of randomized controlled trials. World Psychiatry, 18(3), 325–336.',
      'Cheng, V. W. S., et al. (2019). Gamification in apps and technologies for improving mental health and well-being: Systematic review. JMIR Mental Health, 6(6), e13717.'
    ] }
  ]
};

/* 강도 점수에 따라 문장에 들어가는 말 (1점부터 10점까지 차례대로) */
window.MAEUM_DATA.intensityWords = ['살짝', '살짝', '조금', '조금', '꽤', '꽤', '많이', '많이', '아주 크게', '아주 크게'];

/* ⑤ 원인 보기 (1~5번) */
window.MAEUM_DATA.causes = [
  { id: 'word', label: '그 사람의 말', hint: '들은 말 한마디', sentence: '그 사람의 말에서' },
  { id: 'attitude', label: '그 사람의 태도', hint: '표정, 행동, 말투', sentence: '그 사람의 태도에서' },
  { id: 'result', label: '일의 결과', hint: '점수, 승패, 결과물', sentence: '일의 결과에서' },
  { id: 'expect', label: '내가 했던 기대', hint: '이렇게 되길 바랐던 마음', sentence: '내가 했던 기대 때문에' },
  { id: 'other', label: '다른 것', hint: '직접 적어도 돼요', sentence: '그 일에서', sentenceWithText: '"{글}" 때문에' }
];

/*
  감정 고르기 화면의 "잘 모르겠어요"를 누르면 시작하는 질문 방법.
  각 화면의 5번 "이 중엔 없어요"를 누를 때마다 차례대로 바뀌어요
  1번째: 몸 감각 → 2번째: 하고 싶었던 행동 → 3번째: 반대로(욕구부터) → 4번째: 비슷한 옛 경험
  1번째(몸 감각)는 장면 하나가 아니라 몸의 곳별 느낌(parts)을 여러 개 골라요. 2~4번째는 장면(options) 하나를 골라요.
  그다음에도 5번을 누르면 "지금은 이름 붙이기 어려운 감정"으로 저장돼요.
  emotions 안의 이름표는 emotions.js의 id예요.
*/
window.MAEUM_DATA.approaches = [
  {
    key: 'body',
    intro: '좋아요. 이번에는 몸에게 물어볼게요.',
    question: '그 일이 있던 순간, 몸에서 가장 먼저 느껴진 곳은 어디였나요?',
    guide: '곳을 누르면 느낌이 펼쳐져요. 맞는 느낌을 모두 누르고 "다음"을 누르세요. 다른 곳도 함께 골라도 돼요.',
    wordsQuestion: '그 몸의 느낌에 이름을 붙인다면 무엇에 가까울까요?',
    wordsGuide: '고른 몸의 느낌마다 이어질 수 있는 감정이에요. 같은 느낌도 상황에 따라 다른 감정일 수 있어요. 그 일을 떠올리며 낱말을 몸의 느낌에 대 보고, 맞는 것 같은 감정을 모두 누르세요. 아니다 싶으면 다시 눌러 풀어요.',
    careNote: '몸의 증상이 계속되거나 심하면 감정 탐색보다 진료가 먼저예요.',
    /*
      몸의 곳(parts)과 느낌(feelings) — docs/body-reactions.md(몸의 반응 보완 장)의 4-2 연결표·2-7 관용 표현을 따라 정리했어요.
      - parts: 몸 그림의 12곳을 6묶음으로 모았어요(where = 묶음에 든 곳).
      - emotions: 그 느낌에 이어질 수 있는 감정 낱말 id(emotions.js). 경향일 뿐 정답이 아니에요.
      - src: 근거 표시 — N(Nummenmaa 외 2014·2018), P(박소영·주은선 2019), H(화병 임상진료지침), A(작성자 추정)
      - idioms: 그 느낌을 말하는 한국어 관용 표현. 낱말로 찾기에 이렇게 적으면 이 느낌으로 이어 줘요.
      - ask: 여러 감정에 걸치는 느낌에 붙이는 상황 질문(감정 후보를 좁히는 데 써요).
      - care: true면 "진료가 먼저예요" 안내를 보여 줘요(가슴이 아림·숨이 가쁨·어지러움).
      id는 기록 중에 고른 것을 기억하는 데 써요. 바꾸지 마세요.
    */
    parts: [
      { id: 'head', label: '머리·얼굴', where: '머리 · 눈 · 얼굴 · 입 · 턱', feelings: [
        { id: 'b-head-hot', area: 'head', tex: 'hot', label: '머리가 뜨겁고 터질 것 같았어요', emotions: ['ang29', 'ang19', 'ang01', 'red01'], src: 'N·P',
          idioms: ['열이 나다', '불이 나다', '열 받다', '머리 뚜껑이 열리다', '피가 거꾸로 솟다', '혈압이 오르다', '눈에서 불이 나다', '눈이 뒤집히다', '핏대를 세우다'] },
        { id: 'b-head-ache', area: 'head', tex: 'pain', label: '머리가 지끈거렸어요', emotions: ['sad54', 'ang01', 'fear10', 'sad53'], src: 'A',
          idioms: ['골치가 아프다', '머리가 아프다'] },
        { id: 'b-head-blank', area: 'eyes', tex: 'breath', label: '눈앞이 하얘지거나 캄캄해졌어요', emotions: ['fear24', 'fear33', 'fearH2', 'sad16', 'sad19'], src: 'P',
          idioms: ['눈앞이 하얘지다', '머릿속이 하얘지다', '눈앞이 캄캄하다'],
          ask: '갑자기 놀란 일이었나요, 앞이 막막한 일이었나요?' },
        { id: 'b-eyes-wide', area: 'eyes', tex: 'move', label: '눈이 휘둥그레지고 입이 떡 벌어졌어요', emotions: ['fear24', 'yel28', 'fear26', 'fear33'], src: 'P',
          idioms: ['눈이 휘둥그레지다', '입이 떡 벌어지다', '어안이 벙벙하다'] },
        { id: 'b-dizzy', area: 'head', tex: 'move', label: '머리가 핑 돌고 어지러웠어요', emotions: ['fear33', 'fearH2', 'fear43', 'fear31'], src: 'A',
          idioms: ['머리가 핑 돌다', '어지럽다'], care: true },
        { id: 'b-face-hot', area: 'face', tex: 'hot', label: '얼굴이 화끈거리고 달아올랐어요', emotions: ['fear13', 'fear14', 'fear23', 'ang29', 'joy02'], src: 'P·A',
          idioms: ['얼굴이 화끈거리다', '얼굴이 달아오르다', '귀까지 빨개지다', '낯이 뜨겁다', '얼굴이 빨개지다', '얼굴이 붉으락푸르락하다', '뒤통수가 따갑다'],
          ask: '부끄러운 일이었나요, 화가 난 일이었나요, 마음이 설레는 일이었나요?' },
        { id: 'b-brow', area: 'face', tex: 'tight', label: '미간이 찌푸려졌어요', emotions: ['angH2', 'ang16', 'ang04', 'ang01'], src: 'P',
          idioms: ['미간이 찌푸려지다', '눈에 거슬리다', '눈엣가시 같다'] },
        { id: 'b-tears', area: 'eyes', tex: 'hot', label: '눈시울이 뜨겁고 코끝이 찡했어요', emotions: ['sad30', 'sad17', 'joy16', 'ang05'], src: 'P',
          idioms: ['눈시울이 붉어지다', '눈시울이 뜨거워지다', '코끝이 찡하다', '눈물이 핑 돌다'],
          ask: '슬프거나 서러운 일이었나요, 마음이 크게 움직인 고마운 일이었나요?' },
        { id: 'b-mouth-dry', area: 'mouth', tex: 'breath', label: '입이 바싹 마르고 마른침을 삼켰어요', emotions: ['fear09', 'fear31', 'fear07'], src: 'P',
          idioms: ['입이 바싹 마르다', '마른침을 삼키다'] },
        { id: 'b-teeth', area: 'mouth', tex: 'weight', label: '이를 악물었어요', emotions: ['ang06', 'ang29', 'ang05', 'ang31'], src: 'P',
          idioms: ['이를 악물다', '이가 갈리다', '치가 떨리다'] },
        { id: 'b-smile', area: 'mouth', tex: 'move', label: '입꼬리가 올라가고 웃음이 났어요', emotions: ['joy28', 'joy33', 'joy15', 'joyH2'], src: 'P',
          idioms: ['입이 귀에 걸리다', '입꼬리가 올라가다', '콧노래가 나오다', '눈이 반짝이다'] }
      ] },
      { id: 'chest', label: '목·가슴', where: '목 · 뒷목 · 가슴 · 심장', feelings: [
        { id: 'b-throat', area: 'neck', tex: 'tight', label: '목이 메고 꽉 막혔어요', emotions: ['blu03', 'sad17', 'ang05', 'ang02', 'sad30'], src: 'P·H',
          idioms: ['목이 메다', '목이 막히다', '한이 맺히다'] },
        { id: 'b-neck-stiff', area: 'neck', tex: 'pain', label: '뒷목이 당기고 뻐근했어요', emotions: ['ang29', 'fear10', 'fear09', 'ang17'], src: 'P',
          idioms: ['뒷목을 잡다', '뒷골이 당기다', '뒷목이 뻐근하다'] },
        { id: 'b-chest-tight', area: 'chest', tex: 'tight', label: '가슴이 답답하고 돌덩이를 얹은 것 같았어요', emotions: ['fear31', 'fear01', 'ang05', 'ang29', 'sad30', 'ang02'], src: 'N·P·H',
          idioms: ['가슴이 답답하다', '가슴에 돌덩이를 얹은 듯하다', '숨통이 조여 오다', '숨이 막히다'],
          ask: '걱정되는 일이었나요, 억울하거나 화나는 일이었나요, 슬픈 일이었나요?' },
        { id: 'b-chest-rise', area: 'chest', tex: 'move', label: '가슴에서 뜨거운 것이 치밀어 올랐어요', emotions: ['ang29', 'ang05', 'ang06', 'red02'], src: 'P·H',
          idioms: ['울화가 치밀다', '부아가 치밀다', '속에서 욱하다', '속에서 천불이 나다'] },
        { id: 'b-chest-ache', area: 'chest', tex: 'pain', label: '가슴이 아리고 미어졌어요', emotions: ['sad30', 'sad33', 'sad11', 'sad20', 'sad34'], src: 'P',
          idioms: ['가슴이 미어지다', '가슴이 찢어지다', '가슴이 아리다', '가슴이 시리다', '가슴이 먹먹하다', '억장이 무너지다', '가슴이 무너지다', '애간장이 녹다'], care: true },
        { id: 'b-chest-prick', area: 'chest', tex: 'pain', label: '가슴이 뜨끔하고 콕콕 찔렸어요', emotions: ['sad23', 'sad20', 'sadH2', 'sad22'], src: 'A',
          idioms: ['가슴이 뜨끔하다', '양심이 찔리다', '가슴이 콕콕 찔리다', '마음에 걸리다', '눈에 밟히다', '볼 낯이 없다', '면목이 없다', '가슴을 치다', '발 뻗고 못 자다', '머리를 쥐어박고 싶다'] },
        { id: 'b-chest-warm', area: 'chest', tex: 'warm', label: '가슴이 따뜻하고 뭉클했어요', emotions: ['joy13', 'grn18', 'joy16', 'joy14'], src: 'N·P',
          idioms: ['가슴이 따뜻해지다', '가슴이 뭉클하다', '마음이 녹다'] },
        { id: 'b-chest-full', area: 'chest', tex: 'empty', label: '가슴이 벅차고 부풀어 올랐어요', emotions: ['joyH1', 'joy28', 'joy09', 'yel03'], src: 'P',
          idioms: ['가슴이 벅차다'] },
        { id: 'b-chest-empty', area: 'chest', tex: 'empty', label: '가슴이 텅 비고 구멍이 난 것 같았어요', emotions: ['sadH6', 'sad02', 'sad06', 'sadH1'], src: 'P',
          idioms: ['가슴에 구멍이 뚫리다', '가슴이 텅 비다', '마음이 허하다'] },
        { id: 'b-chest-drop', area: 'chest', tex: 'move', label: '심장이 철렁 내려앉았어요', emotions: ['fear25', 'fear24', 'fear07', 'fear31'], src: 'P',
          idioms: ['심장이 철렁 내려앉다', '가슴이 덜컥하다', '간이 콩알만 해지다', '간이 떨리다', '심장이 쪼그라들다'] },
        { id: 'b-chest-pound', area: 'chest', tex: 'move', label: '가슴이 두근거렸어요', emotions: ['joy02', 'joyH5', 'fear31', 'fear09', 'fear18'], src: 'N·A',
          idioms: ['가슴이 두근거리다', '가슴이 뛰다', '가슴이 설레다', '심장이 간질간질하다'],
          ask: '기다리던 좋은 일이었나요, 걱정되거나 떨리는 일이었나요?' },
        { id: 'b-breath', area: 'chest', tex: 'breath', label: '숨이 가쁘고 얕아졌어요', emotions: ['fear31', 'fear02', 'fear05', 'fear42'], src: 'A',
          idioms: ['숨이 가쁘다', '숨이 멎을 것 같다'], care: true },
        { id: 'b-breath-easy', area: 'chest', tex: 'breath', label: '숨이 트이고 고르게 쉬어졌어요', emotions: ['joy07', 'joy41', 'grn06', 'joyH3'], src: 'P',
          idioms: ['숨이 고르다', '한숨 돌리다', '숨통이 트이다'] }
      ] },
      { id: 'belly', label: '배·속', where: '명치 · 윗배 · 배', feelings: [
        { id: 'b-belly-knot', area: 'pit', tex: 'tight', label: '명치가 꽉 막히고 체한 것 같았어요', emotions: ['ang05', 'ang13', 'fear01', 'fearH5'], src: 'H·P',
          idioms: ['명치가 막히다', '체한 것 같다', '속이 얹히다'] },
        { id: 'b-belly-burn', area: 'belly', tex: 'hot', label: '속이 타고 애가 탔어요', emotions: ['fear01', 'fear02', 'ang29', 'sad56'], src: 'P',
          idioms: ['속이 타다', '애가 타다', '가슴을 졸이다', '피가 마르다'],
          ask: '걱정되는 일이었나요, 화가 나는 일이었나요?' },
        { id: 'b-belly-boil', area: 'belly', tex: 'hot', label: '속이 부글부글 끓었어요', emotions: ['ang13', 'ang29', 'ang19', 'red02'], src: 'P',
          idioms: ['속이 부글부글 끓다', '속이 터지다', '복장이 터지다'] },
        { id: 'b-belly-sick', area: 'belly', tex: 'breath', label: '속이 울렁거리고 메스꺼웠어요', emotions: ['ang20', 'angH2', 'red18', 'fear31'], src: 'N·P',
          idioms: ['속이 메스껍다', '구역질나다', '비위가 상하다', '비위가 뒤틀리다', '속이 뒤집히다', '속이 울렁거리다', '정이 떨어지다', '밥맛 떨어지다'],
          ask: '싫고 못마땅한 일이었나요, 불안한 일이었나요?' },
        { id: 'b-belly-ache', area: 'belly', tex: 'pain', label: '배가 아프고 속이 쓰렸어요', emotions: ['fear01', 'fear10', 'sad24', 'sad27', 'ang15'], src: 'A',
          idioms: ['배가 아프다', '속이 쓰리다', '배알이 꼴리다'],
          ask: '걱정되는 일이었나요, 남이 잘되어 샘나는 일이었나요?' },
        { id: 'b-belly-open', area: 'pit', tex: 'empty', label: '속이 뻥 뚫리고 후련했어요', emotions: ['joyH3', 'joy36', 'joy06', 'grn09'], src: 'P',
          idioms: ['속이 후련하다', '가슴이 뻥 뚫리다', '체증이 내려가다', '먹지 않아도 배부르다'] },
        { id: 'b-no-appetite', area: 'belly', tex: 'breath', label: '입맛이 없었어요', emotions: ['sad15', 'sad30', 'fear01', 'sad14'], src: 'P',
          idioms: ['입맛이 없다', '밥이 안 넘어가다'] }
      ] },
      { id: 'back', label: '어깨·등', where: '어깨 · 등 · 허리', feelings: [
        { id: 'b-shoulder-heavy', area: 'back', tex: 'weight', label: '어깨가 무겁고 처졌어요', emotions: ['fear10', 'sad20', 'sad13', 'sad05'], src: 'P',
          idioms: ['어깨가 무겁다', '어깨가 처지다'],
          ask: '해야 할 일이 버거운 때였나요, 미안하거나 실망한 일이었나요?' },
        { id: 'b-shoulder-shrink', area: 'back', tex: 'tight', label: '어깨가 움츠러들고 고개를 못 들었어요', emotions: ['fear15', 'fear16', 'fear13', 'fear23'], src: 'P·A',
          idioms: ['고개를 못 들다', '얼굴을 들 수 없다', '쥐구멍에라도 숨고 싶다', '몸 둘 바를 모르다', '눈 둘 곳이 없다', '벌거벗겨진 것 같다', '체면이 구겨지다'] },
        { id: 'b-shoulder-up', area: 'back', tex: 'move', label: '어깨가 들썩이고 쫙 펴졌어요', emotions: ['joy01', 'joy28', 'joy10', 'joy11'], src: 'P',
          idioms: ['어깨가 들썩이다', '어깨춤이 나다', '어깨가 펴지다'] },
        { id: 'b-shoulder-light', area: 'back', tex: 'weight', label: '어깨가 가벼워지고 긴장이 풀렸어요', emotions: ['joy07', 'joy06', 'grn06', 'joy05'], src: 'P',
          idioms: ['어깨가 가벼워지다', '긴장이 풀리다', '마음이 놓이다'] },
        { id: 'b-back-chill', area: 'back', tex: 'cold', label: '등골이 오싹했어요', emotions: ['fear08', 'fear05', 'fear07', 'red12'], src: 'P',
          idioms: ['등골이 오싹하다', '간담이 서늘하다'] }
      ] },
      { id: 'limbs', label: '팔·다리', where: '팔 · 손 · 다리 · 발', feelings: [
        { id: 'b-fist', area: 'arms', tex: 'weight', label: '주먹을 불끈 쥐었어요', emotions: ['ang29', 'ang19', 'ang06', 'ang05'], src: 'N·P',
          idioms: ['주먹을 불끈 쥐다', '주먹이 운다'] },
        { id: 'b-hands-shake', area: 'arms', tex: 'move', label: '손이 떨리고 식은땀이 났어요', emotions: ['fear12', 'fear09', 'red10', 'fear05', 'ang29'], src: 'N·P',
          idioms: ['손에 땀을 쥐다', '식은땀이 나다', '손이 떨리다'],
          ask: '무섭거나 긴장되는 일이었나요, 화가 나서 떨렸나요?' },
        { id: 'b-hands-cold', area: 'arms', tex: 'cold', label: '손발이 차가워졌어요', emotions: ['fear07', 'fear09', 'fear33', 'fear27'], src: 'P',
          idioms: ['손발이 차가워지다', '손발이 얼음장 같다'] },
        { id: 'b-hands-curl', area: 'arms', tex: 'tingle', label: '손발이 오그라들고 간질거렸어요', emotions: ['fear14', 'fear22', 'fear29'], src: 'P',
          idioms: ['손발이 오그라들다', '몸이 근질근질하다'] },
        { id: 'b-legs-weak', area: 'legs', tex: 'weight', label: '다리에 힘이 풀리고 후들거렸어요', emotions: ['fear24', 'fear05', 'joy07', 'blu20'], src: 'P·A',
          idioms: ['다리가 풀리다', '다리가 후들거리다', '오금이 저리다'],
          ask: '놀라거나 무서운 일이었나요, 큰일이 끝나 마음이 놓인 때였나요?' },
        { id: 'b-restless', area: 'legs', tex: 'move', label: '가만히 있을 수 없어 발을 동동 굴렀어요', emotions: ['fear04', 'fear02', 'red06', 'fear01'], src: 'P',
          idioms: ['발을 동동 구르다', '안절부절못하다', '좌불안석이다'] },
        { id: 'b-feet-light', area: 'legs', tex: 'weight', label: '발걸음이 가벼웠어요', emotions: ['joy28', 'joy06', 'joy01', 'joy03'], src: 'P',
          idioms: ['발걸음이 가볍다'] },
        { id: 'b-feet-heavy', area: 'legs', tex: 'weight', label: '발걸음이 무거웠어요', emotions: ['sad30', 'sad57', 'sad05', 'sad13'], src: 'P',
          idioms: ['발걸음이 무겁다'] }
      ] },
      { id: 'whole', label: '온몸', where: '온몸 · 피부 · 털', feelings: [
        { id: 'b-freeze', area: 'whole', tex: 'cold', label: '몸이 굳고 얼어붙었어요', emotions: ['fear09', 'fear07', 'fear23', 'fear27'], src: 'P',
          idioms: ['몸이 굳다', '얼어붙다', '숨을 죽이다'],
          ask: '무섭거나 긴장되는 일이었나요, 부끄러운 일이었나요?' },
        { id: 'b-drained', area: 'whole', tex: 'weight', label: '온몸에 힘이 빠지고 축 처졌어요', emotions: ['sad30', 'sad15', 'sad05', 'sad14'], src: 'N·P',
          idioms: ['맥이 풀리다', '몸이 물먹은 솜 같다', '힘이 쭉 빠지다'] },
        { id: 'b-heavy', area: 'whole', tex: 'weight', label: '몸이 천근만근 무겁고 지쳤어요', emotions: ['sad13', 'sad53', 'blu21', 'blu23'], src: 'A',
          idioms: ['몸이 천근만근이다', '녹초가 되다', '파김치가 되다', '진이 빠지다', '기진맥진하다', '눈꺼풀이 무겁다'] },
        { id: 'b-light', area: 'whole', tex: 'weight', label: '몸이 가볍고 붕 뜨는 것 같았어요', emotions: ['joy28', 'joy06', 'yel04', 'joy01'], src: 'P',
          idioms: ['날아갈 것 같다', '몸이 붕 뜨다'] },
        { id: 'b-warm', area: 'whole', tex: 'warm', label: '온몸이 따뜻하고 포근했어요', emotions: ['joy41', 'grn18', 'joy07', 'grn19'], src: 'N·P',
          idioms: ['온몸이 따뜻하다', '마음이 포근하다'] },
        { id: 'b-relaxed', area: 'whole', tex: 'breath', label: '몸이 노곤하게 풀렸어요', emotions: ['joy05', 'joy07', 'joy41', 'joy44'], src: 'A',
          idioms: ['몸이 노곤해지다', '발 뻗고 자다'] },
        { id: 'b-goosebumps', area: 'whole', tex: 'tingle', label: '온몸에 소름이 돋고 털이 곤두섰어요', emotions: ['fear08', 'fear07', 'fear19', 'ang21'], src: 'P',
          idioms: ['소름이 돋다', '소름 끼치다', '머리털이 곤두서다', '몸서리치다'] },
        { id: 'b-hot', area: 'whole', tex: 'hot', label: '온몸이 뜨겁고 열이 올랐어요', emotions: ['ang29', 'ang30', 'red01', 'fear13'], src: 'P·H',
          idioms: ['온몸에 열이 오르다', '몸이 달아오르다'],
          ask: '화가 난 일이었나요, 부끄러운 일이었나요?' },
        { id: 'b-numb', area: 'whole', tex: 'breath', label: '몸에 아무 느낌이 없고 멍했어요', emotions: ['fear33', 'blu15', 'blu23', 'blu13', 'blu12'], src: 'P·A',
          idioms: ['멍하다', '아무 느낌이 없다', '넋이 나가다'] }
      ] }
    ]
  },
  {
    key: 'action',
    intro: '그럼 행동으로 떠올려 볼게요.',
    question: '그 순간 무엇을 하고 싶었나요?',
    wordsQuestion: '그 행동을 하고 싶게 만든 마음은 무엇이었을까요?',
    options: [
      { label: '누군가에게 바로 말하고 나누고 싶었어요', emotions: ['joyH2', 'joyH6', 'joyH3', 'joy10'] },
      { label: '이불 속에 숨거나 혼자 있고 싶었어요', emotions: ['sadH4', 'sadH2', 'sadH3', 'sad04'] },
      { label: '따지거나 문을 쾅 닫고 싶었어요', emotions: ['angH1', 'angH2', 'angH5', 'ang05'] },
      { label: '그곳을 얼른 빠져나가고 싶었어요', emotions: ['fearH1', 'fearH3', 'fearH4', 'fear05'] }
    ]
  },
  {
    key: 'reverse',
    intro: '감정 이름은 잠시 내려놓을게요. 거꾸로 가 볼게요.',
    question: '그때 가장 바랐던 것은 무엇이었나요?',
    wordsQuestion: '그 욕구를 떠올리면, 그때 마음은 이 중 어디에 가까웠나요?',
    options: [
      { label: '누가 내 마음을 알아주길 바랐어요', need: 'con2', emotions: ['sad01', 'sad02', 'sadH1', 'ang09'] },
      { label: '공평하게, 존중받으며 대해지길 바랐어요', need: 'res2', emotions: ['ang05', 'ang11', 'angH4', 'ang07'] },
      { label: '안전하고 마음이 놓이길 바랐어요', need: 'saf1', emotions: ['fear01', 'fear05', 'fearH6', 'fearH2'] },
      { label: '내가 애쓴 것을 인정받길 바랐어요', need: 'grow3', emotions: ['sad05', 'ang12', 'fear11', 'joy09'] }
    ]
  },
  {
    key: 'past',
    intro: '예전 기억에서 힌트를 찾아볼게요.',
    question: '예전에 비슷한 기분이 들었던 때가 있다면, 어떤 장면과 가장 닮았나요?',
    wordsQuestion: '그 장면 속 마음에 이름을 붙인다면요?',
    options: [
      { label: '힘든 일을 끝내고 한숨 돌렸던 때', emotions: ['joyH3', 'joy05', 'joy07', 'joyH6'] },
      { label: '아끼던 사람과 멀어졌던 때', emotions: ['sadH1', 'sad10', 'sad12', 'angH5'] },
      { label: '내 잘못이 아닌데 꾸중을 들었던 때', emotions: ['ang05', 'ang06', 'angH4', 'ang11'] },
      { label: '처음 가는 곳에 혼자 남겨졌던 때', emotions: ['sad16', 'fear07', 'fearH6', 'fearH1'] }
    ]
  }
];

/*
  몸의 반응 — 몸 그림의 12곳과 감각 질감 10계열 (docs/body-reactions.md 2-6, 5-6(8))
  - bodyAreas: 몸 그림에서 누르는 곳. part = 몸의 느낌 6묶음(approaches[0].parts) 가운데 어디에 드는지.
  - bodyTextures: 느낌의 결. basic: true인 4계열(뜨거움·차가움·조임·무거움)은 "쉽게" 단계에서 보여요.
  - 느낌마다 area(곳)와 tex(결)를 approaches[0].parts의 feelings에 적어요. 나눔은 작성자 추정이에요.
*/
window.MAEUM_DATA.bodyAreas = [
  { id: 'head', label: '머리', part: 'head' },
  { id: 'eyes', label: '눈', part: 'head' },
  { id: 'face', label: '얼굴', part: 'head' },
  { id: 'mouth', label: '입·턱', part: 'head' },
  { id: 'neck', label: '목', part: 'chest' },
  { id: 'chest', label: '가슴', part: 'chest' },
  { id: 'pit', label: '명치', part: 'belly' },
  { id: 'belly', label: '배(속)', part: 'belly' },
  { id: 'back', label: '어깨·등', part: 'back' },
  { id: 'arms', label: '팔·손', part: 'limbs' },
  { id: 'legs', label: '다리·발', part: 'limbs' },
  { id: 'whole', label: '온몸', part: 'whole' }
];
window.MAEUM_DATA.bodyTextures = [
  { id: 'hot', label: '뜨거움', icon: '🔥', basic: true },
  { id: 'cold', label: '차가움', icon: '❄️', basic: true },
  { id: 'tight', label: '조임·압박', icon: '✊', basic: true },
  { id: 'weight', label: '무게·힘', icon: '⚖️', basic: true },
  { id: 'warm', label: '따뜻함', icon: '☕' },
  { id: 'move', label: '움직임·떨림', icon: '💗' },
  { id: 'tingle', label: '간지러움·찌릿함', icon: '⚡' },
  { id: 'empty', label: '비어 있음·참', icon: '⭕' },
  { id: 'pain', label: '통증·불편', icon: '🩹' },
  { id: 'breath', label: '호흡·소화·에너지', icon: '🌬️' }
];
/* 몸의 느낌 화면의 단계 (5-6(8)): 쉽게 = 6곳·4계열, 자세히 = 몸 그림 12곳·10계열, 적어서 찾기 = 자유 입력·관용 표현 사전 */
window.MAEUM_DATA.bodyModes = [
  { id: 'easy', label: '쉽게', hint: '6곳 · 결 4가지' },
  { id: 'detail', label: '자세히', hint: '그림 12곳 · 결 10가지' },
  { id: 'write', label: '적어서 찾기', hint: '적거나 사전에서' }
];
/* 몸의 느낌 세기 (5-6(1)) */
window.MAEUM_DATA.bodyLevels = [
  { n: 1, label: '약' },
  { n: 2, label: '중' },
  { n: 3, label: '강' }
];
/*
  변별 연습 카드 (5-6(8) "변별 퀴즈") — 같은 몸의 느낌이 상황에 따라 다른 감정이 되는 예.
  감정 도감에서 열어요. 점수를 매기지 않아요. answer는 "흔히 가까운 감정"이며 정답이 아니에요(작성자 추정).
*/
window.MAEUM_DATA.bodyQuiz = [
  { body: 'b-chest-pound', situation: '내일 기다리던 여행을 떠나요.', options: ['joy02', 'fear31'], answer: 'joy02' },
  { body: 'b-chest-pound', situation: '곧 내 발표 차례가 와요.', options: ['joy02', 'fear09'], answer: 'fear09' },
  { body: 'b-face-hot', situation: '많은 사람 앞에서 넘어졌어요.', options: ['fear13', 'ang29'], answer: 'fear13' },
  { body: 'b-face-hot', situation: '내 말을 끊고 내 생각을 비웃었어요.', options: ['fear13', 'ang29'], answer: 'ang29' },
  { body: 'b-legs-weak', situation: '잃어버린 아이를 겨우 찾았어요.', options: ['joy07', 'fear05'], answer: 'joy07' },
  { body: 'b-legs-weak', situation: '어두운 골목에서 누가 계속 따라왔어요.', options: ['joy07', 'fear05'], answer: 'fear05' },
  { body: 'b-tears', situation: '친구가 내 생일을 기억하고 편지를 줬어요.', options: ['joy16', 'sad30'], answer: 'joy16' },
  { body: 'b-tears', situation: '오래 키운 강아지와 헤어졌어요.', options: ['joy16', 'sad30'], answer: 'sad30' },
  { body: 'b-belly-burn', situation: '가족의 검사 결과를 기다리고 있어요.', options: ['fear01', 'ang29'], answer: 'fear01' },
  { body: 'b-belly-burn', situation: '몇 번을 말해도 약속을 또 안 지켰어요.', options: ['fear01', 'ang29'], answer: 'ang29' }
];
