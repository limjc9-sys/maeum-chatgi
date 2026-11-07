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
  thoughtWayHint: '"무시당했다", "배신당했다"처럼 상대가 한 일이 먼저 떠오를 때',
  thoughtTitle: '상대가 나에게 한 일 가운데 떠오르는 말을 누르세요',
  thoughtGuide: '"무시당했다", "버림받았다" 같은 말은 감정이 아니라 "상대가 나에게 이렇게 했다"는 생각이에요. 그 생각 밑에 있는 감정을 함께 찾아요. 여섯 묶음 가운데 가까운 것을 보고, 말을 누르세요.',
  thoughtSearchHint: '상대가 나에게 한 일에 대한 생각이에요. 누르면 그 밑의 감정을 찾아요.',
  thoughtFeelings: '이 생각 밑에는 이런 감정이 있었을 수 있어요. 맞는 것을 모두 누르세요.',
  thoughtNeeds: '이런 욕구가 중요했을 수 있어요. 욕구 단계에서 먼저 보여 드려요.',
  notSure: '잘 모르겠어요',
  notSureHint: '몸의 느낌, 하고 싶었던 행동으로 찾아요',
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
  hiddenBonus: '숨은 감정 발견! 보너스 별 ★ 하나를 받았어요.',
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
  dexGuide: '기분 4칸 가운데 하나를 누르면 그 칸의 감정이 범주별로 나와요. 낱말을 누르면 뜻, 이럴 때 느껴요, 같은 뜻 다른 말, 내 기록이 펼쳐져요. ✓는 내가 골라 본 감정이에요.',

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
    { icon: '②', title: '감정 고르기', body: '세 방법은 위에서 아래로 서로 돕는 차례예요. ① 기분 4칸으로 찾기: 먼저 그때 기분과 가장 가까운 칸(노랑·초록·빨강·파랑)을 눌러 펼쳐요. ② 핵심 감정으로 찾기: 많은 사람이 자주 느끼는 6개(수치심·죄책감·분노·두려움·상실감·슬픔)가 바로 떠오르면 눌러요. ③ 다른 방법으로 찾기: ①·②에서 찾기 어려우면 낱말을 적어 찾거나, "무시당했다"처럼 상대가 나에게 한 일로 찾거나, "잘 모르겠어요"(몸 느낌·행동으로 찾기)를 써요. 어느 방법으로 고른 감정이든 위쪽에 함께 모이고, 몇 개를 골라도 괜찮아요. 누르면 뜻이 나오고, 다시 누르면 풀려요.' },
    { icon: '③', title: '강도', body: '고른 감정마다 1~10 가운데 크기를 골라요. 한 화면에 모두 나와요. 잘못 고른 것 같은 감정은 "빼기", 잘 모르겠는 감정은 "보류"를 누르세요. 보류한 감정은 강도 없이 마음 카드에 따로 적히고, 둘 다 "되살리기"로 되돌릴 수 있어요.' },
    { icon: '④', title: '원인', body: '그 마음이 무엇 때문에 생겼는지 가장 가까운 것 하나를 누르고 "다음"을 눌러요.' },
    { icon: '⑤', title: '욕구 고르기', body: '감정과 같은 차례예요. 1. 고른 감정과 함께 흔히 보이는 욕구가 먼저 나와요(경향일 뿐 정답은 아니에요). 2. 욕구 14범주를 펼쳐 더 찾아요. 3. 낱말로 찾을 수도 있어요. 맞는 것 같은 욕구는 몇 개든 모두 누르세요. 고르지 않고 "카드 만들기"를 눌러도 돼요.' },
    { icon: '⑥', title: '마음 카드', body: '감정·강도·욕구·한 줄 정리가 카드로 남아요. 고른 욕구가 맞았는지 답하면 다음에 욕구 후보 차례가 바뀌어요.' },
    { icon: '←', title: '이전·다음 단추', body: '처음 화면을 뺀 모든 화면 맨 아래에 같은 모양의 단추 두 개가 있어요. 왼쪽 "← 이전"(흰 단추)은 바로 앞 화면으로, 오른쪽 "다음 →"(파란 단추)은 다음 단계로 가요. 마음 카드에서도 이전으로 돌아갈 수 있어요. 돌아가도 적은 글, 고른 감정·강도·보류·원인·욕구는 지워지지 않고 그대로 남아요. 고친 뒤 다시 앞으로 가면 이어서 할 수 있고, 마음 카드에서 돌아가 고친 뒤 다시 만들면 새 카드가 하나 더 생기지 않고 같은 카드가 고쳐져요. 화면 위쪽 "그만하기"를 누르면 처음 화면으로 가요.' },
    { icon: '📖', title: '도감·보고서·기록', body: '감정 도감: 기분 4칸별로 모든 감정 낱말 목록이 있고, 누르면 쉬운 설명이 펼쳐져요. 주간 보고서: 자주 나온 감정과 욕구를 볼 수 있어요. 지난 기록: 기록마다 수정(처음 단계부터 고쳐 같은 기록에 저장), 피드백(다시 보며 나에게 남기는 글), 삭제 단추가 있어요. 기록은 이 휴대폰 안에만 저장되고, 기록 옮기기로 파일에 담아 옮길 수 있어요.' },
    { icon: '가', title: '글자가 작으면', body: '처음 화면 왼쪽 위 "글자 크게"를 누르면 모든 화면의 글자와 버튼이 커져요. 다시 누르면 보통 크기로 돌아와요.' }
  ],
  install: [
    '안드로이드(크롬): 오른쪽 위 ⋮ 메뉴 → "홈 화면에 추가" 또는 "앱 설치"를 누르세요.',
    '아이폰(사파리): 아래쪽 공유 버튼(네모에 화살표) → "홈 화면에 추가"를 누르세요.',
    '한 번 연 뒤에는 인터넷이 없어도 열려요.'
  ],
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
