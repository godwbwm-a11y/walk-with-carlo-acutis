/* 게임 전역 상수 — 색, 글자, 화면 규격 */

window.GAME = {
  WIDTH: 390,
  HEIGHT: 844,
  TITLE: '오늘, 카를로 아쿠티스와 함께 걷습니다',
  CORE_LINE: '“항상 예수님과 함께 있는 것,\n이것이 나의 인생 계획입니다.”',
  SAVE_KEY: 'carlo_walk_save_v1'
};

/* 글자 크기: 본문 18 이상, 대화 21 — 모바일 가독성 기준 */
window.FONT = {
  family: "'Gowun Dodum','Apple SD Gothic Neo','Noto Sans KR',sans-serif",
  dialogue: 21,
  body: 18,
  small: 16,
  label: 17,
  title: 30
};

/* 따뜻한 색감 팔레트 (네온·자극적 색 배제) */
window.PAL = {
  cream: '#fff8ec',
  paper: '#fdf3e0',
  ink: '#3d2c20',
  inkSoft: '#6b5544',
  sun: '#f2b56b',
  sunDeep: '#e0954a',
  clay: '#c9755a',
  leaf: '#8aa96b',
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
  shadow: 0x000000
};

window.HEX = function (css) { return parseInt(css.replace('#', '0x'), 16); };

/* 터치 최소 크기 — 손가락 기준 */
window.TOUCH = { min: 56, gap: 16 };
