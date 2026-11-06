/*
  ───────────────────────────────────────────────
  감정 단어 파일 (emotions.js)
  ───────────────────────────────────────────────
  - 따옴표 ' ' 안의 글자만 고치세요.
  - id: '...' 부분은 절대 고치지 마세요. (기록과 도감이 이 이름표로 연결돼요)
  - word  = 감정 이름
  - desc  = 버튼 아래 작게 나오는 설명
  - same  = 같은 뜻 다른 말 (0~3개). 감정을 고르면 "어느 말이 가장 가까운가요?" 화면에
            원래 단어와 함께 나와요. 설명(desc)은 원래 단어의 것을 함께 써요.
            새로 더할 때 id는 원래 단어 id 뒤에 a, b, c를 붙여요. (예: fear01 → fear01a)
  - 각 묶음(groups)은 화면 한 장에 나오는 감정 4개예요. 묶음마다 꼭 4개를 유지하세요.
  - 묶음은 4개보다 많아도 돼요. 묶음 고르기 화면에 4개씩 나오고,
    5번 "다른 묶음 더 보기"를 누르면 다음 묶음 4개가 나와요.
  - 뜻이 아주 비슷한 단어는 서로 다른 묶음에 넣거나 same(같은 뜻 다른 말)으로 넣어 주세요.
    (docs/emotion-words-research.md 참고)
  - hidden(숨은 감정)은 "이 중엔 없어요"를 눌렀을 때 다른 방법으로만 만날 수 있는 감정이에요.
*/
window.MAEUM_DATA = window.MAEUM_DATA || {};

