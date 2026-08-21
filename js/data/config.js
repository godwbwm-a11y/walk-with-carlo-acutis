/* 게임 전역 상수 — 색, 글자, 화면 규격 */

window.GAME = {
  WIDTH: 390,
  HEIGHT: 844,
  TITLE: '오늘, 카를로 아쿠티스와 함께 걷습니다',
  CORE_LINE: '“항상 예수님과 함께 있는 것,\n이것이 나의 인생 계획입니다.”',
  SAVE_KEY: 'carlo_walk_save_v1',

  /* 저작권과 이용 안내 — 제목 화면 아래에 늘 보입니다 */
  COPYRIGHT: '© 2026 Young is Young',
  LICENSE: '모든 신자가 자유롭게 사용하실 수 있습니다.',

  /* 화면을 눌러야 다음으로 넘어가는 곳의 안내 */
  TAP_NEXT: '화면을 누르면 계속됩니다'
};

/* 글자 크기 — 읽기 편하도록 전체적으로 키웠습니다.
   작은 글씨도 18 아래로 내려가지 않게 합니다. */
window.FONT = {
  family: "'Gowun Dodum','Apple SD Gothic Neo','Noto Sans KR',sans-serif",
  dialogue: 25,
  body: 21,
  small: 18,
  label: 20,
  title: 32,
  tiny: 15                     // 출처·주석처럼 정말 작아도 되는 곳에만
};

/* 코드 곳곳에서 숫자를 직접 넘긴 글자들도 함께 커지도록 한 곳에서 키웁니다.
   너무 작은 글씨는 최소 크기까지 끌어올립니다. */
window.FONT_SCALE = 1.16;
window.FONT_MIN = 15;

/* 따뜻한 색감 팔레트 (네온·자극적 색 배제) */
window.PAL = {
  cream: '#fff8ec',
  paper: '#fdf3e0',
  ink: '#3d2c20',
  inkSoft: '#5f4a3a',          // 옛 값보다 조금 진하게 — 종이 위에서 더 잘 읽힙니다
  sun: '#f2b56b',
  sunDeep: '#d2822f',          // 밝은 배경 위에서도 읽히도록 진하게
  clay: '#c9553f',
  leaf: '#7a9a58',
  sky: '#8fc0d9',
  sea: '#2f6b8f',
  seaDeep: '#1d4a68',
  night: '#16233f',
  dusk: '#2b3b60',
  dawn: '#e9a284',
  sand: '#d9c2a3',
  sandNight: '#9fb0c4',
  wood: '#b98a5e',
  woodDark: '#8a6340',
  wall: '#f0d9b8',
  wallShade: '#e2c49c',
  floor: '#e8cfa9',
  white: '#ffffff',

  /* 어두운 배경 위의 보조 글씨 — 예전의 흐린 회색보다 밝게 */
  dim: '#b9c6dc',
  dimWarm: '#e0d3bd',

  shadow: 0x000000
};

window.HEX = function (css) { return parseInt(css.replace('#', '0x'), 16); };

/* 터치 최소 크기 — 손가락 기준.
   slop: 이만큼 넘게 손가락이 밀리면 누른 것으로 치지 않습니다. */
window.TOUCH = { min: 60, gap: 18, slop: 20 };
