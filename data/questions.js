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
  appTitle: '내 마음 찾기',
  appSubtitle: '오늘 있었던 일 속에서 내 감정의 이름을 찾아보는 게임',
  privacy: '기록은 이 휴대폰 안에만 저장돼요. 어디로도 보내지 않아요.',
  startButton: '시작하기',

  /* 단계 이름 (화면 위쪽에 나와요) */
  steps: ['있었던 일', '감정 고르기', '강도', '원인', '욕구', '결과'],

  /* ① 상황 입력 */
  situationTitle: '오늘 어떤 일이 있었나요?',
  situationGuide: '있었던 일을 1~3줄로 짧게 적어 주세요. 적지 않고 바로 시작해도 돼요.',
  situationPlaceholder: '예) 친구가 약속 시간에 30분이나 늦게 왔다.',
  situationSkip: '적지 않고 시작하기',
  nextButton: '다음',

  /* ② 큰 감정 고르기 */
  familyTitle: '그때 마음은 어느 쪽에 가까웠나요?',
  familyNotSure: '잘 모르겠어요',
  familyNotSureHint: '괜찮아요. 다른 방법으로 찾아볼게요',

  /* ③ 세부 감정 고르기 */
  groupTitle: '조금 더 좁혀 볼게요. 어떤 느낌에 가까웠나요?',
  groupMore: '다른 묶음 더 보기',
  groupMoreHint: '비슷한 느낌 묶음이 더 있어요',
  wordsTitle: '이 중 가까운 감정을 골라 보세요.',

  /* 여러 감정 체크 (3개까지) */
  pickGuide: '맞는 감정을 눌러 체크하세요. 여러 마음이 섞였으면 3개까지 골라도 돼요.',
  pickTitle: '고른 감정 {글}개',
  pickLimit: '3개까지',
  pickMore: '다른 쪽에서 더 고르기',
  pickNext: '다음 →',
  pickNextCount: '고른 감정 {글}개로 다음 →',
  pickMax: '감정은 3개까지 고를 수 있어요. 하나를 빼고 다시 골라 주세요.',
  noneOfThese: '이 중엔 없어요',
  noneOfTheseHint: '다른 방법으로 물어볼게요',
  wordingTitle: '뜻은 같은 말이에요. 평소에 쓰는 말을 골라 보세요.',
  wordingGuide: '어느 것을 골라도 틀리지 않아요. 입에 붙는 말이면 돼요.',
  wordingSameHint: '{감정과} 같은 뜻이에요',

  /* 비슷한 감정 구별하기 (data/emotions.js의 compareSets) */
  compareTitle: '비슷한 감정과 견주어 볼게요. 그때 일과 가장 맞는 문장을 골라 보세요.',
  compareLead: '고른 감정: {감정}',

  /* 단어로 찾기 */
  searchButton: '🔍 단어로 찾기',
  searchTitle: '떠오르는 감정 단어를 적어 보세요',
  searchGuide: '예) 부끄러웠다, 미안함, 놀람, 서운해요',
  searchPlaceholder: '감정 단어 적기',
  searchSuggest: '자주 찾는 감정',
  searchResults: '찾은 단어 {글}개',
  searchNone: '맞는 단어를 못 찾았어요. 다른 말로 적거나, 이전 화면에서 쪽을 골라 찾아보세요.',
  searchSame: '{감정과} 같은 뜻',

  /* ④ 강도 */
  intensityTitle: '그 감정은 얼마나 컸나요?',
  intensityGuide: '1점은 아주 조금, 10점은 아주 크게라는 뜻이에요.',

  /* ⑤ 원인 */
  causeTitle: '그 마음은 무엇 때문에 생겼을까요?',
  causeOtherTitle: '어떤 것이었는지 적고 싶다면 적어 주세요.',
  causeOtherGuide: '안 적고 넘어가도 괜찮아요.',
  causeOtherPlaceholder: '예) 갑자기 비가 와서',

  /* 욕구 고르기 */
  needMore: '다른 욕구 찾기',
  needMoreHint: '욕구 쪽을 골라 더 찾아볼게요',
  needSkip: '지금은 넘어가기',
  needGroupTitle: '어느 쪽 욕구에 가까웠나요?',
  needGroupMore: '다른 욕구 쪽 더 보기',
  needGroupMoreHint: '욕구 쪽이 더 있어요',
  needWordsTitle: '이 중 가장 가까운 욕구를 골라 보세요.',
  needWordsMore: '이 쪽 욕구 더 보기',
  needWordsMoreHint: '같은 쪽 욕구가 더 있어요',
  needOtherGroup: '다른 욕구 쪽 보기',
  needOtherGroupHint: '욕구 쪽 고르기로 돌아가요',
  needCompareTitle: '비슷한 욕구와 견주어 볼게요. 그때 바랐던 것과 가장 맞는 문장을 골라 보세요.',
  needCompareLead: '고른 욕구: {욕구}',
  needSearchButton: '🔍 욕구 단어로 찾기',
  needSearchTitle: '바랐던 것을 단어로 적어 보세요',
  needSearchGuide: '예) 인정받고 싶었다, 위로, 쉬고 싶었다, 사과',
  needSearchPlaceholder: '욕구 단어 적기',
  needSearchSuggest: '자주 찾는 욕구',

  /* 결과 카드 */
  resultTitle: '오늘의 마음 카드',
  resultEmotion: '찾은 감정',
  resultEmotionsMany: '찾은 감정 {글}개',
  resultIntensity: '강도',
  resultNeed: '필요했던 것',
  resultSummary: '한 줄 정리',
  resultTip: '작은 실천 제안',
  hiddenBonus: '숨은 감정 발견! 보너스 별 ★ 하나를 받았어요.',
  newWordBonus: '새 감정 단어를 찾았어요. 도감에 채워졌어요.',
  homeButton: '처음 화면으로',
  dexButton: '감정 도감 보기',

  /* 한 줄 정리 문장 */
  summaryUnmet: '{원인} {감정을} {강도} 느꼈고, 마음 깊은 곳에서는 {욕구가} 필요했어요.',
  summaryMet: '{원인} {감정을} {강도} 느꼈어요. {욕구가} 채워졌기 때문이에요.',
  summaryNoNeed: '{원인} {감정을} {강도} 느꼈어요. 그 밑에 있는 욕구는 아직 찾는 중이에요.',

  /* 이름 붙이기 어려운 감정·욕구 */
  unnamedTitle: '지금은 이름 붙이기 어려운 감정이에요',
  unnamedBody: '괜찮아요. 모든 감정에 바로 이름이 붙지는 않아요. 오늘 마음은 "지금은 이름 붙이기 어려운 감정"으로 저장해 둘게요. 시간이 지나면 이름이 떠오를 수도 있어요.',
  unnamedNeedTitle: '욕구도 천천히 찾아도 돼요',
  unnamedNeedBody: '무엇이 필요했는지 바로 떠오르지 않을 때도 있어요. 오늘은 "이름 붙이기 어려운 욕구"으로 남겨 둘게요.',
  continueButton: '계속하기',

  /* 위로 문장 (홈 화면 아래쪽) */
  homeEncourage: '정답은 없어요. 떠오르는 대로 골라도 괜찮아요.',

  /* 게임 방법 안내 (처음 열 때 한 번 나와요. 처음 화면 메뉴에서 다시 볼 수 있어요) */
  introSkip: '건너뛰기',
  introPrev: '← 이전',
  introNext: '다음 →',
  introDone: '알겠어요, 시작할게요',
  introMenu: '게임 방법',
  introMenuHint: '처음 안내 다시 보기'
};

