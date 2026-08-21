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
      /* 가운데 맞추기는 CSS 에만 맡깁니다.
         Phaser 에도 맡기면 여백으로 한 번, flex 로 또 한 번 —
         두 번 가운데를 맞추다가 화면이 한쪽으로 밀립니다. */
      autoCenter: Phaser.Scale.NO_CENTER,
      width: GAME.WIDTH,
      height: GAME.HEIGHT
    },
    render: {
      antialias: true,
      antialiasGL: true,
      roundPixels: false,               // 크게 늘려 보일 때 글자가 뭉개지지 않도록
      mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
      powerPreference: 'high-performance'
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
      PhoneScene, StoreScene, DreamBeachScene, VistaScene, ChatScene,
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
      FeedScene, WordsScene, MirrorScene, SeePersonScene, GiftScene, BrickScene,
      Day5SubwayScene, Day5FestivalScene, Day5ReconcileScene, Day5VocationScene,
      Day5MassScene, Day5ThemeScene, Day5NightScene, Day5NoteScene, Day5EndScene,
      WayScene, HelloScene, RhythmScene, MosaicScene, HeartStopScene, CourageScene,
      Day6IntroScene, Day6PilgrimageScene, Day6FieldScene, Day6VigilScene,
      Day6NightScene, Day6DawnScene, Day6MissionScene, Day6NoteScene, Day6EndScene,
      PilgrimWalkScene, OurSpotScene, StarPrayerScene, StayScene, MorningScene, MissionScene,
      CrosswordScene, ChurchQuestScene,
      Day7RoomScene, Day7SchoolScene, Day7ComputerScene, Day7TownScene,
      Day7ChurchScene, Day7NoteScene, Day7EndScene,
      ExplainScene, MakeCardScene, NetChoiceScene, NoticeScene, ReceivedScene,
      MiracleMapScene, FortressScene, NightShareScene,
      Day8MorningScene, Day8SearchScene, Day8WalkScene, Day8ChurchScene,
      Day8BeachScene, Day8HomeScene, Day8GoodbyeScene, Day8CardScene,
      Day8NoteScene, Day8ReviewScene, Day8EndScene,
      SeeFriendScene, AloneScene, MyPathScene,
      EpIntroScene, EpYardScene, EpDinnerScene, EpCarloScene,
      EpChurchScene, EpPrayerScene, EpPhotoScene, EpWalkScene,
      EpPhotoBookScene, EpCreditsScene, EpFinalScene,
      PassScene, JegiScene, GonggiScene, PoseScene, FollowScene, TasteScene, TwoWordsScene
    ]
  };

  let game = null;

  /* 어느 한 곳이 잘못되어도 게임이 통째로 멈추지는 않게 합니다.
     화면을 다시 그려 달라는 요청은 한 번 끊기면 스스로 돌아오지 않아서,
     그대로 두면 말풍선만 남고 글자가 영영 나오지 않습니다. */
  function keepAlive(g) {
    const step = g.step.bind(g);
    let told = 0;
    g.step = function (time, delta) {
      try {
        step(time, delta);
      } catch (e) {
        if (told < 5) { told++; console.error('[한 프레임을 건너뜁니다]', e); }
      }
    };
  }

  function launch() {
    if (game) return;
    game = new Phaser.Game(config);
    keepAlive(game);
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

  /* PC 인지 손에 든 기기인지 — PC 에서는 가로 화면이 당연하므로 안내하지 않습니다 */
  const isDesktop = (function () {
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 1);
    return !coarse && !touch;
  })();
  window.IS_DESKTOP = isDesktop;
  if (isDesktop) document.body.classList.add('desktop');

  /* 가로 화면 안내 (손에 든 기기에서만) */
  const guard = document.getElementById('rotate-guard');
  function checkOrientation() {
    /* 글을 적는 동안에는 자판 때문에 화면이 낮아질 뿐입니다.
       가로로 돌렸다고 오해하지 않도록 그대로 둡니다. */
    if (window.__typing) return;
    const landscape = !isDesktop && window.innerWidth > window.innerHeight * 1.08;
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
