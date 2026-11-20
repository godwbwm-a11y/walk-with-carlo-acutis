/* 주인공 — 처음 걸을 때 셋 가운데 한 명을 고릅니다.
   이름은 옷 색에서 따왔고, 고르는 화면과 대사 어디에도 성별을 가리키는 말을 쓰지 않습니다.
   이야기 속의 주인공은 언제나 ‘나’입니다. */

window.HEROES = [
  { id: 'sky', name: '하늘', tag: '하늘색 줄무늬 티 · 짧은 머리', ring: '#2f6b8f',
    look: { skin: 0xf6d3b0, hair: 0x33261f, shirt: 0xa8d4e6, pants: 0x3f5a80, shoes: 0xffffff, stripe: 0xffffff } },
  { id: 'sun', name: '해바라기', tag: '노란 티 · 하나로 묶은 긴 머리', ring: '#c98a1f',
    look: { skin: 0xf3cba6, hair: 0x3b261c, shirt: 0xf5cf63, pants: 0x6f8fb8, shoes: 0xf0907e, hairStyle: 'ponytail', eye: 0x4a3020 } },
  { id: 'wood', name: '숲', tag: '초록 후드티 · 부스스한 단발', ring: '#4f7a5c',
    look: { skin: 0xe8b994, hair: 0x5a3b2a, shirt: 0x8fb39a, pants: 0xcdb894, shoes: 0x5b4a42, hairStyle: 'shag', hoodie: true, longSleeve: true } }
];
