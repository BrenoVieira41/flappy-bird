console.log('Criando joguinho!');

const sprites = new Image();
sprites.src = './sprites.png';

let gameFrames = 0;
const som_hit = new Audio();
som_hit.volume = 0.3
som_hit.src = './efeitos/imorreu.mp3'

const canvas = document.querySelector('canvas');
const contex = canvas.getContext('2d');

let background = {
  sorceX: 390,
  sorceY: 0,
  width: 275,
  height: 204,
  x: 0,
  y: canvas.height - 204,
  drawing() {
    contex.fillStyle = '#70c5ce';
    contex.fillRect(0, 0, canvas.width, canvas.height);

    contex.drawImage(
      sprites,
      background.sorceX, background.sorceY,
      background.width, background.height,
      background.x, background.y,
      background.width, background.height,
    );

    contex.drawImage(
      sprites,
      background.sorceX, background.sorceY,
      background.width, background.height,
      (background.x + background.width), background.y,
      background.width, background.height,
    );
  }
}

function createFloor() {
  let floor = {
    sorceX: 0,
    sorceY: 610,
    width: 224,
    height: 112,
    x: 0,
    y: canvas.height - 112,

    update() {
      const floorMove = 1;
      const repeat = floor.width / 2;
      const move = floor.x - floorMove;

      floor.x = move % repeat;
    },

    drawing() {
      contex.drawImage(
        sprites,
        floor.sorceX, floor.sorceY,
        floor.width, floor.height,
        floor.x, floor.y,
        floor.width, floor.height,
      );

      contex.drawImage(
        sprites,
        floor.sorceX, floor.sorceY,
        floor.width, floor.height,
        (floor.x + floor.width), floor.y,
        floor.width, floor.height,
      );
    }
  };
  return floor;
}

let start = {
  sorceX: 134,
  sorceY: 0,
  width: 174,
  height: 152,
  x: (canvas.width / 2) - 174 / 2,
  y: 50,
  drawing() {
    contex.drawImage(
      sprites,
      start.sorceX, start.sorceY,
      start.width, start.height,
      start.x, start.y,
      start.width, start.height,
    );
  }
}

let endGame = {
  sorceX: 134,
  sorceY: 153,
  width: 226,
  height: 200,
  x: (canvas.width / 2) - 226 / 2,
  y: 50,
  drawing() {
    contex.drawImage(
      sprites,
      endGame.sorceX, endGame.sorceY,
      endGame.width, endGame.height,
      endGame.x, endGame.y,
      endGame.width, endGame.height,
    );
  }
}

function createPipes() {
  const pipes = {
    width: 52,
    height: 400,
    floor: {
      sorceX: 0,
      sorceY: 169,
    },
    sky: {
      sorceX: 52,
      sorceY: 169,
    },
    space: 80,
    drawing() {
      pipes.pares.forEach(function (par) {
        const yRandom = par.y;
        const spacePipes = 90;

        const pipeSkyX = par.x;
        const pipeSkyY = yRandom;

        contex.drawImage(
          sprites,
          pipes.sky.sorceX, pipes.sky.sorceY,
          pipes.width, pipes.height,
          pipeSkyX, pipeSkyY,
          pipes.width, pipes.height,
        )

        const pipeFloorX = par.x;
        const pipefloorY = pipes.height + spacePipes + yRandom;

        contex.drawImage(
          sprites,
          pipes.floor.sorceX, pipes.floor.sorceY,
          pipes.width, pipes.height,
          pipeFloorX, pipefloorY,
          pipes.width, pipes.height,
        )

        par.pipeSky = {
          x: pipeSkyX,
          y: pipes.height + pipeSkyY
        }
        par.pipefloor = {
          x: pipeFloorX,
          y: pipefloorY
        }
      })
    },
    limited(par) {
      const headBird = globais.bird.y;
      const endBird = globais.bird.y + globais.bird.height;

      if ((globais.bird.x + globais.bird.width) >= par.x) {
        if (headBird <= par.pipeSky.y) {
          return true;
        }

        if (endBird >= par.pipefloor.y) {
          return true;
        }
      }
      return false;
    },
    pares: [],
    update() {
      const frames100late = gameFrames % 100 === 0;
      if (frames100late) {
        pipes.pares.push({
          x: canvas.width,
          y: -150 * (Math.random() + 1),
        });
      }

      pipes.pares.forEach(function (par) {
        par.x = par.x - 2;

        if (pipes.limited(par)) {
          som_hit.play();
          screenUpdate(screens.game_over);
        }

        if (par.x + pipes.width <= 0) {
          pipes.pares.shift();
        }
      });

    }
  }

  return pipes;
}

