/* 미니게임 모음 — 제목 화면에서 골라 언제든 다시 즐길 수 있는 게임들.
   생각하고 고르는 장면(성찰·기도·선택)은 이야기 안에서만 만나도록 넣지 않았습니다. */

window.ARCADE = {

  groups: [
    { day: 1, label: 'DAY 1 · 금요일' },
    { day: 'C', label: '가롤로의 하루 · 2005 밀라노' },
    { day: 2, label: 'DAY 2 · 토요일' },
    { day: 3, label: 'DAY 3 · 주일' },
    { day: 4, label: 'DAY 4 · 월요일' },
    { day: 5, label: 'DAY 5 · 화요일' },
    { day: 6, label: 'DAY 6 · 수요일' },
    { day: 7, label: 'DAY 7 · 목요일' },
    { day: 8, label: 'DAY 8 · 금요일' },
    { day: 'E', label: '에필로그 · 우리 본당' }
  ],

  /* kind: 액션 · 퍼즐 · 리듬 · 손놀이  /  late: 그날 후반부에 새로 들어간 게임 */
  games: [
    { key: 'StarCatchScene', day: 1, title: '별빛 모으기', kind: '액션', late: true, desc: '떨어지는 별빛을 등불로 받아요. 걱정 구름은 피하고!' },
    { key: 'HelpMomScene', day: 1, title: '설거지 도와드리기', kind: '손놀이', desc: '접시를 문질러 반짝반짝' },
    { key: 'WaterPlantScene', day: 1, title: '화분에 물주기', kind: '손놀이', desc: '물뿌리개를 끌어 천천히' },
    { key: 'HomeworkScene', day: 1, title: '숙제하기', kind: '액션', desc: '떠오르는 딴생각을 톡톡 옆으로' },
    { key: 'ShelfScene', day: 1, title: '책장 정리', kind: '퍼즐', desc: '바닥의 책을 책장에 꽂아요' },

    { key: 'FortressScene', day: 'C', title: '한 시간의 게임', kind: '액션', desc: '각도와 바람을 읽고 포탄을 쏘는 포격 게임' },
    { key: 'MiracleMapScene', day: 'C', title: '성체 기적 지도', kind: '퍼즐', desc: '기적 카드를 지도 위 나라에 놓아요' },
    { key: 'NightShareScene', day: 'C', title: '밤거리에서', kind: '손놀이', desc: '수프·침낭·빵을 필요한 사람에게' },

    { key: 'WayHomeScene', day: 2, title: '돌아가는 길', kind: '액션', late: true, desc: '해 질 녘 골목을 달려요. 웅덩이는 폴짝!' },
    { key: 'PrepareBagScene', day: 2, title: '나갈 준비', kind: '퍼즐', desc: '가방이 왜 이렇게 무겁지?' },
    { key: 'OrangeScene', day: 2, title: '굴러가는 귤', kind: '액션', desc: '쏟아진 귤을 같이 주워요' },
    { key: 'NoiseScene', day: 2, title: '마음의 소음', kind: '액션', desc: '눌러도 사라지지 않는 생각들' },
    { key: 'HeavyBagScene', day: 2, title: '무거운 가방', kind: '손놀이', desc: '오늘 하나만 내려놓기' },

    { key: 'GlassPuzzleScene', day: 3, title: '빛의 조각', kind: '퍼즐', late: true, desc: '흩어진 스테인드글라스를 밀어 맞춰요' },
    { key: 'ReadyScene', day: 3, title: '30분 전', kind: '액션', desc: '서둘러 나갈 준비!' },
    { key: 'LookAroundScene', day: 3, title: '기다리는 동안', kind: '손놀이', desc: '버스를 기다리며 둘러보기' },

    { key: 'OriginalScene', day: 4, title: '원본을 찾아라', kind: '퍼즐', late: true, desc: '똑같은 뒷모습들 사이에서 ‘나’를 찾아요' },
    { key: 'FeedScene', day: 4, title: '피드', kind: '손놀이', desc: '끝없이 넘어가는 화면' },
    { key: 'WordsScene', day: 4, title: '누가 원하는 걸까', kind: '퍼즐', desc: '내가 원하는 것, 남이 원하는 것' },
    { key: 'BrickScene', day: 4, title: '그 말들, 떨어뜨리기', kind: '액션', desc: '공을 튕겨 나를 덮은 말들을 깨요' },

    { key: 'HelloMatchScene', day: 5, title: '인사 짝 맞추기', kind: '퍼즐', late: true, desc: '세계의 인사와 그 나라 말을 짝지어요' },
    { key: 'WayScene', day: 5, title: '같이 가는 길', kind: '퍼즐', desc: '지도를 돌려 길을 찾아요' },
    { key: 'HelloScene', day: 5, title: 'HELLO, SEOUL!', kind: '손놀이', desc: '말이 통하지 않아도 인사' },
    { key: 'RhythmScene', day: 5, title: '우리의 리듬', kind: '리듬', desc: '무대에서 함께 박자를' },
    { key: 'MosaicScene', day: 5, title: '한 몸, 많은 지체', kind: '퍼즐', desc: '조각 하나를 붙여요' },
    { key: 'CourageScene', day: 5, title: '용기의 한 걸음', kind: '액션', desc: '발판 세 개면 충분해요' },

    { key: 'WaterShareScene', day: 6, title: '물 한 병의 나눔', kind: '액션', late: true, desc: '목마른 순례자에게 재빨리 물을!' },
    { key: 'PilgrimWalkScene', day: 6, title: '순례길', kind: '손놀이', desc: '함께 도착하기' },
    { key: 'ChurchQuestScene', day: 6, title: '성당 탐험', kind: '액션', desc: '성당 곳곳의 임무' },
    { key: 'CrosswordScene', day: 6, title: '주교님의 낱말퀴즈', kind: '퍼즐', desc: '교회 낱말을 채워요' },
    { key: 'OurSpotScene', day: 6, title: '우리 자리', kind: '손놀이', desc: '하룻밤짜리 동네 만들기' },
    { key: 'MorningScene', day: 6, title: '아침이다!', kind: '퍼즐', desc: '뒤섞인 물건에서 내 것 찾기' },

    { key: 'LinkHeartScene', day: 7, title: '마음 잇기', kind: '퍼즐', late: true, desc: '길을 돌려 나와 친구들을 이어요' },
    { key: 'ExplainScene', day: 7, title: '같이 풀어보자', kind: '퍼즐', desc: '설명하는 순서 만들기' },
    { key: 'NoticeScene', day: 7, title: '천천히 바라보기', kind: '퍼즐', desc: '오래 보아야 보이는 필요' },

    { key: 'MemoryWalkScene', day: 8, title: '일곱 날의 기억', kind: '리듬', late: true, desc: '빛나는 순서를 기억해 따라 눌러요' },
    { key: 'MyPathScene', day: 8, title: '나의 길', kind: '손놀이', desc: '어느 쪽으로 걸어도 하나의 길' },

    { key: 'PassScene', day: 'E', title: '축구 한 판', kind: '액션', desc: '공을 뺏고 차고, 골대는 없어요' },
    { key: 'JegiScene', day: 'E', title: '제기차기', kind: '액션', desc: '떨어지는 제기를 발로 톡' },
    { key: 'GonggiScene', day: 'E', title: '공기놀이', kind: '액션', desc: '튀어 오른 돌을 때맞춰 잡기' },
    { key: 'PoseScene', day: 'E', title: '사진 찍기', kind: '손놀이', desc: '다 같이 포즈!' },
    { key: 'TasteScene', day: 'E', title: '이거 먹어봐', kind: '손놀이', desc: '한국 간식 나눠 먹기' },
    { key: 'FollowScene', day: 'E', title: '가방을 찾아서', kind: '액션', desc: '같이 찾으면 금방' },
    { key: 'TwoWordsScene', day: 'E', title: '우리말, 너희말', kind: '퍼즐', desc: '한 단어씩 서로에게' }
  ],

  has: function (key) { return this.games.some(function (g) { return g.key === key; }); },
  get: function (key) { return this.games.find(function (g) { return g.key === key; }) || null; }
};

/* 그날 후반부에 넣은 새 게임 — 이야기 장면이 시작될 때 한 번 끼어듭니다.
   이미 했으면 다시 끼어들지 않고(이어서 걷기 등), 그날을 처음부터 다시 걸으면 다시 나옵니다. */
window.Interlude = {
  run: function (scene, key, intro) {
    const flag = 'interlude.' + key;
    if (SaveSystem.get(flag, false)) return false;
    /* 장면이 다 만들어진 뒤 첫 프레임에 띄우고, 이야기는 그동안 멈춰 둡니다 */
    scene.events.once('update', function () {
      SaveSystem.set(flag, true);
      scene.scene.launch(key, { from: scene.scene.key, interlude: true, intro: intro || null });
      scene.scene.pause();
    });
    return true;
  },
  /* 그날을 다시 걸으면 그날의 끼어드는 게임도 다시 */
  resetDay: function (day) {
    const d = SaveSystem.data;
    if (!d.interlude) return;
    ARCADE.games.forEach(function (g) { if (g.late && g.day === day) delete d.interlude[g.key]; });
    SaveSystem.save();
  }
};
