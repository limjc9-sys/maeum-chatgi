/*
  ───────────────────────────────────────────────
  감정 낱말 파일 (emotions.js)
  ───────────────────────────────────────────────
  - 따옴표 ' ' 안의 글자만 고치세요.
  - id: '...' 부분은 절대 고치거나 지우지 마세요. (기록과 도감이 이 이름표로 연결돼요)
  - 짜임: 기분 4칸(quadrants) → 칸 안의 범주(categories) → 감정 낱말(emotions)
      기분 4칸은 무드 미터(Brackett, Yale RULER)와 Russell(1980)의 두 축을 따랐어요.
        노랑 = 기분 좋음 · 힘이 넘침   초록 = 기분 좋음 · 차분함
        빨강 = 기분 나쁨 · 힘이 셈     파랑 = 기분 나쁨 · 힘이 빠짐
      범주는 조사자료(감정·욕구 낱말 풀 2장)의 범주를 따랐어요. 칸·범주 배치는 작성자 추정이에요.
  - word  = 감정 이름
  - desc  = 낱말을 눌렀을 때 나오는 설명
  - same  = 같은 뜻 다른 말. 화면에서는 원래 낱말 바로 뒤에 따로 나와 각각 고를 수 있어요.
            설명(desc)은 원래 낱말의 것을 함께 써요. 새로 더할 때 id는 원래 id 뒤에 a, b, c …를 붙여요.
  - hidden: true = 숨은 감정(★). 화면에는 다른 낱말처럼 나오고, 처음 고르면 ★ 보너스를 받아요.
  - ask   = 비슷한 감정 견주기 문장 (지금 화면에서는 쓰지 않고 연습 모드용으로 남겨 둠)
  - 감정을 고르는 개수에는 제한이 없어요. 한 칸·한 범주에서만 고르게 만들지 마세요.
    (docs/design-rules.md 1번)
  - 새 낱말 id: 노랑 yel, 초록 grn, 빨강 red, 파랑 blu 뒤에 번호
  - face  = 기분 4칸 단추에 나오는 얼굴 그림. 글을 읽기 어려운 어린이·어르신도 칸을 알아보게 해요.
*/
window.MAEUM_DATA = window.MAEUM_DATA || {};