function createScoreboard() {
  const scoreboard = {
    points: 0,
    drawing() {
      contex.font = '35px "Lexend", sans-serif';
      contex.textAlign = 'right'
      contex.fillStyle = 'white';
      contex.fillText(`${Math.floor(scoreboard.points)}`, canvas.width - 10, 35);
    },
    update() {
      const frameInterval = 10;
      const intervalEnd = gameFrames % frameInterval === 0;

      if (intervalEnd) {
        scoreboard.points = scoreboard.points + 1;
      }
    }
  }
  return scoreboard;
}

function createScoreboardGameOver() {
  const scoreboard = {
    drawing() {
      contex.font = '25px "Lexend", sans-serif';
      contex.textAlign = 'center'
      contex.fillStyle = 'black';
      contex.fillText(`${globais.scoreboard.points}`, canvas.width - 88, 145);

      contex.font = '25px "Lexend", sans-serif';
      contex.textAlign = 'center'
      contex.fillStyle = 'black';
      contex.fillText(`${localStorage.getItem('score')}`, canvas.width - 88, 190);
    },
  }
  return scoreboard;
}

function limit(bird, floor) {
  const birdY = bird.y + bird.width;
  const floorY = floor.y;

  if (birdY >= floorY) {
    return true;
  }

  return false;
}

function createBird() {
  let bird = {
    sorceX: 0,
    sorceY: 0,
    width: 33,
    height: 24,
    x: 10,
    y: 50,
    speed: 0,
    gravity: 0.25,
    jump: 4.6,

    jumping() {
      bird.speed = - bird.jump;
    },

    update() {
      if (limit(bird, globais.floor)) {
        som_hit.play();

        screenUpdate(screens.game_over);
      }

      bird.speed = bird.speed + bird.gravity;
      bird.y = bird.y + bird.speed;
    },

    moving: [
      { sorceX: 0, sorceY: 0 },
      { sorceX: 0, sorceY: 26 },
      { sorceX: 0, sorceY: 52 },
      { sorceX: 0, sorceY: 26 },
    ],

    currentFrame: 0,
    updateFrame() {
      const frameInterval = 10;
      const intervalEnd = gameFrames % frameInterval === 0;

      if (intervalEnd) {
        const base = 1;
        const increment = base + bird.currentFrame;
        const baseRepeat = bird.moving.length;
        bird.currentFrame = increment % baseRepeat
      }
    },

    drawing() {
      bird.updateFrame();
      const { sorceX, sorceY } = bird.moving[bird.currentFrame];

      contex.drawImage(
        sprites,
        sorceX, sorceY,
        bird.width, bird.height,
        bird.x, bird.y,
        bird.width, bird.height,
      );
    }
  }
  return bird;
}

const globais = {}
let active = {};


function screenUpdate(newScreen) {
  active = newScreen;

  if (active.initialize) {
    active.initialize();
  }
}

const screens = {
  start: {
    initialize() {
      globais.bird = createBird();
      globais.floor = createFloor();
      globais.pipes = createPipes();
    },
    drawing() {
      background.drawing();
      globais.bird.drawing();

      globais.floor.drawing();
      start.drawing();
    },
    click() {
      screenUpdate(screens.game);
    },
    update() {
      globais.floor.update();
    }
  }
};

function record(score) {
  const currentRecord = localStorage.getItem('score');

  if (!currentRecord || score > parseInt(currentRecord)) {
    localStorage.setItem('score', score);
  }
}

screens.game = {
  initialize() {
    globais.scoreboard = createScoreboard();
  },
  drawing() {
    background.drawing();
    globais.pipes.drawing();
    globais.floor.drawing();
    globais.bird.drawing();
    globais.scoreboard.drawing()
  },

  click() {
    globais.bird.jumping();
  },

  update() {
    globais.pipes.update();
    globais.floor.update();
    globais.bird.update();
    globais.scoreboard.update();
  }
};

screens.game_over = {
  initialize() {
    globais.scoreboardEnd = createScoreboardGameOver();
    record(globais.scoreboard.points)
  },

  drawing() {
    endGame.drawing();
    globais.scoreboardEnd.drawing();
  },

  update() {
  },

  click() {
    screenUpdate(screens.start);
  },
}

function loop() {
  active.drawing();
  active.update();

  gameFrames = gameFrames + 1;
  requestAnimationFrame(loop);
}

window.addEventListener('click', function () {
  if (active.click) active.click();
});

screenUpdate(screens.start);
loop();