/* 게임 방법 안내 카드 (위에서부터 차례대로 한 장씩 나와요. 장수를 줄이거나 늘려도 돼요) */
window.MAEUM_DATA.intro = [
  {
    icon: '💗',
    title: '오늘 마음의 이름을 찾아요',
    body: '오늘 있었던 일을 1~3줄로 적고, 질문에 하나씩 답하면 그때 감정의 이름을 찾을 수 있어요. 한 판은 5~10분이면 끝나요.'
  },
  {
    icon: '🔍',
    title: '딱 맞는 게 없으면 5번',
    body: '보기 중에 맞는 것이 없으면 5번 "이 중엔 없어요"를 누르세요. 처음 감정 쪽 화면에서는 "잘 모르겠어요"를 누르면 돼요. 여러 마음이 섞였으면 감정을 3개까지 함께 체크할 수 있어요. 몸의 느낌, 하고 싶었던 행동처럼 다른 방법으로 다시 물어봐요. 정답은 없어요.'
  },
  {
    icon: '📖',
    title: '모으고 돌아봐요',
    body: '찾은 감정 단어는 감정 도감에 모여요. 숨은 감정을 찾으면 별 ★을 받아요. 기록은 이 휴대폰 안에만 저장돼요.'
  }
];

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
  "이 중엔 없어요"(5번)를 누를 때마다 차례대로 바뀌는 질문 방법
  1번째: 몸 감각 → 2번째: 하고 싶었던 행동 → 3번째: 반대로(욕구부터) → 4번째: 비슷한 옛 경험
  그다음에도 5번을 누르면 "지금은 이름 붙이기 어려운 감정"으로 저장돼요.
  emotions 안의 이름표는 emotions.js의 id예요.
