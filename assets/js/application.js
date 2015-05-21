$(function() {
  TEXTFORMAT = 'bold 20px Arial';
  TEXTCOLOR = '#A3FF24';

  var stage = new createjs.Stage('pong'),
    loader = new createjs.LoadQueue(false),
    width = 480; //window.innerWidth,
    height = 320; //window.innerHeight,
    xBallSpeed = 5,
    yBallSpeed = 5,
    Images = {},
    Tweens = {},
    Sounds = {},
    GameView = {}

  var manifest = [
    { src: 'bg.png',       id: 'bg' },
    { src: 'ball.png',     id: 'ball' },
    { src: 'credits.png',  id: 'credits' },
    { src: 'creditsB.png', id: 'creditsB' },
    { src: 'lose.png',     id: 'lose' },
    { src: 'main.png',     id: 'main' },
    { src: 'paddle.png',   id: 'paddle' },
    { src: 'startB.png',   id: 'startB' },
    { src: 'win.png',      id: 'win' }
  ];

  stage.canvas.width = width;
  stage.canvas.height = height;
  stage.enableMouseOver(60);

  createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);
  loader.installPlugin(createjs.Sound);
  loader.on('complete', initGame, this);
  loader.loadManifest(manifest, true, './assets/img/');

  function initGame(e) {
    Sounds.init();
    Images.init();
    GameView.init();
    Tweens.init();
  };

  Sounds.init = function() {
    var sounds = [
      { src: 'hit.mp3',         id: 'hit' },
      { src: 'playerScore.mp3', id: 'playerScore' },
      { src: 'enemyScore.mp3',  id: 'enemyScore' },
      { src: 'wall.mp3',        id: 'wall' }
    ];

    createjs.Sound.registerSounds(sounds, './assets/music/');
  };

  Images.init = function() {
    // Background image
    this.bgImg = new createjs.Bitmap(loader.getResult('bg').src);

    // Ball image
    this.ballImg = new createjs.Bitmap(loader.getResult('ball').src);

    // Credits button image
    this.creditsBImg = new createjs.Bitmap(loader.getResult('creditsB').src);

    // Lose image
    this.loseImg = new createjs.Bitmap(loader.getResult('lose').src);

    // Main image
    this.mainImg = new createjs.Bitmap(loader.getResult('main').src);

    // Player image
    this.playerImg = new createjs.Bitmap(loader.getResult('paddle').src);

    // Cpu image
    this.cpuImg = new createjs.Bitmap(loader.getResult('paddle').src);

    // Start button image
    this.startBImg = new createjs.Bitmap(loader.getResult('startB').src);

    // Win image
    this.winImg = new createjs.Bitmap(loader.getResult('win').src);

    // Player score
    this.playerScore = new createjs.Text('0', TEXTFORMAT, TEXTCOLOR);

    // Cpu score
    this.cpuScore = new createjs.Text('0', TEXTFORMAT, TEXTCOLOR);

    // Credits text
    this.creditsText = new createjs.Text('Developed by Volodimir Partytskyi', TEXTFORMAT, TEXTCOLOR)

    // Year text
    this.yearText = new createjs.Text('© ' + new Date().getFullYear(), TEXTFORMAT, TEXTCOLOR)
  };

  GameView.init = function() {
    // Start button
    Images.startBImg.x = 208.5;
    Images.startBImg.y = 160;
    Images.startBImg.cursor = 'pointer';

    // Credits button
    Images.creditsBImg.x = 200;
    Images.creditsBImg.y = 200;
    Images.creditsBImg.cursor = 'pointer';

    stage.addChild(
      Images.mainImg,
      Images.startBImg,
      Images.creditsBImg
    );

    // Credits view
    Images.creditsBImg.on('click', function() {
      stage.removeChild(
        Images.startBImg,
        Images.creditsBImg
      );

      Images.creditsText.x = 77;
      Images.creditsText.y = 160;
      Images.yearText.x = 210;
      Images.yearText.y = 200;

      stage.addChild(
        Images.creditsText,
        Images.yearText
      );
      stage.update();

      Images.mainImg.on('click', function() {
        stage.removeChild(
          Images.creditsText,
          Images.yearText
        );

        stage.addChild(
          Images.startBImg,
          Images.creditsBImg
        );
      });
    });

    ////////////////// Game view //////////////////
    Images.startBImg.on('click', function() {
      Images.startBImg.removeAllEventListeners();
      stage.removeChild(
        Images.mainImg,
        Images.startBImg,
        Images.creditsBImg
      );

      // Player
      Images.playerImg.x = 2;
      Images.playerImg.y = 125.5;

      // Cpu
      Images.cpuImg.x = 455;
      Images.cpuImg.y = 125.5;

      // Ball
      Images.ballImg.x = 225;
      Images.ballImg.y = 145;

      // Player score
      Images.playerScore.maxWidth = 1000; //fix for Chrome 17
      Images.playerScore.x = 206;
      Images.playerScore.y = 20;

      // Cpu score
      Images.cpuScore.maxWidth = 1000; //fix for Chrome 17
      Images.cpuScore.x = 262;
      Images.cpuScore.y = 20;

      stage.addChild(
        Images.bgImg,
        Images.playerImg,
        Images.cpuImg,
        Images.ballImg,
        Images.playerScore,
        Images.cpuScore
      );
    });

    TweenLite.ticker.addEventListener('tick', stage.update, stage);
    stage.update();
  };

  Tweens.init = function() {
    function startGame() {
      Images.bgImg.on('click', function() {
        stage.removeAllEventListeners();
        Images.bgImg.removeAllEventListeners();

        stage.on('stagemousemove', function(e) {
          if (e.stageY < 248) { TweenLite.to(Images.playerImg, 0, {easel: { y: e.stageY }}) }
        });

        TweenLite.ticker.addEventListener('tick', updateGame);
      });
    };
    startGame();

    function updateGame() {
      // Ball movement
      TweenLite.to(Images.ballImg, 0, {easel: { y: Images.ballImg.y + yBallSpeed, x: Images.ballImg.x + xBallSpeed }});

      // Cpu movement
      if (Images.cpuImg.y < Images.ballImg.y) {
        TweenLite.to(Images.cpuImg, 0, {easel: { y: Images.cpuImg.y + 4.6 }});
      } else {
        TweenLite.to(Images.cpuImg, 0, {easel: { y: Images.cpuImg.y - 4.6 }});
      };

      // Up
      if (Images.ballImg.y < 0) {
        yBallSpeed = -yBallSpeed;
        createjs.Sound.play('wall');
      };

      // Down
      if (Images.ballImg.y > 290) {
        yBallSpeed = -yBallSpeed;
        createjs.Sound.play('wall');
      };

      // Cpu collision
      if (Images.ballImg.x + 25 > Images.cpuImg.x && Images.ballImg.x + 25 < Images.cpuImg.x + 22 && Images.ballImg.y >= Images.cpuImg.y - 15 && Images.ballImg.y < Images.cpuImg.y + 75) {
        xBallSpeed *= -1.1;
        createjs.Sound.play('hit');
      };

      // Player collision
      if (Images.ballImg.x <= Images.playerImg.x + 20 && Images.ballImg.x > Images.playerImg.x && Images.ballImg.y >= Images.playerImg.y - 15 && Images.ballImg.y < Images.playerImg.y + 75) {
        xBallSpeed *= -1.1;
        createjs.Sound.play('hit');
      };

      // Cpu score
      if (Images.ballImg.x < 0) {
        xBallSpeed = -xBallSpeed;
        Images.cpuScore.text = parseInt(Images.cpuScore.text + 1);
        createjs.Sound.play('enemyScore');
        resetGame();
      };

      // Player score
      if (Images.ballImg.x > 480) {
        xBallSpeed = -xBallSpeed;
        Images.playerScore.text = parseInt(Images.playerScore.text + 1);
        createjs.Sound.play('playerScore');
        resetGame();
      };

      if (Images.playerScore.text == '10') { alertGame(Images.winImg) }; // Check for win
      if (Images.cpuScore.text == '10') { alertGame(Images.loseImg) }; // Check for lose
    };

    function resetGame() {
      Images.playerImg.y = 125.5;
      Images.cpuImg.y = 125.5;

      Images.ballImg.x = 225;
      Images.ballImg.y = 145;
      xBallSpeed = 5;

      stage.removeAllEventListeners();
      TweenLite.ticker.removeEventListener("tick", updateGame);
      startGame();
    };

    function alertGame(img) {
      TweenLite.ticker.removeEventListener("tick", updateGame);
      stage.removeAllEventListeners();
      Images.bgImg.removeAllEventListeners();

      img.x = 140;
      img.y = 115;

      stage.addChild(img);
    };
  };
});
