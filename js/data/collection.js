/* 수집하는 말씀 카드 — 카를로 아쿠티스의 말, 성경 말씀, 성인 성녀의 말씀.
   짧게 인용하고 출처를 함께 적습니다. */

window.COLLECTION = {

  cats: {
    carlo:  { name: '카를로의 말',   color: '#c9553f', icon: '✝' },
    bible:  { name: '성경 말씀',     color: '#3f6f8f', icon: '📖' },
    saints: { name: '성인 성녀의 말', color: '#7a5f8a', icon: '✧' },
    journey: { name: '여행의 문장', color: '#4f7d6a', icon: '✎' }
  },

  cards: [
    /* ── 카를로 아쿠티스 ─────────────────────── */
    { id: 'c1', day: 1, cat: 'carlo', text: '항상 예수님과 함께 있는 것,\n이것이 나의 인생 계획입니다.',
      from: '성 카를로 아쿠티스', where: '카를로와 메시지를 주고받았을 때' },
    { id: 'c2', day: 2, cat: 'carlo', text: '성체는 천국으로 가는\n고속도로입니다.',
      from: '성 카를로 아쿠티스', where: '성당에서 성체등을 바라보았을 때' },
    { id: 'c3', day: 1, cat: 'carlo', text: '모든 사람은 원본으로 태어나지만,\n많은 이가 복사본으로 죽습니다.',
      from: '성 카를로 아쿠티스', where: '성인이 뭐냐고 물어보았을 때' },
    { id: 'c4', day: 2, cat: 'carlo', text: '나 말고, 하느님.',
      from: '성 카를로 아쿠티스', where: 'DAY 2를 마쳤을 때' },
    { id: 'c5', day: 1, cat: 'carlo', text: '슬픔은 자기 자신을 바라보는 것이고,\n행복은 하느님을 바라보는 것입니다.',
      from: '성 카를로 아쿠티스', where: '기도가 잘 안 된다고 말했을 때' },
    { id: 'c10', day: 1, cat: 'carlo', text: '우리가 성체를 모실수록\n우리는 예수님을 닮아갑니다.',
      from: '성 카를로 아쿠티스', where: '미사가 지루하다고 말했을 때' },
    { id: 'c11', day: 1, cat: 'carlo', text: '천 번의 전투에서 이긴다 한들\n자기 자신을 이기지 못한다면\n무슨 소용이 있겠습니까?',
      from: '성 카를로 아쿠티스', where: '카를로에게 컴퓨터 이야기를 물었을 때' },

    { id: 'c6', day: 99, cat: 'carlo', text: '햇볕 앞에 있으면 살갗이 타고,\n성체 앞에 있으면\n성인이 됩니다.',
      from: '성 카를로 아쿠티스', where: '카를로의 하루 — 아침, 성체 앞에 앉았을 때' },
    { id: 'c7', day: 99, cat: 'carlo', text: '사람들은 몸을 가꾸는 데는\n그렇게 마음을 쓰면서,\n영혼을 가꾸는 데는\n마음을 쓰지 않습니다.',
      from: '성 카를로 아쿠티스', where: '카를로의 하루 — 게임기를 끄던 순간' },
    { id: 'c8', day: 99, cat: 'carlo', text: '우리의 목표는 무한이어야 합니다.\n무한이 우리의 고향입니다.',
      from: '성 카를로 아쿠티스', where: '카를로의 하루 — 마지막 밤하늘 아래' },
    { id: 'c9', day: 99, cat: 'carlo', text: '저는 제 삶을 단 1분도\n헛되이 쓰지 않았습니다.',
      from: '성 카를로 아쿠티스', where: '카를로의 하루를 끝까지 함께 걸었을 때' },

    /* ── 성경 ────────────────────────────────── */
    { id: 'b1', day: 1, cat: 'bible', text: '용기를 내어라.\n내가 세상을 이겼다.',
      from: '요한 16,33', where: 'DAY 1을 마쳤을 때' },
    { id: 'b2', day: 1, cat: 'bible', text: '고생하며 무거운 짐을 진 너희는\n모두 나에게 오너라.',
      from: '마태 11,28', where: '시끄러운 알림을 내려놓았을 때' },
    { id: 'b3', day: 1, cat: 'bible', text: '그러므로 내일을 걱정하지 마라.',
      from: '마태 6,34', where: '파도가 왔다 가는 것을 지켜보았을 때' },
    { id: 'b4', day: 1, cat: 'bible', text: '주님은 나의 목자,\n나에게 아쉬울 것 없어라.',
      from: '시편 23,1', where: '책장을 정리하다 무언가를 찾았을 때' },
    { id: 'b5', day: 1, cat: 'bible', text: '나는 너희를 친구라고 불렀다.',
      from: '요한 15,15', where: '벤치에서 카를로와 이야기를 마쳤을 때' },
    { id: 'b6', day: 1, cat: 'bible', text: '당신께서 저를 놀랍고 신비롭게\n지으셨으니 당신을 찬송하나이다.',
      from: '시편 139,14', where: '지난 여름 사진을 들여다보았을 때' },
    { id: 'b7', day: 1, cat: 'bible', text: '너희의 빛이 사람들 앞을 비추어,\n그들이 하늘에 계신 아버지를 찬양하게 하여라.',
      from: '마태 5,16', where: '가족의 말을 끝까지 들었을 때' },
    { id: 'b8', day: 1, cat: 'bible', text: '하늘은 하느님의 영광을 이야기하고\n창공은 그분의 솜씨를 알려준다.',
      from: '시편 19,2', where: '밤하늘을 올려다보았을 때' },

    { id: 'b9', day: 99, cat: 'bible', text: '너희가 내 형제들인\n이 가장 작은 이들 가운데\n한 사람에게 해 준 것이\n바로 나에게 해 준 것이다.',
      from: '마태 25,40', where: '카를로의 하루 — 밤거리에서 따뜻한 것을 나누었을 때' },
    { id: 'b10', day: 99, cat: 'bible', text: '벗을 위하여 목숨을 내놓는 것보다\n더 큰 사랑은 없다.',
      from: '요한 15,13', where: '카를로의 하루 — 괴롭힘 당하는 친구 곁에 섰을 때' },
    { id: 'b11', day: 99, cat: 'bible', text: '와서 보아라.',
      from: '요한 1,39', where: '카를로의 하루 — 성체 기적을 지도에 모았을 때' },

    /* ── 성인 성녀 ───────────────────────────── */
    { id: 's1', day: 1, cat: 'saints', text: '당신 안에 쉬기까지\n저희 마음은 안식이 없나이다.',
      from: '성 아우구스티노', where: '하느님이 계신지 물어보았을 때' },
    { id: 's2', day: 1, cat: 'saints', text: '우리는 큰일을 할 수 없습니다.\n다만 큰 사랑으로 작은 일을 할 뿐입니다.',
      from: '성녀 마더 데레사', where: '설거지를 도왔을 때' },
    { id: 's3', day: 1, cat: 'saints', text: '주님, 저를 당신 평화의 도구로 써 주소서.',
      from: '평화를 구하는 기도', where: '오랜만에 묵주를 손에 쥐었을 때' },
    { id: 's4', day: 1, cat: 'saints', text: '사랑은 모든 것을 할 수 있게 합니다.',
      from: '성녀 소화 데레사', where: '화분에 물을 주었을 때' },
    { id: 's5', day: 1, cat: 'saints', text: '두려워하지 마십시오.',
      from: '성 요한 바오로 2세', where: '넓은 바다 앞에 앉았을 때' },
    { id: 's6', day: 1, cat: 'saints', text: '모든 것을 하느님의 더 큰 영광을 위하여.',
      from: '성 이냐시오 데 로욜라', where: '숙제를 끝까지 해냈을 때' },
    { id: 's7', day: 1, cat: 'saints', text: '기쁘게 지내십시오.\n제가 바라는 것은 그것뿐입니다.',
      from: '성 필립보 네리', where: '오래된 게임기를 발견했을 때' },
    { id: 's8', day: 99, cat: 'saints', text: '거룩함은 언제나\n기쁘게 지내는 것입니다.',
      from: '성 요한 보스코', where: '카를로의 하루 — 한 시간의 게임을 마쳤을 때' },

    /* DAY 2 */
    { id: 'b13', day: 2, cat: 'bible', text: '두려워하지 마라, 내가 너와 함께 있다.',
      from: '이사 41,10', where: '공원 벤치 아래에서' },
    { id: 'b12', day: 2, cat: 'bible', text: '여러분의 모든 걱정을 그분께 내맡기십시오.\n그분께서 여러분을 돌보고 계십니다.',
      from: '1베드 5,7', where: '무거운 돌 하나를 내려놓았을 때' },
    { id: 's9', day: 2, cat: 'saints', text: '기도하고, 바라고,\n걱정하지 마십시오.',
      from: '성 비오 신부', where: '편의점에서 따뜻한 말을 건넸을 때' },
    { id: 'j1', day: 2, cat: 'journey', text: '오늘은 하나면 됐어.',
      from: '여행의 문장', where: '유해 앞에서 기도를 마쳤을 때' }
  ],

  get: function (id) { return this.cards.find(function (c) { return c.id === id; }); },

  byDay: function (day) { return this.cards.filter(function (c) { return (c.day === undefined ? 1 : c.day) === day; }); },

  days: function () {
    const set = {};
    this.cards.forEach(function (c) { set[c.day === undefined ? 1 : c.day] = true; });
    return Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
  }
};
