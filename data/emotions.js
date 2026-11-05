/*
  ───────────────────────────────────────────────
  감정 단어 파일 (emotions.js)
  ───────────────────────────────────────────────
  - 따옴표 ' ' 안의 글자만 고치세요.
  - id: '...' 부분은 절대 고치지 마세요. (기록과 도감이 이 이름표로 연결돼요)
  - word  = 감정 이름
  - desc  = 버튼 아래 작게 나오는 설명
  - 각 묶음(groups)은 화면 한 장에 나오는 4개 감정이에요. 꼭 4개를 유지하세요.
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
          { id: 'joy01', word: '신남', desc: '몸이 들썩일 만큼 즐거워요' },
          { id: 'joy02', word: '설렘', desc: '좋은 일이 올 것 같아 두근거려요' },
          { id: 'joy03', word: '들뜸', desc: '마음이 붕 떠서 가만있기 어려워요' },
          { id: 'joy04', word: '짜릿함', desc: '순간 온몸이 찌릿할 만큼 좋아요' }
        ]
      },
      {
        label: '편안하고 마음이 놓여요',
        hint: '걱정이 내려간 느낌',
        emotions: [
          { id: 'joy05', word: '편안함', desc: '걱정 없이 마음이 느슨해요' },
          { id: 'joy06', word: '홀가분함', desc: '무거운 짐을 내려놓은 것 같아요' },
          { id: 'joy07', word: '안심됨', desc: '걱정하던 일이 괜찮아져 숨이 놓여요' },
          { id: 'joy08', word: '느긋함', desc: '서두를 것 없이 여유로워요' }
        ]
      },
      {
        label: '뿌듯하고 자신 있어요',
        hint: '내가 해낸 것 같은 느낌',
        emotions: [
          { id: 'joy09', word: '뿌듯함', desc: '내가 해낸 일이 마음에 꽉 차요' },
          { id: 'joy10', word: '자랑스러움', desc: '누군가에게 보여 주고 싶을 만큼 좋아요' },
          { id: 'joy11', word: '당당함', desc: '고개를 들고 내 모습 그대로 있어도 돼요' },
          { id: 'joy12', word: '자신 있음', desc: '이번엔 잘할 수 있을 것 같아요' }
        ]
      },
      {
        label: '따뜻하고 고마워요',
        hint: '누군가의 마음을 받은 느낌',
        emotions: [
          { id: 'joy13', word: '고마움', desc: '받은 마음에 보답하고 싶어요' },
          { id: 'joy14', word: '따뜻함', desc: '마음 한쪽이 포근하게 데워져요' },
          { id: 'joy15', word: '반가움', desc: '보고 싶던 것을 만나 기뻐요' },
          { id: 'joy16', word: '감동', desc: '마음이 크게 움직여 눈시울이 붉어져요' }
        ]
      }
    ],
    hidden: [
      { id: 'joyH1', word: '벅참', desc: '기쁨이 가슴에 가득 차 넘칠 것 같아요' },
      { id: 'joyH2', word: '흐뭇함', desc: '바라보기만 해도 미소가 지어져요' },
      { id: 'joyH3', word: '후련함', desc: '막혀 있던 것이 뻥 뚫린 것 같아요' },
      { id: 'joyH4', word: '상쾌함', desc: '맑은 공기를 마신 것처럼 개운해요' },
      { id: 'joyH5', word: '기대됨', desc: '다음이 어떻게 될지 기다려져요' },
      { id: 'joyH6', word: '든든함', desc: '믿는 구석이 있어 마음이 꽉 차요' }
    ]
  },
  {
    id: 'sad',
    label: '슬픔 쪽',
    hint: '서운했다, 아쉬웠다, 힘이 빠졌다',
    emoji: '🌧️',
    color: '#3F7FE0',
    groups: [
      {
        label: '서운하고 외로워요',
        hint: '혼자인 것 같은 느낌',
        emotions: [
          { id: 'sad01', word: '서운함', desc: '기대한 만큼 마음을 받지 못했어요' },
          { id: 'sad02', word: '외로움', desc: '곁에 아무도 없는 것 같아요' },
          { id: 'sad03', word: '소외감', desc: '무리 밖으로 밀려난 것 같아요' },
          { id: 'sad04', word: '쓸쓸함', desc: '조용하고 텅 빈 느낌이 들어요' }
        ]
      },
      {
        label: '실망하고 힘이 빠져요',
        hint: '바라던 대로 되지 않은 느낌',
        emotions: [
          { id: 'sad05', word: '실망', desc: '바라던 대로 되지 않아 마음이 내려앉아요' },
          { id: 'sad06', word: '허탈함', desc: '애쓴 것이 한순간에 사라진 것 같아요' },
          { id: 'sad07', word: '아쉬움', desc: '조금만 더 했으면 하는 마음이 남아요' },
          { id: 'sad08', word: '김빠짐', desc: '신났던 마음이 갑자기 식었어요' }
        ]
      },
      {
        label: '마음이 아프고 그리워요',
        hint: '소중한 것이 다친 느낌',
        emotions: [
          { id: 'sad09', word: '속상함', desc: '마음이 상해서 자꾸 생각나요' },
          { id: 'sad10', word: '그리움', desc: '다시 보고 싶고 함께하고 싶어요' },
          { id: 'sad11', word: '상실감', desc: '소중한 것을 잃어 빈 곳이 커요' },
          { id: 'sad12', word: '애틋함', desc: '안쓰럽고 아끼는 마음이 겹쳐요' }
        ]
      },
      {
        label: '지치고 기운이 없어요',
        hint: '몸도 마음도 무거운 느낌',
        emotions: [
          { id: 'sad13', word: '지침', desc: '몸도 마음도 다 써 버린 것 같아요' },
          { id: 'sad14', word: '무기력', desc: '아무것도 하고 싶지 않아요' },
          { id: 'sad15', word: '우울함', desc: '마음이 오래 가라앉아 있어요' },
          { id: 'sad16', word: '막막함', desc: '어디서부터 해야 할지 모르겠어요' }
        ]
      }
    ],
    hidden: [
      { id: 'sadH1', word: '허전함', desc: '무언가 빠진 것처럼 비어 있어요' },
      { id: 'sadH2', word: '미안함', desc: '누군가에게 잘못한 것 같아 마음이 쓰여요' },
      { id: 'sadH3', word: '후회', desc: '그때 다르게 할걸 하는 생각이 들어요' },
      { id: 'sadH4', word: '처량함', desc: '내 모습이 초라하고 가엾게 느껴져요' },
      { id: 'sadH5', word: '서글픔', desc: '까닭 없이 눈물이 날 것 같아요' },
      { id: 'sadH6', word: '공허함', desc: '해도 해도 채워지지 않는 것 같아요' }
    ]
  },
  {
    id: 'anger',
    label: '화남 쪽',
    hint: '짜증 났다, 억울했다, 무시당했다',
    emoji: '🔥',
    color: '#D9473A',
    groups: [
      {
        label: '짜증 나고 답답해요',
        hint: '신경이 곤두서는 느낌',
        emotions: [
          { id: 'ang01', word: '짜증', desc: '작은 일에도 신경이 곤두서요' },
          { id: 'ang02', word: '답답함', desc: '말이 통하지 않아 가슴이 막혀요' },
          { id: 'ang03', word: '귀찮음', desc: '하기 싫은 일이 자꾸 생겨요' },
          { id: 'ang04', word: '성가심', desc: '자꾸 방해받아 거슬려요' }
        ]
      },
      {
        label: '억울하고 분해요',
        hint: '불공평하다는 느낌',
        emotions: [
          { id: 'ang05', word: '억울함', desc: '내 잘못이 아닌데 탓을 들었어요' },
          { id: 'ang06', word: '분함', desc: '진 것 같아 이가 꽉 물려요' },
          { id: 'ang07', word: '원망', desc: '그 사람 때문이라는 생각이 들어요' },
          { id: 'ang08', word: '배신감', desc: '믿었던 사람이 등을 돌렸어요' }
        ]
      },
      {
        label: '무시당한 것 같아요',
        hint: '내가 작게 취급된 느낌',
        emotions: [
          { id: 'ang09', word: '무시당한 느낌', desc: '내가 없는 사람처럼 취급받았어요' },
          { id: 'ang10', word: '모욕감', desc: '나를 깎아내리는 말에 상처받았어요' },
          { id: 'ang11', word: '자존심 상함', desc: '내 체면이 구겨진 것 같아요' },
          { id: 'ang12', word: '얕보인 느낌', desc: '나를 쉽게 여긴다는 생각이 들어요' }
        ]
      },
      {
        label: '속이 부글부글 끓어요',
        hint: '화가 올라오는 느낌',
        emotions: [
          { id: 'ang13', word: '부글부글함', desc: '화가 속에서 계속 끓어올라요' },
          { id: 'ang14', word: '울컥함', desc: '갑자기 화가 확 치밀어요' },
          { id: 'ang15', word: '약오름', desc: '놀림받은 것 같아 분해요' },
          { id: 'ang16', word: '불쾌함', desc: '기분이 상해서 찝찝해요' }
        ]
      }
    ],
    hidden: [
      { id: 'angH1', word: '질투', desc: '남이 가진 것이 부럽고 속상해요' },
      { id: 'angH2', word: '못마땅함', desc: '하는 모습이 마음에 들지 않아요' },
      { id: 'angH3', word: '언짢음', desc: '기분이 살짝 상해 있어요' },
      { id: 'angH4', word: '괘씸함', desc: '나를 그렇게 대한 것이 용서가 안 돼요' },
      { id: 'angH5', word: '야속함', desc: '나를 몰라주는 것이 섭섭하고 미워요' },
      { id: 'angH6', word: '진저리남', desc: '같은 일이 반복돼 이제 지긋지긋해요' }
    ]
  },
  {
    id: 'fear',
    label: '불안·두려움 쪽',
    hint: '걱정됐다, 무서웠다, 긴장됐다',
    emoji: '🌀',
    color: '#7B5BD0',
    groups: [
      {
        label: '걱정되고 초조해요',
        hint: '마음을 졸이는 느낌',
        emotions: [
          { id: 'fear01', word: '걱정', desc: '나쁜 일이 생길까 봐 마음이 쓰여요' },
          { id: 'fear02', word: '초조함', desc: '시간이 가는 게 조급하고 불안해요' },
          { id: 'fear03', word: '조마조마함', desc: '결과를 기다리며 마음을 졸여요' },
          { id: 'fear04', word: '안절부절', desc: '가만히 있지 못하고 서성여요' }
        ]
      },
      {
        label: '무섭고 두려워요',
        hint: '피하고 싶은 느낌',
        emotions: [
          { id: 'fear05', word: '무서움', desc: '다칠 것 같아 피하고 싶어요' },
          { id: 'fear06', word: '겁남', desc: '해 보기도 전에 움츠러들어요' },
          { id: 'fear07', word: '두려움', desc: '알 수 없는 일이 다가와 마음이 얼어붙어요' },
          { id: 'fear08', word: '오싹함', desc: '등이 서늘해지고 소름이 돋아요' }
        ]
      },
      {
        label: '긴장되고 부담돼요',
        hint: '잘해야 한다는 느낌',
        emotions: [
          { id: 'fear09', word: '긴장됨', desc: '몸과 마음이 팽팽하게 당겨져요' },
          { id: 'fear10', word: '부담감', desc: '해야 할 일이 어깨를 누르는 것 같아요' },
          { id: 'fear11', word: '압박감', desc: '잘해야 한다는 생각에 숨이 막혀요' },
          { id: 'fear12', word: '떨림', desc: '손이나 목소리가 떨려요' }
        ]
      },
      {
        label: '창피하고 움츠러들어요',
        hint: '작아지는 느낌',
        emotions: [
          { id: 'fear13', word: '창피함', desc: '다른 사람 앞에서 얼굴이 화끈거려요' },
          { id: 'fear14', word: '민망함', desc: '어색해서 어디 숨고 싶어요' },
          { id: 'fear15', word: '위축됨', desc: '내가 작아진 것 같아요' },
          { id: 'fear16', word: '주눅 듦', desc: '기가 눌려 말이 잘 안 나와요' }
        ]
      }
    ],
    hidden: [
      { id: 'fearH1', word: '혼란스러움', desc: '무엇이 맞는지 머릿속이 뒤죽박죽이에요' },
      { id: 'fearH2', word: '당황함', desc: '예상 못 한 일에 머리가 하얘졌어요' },
      { id: 'fearH3', word: '불편함', desc: '그곳에 있는 것이 어딘가 거북해요' },
      { id: 'fearH4', word: '의심스러움', desc: '정말 그런지 믿기 어려워요' },
      { id: 'fearH5', word: '찜찜함', desc: '뭔가 개운하지 않게 남아 있어요' },
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