window.MAEUM_DATA.quadrants = [
  {
    id: 'yellow', name: '노랑', face: '😄', label: '기분이 좋고 힘이 넘쳐요', hint: '기쁨 · 설렘 · 뿌듯함 · 흥미', color: '#E0A100', met: true,
    categories: [
      {
        id: 'y-joy', label: '기쁨·즐거움',
        emotions: [
          { id: 'joy28', word: '기쁨', desc: '바라던 일이 이루어져 마음이 환해요', ask: '바라던 좋은 일이 생겼어요', same: [{ id: 'joy28a', word: '기분 좋음' }, { id: 'joy28b', word: '좋음' }] },
          { id: 'joy29', word: '행복함', desc: '지금 이대로 참 좋다고 느껴요', ask: '지금 이대로 모든 것이 좋았어요', same: [{ id: 'joy29a', word: '더없이 행복함' }, { id: 'joy29b', word: '충만함' }] },
          { id: 'joy33', word: '즐거움', desc: '하는 동안 내내 마음이 즐거워요', same: [{ id: 'joy33a', word: '유쾌함' }, { id: 'joy33b', word: '쾌활함' }, { id: 'joy33c', word: '경쾌함' }] },
          { id: 'joy34', word: '웃음이 터짐', desc: '참으려 해도 깔깔 웃음이 터져 나와요', same: [{ id: 'joy34a', word: '함박웃음' }, { id: 'joy34b', word: '싱글벙글함' }, { id: 'joy34c', word: '희희낙락함' }] },
          { id: 'joy35', word: '흥겨움', desc: '노래나 놀이에 어깨가 들썩여요' },
          { id: 'joy36', word: '통쾌함', desc: '이겨 내거나 바로잡혀 속이 시원해요', same: [{ id: 'joy36a', word: '속 시원함' }] },
          { id: 'joy01', word: '신남', desc: '몸이 들썩일 만큼 즐거워요', same: [{ id: 'joy01a', word: '신명남' }, { id: 'joy01b', word: '신바람 남' }, { id: 'joy01c', word: '아주 신남' }] },
          { id: 'joy03', word: '들뜸', desc: '마음이 붕 떠서 가만있기 어려워요', same: [{ id: 'joy03a', word: '흥분됨' }, { id: 'joy03b', word: '상기됨' }, { id: 'joy03c', word: '충동적인 마음' }] },
          { id: 'joy04', word: '짜릿함', desc: '순간 온몸이 찌릿할 만큼 좋아요', same: [{ id: 'joy04a', word: '전율' }, { id: 'joy04b', word: '스릴' }] },
          { id: 'joy17', word: '재미있음', desc: '웃음이 절로 나올 만큼 즐거워요' },
          { id: 'joy16', word: '감동', desc: '마음이 크게 움직여 눈시울이 붉어져요', same: [{ id: 'joy16a', word: '감격' }, { id: 'joy16b', word: '뭉클함' }, { id: 'joy16c', word: '감명 깊음' }] },
          { id: 'joy15', word: '반가움', desc: '보고 싶던 것을 만나 기뻐요', same: [{ id: 'joy15a', word: '달가움' }] },
          { id: 'joyH1', word: '벅참', desc: '기쁨이 가슴에 가득 차 넘칠 것 같아요', hidden: true },
          { id: 'joy40', word: '열광', desc: '좋아하는 것에 푹 빠져 크게 환호해요' },
          { id: 'yel01', word: '흔쾌함', desc: '기꺼이 받아들일 만큼 마음이 시원하고 좋아요' },
          { id: 'yel02', word: '환희', desc: '몹시 기뻐서 마음이 크게 들떠요' },
          { id: 'yel03', word: '감격스러움', desc: '마음 깊이 느껴 크게 감동했어요' },
          { id: 'yel04', word: '날아갈 듯함', desc: '너무 기뻐서 몸과 마음이 가벼워요' },
          { id: 'yel05', word: '빛나는 기분', desc: '얼굴과 마음이 환하게 밝아져요' }
        ]
      },
      {
        id: 'y-hope', label: '기대·희망',
        emotions: [
          { id: 'joy02', word: '설렘', desc: '좋은 일이 올 것 같아 두근거려요', same: [{ id: 'joy02a', word: '콩닥거림' }] },
          { id: 'joyH5', word: '기대됨', desc: '다음이 어떻게 될지 기다려져요', hidden: true, same: [{ id: 'joyH5a', word: '학수고대' }] },
          { id: 'joy37', word: '희망참', desc: '앞으로 좋아질 거라는 믿음이 생겨요', same: [{ id: 'joy37a', word: '낙관적인 마음' }, { id: 'joy37b', word: '긍정적인 마음' }] },
          { id: 'yel06', word: '기대에 부풂', desc: '좋은 일이 생길 것 같아 마음이 부풀어요' },
          { id: 'yel07', word: '고무됨', desc: '힘을 얻어 해 보고 싶은 마음이 커져요' }
        ]
      },
      {
        id: 'y-energy', label: '활력·의욕',
        emotions: [
          { id: 'joy39', word: '활발함', desc: '몸과 마음에 힘이 넘쳐 움직이고 싶어요', same: [{ id: 'joy39a', word: '기운이 넘침' }] },
          { id: 'joy19', word: '의욕', desc: '무언가 해 보고 싶은 힘이 솟아요', same: [{ id: 'joy19a', word: '동기 부여됨' }, { id: 'joy19b', word: '고취됨' }] },
          { id: 'yel08', word: '활기참', desc: '몸과 마음에 생기가 넘쳐요' },
          { id: 'yel09', word: '생기가 돎', desc: '지쳐 있던 몸과 마음에 다시 힘이 돌아요' },
          { id: 'yel10', word: '살아 있음', desc: '내가 살아 있다는 것이 또렷하게 느껴져요' },
          { id: 'yel11', word: '기운이 남', desc: '몸에 힘이 생겨 움직이고 싶어요' },
          { id: 'yel12', word: '의욕 넘침', desc: '하고 싶은 마음이 가득해요' },
          { id: 'yel13', word: '기력이 넘침', desc: '몸에 힘이 가득해 지치지 않아요' },
          { id: 'yel14', word: '원기 왕성함', desc: '기운이 아주 세고 튼튼해요' },
          { id: 'yel15', word: '힘이 솟음', desc: '몸 안에서 힘이 불끈 솟아요' },
          { id: 'yel16', word: '열정적임', desc: '어떤 일에 마음이 뜨겁게 쏠려요' },
          { id: 'yel17', word: '열렬함', desc: '무척 뜨겁고 간절하게 마음이 쏠려요' },
          { id: 'yel18', word: '의기충천함', desc: '해낼 수 있다는 자신감과 기세가 아주 높아요' }
        ]
      },
      {
        id: 'y-pride', label: '자신감·뿌듯함',
        emotions: [
          { id: 'joy10', word: '자랑스러움', desc: '누군가에게 보여 주고 싶을 만큼 좋아요', ask: '내가 해낸 일을 남에게 보여 주고 싶었어요', same: [{ id: 'joy10a', word: '으쓱함' }] },
          { id: 'joy11', word: '당당함', desc: '고개를 들고 내 모습 그대로 있어도 돼요', same: [{ id: 'joy11a', word: '의기양양함' }, { id: 'joy11b', word: '기고만장함' }] },
          { id: 'joy09', word: '뿌듯함', desc: '내가 해낸 일이 마음에 꽉 차요', same: [{ id: 'joy09a', word: '대견함' }] },
          { id: 'joy12', word: '자신 있음', desc: '이번엔 잘할 수 있을 것 같아요' },
          { id: 'joy18', word: '보람', desc: '내가 한 일이 누군가에게 도움이 돼 기뻐요' },
          { id: 'yel19', word: '용기 남', desc: '겁을 이기고 해 볼 마음이 생겨요' },
          { id: 'yel20', word: '힘이 생김', desc: '할 수 있다는 힘이 내 안에 생겨요' }
        ]
      },
      {
        id: 'y-interest', label: '흥미·몰입',
        emotions: [
          { id: 'joy20', word: '흥미로움', desc: '더 알아보고 싶을 만큼 마음이 끌려요' },
          { id: 'joy21', word: '궁금함', desc: '어떻게 된 건지 답을 알고 싶어요', same: [{ id: 'joy21a', word: '감질남' }] },
          { id: 'joy22', word: '몰입됨', desc: '시간 가는 줄 모르고 푹 빠져 있어요', same: [{ id: 'joy22a', word: '집중됨' }] },
          { id: 'joy23', word: '신선함', desc: '처음 겪는 일이라 새롭고 산뜻해요', same: [{ id: 'joy23a', word: '상큼함' }] },
          { id: 'joy45', word: '끌림', desc: '자꾸 눈길과 마음이 그쪽으로 가요', same: [{ id: 'joy45a', word: '매력적임' }, { id: 'joy45b', word: '섹시함' }] },
          { id: 'yel21', word: '호기심', desc: '무엇인지 알고 싶어 마음이 끌려요' },
          { id: 'yel22', word: '참여하고 싶음', desc: '나도 함께 끼어 해 보고 싶어요' },
          { id: 'yel23', word: '정신이 번쩍 듦', desc: '정신이 확 맑아지고 또렷해져요' },
          { id: 'yel24', word: '자극받음', desc: '무언가에 마음이 움직여 해 보고 싶어져요' },
          { id: 'yel25', word: '매료됨', desc: '마음을 완전히 빼앗길 만큼 끌려요' },
          { id: 'yel26', word: '매혹됨', desc: '아름답거나 신기해 마음이 홀린 듯 끌려요' },
          { id: 'yel27', word: '빠져듦', desc: '다른 것을 잊을 만큼 깊이 빠져 있어요' }
        ]
      },
      {
        id: 'y-awe', label: '감탄·경이',
        emotions: [
          { id: 'joy24', word: '신기함', desc: '어떻게 이럴 수 있지 싶어 눈이 동그래져요', ask: '놀라웠지만 좋은 쪽으로 놀라웠어요', same: [{ id: 'joy24a', word: '신비로움' }, { id: 'joy24b', word: '기상천외' }] },
          { id: 'joy25', word: '감탄', desc: '정말 대단해서 "와" 소리가 절로 나요', same: [{ id: 'joy25a', word: '감복' }, { id: 'joy25b', word: '탄복' }] },
          { id: 'joy26', word: '황홀함', desc: '너무 아름다워 넋을 놓고 바라봐요', same: [{ id: 'joy26a', word: '경이로움' }, { id: 'joy26b', word: '감미로움' }] },
          { id: 'joy27', word: '존경스러움', desc: '그 사람이 대단해 닮고 싶어요' },
          { id: 'joy38', word: '영감을 받음', desc: '좋은 생각이 번쩍 떠올라 해 보고 싶어요', same: [{ id: 'joy38a', word: '감흥' }] },
          { id: 'joy48', word: '근사함', desc: '멋지고 훌륭해 보여 기분이 좋아요', same: [{ id: 'joy48a', word: '우아함' }, { id: 'joy48b', word: '훌륭함' }] },
          { id: 'joy46', word: '낭만적인 기분', desc: '영화 속 장면처럼 마음이 몽글몽글해요' },
          { id: 'joy47', word: '감개무량함', desc: '지난 일을 돌아보니 마음이 깊이 울려요', same: [{ id: 'joy47a', word: '감회' }] },
          { id: 'yel28', word: '놀라움', desc: '생각보다 대단해 놀랍고 좋아요' },
          { id: 'yel29', word: '눈부심', desc: '너무 멋져 눈을 떼기 어려워요' }
        ]
      }
    ]
  },
  {
    id: 'green', name: '초록', face: '😌', label: '기분이 좋고 차분해요', hint: '편안함 · 안심 · 만족 · 따뜻함', color: '#2E9E6A', met: true,
    categories: [
      {
        id: 'g-calm', label: '평온·여유',
        emotions: [
          { id: 'joy41', word: '평온함', desc: '마음이 잔잔한 물처럼 고요해요', same: [{ id: 'joy41a', word: '평화로움' }, { id: 'joy41b', word: '고요함' }, { id: 'joy41c', word: '차분함' }] },
          { id: 'joy05', word: '편안함', desc: '몸과 마음에 불편한 곳이 없어요', same: [{ id: 'joy05a', word: '편함' }, { id: 'joy05b', word: '안락함' }, { id: 'joy05c', word: '안온함' }] },
          { id: 'joy08', word: '느긋함', desc: '서두를 것 없이 여유로워요', same: [{ id: 'joy08a', word: '여유로움' }, { id: 'joy08b', word: '한가로움' }] },
          { id: 'joy42', word: '걱정 없음', desc: '신경 쓰이는 일이 하나도 없어요', same: [{ id: 'joy42a', word: '속 편함' }, { id: 'joy42b', word: '근심 걱정 없음' }, { id: 'joy42c', word: '태평함' }] },
          { id: 'joy43', word: '생각에 잠김', desc: '조용히 이것저것 곰곰이 떠올려요' },
          { id: 'joy44', word: '나른함', desc: '몸이 노곤하고 졸릴 만큼 느슨해요' },
          { id: 'grn01', word: '담담함', desc: '마음이 크게 흔들리지 않고 차분해요' },
          { id: 'grn02', word: '잔잔함', desc: '마음에 큰 출렁임 없이 고요해요' },
          { id: 'grn03', word: '잠잠해짐', desc: '출렁이던 마음이 가라앉았어요' },
          { id: 'grn04', word: '진정됨', desc: '들떠 있던 마음이 차분해졌어요' },
          { id: 'grn05', word: '누그러짐', desc: '굳어 있던 마음이 부드럽게 풀려요' },
          { id: 'grn06', word: '긴장이 풀림', desc: '굳어 있던 몸과 마음이 느슨해져요' },
          { id: 'grn07', word: '아늑함', desc: '포근하게 감싸인 듯 편안해요' }
        ]
      },
      {
        id: 'g-relief', label: '안도·개운함',
        emotions: [
          { id: 'joy06', word: '홀가분함', desc: '무거운 짐을 내려놓은 것 같아요', same: [{ id: 'joy06a', word: '가뿐함' }, { id: 'joy06b', word: '가벼움' }] },
          { id: 'joy07', word: '안심됨', desc: '걱정하던 일이 괜찮아져 숨이 놓여요', ask: '걱정하던 일이 괜찮아졌어요', same: [{ id: 'joy07a', word: '천만다행' }, { id: 'joy07b', word: '안전한 느낌' }, { id: 'joy07c', word: '안정감' }] },
          { id: 'joyH3', word: '후련함', desc: '막혀 있던 것이 뻥 뚫린 것 같아요', hidden: true },
          { id: 'joyH4', word: '상쾌함', desc: '맑은 공기를 마신 것처럼 개운해요', hidden: true, same: [{ id: 'joyH4a', word: '쾌적함' }] },
          { id: 'grn08', word: '산뜻함', desc: '기분이 깨끗하고 가벼워요' },
          { id: 'grn09', word: '개운함', desc: '답답한 것이 사라져 몸과 마음이 시원해요' },
          { id: 'grn10', word: '푹 쉰 느낌', desc: '충분히 쉬어 몸과 마음이 회복됐어요' },
          { id: 'grn11', word: '기운을 되찾음', desc: '빠졌던 힘이 다시 돌아왔어요' },
          { id: 'grn12', word: '새로워진 느낌', desc: '다시 시작할 수 있을 만큼 마음이 새로워요' }
        ]
      },
      {
        id: 'g-secure', label: '만족·안정',
        emotions: [
          { id: 'joy30', word: '만족스러움', desc: '이만하면 충분해서 더 바랄 게 없어요', same: [{ id: 'joy30a', word: '흡족함' }, { id: 'joy30b', word: '자족함' }] },
          { id: 'joyH2', word: '흐뭇함', desc: '바라보기만 해도 미소가 지어져요', hidden: true, same: [{ id: 'joyH2a', word: '보기 좋음' }] },
          { id: 'joyH6', word: '든든함', desc: '믿는 구석이 있어 마음이 꽉 차요', hidden: true },
          { id: 'grn13', word: '안전함', desc: '다칠 걱정 없이 마음이 놓여요' },
          { id: 'grn14', word: '안정됨', desc: '마음이 흔들리지 않고 자리를 잡았어요' },
          { id: 'grn15', word: '중심이 잡힘', desc: '무엇이 중요한지 알고 마음이 단단해요' },
          { id: 'grn16', word: '머리가 맑음', desc: '생각이 또렷하고 정리가 돼요' },
          { id: 'grn17', word: '믿음이 감', desc: '그 사람이나 일을 믿을 수 있어요' }
        ]
      },
      {
        id: 'g-love', label: '애정·감사',
        emotions: [
          { id: 'joy13', word: '고마움', desc: '받은 마음에 보답하고 싶어요', same: [{ id: 'joy13a', word: '감사함' }, { id: 'joy13b', word: '축복받은 느낌' }] },
          { id: 'joy14', word: '따뜻함', desc: '마음 한쪽이 포근하게 데워져요', same: [{ id: 'joy14a', word: '따스함' }] },
          { id: 'joy31', word: '사랑스러움', desc: '너무 소중하고 예뻐 꼭 안아 주고 싶어요', same: [{ id: 'joy31a', word: '예쁨' }, { id: 'joy31b', word: '어여쁨' }] },
          { id: 'joy32', word: '정다움', desc: '서로 마음이 가까워 함께 있는 게 좋아요', same: [{ id: 'joy32a', word: '친근함' }, { id: 'joy32b', word: '친숙함' }, { id: 'joy32c', word: '다정함' }] },
          { id: 'grn18', word: '사랑함', desc: '누군가를 아끼고 소중히 여기는 마음이 커요' },
          { id: 'grn19', word: '포근함', desc: '따뜻하게 감싸인 듯 편안해요' },
          { id: 'grn20', word: '푸근함', desc: '마음이 넉넉하고 따뜻해요' },
          { id: 'grn21', word: '훈훈함', desc: '사람 사이의 정이 느껴져 마음이 따뜻해요' },
          { id: 'grn22', word: '정겨움', desc: '정이 넘쳐 다정하게 느껴져요' },
          { id: 'grn23', word: '정을 느낌', desc: '그 사람에게 정이 들어 마음이 가요' },
          { id: 'grn24', word: '친밀함', desc: '아주 가깝고 친하게 느껴져요' },
          { id: 'grn25', word: '마음이 열림', desc: '다른 사람을 받아들일 마음이 생겨요' },
          { id: 'grn26', word: '연민', desc: '다른 사람의 아픔이 안타까워 돕고 싶어요' },
          { id: 'grn27', word: '공감됨', desc: '다른 사람의 마음이 내 마음처럼 느껴져요' }
        ]
      }
    ]
  },
  {
    id: 'red', name: '빨강', face: '😠', label: '기분이 나쁘고 힘이 세요', hint: '화 · 불안 · 두려움 · 부끄러움', color: '#E04848', met: false,
    categories: [
      {
        id: 'r-anger', label: '화·분노',
        emotions: [
          { id: 'ang19', word: '분노', desc: '참기 어려울 만큼 크게 화가 나요', ask: '옳지 않은 일에 화가 크게 치밀었어요', same: [{ id: 'ang19a', word: '격분' }, { id: 'ang19b', word: '격노' }, { id: 'ang19c', word: '진노' }] },
          { id: 'ang29', word: '화남', desc: '마음에 안 들어 화가 나요', same: [{ id: 'ang29a', word: '노여움' }, { id: 'ang29b', word: '몹시 화남' }, { id: 'ang29c', word: '쌕쌕거림' }] },
          { id: 'ang30', word: '격해짐', desc: '감정이 점점 거세져 목소리가 커져요', same: [{ id: 'ang30a', word: '격앙됨' }, { id: 'ang30b', word: '격양됨' }] },
          { id: 'ang31', word: '치 떨림', desc: '너무 분하고 화가 나 몸이 부들부들 떨려요' },
          { id: 'ang13', word: '부글부글함', desc: '화가 속에서 계속 끓어올라요', same: [{ id: 'ang13a', word: '울화통' }, { id: 'ang13b', word: '속 썩음' }] },
          { id: 'ang14', word: '울컥함', desc: '갑자기 화가 확 치밀어요', same: [{ id: 'ang14a', word: '화가 치밀어 오름' }] },
          { id: 'ang06', word: '분함', desc: '진 것 같아 이가 꽉 물려요', same: [{ id: 'ang06a', word: '분개' }, { id: 'ang06b', word: '울분' }] },
          { id: 'ang07', word: '원망', desc: '그 사람 때문이라는 생각이 들어요' },
          { id: 'angH4', word: '괘씸함', desc: '나를 그렇게 대한 것이 용서가 안 돼요', hidden: true },
          { id: 'red01', word: '끓어오름', desc: '화가 속에서 부글부글 올라와요' },
          { id: 'red02', word: '울화가 치밂', desc: '쌓인 화가 한꺼번에 터질 것 같아요' },
          { id: 'red03', word: '핏대 섬', desc: '너무 화가 나서 목에 힘줄이 설 정도예요' },
          { id: 'red04', word: '노발대발함', desc: '몹시 화가 나서 크게 소리치고 싶어요' },
          { id: 'red05', word: '적대감', desc: '상대를 적처럼 여기는 마음이 들어요' }
        ]
      },
      {
        id: 'r-annoy', label: '짜증·답답함',
        emotions: [
          { id: 'ang01', word: '짜증', desc: '작은 일에도 신경이 곤두서요', ask: '자잘한 일이 자꾸 신경을 건드렸어요' },
          { id: 'ang02', word: '답답함', desc: '말이 통하지 않아 가슴이 막혀요', same: [{ id: 'ang02a', word: '갑갑함' }] },
          { id: 'ang04', word: '성가심', desc: '자꾸 방해받아 거슬려요', same: [{ id: 'ang04a', word: '거슬림' }, { id: 'ang04b', word: '골칫거리' }] },
          { id: 'ang03', word: '귀찮음', desc: '하기 싫은 일이 자꾸 생겨요' },
          { id: 'ang15', word: '약오름', desc: '놀림받은 것 같아 분해요', same: [{ id: 'ang15a', word: '아니꼬움' }] },
          { id: 'ang16', word: '불쾌함', desc: '기분이 상해서 찝찝해요', same: [{ id: 'ang16a', word: '불유쾌함' }, { id: 'ang16b', word: '기분 나쁨' }] },
          { id: 'ang17', word: '어이없음', desc: '말도 안 되는 일이라 황당하고 화가 나요', same: [{ id: 'ang17a', word: '가당찮음' }, { id: 'ang17b', word: '가관' }] },
          { id: 'ang37', word: '불만', desc: '마음에 차지 않아 투덜대고 싶어요', same: [{ id: 'ang37a', word: '불만스러움' }, { id: 'ang37b', word: '불만족' }, { id: 'ang37c', word: '써부렁거림' }] },
          { id: 'ang38', word: '삐짐', desc: '서운하고 언짢아서 토라졌어요', same: [{ id: 'ang38a', word: '뾰루퉁함' }, { id: 'ang38b', word: '불퉁터짐' }, { id: 'ang38c', word: '뚱함' }] },
          { id: 'ang39', word: '신경질', desc: '참지 못하고 날카로운 말이 튀어나와요', same: [{ id: 'ang39a', word: '신경질적인 마음' }] },
          { id: 'ang28', word: '심술남', desc: '괜히 남을 골탕 먹이고 싶어요', same: [{ id: 'ang28a', word: '심술궂음' }, { id: 'ang28b', word: '심통' }] },
          { id: 'ang27', word: '얄미움', desc: '제 잇속만 챙기는 모습이 밉게 보여요', same: [{ id: 'ang27a', word: '치사함' }, { id: 'ang27b', word: '야비함' }, { id: 'ang27c', word: '가증스러움' }] },
          { id: 'angH2', word: '못마땅함', desc: '하는 모습이 마음에 들지 않아요', hidden: true, same: [{ id: 'angH2a', word: '마땅찮음' }, { id: 'angH2b', word: '달갑잖음' }] },
          { id: 'angH3', word: '언짢음', desc: '기분이 살짝 상해 있어요', hidden: true },
          { id: 'ang24', word: '반항심', desc: '시키는 대로 하기 싫어 맞서고 싶어요', same: [{ id: 'ang24a', word: '비딱함' }] },
          { id: 'red06', word: '조급함', desc: '빨리 되지 않아 마음이 급해요' }
        ]
      },
      {
        id: 'r-unfair', label: '억울함·무시당한 느낌',
        emotions: [
          { id: 'ang05', word: '억울함', desc: '내 잘못이 아닌데 탓을 들었어요', ask: '내 잘못이 아닌데 탓을 듣거나 손해를 봤어요', same: [{ id: 'ang05a', word: '원통함' }, { id: 'ang05b', word: '반칙당한 느낌' }] },
          { id: 'ang08', word: '배신감', desc: '믿었던 사람이 등을 돌렸어요' },
          { id: 'ang09', word: '무시당한 느낌', desc: '내가 없는 사람처럼 취급받았어요', ask: '그 사람이 나를 하찮게 대했어요', same: [{ id: 'ang09a', word: '멸시당함' }] },
          { id: 'ang10', word: '모욕감', desc: '나를 깎아내리는 말에 상처받았어요', same: [{ id: 'ang10a', word: '모멸감' }, { id: 'ang10b', word: '모욕적인 느낌' }, { id: 'ang10c', word: '굴욕감' }] },
          { id: 'ang11', word: '자존심 상함', desc: '내 체면이 구겨진 것 같아요', same: [{ id: 'ang11a', word: '치욕' }, { id: 'ang11b', word: '웃음거리가 된 느낌' }] },
          { id: 'ang12', word: '얕보인 느낌', desc: '나를 쉽게 여긴다는 생각이 들어요' },
          { id: 'ang18', word: '푸대접받은 느낌', desc: '나만 소홀히 대해서 화가 나요', same: [{ id: 'ang18a', word: '야박함' }] },
          { id: 'ang25', word: '간섭받는 느낌', desc: '내 일에 자꾸 끼어들어 싫어요' },
          { id: 'ang26', word: '떠밀린 느낌', desc: '내 뜻과 상관없이 억지로 끌려가요', same: [{ id: 'ang26a', word: '강압적인 느낌' }] }
        ]
      },
      {
        id: 'r-worry', label: '걱정·불안',
        emotions: [
          { id: 'fear01', word: '걱정', desc: '나쁜 일이 생길까 봐 마음이 쓰여요', ask: '안 좋은 일이 생길까 봐 자꾸 생각이 났어요', same: [{ id: 'fear01a', word: '근심' }, { id: 'fear01b', word: '염려' }, { id: 'fear01c', word: '우려' }] },
          { id: 'fear31', word: '불안함', desc: '무엇 때문인지 몰라도 마음이 놓이지 않아요', ask: '무엇 때문인지 모르게 마음이 놓이지 않았어요', same: [{ id: 'fear31a', word: '불안정함' }] },
          { id: 'fear02', word: '초조함', desc: '시간이 가는 게 조급하고 불안해요', same: [{ id: 'fear02a', word: '조바심' }, { id: 'fear02b', word: '노심초사' }, { id: 'fear02c', word: '전전긍긍' }] },
          { id: 'fear04', word: '안절부절', desc: '가만히 있지 못하고 서성여요' },
          { id: 'fear12', word: '떨림', desc: '손이나 목소리가 떨려요' },
          { id: 'fear32', word: '예민함', desc: '작은 일에도 마음이 쉽게 흔들려요', same: [{ id: 'fear32a', word: '신경이 날카로움' }] },
          { id: 'fear03', word: '조마조마함', desc: '결과를 기다리며 마음을 졸여요', same: [{ id: 'fear03a', word: '아슬아슬함' }] },
          { id: 'fear18', word: '두근거림', desc: '심장이 쿵쿵 뛰어 숨이 가빠요' },
          { id: 'fear09', word: '긴장됨', desc: '몸과 마음이 팽팽하게 당겨져요', same: [{ id: 'fear09a', word: '각성됨' }] },
          { id: 'fear10', word: '부담감', desc: '해야 할 일이 어깨를 누르는 것 같아요', same: [{ id: 'fear10a', word: '부담스러움' }, { id: 'fear10b', word: '스트레스 받음' }] },
          { id: 'fear11', word: '압박감', desc: '잘해야 한다는 생각에 숨이 막혀요' },
          { id: 'fear30', word: '몰린 느낌', desc: '사방에서 다그쳐 빠져나갈 곳이 없어요', same: [{ id: 'fear30a', word: '쩔쩔맴' }, { id: 'fear30b', word: '절절맴' }] },
          { id: 'fear41', word: '긴박함', desc: '한시가 급해 숨 돌릴 틈이 없어요', same: [{ id: 'fear41a', word: '급박함' }, { id: 'fear41b', word: '절박함' }] },
          { id: 'fear44', word: '만만찮음', desc: '생각보다 어렵고 버거워 보여요' },
          { id: 'fearH4', word: '의심스러움', desc: '정말 그런지 믿기 어려워요', hidden: true, same: [{ id: 'fearH4a', word: '못미더움' }, { id: 'fearH4b', word: '반신반의' }] },
          { id: 'fearH6', word: '경계심', desc: '혹시 모를 일에 몸이 먼저 조심해요', hidden: true },
          { id: 'red07', word: '신경 쓰임', desc: '자꾸 마음이 그쪽으로 가서 편하지 않아요' },
          { id: 'red08', word: '불길함', desc: '나쁜 일이 생길 것 같은 느낌이 들어요' },
          { id: 'red09', word: '동요됨', desc: '마음이 흔들려 가라앉지 않아요' },
          { id: 'red10', word: '진땀 남', desc: '너무 긴장되거나 곤란해서 땀이 나요' },
          { id: 'red11', word: '압도됨', desc: '감당하기 어려울 만큼 크게 밀려와요' }
        ]
      },
      {
        id: 'r-fear', label: '두려움·공포',
        emotions: [
          { id: 'fear07', word: '두려움', desc: '앞으로 닥칠 큰일이 겁나 마음이 무거워요', ask: '앞으로 큰일이 닥칠 것 같아 겁이 났어요' },
          { id: 'fear05', word: '무서움', desc: '다칠 것 같아 피하고 싶어요', ask: '지금 바로 눈앞에 위험한 것이 있었어요', same: [{ id: 'fear05a', word: '공포감' }, { id: 'fear05b', word: '무시무시함' }, { id: 'fear05c', word: '살벌함' }] },
          { id: 'fear06', word: '겁남', desc: '해 보기도 전에 움츠러들어요', same: [{ id: 'fear06a', word: '겁먹음' }, { id: 'fear06b', word: '겁쟁이가 된 느낌' }] },
          { id: 'fear08', word: '오싹함', desc: '등이 서늘해지고 소름이 돋아요', same: [{ id: 'fear08a', word: '섬뜩함' }, { id: 'fear08b', word: '소름 끼침' }, { id: 'fear08c', word: '으스스함' }] },
          { id: 'fear19', word: '끔찍함', desc: '너무 나쁜 장면이라 다시 떠올리기도 싫어요', same: [{ id: 'fear19a', word: '몸서리침' }, { id: 'fear19b', word: '잔혹함' }, { id: 'fear19c', word: '잔인함' }] },
          { id: 'fear20', word: '도망치고 싶음', desc: '그곳을 당장 벗어나고 싶어요' },
          { id: 'fear42', word: '공황', desc: '갑자기 극심한 두려움이 몰려와 정신이 없어요' },
          { id: 'fear43', word: '아찔함', desc: '큰일 날 뻔해서 눈앞이 아득해요' },
          { id: 'red12', word: '간담이 서늘함', desc: '몹시 놀라고 무서워서 가슴이 서늘해요' },
          { id: 'red13', word: '겁에 질림', desc: '너무 무서워 몸이 굳고 어쩔 줄 몰라요' },
          { id: 'red14', word: '공포에 질림', desc: '아주 큰 두려움에 꼼짝할 수 없어요' }
        ]
      },
      {
        id: 'r-confuse', label: '놀람·혼란',
        emotions: [
          { id: 'fear24', word: '깜짝 놀람', desc: '갑작스러운 일에 몸이 움찔했어요', ask: '예상 못 한 일이 갑자기 일어났어요', same: [{ id: 'fear24a', word: '놀람' }, { id: 'fear24b', word: '움찔함' }, { id: 'fear24c', word: '흠칫함' }] },
          { id: 'fear25', word: '철렁함', desc: '나쁜 소식에 가슴이 덜컥 내려앉아요', ask: '나쁜 소식에 가슴이 쿵 내려앉았어요', same: [{ id: 'fear25a', word: '뜨끔함' }, { id: 'fear25b', word: '찔끔함' }] },
          { id: 'fear26', word: '어리둥절함', desc: '무슨 일인지 몰라 멍하니 두리번거려요', same: [{ id: 'fear26a', word: '얼떨떨함' }, { id: 'fear26b', word: '휘둥그래짐' }] },
          { id: 'fear27', word: '얼어붙음', desc: '놀라서 몸이 꼼짝도 안 해요', same: [{ id: 'fear27a', word: '새파래짐' }, { id: 'fear27b', word: '아연실색' }] },
          { id: 'fear33', word: '충격받음', desc: '큰일을 겪어 머리를 한 대 맞은 것 같아요', ask: '믿기 힘든 큰일에 마음이 크게 흔들렸어요', same: [{ id: 'fear33a', word: '충격적' }, { id: 'fear33b', word: '쇼킹함' }, { id: 'fear33c', word: '경악' }] },
          { id: 'fear34', word: '기겁', desc: '너무 놀라 겁에 질려 펄쩍 뛰었어요', same: [{ id: 'fear34a', word: '기절초풍' }, { id: 'fear34b', word: '까무러침' }, { id: 'fear34c', word: '기절할 것 같음' }] },
          { id: 'fear35', word: '기막힘', desc: '너무 뜻밖이라 말문이 막혀요', same: [{ id: 'fear35a', word: '뜨악함' }] },
          { id: 'fear36', word: '갑작스러움', desc: '예고 없이 닥친 일에 정신이 없어요', same: [{ id: 'fear36a', word: '급작스러움' }] },
          { id: 'fear37', word: '이상함', desc: '평소와 달라 어딘가 이상하게 느껴져요', same: [{ id: 'fear37a', word: '기이함' }, { id: 'fear37b', word: '기묘함' }, { id: 'fear37c', word: '괴상함' }] },
          { id: 'fear38', word: '알쏭달쏭함', desc: '맞는지 아닌지 헷갈려요', same: [{ id: 'fear38a', word: '아리송함' }] },
          { id: 'fearH2', word: '당황함', desc: '예상 못 한 일에 머리가 하얘졌어요', hidden: true, same: [{ id: 'fearH2a', word: '당혹함' }] },
          { id: 'fearH1', word: '혼란스러움', desc: '무엇이 맞는지 머릿속이 뒤죽박죽이에요', hidden: true },
          { id: 'fear17', word: '망설여짐', desc: '할까 말까 정하지 못해 마음이 왔다 갔다 해요', same: [{ id: 'fear17a', word: '갈등' }] },
          { id: 'sad45', word: '착잡함', desc: '여러 생각이 갈피를 못 잡게 뒤섞여 마음이 어수선해요', ask: '여러 생각이 얽혀 마음이 어수선했어요', same: [{ id: 'sad45a', word: '심란함' }, { id: 'sad45b', word: '뒤숭숭함' }, { id: 'sad45c', word: '싱숭생숭함' }] },
          { id: 'mix01', word: '복잡미묘함', desc: '한마디로 말하기 어렵게 여러 마음이 얽혀 있어요', same: [{ id: 'mix01a', word: '미묘함' }, { id: 'mix01b', word: '복잡한 마음' }] },
          { id: 'mix02', word: '만감이 교차함', desc: '온갖 느낌이 한꺼번에 솟아올라 서로 엇갈려요' },
          { id: 'mix03', word: '갈팡질팡함', desc: '마음의 갈피를 잡지 못하고 이리저리 헤매요', same: [{ id: 'mix03a', word: '마음이 오락가락함' }] },
          { id: 'red15', word: '양가감정이 듦', desc: '하고 싶은 마음과 하기 싫은 마음이 함께 있어요' }
        ]
      },
      {
        id: 'r-uneasy', label: '불편·난처',
        emotions: [
          { id: 'fearH3', word: '불편함', desc: '그곳에 있는 것이 어딘가 거북해요', hidden: true, same: [{ id: 'fearH3a', word: '마음이 불편함' }, { id: 'fearH3b', word: '거북함' }] },
          { id: 'fearH5', word: '찜찜함', desc: '뭔가 개운하지 않게 남아 있어요', hidden: true, same: [{ id: 'fearH5a', word: '꺼림칙함' }, { id: 'fearH5b', word: '개운찮음' }] },
          { id: 'fear39', word: '난처함', desc: '어떻게 해야 할지 몰라 곤란해요', same: [{ id: 'fear39a', word: '난감함' }, { id: 'fear39b', word: '곤란함' }, { id: 'fear39c', word: '곤혹스러움' }] },
          { id: 'fear40', word: '낭패스러움', desc: '계획이 틀어져 일을 그르쳤어요', same: [{ id: 'fear40a', word: '곤욕스러움' }] },
          { id: 'fear29', word: '어색함', desc: '처음 보는 사람이나 곳이라 낯설고 서먹해요', same: [{ id: 'fear29a', word: '서먹함' }, { id: 'fear29b', word: '낯섦' }] },
          { id: 'red16', word: '찝찝함', desc: '무언가 개운하지 않고 마음에 걸려요' },
          { id: 'red17', word: '숨 막힘', desc: '답답하고 조여 와 숨쉬기 힘든 느낌이에요' }
        ]
      },
      {
        id: 'r-shame', label: '부끄러움·죄책감',
        emotions: [
          { id: 'fear23', word: '수치심', desc: '나라는 사람 자체가 부끄러워 숨고 싶어요', ask: '나라는 사람 자체가 못나고 작게 느껴졌어요', same: [{ id: 'fear23a', word: '수치스러움' }, { id: 'fear23b', word: '오그라듦' }] },
          { id: 'fear13', word: '창피함', desc: '다른 사람 앞에서 얼굴이 화끈거려요', ask: '남들 앞에서 내 실수나 모습이 드러났어요', same: [{ id: 'fear13a', word: '부끄러움' }, { id: 'fear13b', word: '남부끄러움' }, { id: 'fear13c', word: '낯뜨거움' }] },
          { id: 'fear14', word: '민망함', desc: '어색한 상황이라 눈 둘 곳을 모르겠어요', ask: '어색한 상황에 놓여 어쩔 줄 몰랐어요', same: [{ id: 'fear14a', word: '무안함' }, { id: 'fear14b', word: '겸연쩍음' }, { id: 'fear14c', word: '계면쩍음' }] },
          { id: 'fear22', word: '쑥스러움', desc: '칭찬이나 관심을 받아 낯이 간지러워요', same: [{ id: 'fear22a', word: '낯간지러움' }, { id: 'fear22b', word: '멋쩍음' }, { id: 'fear22c', word: '머쓱함' }] },
          { id: 'sad20', word: '죄책감', desc: '내 잘못으로 누군가 힘들어져 마음이 무거워요', ask: '내가 한 행동이 남에게 잘못이었다는 생각이 들었어요' },
          { id: 'sad21', word: '자책감', desc: '"다 내 탓이야" 하며 나를 계속 꾸짖어요', ask: '"내가 왜 그랬을까" 하고 나를 꾸짖었어요', same: [{ id: 'sad21a', word: '자책' }] },
          { id: 'sad22', word: '면목 없음', desc: '그 사람 얼굴을 볼 낯이 없어요', ask: '볼 낯이 없어 그 사람 앞에 서기 어려웠어요' },
          { id: 'sad23', word: '양심이 찔림', desc: '작은 잘못이 생각나 마음이 콕콕 찔려요', ask: '옳지 않은 줄 알면서 해서 마음이 찔렸어요' },
          { id: 'sadH2', word: '미안함', desc: '누군가에게 잘못한 것 같아 마음이 쓰여요', hidden: true, same: [{ id: 'sadH2a', word: '죄송함' }, { id: 'sadH2b', word: '송구함' }] },
          { id: 'sadH3', word: '후회', desc: '그때 다르게 할걸 하는 생각이 들어요', hidden: true, same: [{ id: 'sadH3a', word: '참회' }] }
        ]
      },
      {
        id: 'r-disgust', label: '싫음·미움',
        emotions: [
          { id: 'ang20', word: '역겨움', desc: '속이 메스꺼울 만큼 싫어요', ask: '더럽거나 징그러운 것에 속이 울렁거렸어요', same: [{ id: 'ang20a', word: '구역질남' }, { id: 'ang20b', word: '느글거림' }, { id: 'ang20c', word: '느끼함' }] },
          { id: 'ang21', word: '징그러움', desc: '보기만 해도 몸이 움찔할 만큼 싫어요', same: [{ id: 'ang21a', word: '흉측함' }, { id: 'ang21b', word: '망측함' }, { id: 'ang21c', word: '해괴함' }] },
          { id: 'ang22', word: '정떨어짐', desc: '그 사람에게 마음이 싹 식었어요', ask: '좋던 사람에게 마음이 확 식었어요' },
          { id: 'ang23', word: '한심함', desc: '하는 모습이 못나고 하찮아 보여요', same: [{ id: 'ang23a', word: '가소로움' }, { id: 'ang23b', word: '꼴불견' }, { id: 'ang23c', word: '우스움' }] },
          { id: 'ang33', word: '미움', desc: '그 사람이 싫고 밉게 느껴져요', ask: '그 사람이 싫어서 멀리하고 싶었어요', same: [{ id: 'ang33a', word: '싫음' }] },
          { id: 'ang34', word: '경멸', desc: '하찮게 여겨 깔보고 싶어요', ask: '그 사람이 한참 못나 보여 깔보고 싶었어요', same: [{ id: 'ang34a', word: '코웃음 침' }, { id: 'ang34b', word: '비아냥거림' }, { id: 'ang34c', word: '빈정거림' }] },
          { id: 'ang35', word: '복수심', desc: '당한 만큼 똑같이 갚아 주고 싶어요' },
          { id: 'ang36', word: '고약함', desc: '성질이나 하는 짓이 거칠고 나빠 보여요', same: [{ id: 'ang36a', word: '괴팍함' }, { id: 'ang36b', word: '지독함' }] },
          { id: 'ang32', word: '증오', desc: '그 사람을 몹시 미워해요' },
          { id: 'angH6', word: '진저리남', desc: '같은 일이 반복돼 이제 지긋지긋해요', hidden: true, same: [{ id: 'angH6a', word: '지긋지긋함' }, { id: 'angH6b', word: '넌더리' }, { id: 'angH6c', word: '신물 남' }] },
          { id: 'ang40', word: '더러움', desc: '불결하고 지저분해 기분이 나빠요', same: [{ id: 'ang40a', word: '구질구질함' }, { id: 'ang40b', word: '구차함' }] },
          { id: 'mix08', word: '애증', desc: '아끼는 사람인데 밉기도 해요', ask: '아끼는 사람이 밉기도 했어요', same: [{ id: 'mix08a', word: '밉고도 좋음' }] },
          { id: 'red18', word: '혐오감', desc: '몹시 싫고 꺼려져 멀리하고 싶어요' },
          { id: 'red19', word: '질림', desc: '같은 것이 계속돼서 더는 싫어요' },
          { id: 'red20', word: '밥맛 떨어짐', desc: '하는 짓이 싫어 정이 뚝 떨어져요' }
        ]
      },
      {
        id: 'r-envy', label: '부러움·질투·갈망',
        emotions: [
          { id: 'sad24', word: '부러움', desc: '남이 가진 것을 나도 갖고 싶어요', ask: '남이 가진 것을 나도 갖고 싶었어요', same: [{ id: 'sad24a', word: '남부러움' }, { id: 'sad24b', word: '탐남' }] },
          { id: 'sad27', word: '샘남', desc: '나보다 잘되는 게 은근히 싫어요', ask: '남이 잘되는 것이 괜히 싫었어요' },
          { id: 'angH1', word: '질투', desc: '아끼는 사람을 다른 사람에게 빼앗길 것 같아 속상해요', hidden: true },
          { id: 'sad56', word: '간절함', desc: '무언가를 몹시 바라고 원해요', same: [{ id: 'sad56a', word: '절실함' }, { id: 'sad56b', word: '갈망' }, { id: 'sad56c', word: '갈구' }] }
        ]
      }
    ]
  },
  {
    id: 'blue', name: '파랑', face: '😢', label: '기분이 나쁘고 힘이 빠져요', hint: '슬픔 · 상실 · 외로움 · 지침', color: '#3B74D1', met: false,
    categories: [
      {
        id: 'b-sad', label: '슬픔·눈물',
        emotions: [
          { id: 'sad30', word: '슬픔', desc: '마음이 아래로 가라앉고 울고 싶어요', ask: '마음이 아파 눈물이 날 것 같았어요', same: [{ id: 'sad30a', word: '구슬픔' }, { id: 'sad30b', word: '비감함' }] },
          { id: 'sad32', word: '먹먹함', desc: '슬픔이 차올라 목이 메고 말이 안 나와요', same: [{ id: 'sad32a', word: '찡함' }, { id: 'sad32b', word: '복받침' }] },
          { id: 'sad17', word: '서러움', desc: '나만 홀로 힘든 것 같아 눈물이 북받쳐요' },
          { id: 'sadH5', word: '서글픔', desc: '까닭 없이 눈물이 날 것 같아요', hidden: true },
          { id: 'sad15', word: '우울함', desc: '마음이 오래 가라앉아 있어요', ask: '며칠째 마음이 가라앉아 있어요', same: [{ id: 'sad15a', word: '울적함' }, { id: 'sad15b', word: '침울함' }, { id: 'sad15c', word: '음울함' }] },
          { id: 'sad57', word: '마음이 무거움', desc: '마음이 즐겁지 않고 가라앉아 우울해요', same: [{ id: 'sad57a', word: '무거운 마음' }] },
          { id: 'sad41', word: '울고 싶음', desc: '눈물이 맺히고 금방 울음이 나올 것 같아요', same: [{ id: 'sad41a', word: '울먹임' }, { id: 'sad41b', word: '울상' }, { id: 'sad41c', word: '글썽글썽함' }] },
          { id: 'sad42', word: '울음이 터짐', desc: '참았던 울음이 엉엉 쏟아져요', same: [{ id: 'sad42a', word: '울며불며' }, { id: 'sad42b', word: '울부짖음' }, { id: 'sad42c', word: '절규' }] },
          { id: 'sad43', word: '눈물겨움', desc: '너무 애틋하거나 고마워 눈물이 날 것 같아요' },
          { id: 'sad44', word: '한숨이 나옴', desc: '일이 안 풀려 한숨만 푹푹 나와요', same: [{ id: 'sad44a', word: '한숨지음' }, { id: 'sad44b', word: '탄식' }, { id: 'sad44c', word: '한탄' }] },
          { id: 'sad48', word: '숙연함', desc: '무거운 일 앞에서 마음이 조용히 가라앉아요', same: [{ id: 'sad48a', word: '심각함' }] },
          { id: 'sadH4', word: '처량함', desc: '내 모습이 초라하고 가엾게 느껴져요', hidden: true },
          { id: 'sad40', word: '청승맞음', desc: '궁상맞게 혼자 슬픔에 젖어 있어요' },
          { id: 'sad37', word: '불쌍함', desc: '딱하고 가여워서 마음이 아파요', same: [{ id: 'sad37a', word: '가엾음' }, { id: 'sad37b', word: '가련함' }, { id: 'sad37c', word: '애처로움' }] },
          { id: 'blu01', word: '꿀꿀함', desc: '기분이 흐리고 조금 처져요' },
          { id: 'blu02', word: '처연함', desc: '쓸쓸하고 구슬퍼 마음이 애처로워요' },
          { id: 'blu03', word: '목이 멤', desc: '슬픔이 북받쳐 말이 잘 나오지 않아요' }
        ]
      },
      {
        id: 'b-loss', label: '상실·아픔',
        emotions: [
          { id: 'sad11', word: '상실감', desc: '소중한 것을 잃어 빈 곳이 커요', ask: '소중한 사람이나 물건, 기회를 잃었어요', same: [{ id: 'sad11a', word: '애도' }] },
          { id: 'sad09', word: '속상함', desc: '마음이 상해서 자꾸 생각나요', same: [{ id: 'sad09a', word: '속앓이' }, { id: 'sad09b', word: '가슴앓이' }, { id: 'sad09c', word: '냉가슴' }] },
          { id: 'sad33', word: '비통함', desc: '너무 슬퍼서 가슴이 미어져요', same: [{ id: 'sad33a', word: '애통함' }, { id: 'sad33b', word: '침통함' }, { id: 'sad33c', word: '비탄' }] },
          { id: 'sad34', word: '가슴 아픔', desc: '가슴이 저리고 아릴 만큼 마음이 아파요', same: [{ id: 'sad34a', word: '뼈아픔' }, { id: 'sad34b', word: '뼈저림' }, { id: 'sad34c', word: '애끓음' }] },
          { id: 'sad35', word: '괴로움', desc: '아픈 마음이 계속되어 견디기 힘들어요', same: [{ id: 'sad35a', word: '고통스러움' }, { id: 'sad35b', word: '아픔' }, { id: 'sad35c', word: '고달픔' }] },
          { id: 'sad36', word: '참담함', desc: '끔찍하게 나쁜 일에 말을 잃을 만큼 슬퍼요', same: [{ id: 'sad36a', word: '처참함' }, { id: 'sad36b', word: '처절함' }, { id: 'sad36c', word: '참혹함' }] },
          { id: 'sad38', word: '비참함', desc: '모든 게 무너진 것처럼 처지가 나빠요' },
          { id: 'sad39', word: '불행함', desc: '좋은 일은 없고 나쁜 일만 생기는 것 같아요', same: [{ id: 'sad39a', word: '기구함' }] },
          { id: 'sad47', word: '한스러움', desc: '되돌릴 수 없는 일이 원망스럽고 맺혀요', same: [{ id: 'sad47a', word: '통탄' }] },
          { id: 'sad55', word: '가혹함', desc: '감당하기 너무 힘든 일을 겪는 것 같아요', same: [{ id: 'sad55a', word: '냉혹함' }, { id: 'sad55b', word: '각박함' }] },
          { id: 'blu04', word: '마음이 아픔', desc: '마음에 상처를 입은 듯 아파요' },
          { id: 'blu05', word: '쓰라림', desc: '상처 난 데처럼 마음이 따갑고 아파요' },
          { id: 'blu06', word: '가슴이 찢어짐', desc: '견디기 어려울 만큼 마음이 아파요' }
        ]
      },
      {
        id: 'b-regret', label: '서운함·실망·아쉬움',
        emotions: [
          { id: 'sad01', word: '서운함', desc: '기대한 만큼 마음을 받지 못했어요', ask: '가까운 사람이 내 마음을 몰라 줬어요', same: [{ id: 'sad01a', word: '섭섭함' }] },
          { id: 'angH5', word: '야속함', desc: '나를 몰라주는 것이 섭섭하고 미워요', hidden: true },
          { id: 'sad05', word: '실망', desc: '바라던 대로 되지 않아 마음이 내려앉아요', ask: '기대한 만큼 되지 않았어요', same: [{ id: 'sad05a', word: '낙담' }, { id: 'sad05b', word: '낙심' }, { id: 'sad05c', word: '낙망' }] },
          { id: 'sad07', word: '아쉬움', desc: '조금만 더 했으면 하는 마음이 남아요', same: [{ id: 'sad07a', word: '아까움' }, { id: 'sad07b', word: '애석함' }, { id: 'sad07c', word: '유감스러움' }] },
          { id: 'sad06', word: '허탈함', desc: '애쓴 것이 한순간에 사라진 것 같아요', same: [{ id: 'sad06a', word: '허무함' }, { id: 'sad06b', word: '망연' }, { id: 'sad06c', word: '망연자실' }] },
          { id: 'sad31', word: '안타까움', desc: '돕고 싶은데 어쩔 수 없어 마음이 쓰여요', same: [{ id: 'sad31a', word: '안쓰러움' }, { id: 'sad31b', word: '측은함' }, { id: 'sad31c', word: '짠함' }] },
          { id: 'sad46', word: '씁쓸함', desc: '일이 끝났는데도 뒷맛이 쓰게 남아요', same: [{ id: 'sad46a', word: '쓴웃음' }] },
          { id: 'sad08', word: '김빠짐', desc: '신났던 마음이 갑자기 식었어요', same: [{ id: 'sad08a', word: '맥빠짐' }, { id: 'sad08b', word: '재미없음' }] },
          { id: 'mix04', word: '시원섭섭함', desc: '답답하던 마음이 풀려 홀가분하면서도 한편으로 섭섭해요', ask: '끝나서 홀가분하면서도 아쉬웠어요' },
          { id: 'mix07', word: '달콤씁쓸함', desc: '좋으면서도 한편으로 조금 언짢고 씁쓸해요' }
        ]
      },
      {
        id: 'b-lonely', label: '외로움·그리움',
        emotions: [
          { id: 'sad02', word: '외로움', desc: '곁에 아무도 없는 것 같아요', ask: '곁에 아무도 없는 것 같았어요', same: [{ id: 'sad02a', word: '고독함' }, { id: 'sad02b', word: '적적함' }, { id: 'sad02c', word: '외톨이가 된 느낌' }] },
          { id: 'sad03', word: '소외감', desc: '무리 밖으로 밀려난 것 같아요' },
          { id: 'sad04', word: '쓸쓸함', desc: '조용하고 텅 빈 느낌이 들어요', same: [{ id: 'sad04a', word: '스산함' }, { id: 'sad04b', word: '을씨년스러움' }] },
          { id: 'sad10', word: '그리움', desc: '다시 보고 싶고 함께하고 싶어요', same: [{ id: 'sad10a', word: '아련함' }, { id: 'sad10b', word: '사무침' }] },
          { id: 'sad12', word: '애틋함', desc: '안쓰럽고 아끼는 마음이 겹쳐요', same: [{ id: 'sad12a', word: '애잔함' }, { id: 'sad12b', word: '애달픔' }, { id: 'sad12c', word: '절절함' }] },
          { id: 'sadH1', word: '허전함', desc: '무언가 빠진 것처럼 비어 있어요', hidden: true, same: [{ id: 'sadH1a', word: '휑함' }] },
          { id: 'sadH6', word: '공허함', desc: '해도 해도 채워지지 않는 것 같아요', hidden: true },
          { id: 'sad50', word: '냉담함', desc: '마음이 차갑게 식어 관심이 없어요' },
          { id: 'sad49', word: '덤덤함', desc: '별 느낌 없이 담담해요', same: [{ id: 'sad49a', word: '초연함' }] },
          { id: 'blu07', word: '허함', desc: '마음 한쪽이 비어 있는 것 같아요' },
          { id: 'blu08', word: '거리감', desc: '그 사람과 멀어진 듯 느껴져요' },
          { id: 'blu09', word: '동떨어진 느낌', desc: '나만 따로 떨어져 있는 것 같아요' },
          { id: 'blu10', word: '애탐', desc: '몹시 그리워하거나 바라서 속이 타요' },
          { id: 'blu11', word: '무관심', desc: '아무 일에도 마음이 가지 않아요' },
          { id: 'blu12', word: '무감각', desc: '아무것도 느껴지지 않아요' },
          { id: 'blu13', word: '멍함', desc: '정신이 빠진 듯 아무 생각이 나지 않아요' },
          { id: 'blu14', word: '산만함', desc: '마음이 여기저기 흩어져 집중이 안 돼요' }
        ]
      },
      {
        id: 'b-helpless', label: '무력·좌절',
        emotions: [
          { id: 'sad14', word: '무기력', desc: '아무것도 하고 싶지 않아요', ask: '무엇을 해도 소용없을 것 같았어요', same: [{ id: 'sad14a', word: '의욕 없음' }, { id: 'sad14b', word: '기운 없음' }, { id: 'sad14c', word: '자포자기' }] },
          { id: 'sad16', word: '막막함', desc: '어디서부터 해야 할지 모르겠어요', same: [{ id: 'sad16a', word: '망막함' }, { id: 'sad16b', word: '암담함' }, { id: 'sad16c', word: '암울함' }] },
          { id: 'sad18', word: '좌절감', desc: '애써도 안 돼서 주저앉고 싶어요', same: [{ id: 'sad18a', word: '좌절' }, { id: 'sad18b', word: '기죽음' }, { id: 'sad18c', word: '의기소침' }] },
          { id: 'sad19', word: '절망감', desc: '아무리 봐도 나아질 길이 안 보여요', same: [{ id: 'sad19a', word: '절망' }, { id: 'sad19b', word: '가망 없음' }, { id: 'sad19c', word: '비관적인 마음' }] },
          { id: 'sad25', word: '열등감', desc: '남과 비교하면 내가 못나 보여요', ask: '남과 견주어 보니 내가 못나 보였어요', same: [{ id: 'sad25a', word: '초라함' }] },
          { id: 'sad26', word: '박탈감', desc: '남들은 다 받는데 나만 못 받은 것 같아요', ask: '당연히 내 몫이어야 할 것을 빼앗긴 것 같았어요' },
          { id: 'fear15', word: '위축됨', desc: '내가 작아진 것 같아요', same: [{ id: 'fear15a', word: '쭈뼛거림' }] },
          { id: 'fear16', word: '주눅 듦', desc: '기가 눌려 말이 잘 안 나와요' },
          { id: 'fear28', word: '자신 없음', desc: '내가 잘 해낼 수 있을지 믿기지 않아요' },
          { id: 'blu15', word: '무력감', desc: '내 힘으로는 어떻게 할 수 없다고 느껴요' },
          { id: 'blu16', word: '까마득함', desc: '끝이 보이지 않아 어떻게 할지 모르겠어요' }
        ]
      },
      {
        id: 'b-bored', label: '지루함·시들함',
        emotions: [
          { id: 'sad28', word: '지루함', desc: '하는 일이 재미없고 시간이 안 가요', same: [{ id: 'sad28a', word: '따분함' }, { id: 'sad28b', word: '무료함' }, { id: 'sad28c', word: '심심함' }] },
          { id: 'sad29', word: '시큰둥함', desc: '무엇을 봐도 별로 마음이 안 움직여요', same: [{ id: 'sad29a', word: '심드렁함' }, { id: 'sad29b', word: '시덥잖음' }, { id: 'sad29c', word: '신통찮음' }] },
          { id: 'sad51', word: '시무룩함', desc: '기분이 처져 말수가 줄었어요' },
          { id: 'sad52', word: '지겨움', desc: '오래 해 와서 더는 하고 싶지 않아요', same: [{ id: 'sad52a', word: '싫증남' }, { id: 'sad52b', word: '고리타분함' }, { id: 'sad52c', word: '떨떠름함' }] }
        ]
      },
      {
        id: 'b-tired', label: '지침·피곤',
        emotions: [
          { id: 'sad13', word: '지침', desc: '몸도 마음도 다 써 버린 것 같아요', ask: '힘을 많이 써서 기운이 다 빠졌어요', same: [{ id: 'sad13a', word: '기진맥진' }, { id: 'sad13b', word: '진이 빠짐' }, { id: 'sad13c', word: '소모됨' }] },
          { id: 'sad53', word: '피곤함', desc: '몸이 무겁고 쉬고 싶어요', same: [{ id: 'sad53a', word: '고단함' }] },
          { id: 'sad54', word: '골치 아픔', desc: '일이 꼬여 머리가 지끈거려요', same: [{ id: 'sad54a', word: '지끈거림' }] },
          { id: 'blu17', word: '힘듦', desc: '몸이나 마음이 버겁고 고돼요' },
          { id: 'blu18', word: '노곤함', desc: '몸이 풀려 나른하고 졸려요' },
          { id: 'blu19', word: '졸림', desc: '잠이 와서 눈이 감겨요' },
          { id: 'blu20', word: '맥 풀림', desc: '긴장이 풀려 힘이 쭉 빠져요' },
          { id: 'blu21', word: '녹초가 됨', desc: '힘이 다 빠져 꼼짝하기 싫어요' },
          { id: 'blu22', word: '바닥남', desc: '쓸 힘이 하나도 남지 않았어요' },
          { id: 'blu23', word: '소진됨', desc: '오랫동안 애써서 힘이 다 닳았어요' }
        ]
      },
      {
        id: 'b-fragile', label: '여림·조심',
        emotions: [
          { id: 'fear21', word: '조심스러움', desc: '실수할까 봐 하나하나 살피게 돼요', same: [{ id: 'fear21a', word: '노파심' }, { id: 'fear21b', word: '심려' }] },
          { id: 'blu24', word: '연약함', desc: '작은 일에도 쉽게 다칠 것 같아요' },
          { id: 'blu25', word: '흔들림', desc: '마음이 단단하지 못하고 흔들려요' }
        ]
      }
    ]
  }
];