window.MAEUM_DATA.families = [
  {
    id: 'joy',
    label: '기쁨 쪽',
    hint: '좋았다, 편했다, 뿌듯했다',
    emoji: '🌞',
    color: '#E9A800',
    groups: [
      {
        label: '신나고 설레요',
        hint: '몸이 들썩이는 즐거움',
        emotions: [
          { id: 'joy01', word: '신남', desc: '몸이 들썩일 만큼 즐거워요', same: [{ id: 'joy01a', word: '신명남' }, { id: 'joy01b', word: '신바람 남' }, { id: 'joy01c', word: '아주 신남' }] },
          { id: 'joy02', word: '설렘', desc: '좋은 일이 올 것 같아 두근거려요', same: [{ id: 'joy02a', word: '콩닥거림' }] },
          { id: 'joy04', word: '짜릿함', desc: '순간 온몸이 찌릿할 만큼 좋아요', same: [{ id: 'joy04a', word: '전율' }, { id: 'joy04b', word: '스릴' }] },
          { id: 'joy17', word: '재미있음', desc: '웃음이 절로 나올 만큼 즐거워요' }
        ]
      },
      {
        label: '편안하고 마음이 놓여요',
        hint: '걱정이 내려간 느낌',
        emotions: [
          { id: 'joy05', word: '편안함', desc: '몸과 마음에 불편한 곳이 없어요', same: [{ id: 'joy05a', word: '편함' }, { id: 'joy05b', word: '안락함' }, { id: 'joy05c', word: '안온함' }] },
          { id: 'joy06', word: '홀가분함', desc: '무거운 짐을 내려놓은 것 같아요', same: [{ id: 'joy06a', word: '가뿐함' }, { id: 'joy06b', word: '가벼움' }] },
          { id: 'joy07', word: '안심됨', desc: '걱정하던 일이 괜찮아져 숨이 놓여요', same: [{ id: 'joy07a', word: '천만다행' }, { id: 'joy07b', word: '안전한 느낌' }, { id: 'joy07c', word: '안정감' }] },
          { id: 'joy08', word: '느긋함', desc: '서두를 것 없이 여유로워요', same: [{ id: 'joy08a', word: '여유로움' }, { id: 'joy08b', word: '한가로움' }] }
        ]
      },
      {
        label: '뿌듯하고 자신 있어요',
        hint: '내가 해낸 것 같은 느낌',
        emotions: [
          { id: 'joy09', word: '뿌듯함', desc: '내가 해낸 일이 마음에 꽉 차요', same: [{ id: 'joy09a', word: '대견함' }] },
          { id: 'joy12', word: '자신 있음', desc: '이번엔 잘할 수 있을 것 같아요' },
          { id: 'joy18', word: '보람', desc: '내가 한 일이 누군가에게 도움이 돼 기뻐요' },
          { id: 'joy19', word: '의욕', desc: '무언가 해 보고 싶은 힘이 솟아요', same: [{ id: 'joy19a', word: '동기 부여됨' }, { id: 'joy19b', word: '고취됨' }] }
        ]
      },
      {
        label: '따뜻하고 고마워요',
        hint: '누군가의 마음을 받은 느낌',
        emotions: [
          { id: 'joy13', word: '고마움', desc: '받은 마음에 보답하고 싶어요', same: [{ id: 'joy13a', word: '감사함' }, { id: 'joy13b', word: '축복받은 느낌' }] },
          { id: 'joy14', word: '따뜻함', desc: '마음 한쪽이 포근하게 데워져요', same: [{ id: 'joy14a', word: '따스함' }] },
          { id: 'joy15', word: '반가움', desc: '보고 싶던 것을 만나 기뻐요', same: [{ id: 'joy15a', word: '달가움' }] },
          { id: 'joy16', word: '감동', desc: '마음이 크게 움직여 눈시울이 붉어져요', same: [{ id: 'joy16a', word: '감격' }, { id: 'joy16b', word: '뭉클함' }, { id: 'joy16c', word: '감명 깊음' }] }
        ]
      },
      {
        label: '궁금하고 빠져들어요',
        hint: '더 알고 싶은 느낌',
        emotions: [
          { id: 'joy20', word: '흥미로움', desc: '더 알아보고 싶을 만큼 마음이 끌려요' },
          { id: 'joy21', word: '궁금함', desc: '어떻게 된 건지 답을 알고 싶어요', same: [{ id: 'joy21a', word: '감질남' }] },
          { id: 'joy22', word: '몰입됨', desc: '시간 가는 줄 모르고 푹 빠져 있어요', same: [{ id: 'joy22a', word: '집중됨' }] },
          { id: 'joy23', word: '신선함', desc: '처음 겪는 일이라 새롭고 산뜻해요', same: [{ id: 'joy23a', word: '상큼함' }] }
        ]
      },
      {
        label: '놀랍고 감탄스러워요',
        hint: '"와!" 하는 느낌',
        emotions: [
          { id: 'joy24', word: '신기함', desc: '어떻게 이럴 수 있지 싶어 눈이 동그래져요', same: [{ id: 'joy24a', word: '신비로움' }, { id: 'joy24b', word: '기상천외' }] },
          { id: 'joy25', word: '감탄', desc: '정말 대단해서 "와" 소리가 절로 나요', same: [{ id: 'joy25a', word: '감복' }, { id: 'joy25b', word: '탄복' }] },
          { id: 'joy26', word: '황홀함', desc: '너무 아름다워 넋을 놓고 바라봐요', same: [{ id: 'joy26a', word: '경이로움' }, { id: 'joy26b', word: '감미로움' }] },
          { id: 'joy27', word: '존경스러움', desc: '그 사람이 대단해 닮고 싶어요' }
        ]
      },
      {
        label: '기쁘고 자랑스러워요',
        hint: '좋은 소식을 들은 느낌',
        emotions: [
          { id: 'joy28', word: '기쁨', desc: '바라던 일이 이루어져 마음이 환해요', same: [{ id: 'joy28a', word: '기분 좋음' }, { id: 'joy28b', word: '좋음' }] },
          { id: 'joy10', word: '자랑스러움', desc: '누군가에게 보여 주고 싶을 만큼 좋아요', same: [{ id: 'joy10a', word: '으쓱함' }] },
          { id: 'joy11', word: '당당함', desc: '고개를 들고 내 모습 그대로 있어도 돼요', same: [{ id: 'joy11a', word: '의기양양함' }, { id: 'joy11b', word: '기고만장함' }] },
          { id: 'joy03', word: '들뜸', desc: '마음이 붕 떠서 가만있기 어려워요', same: [{ id: 'joy03a', word: '흥분됨' }, { id: 'joy03b', word: '상기됨' }, { id: 'joy03c', word: '충동적인 마음' }] }
        ]
      },
      {
        label: '행복하고 사랑스러워요',
        hint: '마음이 꽉 차는 느낌',
        emotions: [
          { id: 'joy29', word: '행복함', desc: '지금 이대로 참 좋다고 느껴요', same: [{ id: 'joy29a', word: '더없이 행복함' }, { id: 'joy29b', word: '충만함' }] },
          { id: 'joy30', word: '만족스러움', desc: '이만하면 충분해서 더 바랄 게 없어요', same: [{ id: 'joy30a', word: '흡족함' }, { id: 'joy30b', word: '자족함' }] },
          { id: 'joy31', word: '사랑스러움', desc: '너무 소중하고 예뻐 꼭 안아 주고 싶어요', same: [{ id: 'joy31a', word: '예쁨' }, { id: 'joy31b', word: '어여쁨' }] },
          { id: 'joy32', word: '정다움', desc: '서로 마음이 가까워 함께 있는 게 좋아요', same: [{ id: 'joy32a', word: '친근함' }, { id: 'joy32b', word: '친숙함' }, { id: 'joy32c', word: '다정함' }] }
        ]
      },
      {
        label: '즐겁고 유쾌해요',
        hint: '웃음이 나는 느낌',
        emotions: [
          { id: 'joy33', word: '즐거움', desc: '하는 동안 내내 마음이 즐거워요', same: [{ id: 'joy33a', word: '유쾌함' }, { id: 'joy33b', word: '쾌활함' }, { id: 'joy33c', word: '경쾌함' }] },
          { id: 'joy34', word: '웃음이 터짐', desc: '참으려 해도 깔깔 웃음이 터져 나와요', same: [{ id: 'joy34a', word: '함박웃음' }, { id: 'joy34b', word: '싱글벙글함' }, { id: 'joy34c', word: '희희낙락함' }] },
          { id: 'joy35', word: '흥겨움', desc: '노래나 놀이에 어깨가 들썩여요' },
          { id: 'joy36', word: '통쾌함', desc: '이겨 내거나 바로잡혀 속이 시원해요', same: [{ id: 'joy36a', word: '속 시원함' }] }
        ]
      },
      {
        label: '희망차고 힘이 나요',
        hint: '앞이 밝아 보이는 느낌',
        emotions: [
          { id: 'joy37', word: '희망참', desc: '앞으로 좋아질 거라는 믿음이 생겨요', same: [{ id: 'joy37a', word: '낙관적인 마음' }, { id: 'joy37b', word: '긍정적인 마음' }] },
          { id: 'joy38', word: '영감을 받음', desc: '좋은 생각이 번쩍 떠올라 해 보고 싶어요', same: [{ id: 'joy38a', word: '감흥' }] },
          { id: 'joy39', word: '활발함', desc: '몸과 마음에 힘이 넘쳐 움직이고 싶어요', same: [{ id: 'joy39a', word: '기운이 넘침' }] },
          { id: 'joy40', word: '열광', desc: '좋아하는 것에 푹 빠져 크게 환호해요' }
        ]
      },
      {
        label: '고요하고 평온해요',
        hint: '마음이 잔잔한 느낌',
        emotions: [
          { id: 'joy41', word: '평온함', desc: '마음이 잔잔한 물처럼 고요해요', same: [{ id: 'joy41a', word: '평화로움' }, { id: 'joy41b', word: '고요함' }, { id: 'joy41c', word: '차분함' }] },
          { id: 'joy42', word: '걱정 없음', desc: '신경 쓰이는 일이 하나도 없어요', same: [{ id: 'joy42a', word: '속 편함' }, { id: 'joy42b', word: '근심 걱정 없음' }, { id: 'joy42c', word: '태평함' }] },
          { id: 'joy43', word: '생각에 잠김', desc: '조용히 이것저것 곰곰이 떠올려요' },
          { id: 'joy44', word: '나른함', desc: '몸이 노곤하고 졸릴 만큼 느슨해요' }
        ]
      },
      {
        label: '멋지고 마음이 끌려요',
        hint: '마음이 끌리는 느낌',
        emotions: [
          { id: 'joy45', word: '끌림', desc: '자꾸 눈길과 마음이 그쪽으로 가요', same: [{ id: 'joy45a', word: '매력적임' }, { id: 'joy45b', word: '섹시함' }] },
          { id: 'joy46', word: '낭만적인 기분', desc: '영화 속 장면처럼 마음이 몽글몽글해요' },
          { id: 'joy47', word: '감개무량함', desc: '지난 일을 돌아보니 마음이 깊이 울려요', same: [{ id: 'joy47a', word: '감회' }] },
          { id: 'joy48', word: '근사함', desc: '멋지고 훌륭해 보여 기분이 좋아요', same: [{ id: 'joy48a', word: '우아함' }, { id: 'joy48b', word: '훌륭함' }] }
        ]
      }
    ],
    hidden: [
      { id: 'joyH1', word: '벅참', desc: '기쁨이 가슴에 가득 차 넘칠 것 같아요' },
      { id: 'joyH2', word: '흐뭇함', desc: '바라보기만 해도 미소가 지어져요', same: [{ id: 'joyH2a', word: '보기 좋음' }] },
      { id: 'joyH3', word: '후련함', desc: '막혀 있던 것이 뻥 뚫린 것 같아요' },
      { id: 'joyH4', word: '상쾌함', desc: '맑은 공기를 마신 것처럼 개운해요', same: [{ id: 'joyH4a', word: '쾌적함' }] },
      { id: 'joyH5', word: '기대됨', desc: '다음이 어떻게 될지 기다려져요', same: [{ id: 'joyH5a', word: '학수고대' }] },
      { id: 'joyH6', word: '든든함', desc: '믿는 구석이 있어 마음이 꽉 차요' }
    ]
  },
  {
    id: 'sad',
    label: '슬픔 쪽',
    hint: '서운했다, 미안했다, 힘이 빠졌다',
    emoji: '🌧️',
    color: '#3F7FE0',
    groups: [
      {
        label: '서운하고 외로워요',
        hint: '혼자인 것 같은 느낌',
        emotions: [
          { id: 'sad01', word: '서운함', desc: '기대한 만큼 마음을 받지 못했어요', same: [{ id: 'sad01a', word: '섭섭함' }] },
          { id: 'sad02', word: '외로움', desc: '곁에 아무도 없는 것 같아요', same: [{ id: 'sad02a', word: '고독함' }, { id: 'sad02b', word: '적적함' }, { id: 'sad02c', word: '외톨이가 된 느낌' }] },
          { id: 'sad03', word: '소외감', desc: '무리 밖으로 밀려난 것 같아요' },
          { id: 'sad17', word: '서러움', desc: '나만 홀로 힘든 것 같아 눈물이 북받쳐요' }
        ]
      },
      {
        label: '실망하고 힘이 빠져요',
        hint: '바라던 대로 되지 않은 느낌',
        emotions: [
          { id: 'sad05', word: '실망', desc: '바라던 대로 되지 않아 마음이 내려앉아요', same: [{ id: 'sad05a', word: '낙담' }, { id: 'sad05b', word: '낙심' }, { id: 'sad05c', word: '낙망' }] },
          { id: 'sad06', word: '허탈함', desc: '애쓴 것이 한순간에 사라진 것 같아요', same: [{ id: 'sad06a', word: '허무함' }, { id: 'sad06b', word: '망연' }, { id: 'sad06c', word: '망연자실' }] },
          { id: 'sad07', word: '아쉬움', desc: '조금만 더 했으면 하는 마음이 남아요', same: [{ id: 'sad07a', word: '아까움' }, { id: 'sad07b', word: '애석함' }, { id: 'sad07c', word: '유감스러움' }] },
          { id: 'sad18', word: '좌절감', desc: '애써도 안 돼서 주저앉고 싶어요', same: [{ id: 'sad18a', word: '좌절' }, { id: 'sad18b', word: '기죽음' }, { id: 'sad18c', word: '의기소침' }] }
        ]
      },
      {
        label: '마음이 아프고 그리워요',
        hint: '소중한 것이 다친 느낌',
        emotions: [
          { id: 'sad09', word: '속상함', desc: '마음이 상해서 자꾸 생각나요', same: [{ id: 'sad09a', word: '속앓이' }, { id: 'sad09b', word: '가슴앓이' }, { id: 'sad09c', word: '냉가슴' }] },
          { id: 'sad10', word: '그리움', desc: '다시 보고 싶고 함께하고 싶어요', same: [{ id: 'sad10a', word: '아련함' }, { id: 'sad10b', word: '사무침' }] },
          { id: 'sad11', word: '상실감', desc: '소중한 것을 잃어 빈 곳이 커요', same: [{ id: 'sad11a', word: '애도' }] },
          { id: 'sad12', word: '애틋함', desc: '안쓰럽고 아끼는 마음이 겹쳐요', same: [{ id: 'sad12a', word: '애잔함' }, { id: 'sad12b', word: '애달픔' }, { id: 'sad12c', word: '절절함' }] }
        ]
      },
      {
        label: '지치고 기운이 없어요',
        hint: '몸도 마음도 무거운 느낌',
        emotions: [
          { id: 'sad13', word: '지침', desc: '몸도 마음도 다 써 버린 것 같아요', same: [{ id: 'sad13a', word: '기진맥진' }, { id: 'sad13b', word: '진이 빠짐' }, { id: 'sad13c', word: '소모됨' }] },
          { id: 'sad15', word: '우울함', desc: '마음이 오래 가라앉아 있어요', same: [{ id: 'sad15a', word: '울적함' }, { id: 'sad15b', word: '침울함' }, { id: 'sad15c', word: '음울함' }] },
          { id: 'sad16', word: '막막함', desc: '어디서부터 해야 할지 모르겠어요', same: [{ id: 'sad16a', word: '망막함' }, { id: 'sad16b', word: '암담함' }, { id: 'sad16c', word: '암울함' }] },
          { id: 'sad19', word: '절망감', desc: '아무리 봐도 나아질 길이 안 보여요', same: [{ id: 'sad19a', word: '절망' }, { id: 'sad19b', word: '가망 없음' }, { id: 'sad19c', word: '비관적인 마음' }] }
        ]
      },
      {
        label: '미안하고 내 탓 같아요',
        hint: '잘못한 것 같은 느낌',
        emotions: [
          { id: 'sad20', word: '죄책감', desc: '내 잘못으로 누군가 힘들어져 마음이 무거워요' },
          { id: 'sad21', word: '자책감', desc: '"다 내 탓이야" 하며 나를 계속 꾸짖어요', same: [{ id: 'sad21a', word: '자책' }] },
          { id: 'sad22', word: '면목 없음', desc: '그 사람 얼굴을 볼 낯이 없어요' },
          { id: 'sad23', word: '양심이 찔림', desc: '작은 잘못이 생각나 마음이 콕콕 찔려요' }
        ]
      },
      {
        label: '부럽고 작아져요',
        hint: '남과 비교되는 느낌',
        emotions: [
          { id: 'sad24', word: '부러움', desc: '남이 가진 것을 나도 갖고 싶어요', same: [{ id: 'sad24a', word: '남부러움' }, { id: 'sad24b', word: '탐남' }] },
          { id: 'sad25', word: '열등감', desc: '남과 비교하면 내가 못나 보여요', same: [{ id: 'sad25a', word: '초라함' }] },
          { id: 'sad26', word: '박탈감', desc: '남들은 다 받는데 나만 못 받은 것 같아요' },
          { id: 'sad27', word: '샘남', desc: '나보다 잘되는 게 은근히 싫어요' }
        ]
      },
      {
        label: '시들하고 재미없어요',
        hint: '마음이 식은 느낌',
        emotions: [
          { id: 'sad28', word: '지루함', desc: '하는 일이 재미없고 시간이 안 가요', same: [{ id: 'sad28a', word: '따분함' }, { id: 'sad28b', word: '무료함' }, { id: 'sad28c', word: '심심함' }] },
          { id: 'sad29', word: '시큰둥함', desc: '무엇을 봐도 별로 마음이 안 움직여요', same: [{ id: 'sad29a', word: '심드렁함' }, { id: 'sad29b', word: '시덥잖음' }, { id: 'sad29c', word: '신통찮음' }] },
          { id: 'sad08', word: '김빠짐', desc: '신났던 마음이 갑자기 식었어요', same: [{ id: 'sad08a', word: '맥빠짐' }, { id: 'sad08b', word: '재미없음' }] },
          { id: 'sad14', word: '무기력', desc: '아무것도 하고 싶지 않아요', same: [{ id: 'sad14a', word: '의욕 없음' }, { id: 'sad14b', word: '기운 없음' }, { id: 'sad14c', word: '자포자기' }] }
        ]
      },
      {
        label: '슬프고 먹먹해요',
        hint: '눈물이 날 것 같은 느낌',
        emotions: [
          { id: 'sad30', word: '슬픔', desc: '마음이 아래로 가라앉고 울고 싶어요', same: [{ id: 'sad30a', word: '구슬픔' }, { id: 'sad30b', word: '비감함' }] },
          { id: 'sad04', word: '쓸쓸함', desc: '조용하고 텅 빈 느낌이 들어요', same: [{ id: 'sad04a', word: '스산함' }, { id: 'sad04b', word: '을씨년스러움' }] },
          { id: 'sad31', word: '안타까움', desc: '돕고 싶은데 어쩔 수 없어 마음이 쓰여요', same: [{ id: 'sad31a', word: '안쓰러움' }, { id: 'sad31b', word: '측은함' }, { id: 'sad31c', word: '짠함' }] },
          { id: 'sad32', word: '먹먹함', desc: '슬픔이 차올라 목이 메고 말이 안 나와요', same: [{ id: 'sad32a', word: '찡함' }, { id: 'sad32b', word: '복받침' }] }
        ]
      },
      {
        label: '마음이 찢어지게 아파요',
        hint: '견디기 힘든 슬픔',
        emotions: [
          { id: 'sad33', word: '비통함', desc: '너무 슬퍼서 가슴이 미어져요', same: [{ id: 'sad33a', word: '애통함' }, { id: 'sad33b', word: '침통함' }, { id: 'sad33c', word: '비탄' }] },
          { id: 'sad34', word: '가슴 아픔', desc: '가슴이 저리고 아릴 만큼 마음이 아파요', same: [{ id: 'sad34a', word: '뼈아픔' }, { id: 'sad34b', word: '뼈저림' }, { id: 'sad34c', word: '애끓음' }] },
          { id: 'sad35', word: '괴로움', desc: '아픈 마음이 계속되어 견디기 힘들어요', same: [{ id: 'sad35a', word: '고통스러움' }, { id: 'sad35b', word: '아픔' }, { id: 'sad35c', word: '고달픔' }] },
          { id: 'sad36', word: '참담함', desc: '끔찍하게 나쁜 일에 말을 잃을 만큼 슬퍼요', same: [{ id: 'sad36a', word: '처참함' }, { id: 'sad36b', word: '처절함' }, { id: 'sad36c', word: '참혹함' }] }
        ]
      },
      {
        label: '내 처지가 딱해요',
        hint: '가엾게 느껴지는 느낌',
        emotions: [
          { id: 'sad37', word: '불쌍함', desc: '딱하고 가여워서 마음이 아파요', same: [{ id: 'sad37a', word: '가엾음' }, { id: 'sad37b', word: '가련함' }, { id: 'sad37c', word: '애처로움' }] },
          { id: 'sad38', word: '비참함', desc: '모든 게 무너진 것처럼 처지가 나빠요' },
          { id: 'sad39', word: '불행함', desc: '좋은 일은 없고 나쁜 일만 생기는 것 같아요', same: [{ id: 'sad39a', word: '기구함' }] },
          { id: 'sad40', word: '청승맞음', desc: '궁상맞게 혼자 슬픔에 젖어 있어요' }
        ]
      },
      {
        label: '눈물이 나요',
        hint: '울음이 나오는 느낌',
        emotions: [
          { id: 'sad41', word: '울고 싶음', desc: '눈물이 맺히고 금방 울음이 나올 것 같아요', same: [{ id: 'sad41a', word: '울먹임' }, { id: 'sad41b', word: '울상' }, { id: 'sad41c', word: '글썽글썽함' }] },
          { id: 'sad42', word: '울음이 터짐', desc: '참았던 울음이 엉엉 쏟아져요', same: [{ id: 'sad42a', word: '울며불며' }, { id: 'sad42b', word: '울부짖음' }, { id: 'sad42c', word: '절규' }] },
          { id: 'sad43', word: '눈물겨움', desc: '너무 애틋하거나 고마워 눈물이 날 것 같아요' },
          { id: 'sad44', word: '한숨이 나옴', desc: '일이 안 풀려 한숨만 푹푹 나와요', same: [{ id: 'sad44a', word: '한숨지음' }, { id: 'sad44b', word: '탄식' }, { id: 'sad44c', word: '한탄' }] }
        ]
      },
      {
        label: '마음이 복잡하고 무거워요',
        hint: '생각이 얽힌 느낌',
        emotions: [
          { id: 'sad45', word: '착잡함', desc: '여러 생각이 얽혀 마음이 무거워요', same: [{ id: 'sad45a', word: '심란함' }, { id: 'sad45b', word: '뒤숭숭함' }, { id: 'sad45c', word: '싱숭생숭함' }] },
          { id: 'sad46', word: '씁쓸함', desc: '일이 끝났는데도 뒷맛이 쓰게 남아요', same: [{ id: 'sad46a', word: '쓴웃음' }] },
          { id: 'sad47', word: '한스러움', desc: '되돌릴 수 없는 일이 원망스럽고 맺혀요', same: [{ id: 'sad47a', word: '통탄' }] },
          { id: 'sad48', word: '숙연함', desc: '무거운 일 앞에서 마음이 조용히 가라앉아요', same: [{ id: 'sad48a', word: '심각함' }] }
        ]
      },
      {
        label: '무덤덤하고 시무룩해요',
        hint: '마음이 가라앉아 식은 느낌',
        emotions: [
          { id: 'sad49', word: '덤덤함', desc: '별 느낌 없이 담담해요', same: [{ id: 'sad49a', word: '초연함' }] },
          { id: 'sad50', word: '냉담함', desc: '마음이 차갑게 식어 관심이 없어요' },
          { id: 'sad51', word: '시무룩함', desc: '기분이 처져 말수가 줄었어요' },
          { id: 'sad52', word: '지겨움', desc: '오래 해 와서 더는 하고 싶지 않아요', same: [{ id: 'sad52a', word: '싫증남' }, { id: 'sad52b', word: '고리타분함' }, { id: 'sad52c', word: '떨떠름함' }] }
        ]
      },
      {
        label: '힘들고 애가 타요',
        hint: '버티기 힘든 느낌',
        emotions: [
          { id: 'sad53', word: '피곤함', desc: '몸이 무겁고 쉬고 싶어요', same: [{ id: 'sad53a', word: '고단함' }] },
          { id: 'sad54', word: '골치 아픔', desc: '일이 꼬여 머리가 지끈거려요', same: [{ id: 'sad54a', word: '지끈거림' }] },
          { id: 'sad55', word: '가혹함', desc: '감당하기 너무 힘든 일을 겪는 것 같아요', same: [{ id: 'sad55a', word: '냉혹함' }, { id: 'sad55b', word: '각박함' }] },
          { id: 'sad56', word: '간절함', desc: '무언가를 몹시 바라고 원해요', same: [{ id: 'sad56a', word: '절실함' }, { id: 'sad56b', word: '갈망' }, { id: 'sad56c', word: '갈구' }] }
        ]
      }
    ],
    hidden: [
      { id: 'sadH1', word: '허전함', desc: '무언가 빠진 것처럼 비어 있어요', same: [{ id: 'sadH1a', word: '휑함' }] },
      { id: 'sadH2', word: '미안함', desc: '누군가에게 잘못한 것 같아 마음이 쓰여요', same: [{ id: 'sadH2a', word: '죄송함' }, { id: 'sadH2b', word: '송구함' }] },
      { id: 'sadH3', word: '후회', desc: '그때 다르게 할걸 하는 생각이 들어요', same: [{ id: 'sadH3a', word: '참회' }] },
      { id: 'sadH4', word: '처량함', desc: '내 모습이 초라하고 가엾게 느껴져요' },
      { id: 'sadH5', word: '서글픔', desc: '까닭 없이 눈물이 날 것 같아요' },
      { id: 'sadH6', word: '공허함', desc: '해도 해도 채워지지 않는 것 같아요' }
    ]
  },
  {
    id: 'anger',
    label: '화남 쪽',
    hint: '짜증 났다, 억울했다, 싫었다',
    emoji: '🔥',
    color: '#D9473A',
    groups: [
      {
        label: '짜증 나고 답답해요',
        hint: '신경이 곤두서는 느낌',
        emotions: [
          { id: 'ang01', word: '짜증', desc: '작은 일에도 신경이 곤두서요' },
          { id: 'ang02', word: '답답함', desc: '말이 통하지 않아 가슴이 막혀요', same: [{ id: 'ang02a', word: '갑갑함' }] },
          { id: 'ang17', word: '어이없음', desc: '말도 안 되는 일이라 황당하고 화가 나요', same: [{ id: 'ang17a', word: '가당찮음' }, { id: 'ang17b', word: '가관' }] },
          { id: 'ang16', word: '불쾌함', desc: '기분이 상해서 찝찝해요', same: [{ id: 'ang16a', word: '불유쾌함' }, { id: 'ang16b', word: '기분 나쁨' }] }
        ]
      },
      {
        label: '억울하고 분해요',
        hint: '불공평하다는 느낌',
        emotions: [
          { id: 'ang05', word: '억울함', desc: '내 잘못이 아닌데 탓을 들었어요', same: [{ id: 'ang05a', word: '원통함' }, { id: 'ang05b', word: '반칙당한 느낌' }] },
          { id: 'ang06', word: '분함', desc: '진 것 같아 이가 꽉 물려요', same: [{ id: 'ang06a', word: '분개' }, { id: 'ang06b', word: '울분' }] },
          { id: 'ang07', word: '원망', desc: '그 사람 때문이라는 생각이 들어요' },
          { id: 'ang08', word: '배신감', desc: '믿었던 사람이 등을 돌렸어요' }
        ]
      },
      {
        label: '무시당한 것 같아요',
        hint: '내가 작게 취급된 느낌',
        emotions: [
          { id: 'ang09', word: '무시당한 느낌', desc: '내가 없는 사람처럼 취급받았어요', same: [{ id: 'ang09a', word: '멸시당함' }] },
          { id: 'ang10', word: '모욕감', desc: '나를 깎아내리는 말에 상처받았어요', same: [{ id: 'ang10a', word: '모멸감' }, { id: 'ang10b', word: '모욕적인 느낌' }, { id: 'ang10c', word: '굴욕감' }] },
          { id: 'ang11', word: '자존심 상함', desc: '내 체면이 구겨진 것 같아요', same: [{ id: 'ang11a', word: '치욕' }, { id: 'ang11b', word: '웃음거리가 된 느낌' }] },
          { id: 'ang18', word: '푸대접받은 느낌', desc: '나만 소홀히 대해서 화가 나요', same: [{ id: 'ang18a', word: '야박함' }] }
        ]
      },
      {
        label: '속이 부글부글 끓어요',
        hint: '화가 올라오는 느낌',
        emotions: [
          { id: 'ang13', word: '부글부글함', desc: '화가 속에서 계속 끓어올라요', same: [{ id: 'ang13a', word: '울화통' }, { id: 'ang13b', word: '속 썩음' }] },
          { id: 'ang14', word: '울컥함', desc: '갑자기 화가 확 치밀어요', same: [{ id: 'ang14a', word: '화가 치밀어 오름' }] },
          { id: 'ang15', word: '약오름', desc: '놀림받은 것 같아 분해요', same: [{ id: 'ang15a', word: '아니꼬움' }] },
          { id: 'ang19', word: '분노', desc: '참기 어려울 만큼 크게 화가 나요', same: [{ id: 'ang19a', word: '격분' }, { id: 'ang19b', word: '격노' }, { id: 'ang19c', word: '진노' }] }
        ]
      },
      {
        label: '싫고 역겨워요',
        hint: '멀리 밀어내고 싶은 느낌',
        emotions: [
          { id: 'ang20', word: '역겨움', desc: '속이 메스꺼울 만큼 싫어요', same: [{ id: 'ang20a', word: '구역질남' }, { id: 'ang20b', word: '느글거림' }, { id: 'ang20c', word: '느끼함' }] },
          { id: 'ang21', word: '징그러움', desc: '보기만 해도 몸이 움찔할 만큼 싫어요', same: [{ id: 'ang21a', word: '흉측함' }, { id: 'ang21b', word: '망측함' }, { id: 'ang21c', word: '해괴함' }] },
          { id: 'ang22', word: '정떨어짐', desc: '그 사람에게 마음이 싹 식었어요' },
          { id: 'ang23', word: '한심함', desc: '하는 모습이 못나고 하찮아 보여요', same: [{ id: 'ang23a', word: '가소로움' }, { id: 'ang23b', word: '꼴불견' }, { id: 'ang23c', word: '우스움' }] }
        ]
      },
      {
        label: '귀찮고 하기 싫어요',
        hint: '억지로 끌려가는 느낌',
        emotions: [
          { id: 'ang03', word: '귀찮음', desc: '하기 싫은 일이 자꾸 생겨요' },
          { id: 'ang24', word: '반항심', desc: '시키는 대로 하기 싫어 맞서고 싶어요', same: [{ id: 'ang24a', word: '비딱함' }] },
          { id: 'ang25', word: '간섭받는 느낌', desc: '내 일에 자꾸 끼어들어 싫어요' },
          { id: 'ang26', word: '떠밀린 느낌', desc: '내 뜻과 상관없이 억지로 끌려가요', same: [{ id: 'ang26a', word: '강압적인 느낌' }] }
        ]
      },
      {
        label: '얄밉고 거슬려요',
        hint: '그 사람 행동이 눈에 거슬리는 느낌',
        emotions: [
          { id: 'ang27', word: '얄미움', desc: '제 잇속만 챙기는 모습이 밉게 보여요', same: [{ id: 'ang27a', word: '치사함' }, { id: 'ang27b', word: '야비함' }, { id: 'ang27c', word: '가증스러움' }] },
          { id: 'ang12', word: '얕보인 느낌', desc: '나를 쉽게 여긴다는 생각이 들어요' },
          { id: 'ang04', word: '성가심', desc: '자꾸 방해받아 거슬려요', same: [{ id: 'ang04a', word: '거슬림' }, { id: 'ang04b', word: '골칫거리' }] },
          { id: 'ang28', word: '심술남', desc: '괜히 남을 골탕 먹이고 싶어요', same: [{ id: 'ang28a', word: '심술궂음' }, { id: 'ang28b', word: '심통' }] }
        ]
      },
      {
        label: '몹시 화가 나요',
        hint: '화가 크게 난 느낌',
        emotions: [
          { id: 'ang29', word: '화남', desc: '마음에 안 들어 화가 나요', same: [{ id: 'ang29a', word: '노여움' }, { id: 'ang29b', word: '몹시 화남' }, { id: 'ang29c', word: '쌕쌕거림' }] },
          { id: 'ang30', word: '격해짐', desc: '감정이 점점 거세져 목소리가 커져요', same: [{ id: 'ang30a', word: '격앙됨' }, { id: 'ang30b', word: '격양됨' }] },
          { id: 'ang31', word: '치 떨림', desc: '너무 분하고 화가 나 몸이 부들부들 떨려요' },
          { id: 'ang32', word: '증오', desc: '그 사람을 몹시 미워해요' }
        ]
      },
      {
        label: '밉고 경멸스러워요',
        hint: '그 사람이 싫은 느낌',
        emotions: [
          { id: 'ang33', word: '미움', desc: '그 사람이 싫고 밉게 느껴져요', same: [{ id: 'ang33a', word: '싫음' }] },
          { id: 'ang34', word: '경멸', desc: '하찮게 여겨 깔보고 싶어요', same: [{ id: 'ang34a', word: '코웃음 침' }, { id: 'ang34b', word: '비아냥거림' }, { id: 'ang34c', word: '빈정거림' }] },
          { id: 'ang35', word: '복수심', desc: '당한 만큼 똑같이 갚아 주고 싶어요' },
          { id: 'ang36', word: '고약함', desc: '성질이나 하는 짓이 거칠고 나빠 보여요', same: [{ id: 'ang36a', word: '괴팍함' }, { id: 'ang36b', word: '지독함' }] }
        ]
      },
      {
        label: '불만스럽고 삐쳤어요',
        hint: '뾰로통한 느낌',
        emotions: [
          { id: 'ang37', word: '불만', desc: '마음에 차지 않아 투덜대고 싶어요', same: [{ id: 'ang37a', word: '불만스러움' }, { id: 'ang37b', word: '불만족' }, { id: 'ang37c', word: '써부렁거림' }] },
          { id: 'ang38', word: '삐짐', desc: '서운하고 언짢아서 토라졌어요', same: [{ id: 'ang38a', word: '뾰루퉁함' }, { id: 'ang38b', word: '불퉁터짐' }, { id: 'ang38c', word: '뚱함' }] },
          { id: 'ang39', word: '신경질', desc: '참지 못하고 날카로운 말이 튀어나와요', same: [{ id: 'ang39a', word: '신경질적인 마음' }] },
          { id: 'ang40', word: '더러움', desc: '불결하고 지저분해 기분이 나빠요', same: [{ id: 'ang40a', word: '구질구질함' }, { id: 'ang40b', word: '구차함' }] }
        ]
      }
    ],
    hidden: [
      { id: 'angH1', word: '질투', desc: '아끼는 사람을 다른 사람에게 빼앗길 것 같아 속상해요' },
      { id: 'angH2', word: '못마땅함', desc: '하는 모습이 마음에 들지 않아요', same: [{ id: 'angH2a', word: '마땅찮음' }, { id: 'angH2b', word: '달갑잖음' }] },
      { id: 'angH3', word: '언짢음', desc: '기분이 살짝 상해 있어요' },
      { id: 'angH4', word: '괘씸함', desc: '나를 그렇게 대한 것이 용서가 안 돼요' },
      { id: 'angH5', word: '야속함', desc: '나를 몰라주는 것이 섭섭하고 미워요' },
      { id: 'angH6', word: '진저리남', desc: '같은 일이 반복돼 이제 지긋지긋해요', same: [{ id: 'angH6a', word: '지긋지긋함' }, { id: 'angH6b', word: '넌더리' }, { id: 'angH6c', word: '신물 남' }] }
    ]
  },
  {
    id: 'fear',
    label: '불안·두려움 쪽',
    hint: '걱정됐다, 창피했다, 깜짝 놀랐다',
    emoji: '🌀',
    color: '#7B5BD0',
    groups: [
      {
        label: '걱정되고 두려워요',
        hint: '앞일이 마음 쓰이는 느낌',
        emotions: [
          { id: 'fear01', word: '걱정', desc: '나쁜 일이 생길까 봐 마음이 쓰여요', same: [{ id: 'fear01a', word: '근심' }, { id: 'fear01b', word: '염려' }, { id: 'fear01c', word: '우려' }] },
          { id: 'fear07', word: '두려움', desc: '앞으로 닥칠 큰일이 겁나 마음이 무거워요' },
          { id: 'fear17', word: '망설여짐', desc: '할까 말까 정하지 못해 마음이 왔다 갔다 해요', same: [{ id: 'fear17a', word: '갈등' }] },
          { id: 'fear21', word: '조심스러움', desc: '실수할까 봐 하나하나 살피게 돼요', same: [{ id: 'fear21a', word: '노파심' }, { id: 'fear21b', word: '심려' }] }
        ]
      },
      {
        label: '무섭고 소름 끼쳐요',
        hint: '피하고 싶은 느낌',
        emotions: [
          { id: 'fear05', word: '무서움', desc: '다칠 것 같아 피하고 싶어요', same: [{ id: 'fear05a', word: '공포감' }, { id: 'fear05b', word: '무시무시함' }, { id: 'fear05c', word: '살벌함' }] },
          { id: 'fear08', word: '오싹함', desc: '등이 서늘해지고 소름이 돋아요', same: [{ id: 'fear08a', word: '섬뜩함' }, { id: 'fear08b', word: '소름 끼침' }, { id: 'fear08c', word: '으스스함' }] },
          { id: 'fear19', word: '끔찍함', desc: '너무 나쁜 장면이라 다시 떠올리기도 싫어요', same: [{ id: 'fear19a', word: '몸서리침' }, { id: 'fear19b', word: '잔혹함' }, { id: 'fear19c', word: '잔인함' }] },
          { id: 'fear20', word: '도망치고 싶음', desc: '그곳을 당장 벗어나고 싶어요' }
        ]
      },
      {
        label: '긴장되고 부담돼요',
        hint: '잘해야 한다는 느낌',
        emotions: [
          { id: 'fear09', word: '긴장됨', desc: '몸과 마음이 팽팽하게 당겨져요', same: [{ id: 'fear09a', word: '각성됨' }] },
          { id: 'fear10', word: '부담감', desc: '해야 할 일이 어깨를 누르는 것 같아요', same: [{ id: 'fear10a', word: '부담스러움' }, { id: 'fear10b', word: '스트레스 받음' }] },
          { id: 'fear03', word: '조마조마함', desc: '결과를 기다리며 마음을 졸여요', same: [{ id: 'fear03a', word: '아슬아슬함' }] },
          { id: 'fear18', word: '두근거림', desc: '심장이 쿵쿵 뛰어 숨이 가빠요' }
        ]
      },
      {
        label: '창피하고 부끄러워요',
        hint: '얼굴이 화끈한 느낌',
        emotions: [
          { id: 'fear13', word: '창피함', desc: '다른 사람 앞에서 얼굴이 화끈거려요', same: [{ id: 'fear13a', word: '부끄러움' }, { id: 'fear13b', word: '남부끄러움' }, { id: 'fear13c', word: '낯뜨거움' }] },
          { id: 'fear14', word: '민망함', desc: '어색한 상황이라 눈 둘 곳을 모르겠어요', same: [{ id: 'fear14a', word: '무안함' }, { id: 'fear14b', word: '겸연쩍음' }, { id: 'fear14c', word: '계면쩍음' }] },
          { id: 'fear22', word: '쑥스러움', desc: '칭찬이나 관심을 받아 낯이 간지러워요', same: [{ id: 'fear22a', word: '낯간지러움' }, { id: 'fear22b', word: '멋쩍음' }, { id: 'fear22c', word: '머쓱함' }] },
          { id: 'fear23', word: '수치심', desc: '나라는 사람 자체가 부끄러워 숨고 싶어요', same: [{ id: 'fear23a', word: '수치스러움' }, { id: 'fear23b', word: '오그라듦' }] }
        ]
      },
      {
        label: '깜짝 놀랐어요',
        hint: '갑자기 마음이 덜컥한 느낌',
        emotions: [
          { id: 'fear24', word: '깜짝 놀람', desc: '갑작스러운 일에 몸이 움찔했어요', same: [{ id: 'fear24a', word: '놀람' }, { id: 'fear24b', word: '움찔함' }, { id: 'fear24c', word: '흠칫함' }] },
          { id: 'fear25', word: '철렁함', desc: '나쁜 소식에 가슴이 덜컥 내려앉아요', same: [{ id: 'fear25a', word: '뜨끔함' }, { id: 'fear25b', word: '찔끔함' }] },
          { id: 'fear26', word: '어리둥절함', desc: '무슨 일인지 몰라 멍하니 두리번거려요', same: [{ id: 'fear26a', word: '얼떨떨함' }, { id: 'fear26b', word: '휘둥그래짐' }] },
          { id: 'fear27', word: '얼어붙음', desc: '놀라서 몸이 꼼짝도 안 해요', same: [{ id: 'fear27a', word: '새파래짐' }, { id: 'fear27b', word: '아연실색' }] }
        ]
      },
      {
        label: '자신 없고 움츠러들어요',
        hint: '작아지는 느낌',
        emotions: [
          { id: 'fear06', word: '겁남', desc: '해 보기도 전에 움츠러들어요', same: [{ id: 'fear06a', word: '겁먹음' }, { id: 'fear06b', word: '겁쟁이가 된 느낌' }] },
          { id: 'fear15', word: '위축됨', desc: '내가 작아진 것 같아요', same: [{ id: 'fear15a', word: '쭈뼛거림' }] },
          { id: 'fear28', word: '자신 없음', desc: '내가 잘 해낼 수 있을지 믿기지 않아요' },
          { id: 'fear29', word: '어색함', desc: '처음 보는 사람이나 곳이라 낯설고 서먹해요', same: [{ id: 'fear29a', word: '서먹함' }, { id: 'fear29b', word: '낯섦' }] }
        ]
      },
      {
        label: '쫓기고 숨 막혀요',
        hint: '몰아붙이는 느낌',
        emotions: [
          { id: 'fear11', word: '압박감', desc: '잘해야 한다는 생각에 숨이 막혀요' },
          { id: 'fear02', word: '초조함', desc: '시간이 가는 게 조급하고 불안해요', same: [{ id: 'fear02a', word: '조바심' }, { id: 'fear02b', word: '노심초사' }, { id: 'fear02c', word: '전전긍긍' }] },
          { id: 'fear16', word: '주눅 듦', desc: '기가 눌려 말이 잘 안 나와요' },
          { id: 'fear30', word: '몰린 느낌', desc: '사방에서 다그쳐 빠져나갈 곳이 없어요', same: [{ id: 'fear30a', word: '쩔쩔맴' }, { id: 'fear30b', word: '절절맴' }] }
        ]
      },
      {
        label: '불안하고 가만있기 힘들어요',
        hint: '마음이 놓이지 않는 느낌',
        emotions: [
          { id: 'fear31', word: '불안함', desc: '무엇 때문인지 몰라도 마음이 놓이지 않아요', same: [{ id: 'fear31a', word: '불안정함' }] },
          { id: 'fear04', word: '안절부절', desc: '가만히 있지 못하고 서성여요' },
          { id: 'fear12', word: '떨림', desc: '손이나 목소리가 떨려요' },
          { id: 'fear32', word: '예민함', desc: '작은 일에도 마음이 쉽게 흔들려요', same: [{ id: 'fear32a', word: '신경이 날카로움' }] }
        ]
      },
      {
        label: '크게 놀랐어요',
        hint: '큰일에 충격받은 느낌',
        emotions: [
          { id: 'fear33', word: '충격받음', desc: '큰일을 겪어 머리를 한 대 맞은 것 같아요', same: [{ id: 'fear33a', word: '충격적' }, { id: 'fear33b', word: '쇼킹함' }, { id: 'fear33c', word: '경악' }] },
          { id: 'fear34', word: '기겁', desc: '너무 놀라 겁에 질려 펄쩍 뛰었어요', same: [{ id: 'fear34a', word: '기절초풍' }, { id: 'fear34b', word: '까무러침' }, { id: 'fear34c', word: '기절할 것 같음' }] },
          { id: 'fear35', word: '기막힘', desc: '너무 뜻밖이라 말문이 막혀요', same: [{ id: 'fear35a', word: '뜨악함' }] },
          { id: 'fear36', word: '갑작스러움', desc: '예고 없이 닥친 일에 정신이 없어요', same: [{ id: 'fear36a', word: '급작스러움' }] }
        ]
      },
      {
        label: '이상하고 알쏭달쏭해요',
        hint: '무슨 일인지 모르겠는 느낌',
        emotions: [
          { id: 'fear37', word: '이상함', desc: '평소와 달라 어딘가 이상하게 느껴져요', same: [{ id: 'fear37a', word: '기이함' }, { id: 'fear37b', word: '기묘함' }, { id: 'fear37c', word: '괴상함' }] },
          { id: 'fear38', word: '알쏭달쏭함', desc: '맞는지 아닌지 헷갈려요', same: [{ id: 'fear38a', word: '아리송함' }] },
          { id: 'fear39', word: '난처함', desc: '어떻게 해야 할지 몰라 곤란해요', same: [{ id: 'fear39a', word: '난감함' }, { id: 'fear39b', word: '곤란함' }, { id: 'fear39c', word: '곤혹스러움' }] },
          { id: 'fear40', word: '낭패스러움', desc: '계획이 틀어져 일을 그르쳤어요', same: [{ id: 'fear40a', word: '곤욕스러움' }] }
        ]
      },
      {
        label: '아슬아슬하고 다급해요',
        hint: '위태로운 느낌',
        emotions: [
          { id: 'fear41', word: '긴박함', desc: '한시가 급해 숨 돌릴 틈이 없어요', same: [{ id: 'fear41a', word: '급박함' }, { id: 'fear41b', word: '절박함' }] },
          { id: 'fear42', word: '공황', desc: '갑자기 극심한 두려움이 몰려와 정신이 없어요' },
          { id: 'fear43', word: '아찔함', desc: '큰일 날 뻔해서 눈앞이 아득해요' },
          { id: 'fear44', word: '만만찮음', desc: '생각보다 어렵고 버거워 보여요' }
        ]
      }
    ],
    hidden: [
      { id: 'fearH1', word: '혼란스러움', desc: '무엇이 맞는지 머릿속이 뒤죽박죽이에요' },
      { id: 'fearH2', word: '당황함', desc: '예상 못 한 일에 머리가 하얘졌어요', same: [{ id: 'fearH2a', word: '당혹함' }] },
      { id: 'fearH3', word: '불편함', desc: '그곳에 있는 것이 어딘가 거북해요', same: [{ id: 'fearH3a', word: '마음이 불편함' }, { id: 'fearH3b', word: '거북함' }] },
      { id: 'fearH4', word: '의심스러움', desc: '정말 그런지 믿기 어려워요', same: [{ id: 'fearH4a', word: '못미더움' }, { id: 'fearH4b', word: '반신반의' }] },
      { id: 'fearH5', word: '찜찜함', desc: '뭔가 개운하지 않게 남아 있어요', same: [{ id: 'fearH5a', word: '꺼림칙함' }, { id: 'fearH5b', word: '개운찮음' }] },
      { id: 'fearH6', word: '경계심', desc: '혹시 모를 일에 몸이 먼저 조심해요' }
    ]
  }
];

/* 이름을 끝내 붙이지 못했을 때 저장되는 감정 (도감 개수에는 들어가지 않아요) */
window.MAEUM_DATA.unnamedEmotion = {
  id: 'unnamed',
  word: '이름 붙이기 어려운 감정',
  desc: '지금은 이름 붙이기 어려운 감정'
};
