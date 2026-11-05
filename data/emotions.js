/*
  ───────────────────────────────────────────────
  감정 단어 파일 (emotions.js)
  ───────────────────────────────────────────────
  - 따옴표 ' ' 안의 글자만 고치세요.
  - id: '...' 부분은 절대 고치지 마세요. (기록과 도감이 이 이름표로 연결돼요)
  - word  = 감정 이름
  - desc  = 버튼 아래 작게 나오는 설명
  - 각 묶음(groups)은 화면 한 장에 나오는 감정 4개예요. 묶음마다 꼭 4개를 유지하세요.
  - 묶음은 4개보다 많아도 돼요. 묶음 고르기 화면에 4개씩 나오고,
    5번 "다른 묶음 더 보기"를 누르면 다음 묶음 4개가 나와요.
  - 뜻이 아주 비슷한 단어는 서로 다른 묶음에 넣어 주세요. (docs/emotion-words-research.md 4번 참고)
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
          { id: 'joy04', word: '짜릿함', desc: '순간 온몸이 찌릿할 만큼 좋아요' },
          { id: 'joy17', word: '재미있음', desc: '웃음이 절로 나올 만큼 즐거워요' }
        ]
      },
      {
        label: '편안하고 마음이 놓여요',
        hint: '걱정이 내려간 느낌',
        emotions: [
          { id: 'joy05', word: '편안함', desc: '몸과 마음에 불편한 곳이 없어요' },
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
          { id: 'joy12', word: '자신 있음', desc: '이번엔 잘할 수 있을 것 같아요' },
          { id: 'joy18', word: '보람', desc: '내가 한 일이 누군가에게 도움이 돼 기뻐요' },
          { id: 'joy19', word: '의욕', desc: '무언가 해 보고 싶은 힘이 솟아요' }
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
      },
      {
        label: '궁금하고 빠져들어요',
        hint: '더 알고 싶은 느낌',
        emotions: [
          { id: 'joy20', word: '흥미로움', desc: '더 알아보고 싶을 만큼 마음이 끌려요' },
          { id: 'joy21', word: '궁금함', desc: '어떻게 된 건지 답을 알고 싶어요' },
          { id: 'joy22', word: '몰입됨', desc: '시간 가는 줄 모르고 푹 빠져 있어요' },
          { id: 'joy23', word: '신선함', desc: '처음 겪는 일이라 새롭고 산뜻해요' }
        ]
      },
      {
        label: '놀랍고 감탄스러워요',
        hint: '"와!" 하는 느낌',
        emotions: [
          { id: 'joy24', word: '신기함', desc: '어떻게 이럴 수 있지 싶어 눈이 동그래져요' },
          { id: 'joy25', word: '감탄', desc: '정말 대단해서 "와" 소리가 절로 나요' },
          { id: 'joy26', word: '황홀함', desc: '너무 아름다워 넋을 놓고 바라봐요' },
          { id: 'joy27', word: '존경스러움', desc: '그 사람이 대단해 닮고 싶어요' }
        ]
      },
      {
        label: '기쁘고 자랑스러워요',
        hint: '좋은 소식을 들은 느낌',
        emotions: [
          { id: 'joy28', word: '기쁨', desc: '바라던 일이 이루어져 마음이 환해요' },
          { id: 'joy10', word: '자랑스러움', desc: '누군가에게 보여 주고 싶을 만큼 좋아요' },
          { id: 'joy11', word: '당당함', desc: '고개를 들고 내 모습 그대로 있어도 돼요' },
          { id: 'joy03', word: '들뜸', desc: '마음이 붕 떠서 가만있기 어려워요' }
        ]
      },
      {
        label: '행복하고 사랑스러워요',
        hint: '마음이 꽉 차는 느낌',
        emotions: [
          { id: 'joy29', word: '행복함', desc: '지금 이대로 참 좋다고 느껴요' },
          { id: 'joy30', word: '만족스러움', desc: '이만하면 충분해서 더 바랄 게 없어요' },
          { id: 'joy31', word: '사랑스러움', desc: '너무 소중하고 예뻐 꼭 안아 주고 싶어요' },
          { id: 'joy32', word: '정다움', desc: '서로 마음이 가까워 함께 있는 게 좋아요' }
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
    hint: '서운했다, 미안했다, 힘이 빠졌다',
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
          { id: 'sad17', word: '서러움', desc: '나만 홀로 힘든 것 같아 눈물이 북받쳐요' }
        ]
      },
      {
        label: '실망하고 힘이 빠져요',
        hint: '바라던 대로 되지 않은 느낌',
        emotions: [
          { id: 'sad05', word: '실망', desc: '바라던 대로 되지 않아 마음이 내려앉아요' },
          { id: 'sad06', word: '허탈함', desc: '애쓴 것이 한순간에 사라진 것 같아요' },
          { id: 'sad07', word: '아쉬움', desc: '조금만 더 했으면 하는 마음이 남아요' },
          { id: 'sad18', word: '좌절감', desc: '애써도 안 돼서 주저앉고 싶어요' }
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
          { id: 'sad15', word: '우울함', desc: '마음이 오래 가라앉아 있어요' },
          { id: 'sad16', word: '막막함', desc: '어디서부터 해야 할지 모르겠어요' },
          { id: 'sad19', word: '절망감', desc: '아무리 봐도 나아질 길이 안 보여요' }
        ]
      },
      {
        label: '미안하고 내 탓 같아요',
        hint: '잘못한 것 같은 느낌',
        emotions: [
          { id: 'sad20', word: '죄책감', desc: '내 잘못으로 누군가 힘들어져 마음이 무거워요' },
          { id: 'sad21', word: '자책감', desc: '"다 내 탓이야" 하며 나를 계속 꾸짖어요' },
          { id: 'sad22', word: '면목 없음', desc: '그 사람 얼굴을 볼 낯이 없어요' },
          { id: 'sad23', word: '양심이 찔림', desc: '작은 잘못이 생각나 마음이 콕콕 찔려요' }
        ]
      },
      {
        label: '부럽고 작아져요',
        hint: '남과 비교되는 느낌',
        emotions: [
          { id: 'sad24', word: '부러움', desc: '남이 가진 것을 나도 갖고 싶어요' },
          { id: 'sad25', word: '열등감', desc: '남과 비교하면 내가 못나 보여요' },
          { id: 'sad26', word: '박탈감', desc: '남들은 다 받는데 나만 못 받은 것 같아요' },
          { id: 'sad27', word: '샘남', desc: '나보다 잘되는 게 은근히 싫어요' }
        ]
      },
      {
        label: '시들하고 재미없어요',
        hint: '마음이 식은 느낌',
        emotions: [
          { id: 'sad28', word: '지루함', desc: '하는 일이 재미없고 시간이 안 가요' },
          { id: 'sad29', word: '시큰둥함', desc: '무엇을 봐도 별로 마음이 안 움직여요' },
          { id: 'sad08', word: '김빠짐', desc: '신났던 마음이 갑자기 식었어요' },
          { id: 'sad14', word: '무기력', desc: '아무것도 하고 싶지 않아요' }
        ]
      },
      {
        label: '슬프고 먹먹해요',
        hint: '눈물이 날 것 같은 느낌',
        emotions: [
          { id: 'sad30', word: '슬픔', desc: '마음이 아래로 가라앉고 울고 싶어요' },
          { id: 'sad04', word: '쓸쓸함', desc: '조용하고 텅 빈 느낌이 들어요' },
          { id: 'sad31', word: '안타까움', desc: '돕고 싶은데 어쩔 수 없어 마음이 쓰여요' },
          { id: 'sad32', word: '먹먹함', desc: '슬픔이 차올라 목이 메고 말이 안 나와요' }
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
    hint: '짜증 났다, 억울했다, 싫었다',
    emoji: '🔥',
    color: '#D9473A',
    groups: [
      {
        label: '짜증 나고 답답해요',
        hint: '신경이 곤두서는 느낌',
        emotions: [
          { id: 'ang01', word: '짜증', desc: '작은 일에도 신경이 곤두서요' },
          { id: 'ang02', word: '답답함', desc: '말이 통하지 않아 가슴이 막혀요' },
          { id: 'ang17', word: '어이없음', desc: '말이 안 되는 일이라 기가 막혀요' },
          { id: 'ang16', word: '불쾌함', desc: '기분이 상해서 찝찝해요' }
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
          { id: 'ang18', word: '푸대접받은 느낌', desc: '나만 소홀히 대해서 화가 나요' }
        ]
      },
      {
        label: '속이 부글부글 끓어요',
        hint: '화가 올라오는 느낌',
        emotions: [
          { id: 'ang13', word: '부글부글함', desc: '화가 속에서 계속 끓어올라요' },
          { id: 'ang14', word: '울컥함', desc: '갑자기 화가 확 치밀어요' },
          { id: 'ang15', word: '약오름', desc: '놀림받은 것 같아 분해요' },
          { id: 'ang19', word: '분노', desc: '참기 어려울 만큼 크게 화가 나요' }
        ]
      },
      {
        label: '싫고 역겨워요',
        hint: '멀리 밀어내고 싶은 느낌',
        emotions: [
          { id: 'ang20', word: '역겨움', desc: '속이 메스꺼울 만큼 싫어요' },
          { id: 'ang21', word: '징그러움', desc: '보기만 해도 몸이 움찔할 만큼 싫어요' },
          { id: 'ang22', word: '정떨어짐', desc: '그 사람에게 마음이 싹 식었어요' },
          { id: 'ang23', word: '한심함', desc: '하는 모습이 못나고 하찮아 보여요' }
        ]
      },
      {
        label: '귀찮고 하기 싫어요',
        hint: '억지로 끌려가는 느낌',
        emotions: [
          { id: 'ang03', word: '귀찮음', desc: '하기 싫은 일이 자꾸 생겨요' },
          { id: 'ang24', word: '반항심', desc: '시키는 대로 하기 싫어 맞서고 싶어요' },
          { id: 'ang25', word: '간섭받는 느낌', desc: '내 일에 자꾸 끼어들어 싫어요' },
          { id: 'ang26', word: '떠밀린 느낌', desc: '내 뜻과 상관없이 억지로 끌려가요' }
        ]
      },
      {
        label: '얄밉고 거슬려요',
        hint: '그 사람 행동이 눈에 거슬리는 느낌',
        emotions: [
          { id: 'ang27', word: '얄미움', desc: '제 잇속만 챙기는 모습이 밉게 보여요' },
          { id: 'ang12', word: '얕보인 느낌', desc: '나를 쉽게 여긴다는 생각이 들어요' },
          { id: 'ang04', word: '성가심', desc: '자꾸 방해받아 거슬려요' },
          { id: 'ang28', word: '심술남', desc: '괜히 남을 골탕 먹이고 싶어요' }
        ]
      }
    ],
    hidden: [
      { id: 'angH1', word: '질투', desc: '내 사람이나 자리를 빼앗길 것 같아 속상해요' },
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
    hint: '걱정됐다, 창피했다, 깜짝 놀랐다',
    emoji: '🌀',
    color: '#7B5BD0',
    groups: [
      {
        label: '걱정되고 두려워요',
        hint: '앞일이 마음 쓰이는 느낌',
        emotions: [
          { id: 'fear01', word: '걱정', desc: '나쁜 일이 생길까 봐 마음이 쓰여요' },
          { id: 'fear07', word: '두려움', desc: '앞으로 닥칠 큰일이 겁나 마음이 무거워요' },
          { id: 'fear17', word: '망설여짐', desc: '할까 말까 정하지 못해 마음이 왔다 갔다 해요' },
          { id: 'fear21', word: '조심스러움', desc: '실수할까 봐 하나하나 살피게 돼요' }
        ]
      },
      {
        label: '무섭고 소름 끼쳐요',
        hint: '피하고 싶은 느낌',
        emotions: [
          { id: 'fear05', word: '무서움', desc: '다칠 것 같아 피하고 싶어요' },
          { id: 'fear08', word: '오싹함', desc: '등이 서늘해지고 소름이 돋아요' },
          { id: 'fear19', word: '끔찍함', desc: '너무 나쁜 장면이라 다시 떠올리기도 싫어요' },
          { id: 'fear20', word: '도망치고 싶음', desc: '그 자리를 당장 벗어나고 싶어요' }
        ]
      },
      {
        label: '긴장되고 부담돼요',
        hint: '잘해야 한다는 느낌',
        emotions: [
          { id: 'fear09', word: '긴장됨', desc: '몸과 마음이 팽팽하게 당겨져요' },
          { id: 'fear10', word: '부담감', desc: '해야 할 일이 어깨를 누르는 것 같아요' },
          { id: 'fear03', word: '조마조마함', desc: '결과를 기다리며 마음을 졸여요' },
          { id: 'fear18', word: '두근거림', desc: '심장이 쿵쿵 뛰어 숨이 가빠요' }
        ]
      },
      {
        label: '창피하고 부끄러워요',
        hint: '얼굴이 화끈한 느낌',
        emotions: [
          { id: 'fear13', word: '창피함', desc: '다른 사람 앞에서 얼굴이 화끈거려요' },
          { id: 'fear14', word: '민망함', desc: '어색한 상황이라 눈 둘 곳을 모르겠어요' },
          { id: 'fear22', word: '쑥스러움', desc: '칭찬이나 관심을 받아 낯이 간지러워요' },
          { id: 'fear23', word: '수치심', desc: '나라는 사람 자체가 부끄러워 숨고 싶어요' }
        ]
      },
      {
        label: '깜짝 놀랐어요',
        hint: '갑자기 마음이 덜컥한 느낌',
        emotions: [
          { id: 'fear24', word: '깜짝 놀람', desc: '갑작스러운 일에 몸이 움찔했어요' },
          { id: 'fear25', word: '철렁함', desc: '나쁜 소식에 가슴이 덜컥 내려앉아요' },
          { id: 'fear26', word: '어리둥절함', desc: '무슨 일인지 몰라 멍하니 두리번거려요' },
          { id: 'fear27', word: '얼어붙음', desc: '놀라서 몸이 꼼짝도 안 해요' }
        ]
      },
      {
        label: '자신 없고 움츠러들어요',
        hint: '작아지는 느낌',
        emotions: [
          { id: 'fear06', word: '겁남', desc: '해 보기도 전에 움츠러들어요' },
          { id: 'fear15', word: '위축됨', desc: '내가 작아진 것 같아요' },
          { id: 'fear28', word: '자신 없음', desc: '내가 잘 해낼 수 있을지 믿기지 않아요' },
          { id: 'fear29', word: '어색함', desc: '처음 보는 사람이나 곳이라 낯설고 서먹해요' }
        ]
      },
      {
        label: '쫓기고 숨 막혀요',
        hint: '몰아붙이는 느낌',
        emotions: [
          { id: 'fear11', word: '압박감', desc: '잘해야 한다는 생각에 숨이 막혀요' },
          { id: 'fear02', word: '초조함', desc: '시간이 가는 게 조급하고 불안해요' },
          { id: 'fear16', word: '주눅 듦', desc: '기가 눌려 말이 잘 안 나와요' },
          { id: 'fear30', word: '몰린 느낌', desc: '사방에서 다그쳐 빠져나갈 곳이 없어요' }
        ]
      },
      {
        label: '불안하고 가만있기 힘들어요',
        hint: '마음이 놓이지 않는 느낌',
        emotions: [
          { id: 'fear31', word: '불안함', desc: '무엇 때문인지 몰라도 마음이 놓이지 않아요' },
          { id: 'fear04', word: '안절부절', desc: '가만히 있지 못하고 서성여요' },
          { id: 'fear12', word: '떨림', desc: '손이나 목소리가 떨려요' },
          { id: 'fear32', word: '예민함', desc: '작은 일에도 마음이 쉽게 흔들려요' }
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