/*
  핵심 감정 6개 — 감정 고르기 화면 맨 위에 3개씩 두 줄로 크게 나와요.
  사용자 지정 5개(수치심·분노·두려움·상실감·슬픔)에 죄책감을 더했어요(2026-11-07).
  차례: 나를 향한 감정(수치심·죄책감) → 분노 → 두려움 → 잃음(상실감·슬픔).
  수치심과 죄책감은 서로 다른 감정이라 나란히 두어 견주게 했어요(Tangney 외 1996).
  coreFaces = 낱말 위에 나오는 얼굴 그림(어린이·어르신이 알아보기 쉽게)
*/
window.MAEUM_DATA.coreEmotions = ['fear23', 'sad20', 'ang19', 'fear07', 'sad11', 'sad30'];
window.MAEUM_DATA.coreFaces = { fear23: '😳', sad20: '😔', ang19: '😡', fear07: '😨', sad11: '💔', sad30: '😢' };

/*
  옛 기록 읽기용 — 여러 감정을 함께 고를 수 있게 되면서 화면에서 뺀 "두 마음을 이은 말"이에요.
  지난 기록·도감에서 이름이 보이도록 남겨 두었어요. 지우지 마세요. (새로 고를 수는 없어요)
*/
window.MAEUM_DATA.retiredEmotions = [
  { id: 'mix05', word: '웃픔', desc: '웃기면서도 한편으로 슬퍼요', same: [{ id: 'mix05a', word: '웃기면서 슬픔' }] },
  { id: 'mix06', word: '고마우면서 미안함', desc: '고마운 마음과 미안한 마음이 함께 들어요', same: [{ id: 'mix06a', word: '고맙고 미안함' }] },
  { id: 'mix09', word: '축하하면서 부러움', desc: '잘돼서 기쁘면서도 한편으로 부러워요' },
  { id: 'mix10', word: '반가우면서 어색함', desc: '만나서 반가운데 어딘가 어색해요' },
  { id: 'mix11', word: '하고 싶으면서 두려움', desc: '해 보고 싶은데 한편으로 겁이 나요', same: [{ id: 'mix11a', word: '설레면서 걱정됨' }] }
];

