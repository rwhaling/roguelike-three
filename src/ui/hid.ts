import { v4 as uuidv4 } from 'uuid';
import { DIRS } from "rot-js/lib";
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
  // // ASDW
  // 87: 0, // W
  // 68: 2, // D
  // 83: 4,  // S
  // 65: 6,
};

const tapMap = {
  0: 6,
  1: 0,
  2: 2,
  3: 4,
};

const moveSelectMap = {
  74: -1, // J
  219: -1, // [
  76: 1, // L
  221: 1 // ]
}

const targetSelectMap = {
  73: -1, // I
  188: -1, // <
  75: 1, // K
  190: 1 // >
}

const arrowMap = {
  "btn-left": 6,
  "btn-right": 2,
  "btn-up": 0,
  "btn-down": 4,
};

const numMap = {
  49: "EAT", // 1
  50: "WAIT", // 2
  51: "FLEE", // 3
  52: "SEARCH", // 4
  53: "USE", // 5 
  54: "HELP", // 6
  55: "", // 7
  56: "", // 8
  57: "", // 9
  48: "", // 10
}

const qwertyMap = {
  81: "ATK", // q
  87: "BASH", // w
  69: "BOW", // e
  82: "AIM", // r
  84: "DASH", // t
  89: "DFND", // y
}

const actionMap = {
  186: 1, // semicolon
  222: 2, // quote
  13: 3 // enter
}

const skillMap = {
  220: "USE", // | 
  189: "RUN", // -
  187: "EAT" // +
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
  game.player.controls.dirty = true;
  // prevent zoom
  if (code == 187 || code == 189) {
    ev.preventDefault();
    // return;
  }
  // full screen
  if (code == 70 && ev.altKey && ev.ctrlKey && ev.shiftKey) {
    document.body.requestFullscreen();
    console.log("Full screen pressed.");
    return;
  }

  if (code == 13) {
    ev.preventDefault();
  }

  if (code == 222) { // ' single quote - skip turn
    game.engine.unlock(); 
    return; 
  }
  /* one of numpad directions? */
  if (code in moveSelectMap) {
    console.log("move selector: ",code, moveSelectMap[code]);
    game.player.controls.selectMove(moveSelectMap[code]);
    return;
  }
  if (code in targetSelectMap) {
    console.log("target selector:", code, targetSelectMap[code]);
    console.log("player:", game.player);
    console.log("current target:", game.player.controls.currentTarget);
    game.player.controls.cycleTarget(game, game.player, targetSelectMap[code]);
    return;
  }
  if (code in actionMap) {
    console.log("ACTION!");
    game.player.controls.attemptAction(game, game.player);
    return;
  }
  if (code in skillMap) {
    console.log("SKILL!", skillMap[code]);    
    game.player.controls.tempAttemptSkillByName(game, game.player, skillMap[code]);
    return;
  }
  if (code in qwertyMap) {
    const move = qwertyMap[code]
    console.log("pressed qwerty key", code, move);
    game.player.controls.tempAttemptSkillByName(game, game.player, move);
  }

  if (code in numMap) {
    const move = numMap[code];
    console.log(`pressed number ${code} for ${move}`);
    game.player.controls.tempAttemptSkillByName(game, game.player, move);

  }
  if (code in keyMap) {
    const dir = DIRS[8][keyMap[code]];
    if (game.display) {
      ev.preventDefault();
    }
    arrowStart(game, dir);  
  }
}

// handle an on-screen or keyboard arrow
function arrowStart(game, dir) {
  let last = game.arrowHeld;
  game.arrowHeld = dir;
  // Game.player.lastArrow = dir;
  console.log("arrowHeld:");
  console.log(game.arrowHeld);
  // if (!last) {
  game.player.controls.movePlayer(game,dir)
    // document.dispatchEvent(new Event("arrow"));
  // }
}
