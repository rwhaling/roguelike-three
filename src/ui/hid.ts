import { v4 as uuidv4 } from 'uuid';
import { DIRS } from "rot-js/lib";
import { destroy, movePlayerTo } from "../core/GameLogic";

// these are lookup tables mapping keycodes and
// click/tap directions to game direction vectors

const keyMap = {
  38: 0,
  33: 1,
  39: 2,
  34: 3,
  40: 4,
  35: 5,
  37: 6,
  36: 7,
};

const tapMap = {
  0: 6,
  1: 0,
  2: 2,
  3: 4,
};

const moveSelectMap = {
  74: -1,
  76: 1
}

const targetSelectMap = {
  73: -1,
  75: 1
}

const arrowMap = {
  "btn-left": 6,
  "btn-right": 2,
  "btn-up": 0,
  "btn-down": 4,
};

const actionMap = {
  186: 1, // semicolon
  222: 2, // quote
  13: 3 // enter
}

const touchOffsetY = -20; // move the center by this much
const scaleMobile = 4; // scale mobile screens by this much
const scaleMonitor = 6; // scale computer screens by this much

// handy shortcuts and shims for manipulating the dom
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

export function resolvePointing(game, ev) {
  ev.preventDefault();
  if (game.touchScreen) { return; }
  const g = $("#game");
  // where on the map the click or touch occurred
  const cx = (ev["touches"] ? ev.touches[0].clientX : ev.clientX);
  const cy = (ev["touches"] ? ev.touches[0].clientY : ev.clientY)
  const x = cx - (g.offsetWidth / 2);
  const y = cy - (g.offsetHeight / 2) -
        (game.touchScreen ? touchOffsetY : 0) * window.devicePixelRatio;
  // figure out which quadrant was clicked relative to the player
  const qs = Math.ceil((Math.floor(
            (Math.atan2(y, x) + Math.PI) /
            (Math.PI / 4.0)) % 7) / 2);
  const dir = DIRS[8][tapMap[qs]];
  // actually move the player in that direction
  return dir;
  // movePlayer(dir);
}



// when keyboard input happens this even handler is called
// and the position of the player is updated
export function keyHandler(game,ev) {
  const code = ev.keyCode;
  // prevent zoom
  if (code == 187 || code == 189) {
    ev.preventDefault();
    return;
  }
  // full screen
  if (code == 70 && ev.altKey && ev.ctrlKey && ev.shiftKey) {
    document.body.requestFullscreen();
    console.log("Full screen pressed.");
    return;
  }
  if (code == 81) { destroy(game); return; }
  // if (code == 73) { toggleInventory(ev, true); return; }
  // if (code == 27) { toggleInventory(ev, true, true); return; } ; escape button should only close
  if (code == 190) { game.engine.unlock(); return; } // skip turn
  /* one of numpad directions? */
  if (code in moveSelectMap) {
    console.log("move selector: ",code, moveSelectMap[code]);
    game.player.controls.selectMove(moveSelectMap[code]);
    game.player.controls.dirty = true;
    return;
  }
  if (code in targetSelectMap) {
    console.log("target selector:", code, targetSelectMap[code]);
    console.log("player:", game.player);
    console.log("current target:", game.player.controls.currentTarget);
    let currentTarget = game.player.controls.currentTarget
    let awakeTargets = game.monsters.filter( (m) => m.awake).map( (m) => m.id);
    let currentTargetIndex = awakeTargets.indexOf(currentTarget);
    console.log("currentTargetIndex:",currentTargetIndex,"awake targets:",awakeTargets)
    let newTargetIndex = currentTargetIndex + targetSelectMap[code];
    if (newTargetIndex < 0) { 
      game.player.controls.currentTarget = awakeTargets[awakeTargets.length - 1];
    } else if (newTargetIndex >= awakeTargets.length) {
      game.player.controls.currentTarget = awakeTargets[0];
    } else {
      game.player.controls.currentTarget = awakeTargets[newTargetIndex];
    }
    game.player.controls.dirty = true;
    return;
  }
  if (code in actionMap) {
    console.log("ACTION!");
    if (game.player.controls.currentTarget) {
      let target = game.monsters.filter( (m) => m.id == game.player.controls.currentTarget )[0];
      let angle = Math.atan2(  game.player._y - target._y,  game.player._x - target._x );
//          let angle = Math.atan2(  target._y - Game.player._y,  target._x - Game.player._x );
      let orientation = 0;
      let frac = angle / Math.PI;
      if (frac < 0) {
        frac += 1
      }

      if (frac < 1/16) {
        orientation = 0;
      } else if (frac < 3/16) {
        orientation = 1;
      } else if (frac < 5/16) {
        orientation = 2;
      } else if (frac < 7/16) {
        orientation = 3;
      } else if (frac < 9/16) {
        orientation = 4;
      } else if (frac < 11/16) {
        orientation = 5;
      } else if (frac < 13/16) {
        orientation = 6;
      } else if (frac < 15/16) {
        orientation = 7
      }


      console.log(`spawning arrow with ${angle} (${angle / Math.PI}) [${orientation}] from player at`,game.player._x, game.player._y, `target at`,target._x,target._y);
      let id = uuidv4();

      let particle = {
        id: id,
        char: "A",
        orientation: orientation,
        startPos: [game.player._x, game.player._y],
        endPos: [target._x, target._y],
        startTime: game.lastFrame,
        endTime: game.lastFrame + 300
      }
      game.particles.push(particle);
    }
    return;
  }
  if (!(code in keyMap)) { return; }
  if (code in keyMap) {
    const dir = DIRS[8][keyMap[code]];
    if (game.display) {
      ev.preventDefault();
    }
    arrowStart(game, dir);  
    game.player.controls.dirty = true;
  }
}

// handle an on-screen or keyboard arrow
function arrowStart(game, dir) {
  let last = game.arrowHeld;
  game.arrowHeld = dir;
  // Game.player.lastArrow = dir;
  console.log("arrowHeld:");
  console.log(game.arrowHeld);
  if (!last) {
    movePlayer(game,dir)
    // document.dispatchEvent(new Event("arrow"));
  }
}

// move the player according to a direction vector
// called from the keyboard event handler below
// `keyHandler()`
// and also from the click/tap handler `handlePointing()` below
export function movePlayer(game,dir) {
  const p = game.player;
  game.player.lastArrow = dir;
  console.log("moving player");
  console.log(dir);
  return movePlayerTo(game, p._x + dir[0], p._y + dir[1]);
}
