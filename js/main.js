/* 게임 시작점 — 세로 화면 고정, 반응형 크기 조절, 자동 저장 */

(function () {

  const config = {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#16233f',
    width: GAME.WIDTH,
    height: GAME.HEIGHT,
    scale: {
      mode: Phaser.Scale.FIT,          // 화면이 잘리지 않도록 항상 전체를 보여줍니다
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME.WIDTH,
      height: GAME.HEIGHT
    },
    render: {
      antialias: true,
      roundPixels: true,
      powerPreference: 'low-power'      // 저사양 기기 배려
    },
    fps: { target: 60, min: 30 },
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false }
    },
    input: { activePointers: 3 },
    dom: { createContainer: true },      // 기도와 여행 노트에 직접 적을 수 있도록
    scene: [
      BootScene, TitleScene, HomeScene, RoomScene,
      PhoneScene, DreamBeachScene, VistaScene, ChatScene,
      CarloDayScene,
      PrayerScene, JournalScene, PauseScene,
      PhotoMode, GalleryScene,
      WaterPlantScene, HelpMomScene, HomeworkScene, ShelfScene,
      Day2RoomScene, Day2PhoneScene, Day2StreetScene, Day2StoreScene,
      Day2ChurchScene, Day2RelicScene, Day2SunsetScene, Day2ReturnScene,
      Day2NoteScene, Day2AlbumScene, Day2EndScene,
      PrepareBagScene, OrangeScene, NoiseScene, HeavyBagScene,
      Day3RoomScene, Day3StreetScene, Day3ChurchScene, Day3ExitScene,
      Day3ParkScene, Day3HomeScene, Day3NoteScene, Day3EndScene,
      ReadyScene, LookAroundScene, SilenceScene, HeartWordScene,
      Day4RoomScene, Day4SchoolScene, Day4YardScene, Day4StreetScene,
      Day4NoteScene, Day4EndScene,
      FeedScene, WordsScene, MirrorScene, SeePersonScene, GiftScene,
      Day5SubwayScene, Day5FestivalScene, Day5ReconcileScene, Day5VocationScene,
      Day5MassScene, Day5ThemeScene, Day5NightScene, Day5NoteScene, Day5EndScene,
      WayScene, HelloScene, RhythmScene, MosaicScene, HeartStopScene, CourageScene,
      Day6IntroScene, Day6PilgrimageScene, Day6FieldScene, Day6VigilScene,
      Day6NightScene, Day6DawnScene, Day6MissionScene, Day6NoteScene, Day6EndScene,
      PilgrimWalkScene, OurSpotScene, StarPrayerScene, StayScene, MorningScene, MissionScene,
      MiracleMapScene, FortressScene, NightShareScene
    ]
  };

  let game = null;

  function launch() {
    if (game) return;
    game = new Phaser.Game(config);
    window.__game = game;
  }

  /* 글꼴이 준비되면 시작 — 최대 2.5초까지만 기다립니다 */
  function waitFont() {
    let started = false;
    const go = function () { if (!started) { started = true; launch(); } };
    setTimeout(go, 2500);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { setTimeout(go, 60); });
    } else {
      setTimeout(go, 300);
    }
  }

  /* 가로 화면 안내 */
  const guard = document.getElementById('rotate-guard');
  function checkOrientation() {
    const landscape = window.innerWidth > window.innerHeight * 1.08;
    if (guard) guard.classList.toggle('show', landscape);
    if (game && game.scene) {
      game.scene.scenes.forEach(function (s) {
        if (s.sys.settings.key === 'PauseScene') return;
        const status = s.sys.settings.status;
        if (landscape) {
          if (status === Phaser.Scenes.RUNNING) { s.__rotatePaused = true; s.scene.pause(); }
        } else if (s.__rotatePaused && status === Phaser.Scenes.PAUSED) {
          s.__rotatePaused = false;
          s.scene.resume();
        }
      });
    }
  }

  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', function () { setTimeout(checkOrientation, 220); });

  /* 손가락 두 개로 확대하거나 화면이 밀리지 않게 */
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', function (e) {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  document.addEventListener('dblclick', function (e) { e.preventDefault(); }, { passive: false });

  /* 앱을 벗어나면 소리를 멈춥니다 */
  document.addEventListener('visibilitychange', function () {
    if (!window.AudioSystem) return;
    if (document.hidden) AudioSystem.setBgm(false);
    else AudioSystem.setBgm(SaveSystem.get('settings.bgm', true));
  });

  checkOrientation();
  waitFont();
})();