*/
window.MAEUM_DATA.approaches = [
  {
    key: 'body',
    intro: '좋아요. 이번에는 몸에게 물어볼게요.',
    question: '그 일이 있던 순간, 몸은 어땠나요?',
    wordsQuestion: '그 몸의 느낌에 이름을 붙인다면 무엇에 가까울까요?',
    options: [
      { label: '가슴이 두근거리고 몸이 가벼웠어요', emotions: ['joyH1', 'joyH5', 'joyH4', 'joy01'] },
      { label: '목이 메고 가슴이 텅 빈 것 같았어요', emotions: ['sadH5', 'sadH6', 'sad02', 'sad32'] },
      { label: '얼굴이 뜨겁고 주먹에 힘이 들어갔어요', emotions: ['angH4', 'angH3', 'angH6', 'ang14'] },
      { label: '배가 아프고 몸이 굳었어요', emotions: ['fearH5', 'fearH2', 'fearH6', 'fear09'] }
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
  ⑥ 욕구 찾기
  - 첫 욕구 화면: 고른 감정에 맞는 욕구 4개 (data/needs.js의 needsByEmotion, 없으면 아래 needsByCause)
  - 5번 "다른 욕구 찾기" → 욕구 쪽 고르기 (data/needs.js의 needGroups, 한 장에 4쪽)
    → 쪽 안의 욕구 4개씩 → 마지막 장의 5번은 "이름 붙이기 어려운 욕구"
  question     = 기쁨 쪽이 아닐 때 질문
  questionJoy  = 기쁨 쪽일 때 질문
*/
window.MAEUM_DATA.needRounds = [
  {
    question: '그 순간 무엇이 있었다면 괜찮았을까요?',
    questionJoy: '그 기쁨은 어떤 욕구가 채워져서 생겼을까요?'
  }
];

/* 첫 번째 욕구 질문의 보기: 감정 쪽 × 원인 (각 4개) */
window.MAEUM_DATA.needsByCause = {
  joy: {
    word: ['con2', 'grow3', 'con4', 'mean5'],
    attitude: ['con3', 'res1', 'con4', 'mean2'],
    result: ['grow1', 'grow3', 'mean5', 'grow2'],
    expect: ['grow6', 'mean3', 'free1', 'saf2'],
    other: ['rest1', 'mean6', 'rest6', 'mean2']
  },
  sad: {
    word: ['con2', 'res1', 'con6', 'clar4'],
    attitude: ['con3', 'con5', 'con4', 'res1'],
    result: ['grow3', 'grow4', 'con6', 'mean3'],
    expect: ['saf2', 'con3', 'res5', 'grow4'],
    other: ['rest1', 'con6', 'rest3', 'clar5']
  },
  anger: {
    word: ['res1', 'res4', 'clar4', 'con1'],
    attitude: ['res1', 'res6', 'res2', 'res3'],
    result: ['res2', 'clar1', 'grow3', 'grow4'],
    expect: ['res5', 'res3', 'clar3', 'free1'],
    other: ['rest3', 'free4', 'res6', 'rest4']
  },
  fear: {
    word: ['saf1', 'con6', 'clar3', 'saf3'],
    attitude: ['saf4', 'saf1', 'res6', 'saf6'],
    result: ['grow4', 'saf2', 'grow5', 'clar2'],
    expect: ['saf5', 'free2', 'grow4', 'saf2'],
    other: ['saf6', 'saf3', 'rest5', 'clar5']
  },
  shame: {
    word: ['con7', 'res1', 'grow4', 'con2'],
    attitude: ['con7', 'res1', 'con4', 'grow4'],
    result: ['grow4', 'grow3', 'con7', 'mean7'],
    expect: ['grow4', 'free2', 'con7', 'saf2'],
    other: ['con7', 'grow4', 'rest3', 'clar6']
  },
  surprise: {
    word: ['clar1', 'saf2', 'clar3', 'saf5'],
    attitude: ['clar1', 'clar4', 'saf2', 'res7'],
    result: ['saf2', 'clar1', 'grow4', 'saf5'],
    expect: ['saf2', 'clar2', 'saf5', 'clar1'],
    other: ['saf2', 'clar5', 'saf6', 'clar1']
  },
  disgust: {
    word: ['res1', 'res6', 'res7', 'free5'],
    attitude: ['res6', 'res1', 'res7', 'free5'],
    result: ['res2', 'res7', 'clar1', 'saf7'],
    expect: ['res7', 'res5', 'res2', 'clar3'],
    other: ['saf7', 'res6', 'rest5', 'saf6']
  },
  mixed: {
    word: ['con2', 'clar5', 'con1', 'clar6'],
    attitude: ['clar4', 'con2', 'res1', 'clar5'],
    result: ['clar5', 'mean3', 'con6', 'grow4'],
    expect: ['clar5', 'saf2', 'clar6', 'con2'],
    other: ['clar5', 'rest3', 'clar6', 'con1']
  },
  unknown: {
    word: ['con1', 'clar4', 'res1', 'con2'],
    attitude: ['con3', 'res1', 'saf1', 'clar1'],
    result: ['grow4', 'grow3', 'clar2', 'mean3'],
    expect: ['clar6', 'saf2', 'free2', 'con2'],
    other: ['clar5', 'rest3', 'rest5', 'con1']
  }
};
