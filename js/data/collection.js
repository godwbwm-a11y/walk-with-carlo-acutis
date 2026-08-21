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
    { id: 'c1', day: 1, also: [3], cat: 'carlo', text: '항상 예수님과 함께 있는 것,\n이것이 나의 인생 계획입니다.',
      from: '성 카를로 아쿠티스', where: '카를로와 메시지를 주고받았을 때' },
    { id: 'c2', day: 2, also: [3], cat: 'carlo', text: '성체는 천국으로 가는\n고속도로입니다.',
      from: '성 카를로 아쿠티스', where: '성당에서 성체등을 바라보았을 때' },
    { id: 'c3', day: 1, also: [4], cat: 'carlo', text: '모든 사람은 원본으로 태어나지만,\n많은 이가 복사본으로 죽습니다.',
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
    { id: 'b6', day: 1, also: [4], cat: 'bible', text: '당신께서 저를 놀랍고 신비롭게\n지으셨으니 당신을 찬송하나이다.',
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
    { id: 'b12', day: 2, also: [8], cat: 'bible', text: '여러분의 모든 걱정을 그분께 내맡기십시오.\n그분께서 여러분을 돌보고 계십니다.',
      from: '1베드 5,7', where: '무거운 돌 하나를 내려놓았을 때' },
    { id: 's9', day: 2, cat: 'saints', text: '기도하고, 바라고,\n걱정하지 마십시오.',
      from: '성 비오 신부', where: '편의점에서 따뜻한 말을 건넸을 때' },
    { id: 'j1', day: 2, cat: 'journey', text: '오늘은 하나면 됐어.',
      from: '여행의 문장', where: '유해 앞에서 기도를 마쳤을 때' },

    /* DAY 3 */
    { id: 'b14', day: 3, cat: 'bible', text: '내 안에 머물러라.\n나도 너희 안에 머무르겠다.',
      from: '요한 15,4', where: '버스를 기다리던 정류장에서' },
    { id: 'b15', day: 3, cat: 'bible', text: '내 살을 먹고 내 피를 마시는 사람은\n내 안에 머무르고,\n나도 그 사람 안에 머무른다.',
      from: '요한 6,56', where: '미사가 끝난 빈 성당에서' },
    { id: 's10', day: 3, cat: 'saints', text: '당신께서는 제 안에 계셨습니다.\n그런데 저는 밖에서 당신을 찾았습니다.',
      from: '성 아우구스티노 「고백록」', where: '공원의 작은 책장에서' },
    { id: 'j2', day: 3, cat: 'journey', text: '그냥 함께 있어도 됩니다.',
      from: '여행의 문장', where: '아무것도 하지 않고 머물러 본 뒤' },

    /* DAY 4 */
    { id: 'j3', day: 4, cat: 'journey', text: '다른 사람이 빛난다고\n내가 어두워지는 것은 아니다.',
      from: '여행의 문장', where: '아침 SNS 를 멈추었을 때' },
    { id: 'b16', day: 4, cat: 'bible', text: '우리는 하느님의 작품입니다.',
      from: '에페 2,10', where: '교실에서 시험지를 접었을 때' },
    { id: 's11', day: 4, cat: 'saints', text: '우리는 우리의 나약함과\n실패의 총합이 아닙니다.',
      from: '성 요한 바오로 2세', where: '혼자 있던 친구와 매점에 갔을 때' },
    { id: 'j4', day: 4, cat: 'journey', text: '내가 가진 좋은 것은\n누군가에게 줄 수 있는 선물이다.',
      from: '여행의 문장', where: '석양 아래에서 받은 것을 헤아렸을 때' },

    /* DAY 5 */
    { id: 'b17', day: 5, cat: 'bible', text: '우리도 수가 많지만\n그리스도 안에서 한 몸을 이루면서\n서로 서로 지체가 됩니다.',
      from: '로마 12,5', where: '지하철에서 길을 함께 찾았을 때' },
    { id: 'j5', day: 5, cat: 'journey', text: '낯선 사람은\n아직 모르는 친구일 수도 있다.',
      from: '여행의 문장', where: '먼저 인사를 건네 보았을 때' },
    { id: 's12', day: 5, cat: 'saints', text: '두려워하지 마십시오!\n그리스도께 문을 활짝 여십시오!',
      from: '성 요한 바오로 2세', where: '화해의 공원을 지날 때' },
    { id: 'c12', day: 5, cat: 'carlo', text: '우리의 목표는 유한한 것이 아니라\n무한한 것이어야 합니다.',
      from: '성 카를로 아쿠티스', where: '성소 박람회의 디지털 전시에서' },
    { id: 'b18', day: 5, cat: 'bible', text: '용기를 내어라.\n내가 세상을 이겼다.',
      from: '요한 16,33', where: '개막미사가 끝난 뒤' },
    { id: 'j6', day: 5, cat: 'journey', text: '용기는 두려움이 없는 것이 아니라,\n두려워도 한 걸음 걷는 것이다.',
      from: '여행의 문장', where: '밤의 서울에서 한 걸음 내디뎠을 때' },

    /* DAY 6 */
    { id: 'b19', day: 6, cat: 'bible', text: '서로 남의 짐을 져 주십시오.',
      from: '갈라 6,2', where: '순례길에서 누군가의 가방을 함께 들었을 때' },
    { id: 'j7', day: 6, cat: 'journey', text: '헤어지는 것이 아쉬운 건,\n함께한 시간이 좋았기 때문이다.',
      from: '여행의 문장', where: '순례길에서 조용해졌을 때' },
    { id: 'c13', day: 6, cat: 'carlo', text: '삶은 하느님을 모든 것 위에 사랑하고\n이웃을 자기 자신처럼 사랑할 때\n비로소 참으로 아름답습니다.',
      from: '성 카를로 아쿠티스', where: '밤샘기도가 끝난 별 아래에서' },
    { id: 's13', day: 6, cat: 'saints', text: '저의 소명은 사랑입니다.\n교회의 심장 안에서\n저는 사랑이 되겠습니다.',
      from: '성녀 아기 예수의 데레사', where: '밤샘기도를 마쳤을 때' },
    { id: 'b20', day: 6, cat: 'bible', text: '평화가 너희와 함께!\n아버지께서 나를 보내신 것처럼\n나도 너희를 보낸다.',
      from: '요한 20,21', where: '파견미사 뒤 친구들과 헤어졌을 때' },
    { id: 'j8', day: 6, cat: 'journey', text: 'WYD 는 끝났다.\n하지만 이제 내가 살아갈 차례다.',
      from: '여행의 문장', where: '나의 파견을 정했을 때' },

    /* DAY 7 */
    { id: 'b21', day: 7, cat: 'bible', text: '저마다 받은 은사에 따라\n서로를 위하여 봉사하십시오.',
      from: '1베드 4,10', where: '교실에서 친구에게 설명해준 뒤' },
    { id: 'j9', day: 7, cat: 'journey', text: '잘하는 것이 없어 보이는 날에도\n나눌 것은 있다.',
      from: '여행의 문장', where: '교실 뒤 게시판을 살펴보았을 때' },
    { id: 'c14', day: 7, cat: 'carlo', text: '삶은 선물입니다.\n이 세상에 있는 동안 우리는\n사랑을 더욱 키울 수 있기 때문입니다.',
      from: '성 카를로 아쿠티스', where: '컴퓨터를 끄고 화면이 어두워졌을 때' },
    { id: 's14', day: 7, cat: 'saints', text: '사랑은 무한히 창의적입니다.',
      from: '성 빈첸시오 아 바오로', where: '동네 공원 벤치 옆에서' },
    { id: 'b22', day: 7, cat: 'bible', text: '너희의 빛이 사람들 앞을 비추어,\n그들이 너희의 착한 행실을 보고\n하늘에 계신 너희 아버지를 찬양하게 하여라.',
      from: '마태 5,16', where: '누군가를 도운 뒤 길가에서' },
    { id: 'j10', day: 7, cat: 'journey', text: '내가 받은 것은 나만을 위한 것이 아니다.\n누군가에게 닿을 때 선물이 된다.',
      from: '여행의 문장', where: '석양 아래에서 받은 것과 사람을 이었을 때' },

    /* ── DAY 8 · 이제 내가 걷는다 ─────────────── */
    { id: 'j11', day: 8, cat: 'journey', text: '옆에 아무도 없는 날에도\n나는 그대로 걸을 수 있다.',
      from: '여행의 문장', where: '혼자서 친구에게 먼저 말을 걸었을 때' },
    { id: 'b23', day: 8, cat: 'bible', text: '보라, 내가 세상 끝 날까지\n언제나 너희와 함께 있겠다.',
      from: '마태 28,20', where: '마지막 꿈에서 헤어지던 바닷가에서' },
    { id: 'j12', day: 8, cat: 'journey', text: '나의 인생 계획은\n크지 않아도 괜찮다.\n오늘 걸을 수 있는 한 걸음이면 된다.',
      from: '여행의 문장', where: '나의 길을 스스로 그려보았을 때' }
  ],

  get: function (id) { return this.cards.find(function (c) { return c.id === id; }); },

  byDay: function (day) {
    return this.cards.filter(function (c) {
      const home = (c.day === undefined ? 1 : c.day);
      return home === day || (c.also && c.also.indexOf(day) !== -1);
    });
  },

  days: function () {
    const set = {};
    this.cards.forEach(function (c) {
      set[c.day === undefined ? 1 : c.day] = true;
      if (c.also) c.also.forEach(function (d) { set[d] = true; });
    });
    return Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
  }
};