/* 비슷한 감정 견주기 (지금 화면에서는 쓰지 않음. 연습 모드용으로 보관) */
window.MAEUM_DATA.compareSets = [
  { name: '나를 탓하고 부끄러운 마음', ids: ['fear23', 'sad20', 'fear13', 'fear14'] },
  { name: '무섭고 불안한 마음', ids: ['fear05', 'fear07', 'fear31', 'fear01'] },
  { name: '놀란 마음', ids: ['fear24', 'fear33', 'fear25', 'joy24'] },
  { name: '슬프고 아쉬운 마음', ids: ['sad30', 'sad11', 'sad05', 'sad01'] },
  { name: '화난 마음', ids: ['ang19', 'ang05', 'ang09', 'ang01'] },
  { name: '싫고 밀어내고 싶은 마음', ids: ['ang20', 'ang34', 'ang33', 'ang22'] },
  { name: '남과 견주는 마음', ids: ['sad24', 'sad27', 'sad25', 'sad26'] },
  { name: '미안하고 내 탓 같은 마음', ids: ['sad21', 'sad20', 'sad22', 'sad23'] },
  { name: '기쁜 마음', ids: ['joy28', 'joy29', 'joy07', 'joy10'] },
  { name: '가라앉고 힘 빠진 마음', ids: ['sad15', 'sad13', 'sad14', 'sad02'] }
];

/* "단어로 찾기"에서 아무것도 적지 않았을 때 먼저 보여 주는 감정 */
window.MAEUM_DATA.searchSuggest = ['fear23', 'ang19', 'fear07', 'sad11', 'sad30', 'sad01', 'ang05', 'ang02', 'sad20', 'fear31', 'joy06', 'sad09'];

/* 이름을 끝내 붙이지 못했을 때 저장되는 감정 (도감 개수에는 들어가지 않아요) */
window.MAEUM_DATA.unnamedEmotion = {
  id: 'unnamed',
  word: '이름 붙이기 어려운 감정',
  desc: '지금은 이름 붙이기 어려운 감정'
};
