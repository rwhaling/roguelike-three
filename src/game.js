import MyDisplay from "./mydisplay";
import { drawTile, drawPlayer, drawMonster, render } from "./display/DisplayLogic";
import { checkDeath, checkItem, combat, destroy, movePlayerTo, lose, win } from "./core/GameLogic";
import { Display } from "rot-js/lib/index";
import { v4 as uuidv4 } from 'uuid';
import GameState from "./gamestate"
import { genMap, createBeing } from "./mapgen/MapGen";
import { Player, makePlayer } from "./entities/player";
import { sfx } from "./sound/sfx";
import { showScreen, setEndScreenValues, renderInventory, selectedInventory, inventoryRemove, renderStats, toggleInventory, createGhost, toast, battleMessage, hideToast, renderTargets } from "./ui/ui";
import { movePlayer, keyHandler, resolvePointing } from "./ui/hid";

function runGame(w,mydisplay) {

    // Update this string to set the game title
    const gametitle = "The 3";
  
    /*****************
     *** resources ***
     *****************/
  
    // This tileset is from kenney.nl
    // It's the "microrogue" tileset
  
    const tileSet = document.createElement("img");
    tileSet.src = "tiny_dungeon_sprites_2.png"
    // tileSet.src = "colored_tilemap_packed.png";
  
    // This is where you specify which tile
    // is used to draw each "character"
    // where a character can be a background tile
    // or a player, monster, or item tile
  
    const tileOptions = {
      layout: "my-tile-gl",
    //   layout: "tile",
      bg: "black",
      tileWidth: 16,
      tileHeight: 16,
      tileSet: tileSet,
      tileMap: {
        "@": [0, 0],  // player
        ".": [272, 64], // floor
        "M": [0, 96],  // monster
        "*": [288, 192], // treasure chest
        "g": [304, 192], // gold

        "x": [256, 192], // axe
        "p": [256, 192], // potion

        "a": [336, 256], // tree 1
        "b": [336, 256], // tree 2
        "c": [336, 256], // tree 3
        "d": [336, 256], // tree 4
        "e": [336, 256], // tree 5

        "A": [256, 368], // arrow particle

        "T": [400, 192], // tombstone

        "╔": [352, 0],  // room corner
        "╗": [368, 0], // room corner
        "╝": [272, 0], // room corner
        "╚": [288, 0], // room corner
        "═": [256, 0],  // room edge
        "║": [368, 0], // room edge
        "o": [384, 0], // room corner
      },
      width: 50, // TODO: this is making the window too wide
      height: 20
    }
  
    // should we pay attention to click/touch events on the map
    // and should we show arrow buttons on touch screens?
    const usePointer = true;
    const useArrows = true;
    const touchOffsetY = -20; // move the center by this much
    const scaleMobile = 4; // scale mobile screens by this much
    const scaleMonitor = 6; // scale computer screens by this much
    const turnLengthMS = 200; // shortest time between turns
  
    // these map tiles are walkable
    const walkable = [".", "*", "g"]
  
    // these map tiles should not be replaced by room edges
    const noreplace = walkable.concat(["M", "╔", "╗", "╚", "╝", "═", "║"]);
  
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
    
    /*****************
     *** game code ***
     *****************/
  
  
    // based on the original tutorial by Ondřej Žára
    // www.roguebasin.com/index.php?title=Rot.js_tutorial,_part_1
  
    // this Game object holds all of the game state
    // including the map, engine, entites, and items, etc.
    const Game = new GameState();
    Game.cleanup = cleanup;
  
    // this gets called by the menu system
    // to launch the actual game
    function init(game) {
      game.map = {};
      game.items = {};
      // first create a ROT.js display manager
      // TODO: picking up map width as display width, not ideal
      game.display = new MyDisplay(tileOptions);
    //   game.display._backend = new MyDisplay();
      resetCanvas(game, game.display.getContainer());
      let mapDisplay = new Display({width: tileOptions.width, height: 20, fontSize:6, });

      $("#mapcanvas").innerHTML = "";
      $("#mapcanvas").appendChild(mapDisplay.getContainer());

      // this is where we populate the map data structure
      // with all of the background tiles, items,
      // player and the monster positions
      let [zeroCells, freeCells] = genMap(game, tileOptions, mapDisplay);
      game.player = createBeing(game, makePlayer, freeCells);
      game.display.setPlayerPos(game.player._x, game.player._y);

      // game.monsters = [createBeing(game, makeMonster, freeCells)];
      game.monsters = [
        createBeing(game, makeMonster, freeCells),
        createBeing(game, makeMonster, freeCells),
        createBeing(game, makeMonster, freeCells)
      ];


      //   generateMap(game);
  
      // let ROT.js schedule the player and monster entities
      game.scheduler = new ROT.Scheduler.Simple();
      game.scheduler.add(game.player, true);
      game.monsters.map((m) => game.scheduler.add(m, true));
  
      // render some example items in the inventory
      renderInventory(tileOptions, game.player.inventory);
  
      // render the stats hud at the bottom of the screen
      renderStats(game.player);

      renderTargets(game);
  
      // kick everything off
      game.engine = new ROT.Engine(game.scheduler);
      game.engine.start();
      requestAnimationFrame(drawScene);
    }
  
    // // this gets called at the end of the game when we want
    // // to exit back out and clean everything up to display
    // // the menu and get ready for next round
    // function destroy(game) {
    //   // remove all listening event handlers
    //   removeListeners(game);
  
    //   // tear everything down and
    //   // reset all our variables back
    //   // to null as before init()
    //   // TODO: all new state
    //   if (game.engine) {
    //     game.engine.lock();
    //     game.display = null;
    //     game.map = {};
    //     game.items = {};
    //     game.engine = null;
    //     game.entities = {};
    //     game.scheduler.clear();
    //     game.scheduler = null;
    //     game.player = null;
    //     game.monsters = null;
    //     game.amulet = null;
    //   }
  
    //   // hide the toast message
    //   hideToast(true);
    //   // close out the game screen and show the title
    //   showScreen("title");
    // }
      
    function drawScene(timestamp) {
        if (Game.display === null) {
            return;
        }
        if (Game.player && Game.player.controls.dirty) {
          console.log("ui dirty");
          renderStats(Game.player);
          renderTargets(Game);
        }
        // TODO: check if key held and not animating player
        requestAnimationFrame(drawScene);
        render(Game,timestamp);
    }

  
    /*******************
     *** The monster ***
     *******************/
  
  
    // basic ROT.js entity with position and stats
    function makeMonster(game, id, x, y) {
      return {
        // monster position
        id: id,
        _x: x,
        _y: y,
        // which tile to draw the player with
        character: "M",
        // the name to display in combat
        name: "the monster",
        // the monster's stats
        stats: {"hp": 14},
        lastArrow: [1,0],
        // called by the ROT.js scheduler
        awake: false,
        act: monsterAct,
      }
    }
  
    // the ROT.js scheduler calls this method when it is time
    // for the monster to act
    function monsterAct() {
      // reference to the monster itself
      const m = this;
      // the monster wants to know where the player is
      const p = Game.player;
      // reference to the game map
      const map = Game.map;
      // reference to ROT.js display
      const display = Game.display;
  
      // in this whole code block we use the ROT.js "astar" path finding
      // algorithm to help the monster figure out the fastest way to get
      // to the player - for implementation details check out the doc:
      // http://ondras.github.io/rot.js/manual/#path
      const passableCallback = function(x, y) {
        return (walkable.indexOf(map[x + "," + y]) != -1);
      }
      const astar = new ROT.Path.AStar(p._x, p._y, passableCallback, {topology:4});
      const path = [];
      const pathCallback = function(x, y) {
        path.push([x, y]);
      }
      astar.compute(m._x, m._y, pathCallback);
  
      // ignore the first move on the path as it is the starting point
      path.shift();
      // if the distance from the monster to the player is less than one
      // square then initiate combat
      if (path.length <= 1) {
        combat(Game, m, p);
      } else if (path.length >= 7) {
      
      } else {
        if (this.awake == false) {
          this.awake = true;
          console.log("the monster sees you");
        }
        // draw whatever was on the last tile the monster was one
        // let oldKey = m._x + "," + m._y;
        let oldPos = [m._x, m._y];
        // the player is safe for now so update the monster position
        // to the first step on the path and redraw
        let delta = [path[0][0] - m._x, path[0][1] - m._y ];
        console.log("moving monster");
        console.log(delta);
        m.lastArrow = delta;

        m._x = path[0][0];
        m._y = path[0][1];
        // let newKey = m._x + "," + m._y;
        let newPos = [m._x, m._y];
        let animation = {
            id: m.id,
            startPos: oldPos,
            endPos: newPos,
            startTime: Game.lastFrame,
            endTime: Game.lastFrame + 250
        }
        Game.animatingEntities[m.id] = animation;
        // Game.animating[newKey] = animation;
      }
    }

      
    /************************************
     *** graphics, UI & browser utils ***
     ************************************/
  
  
    const clickevt = !!('ontouchstart' in window) ? "touchstart" : "click";
  
    // handy shortcuts and shims for manipulating the dom
    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);
    NodeList.prototype.forEach = Array.prototype.forEach
  
    // this code resets the ROT.js display canvas
    // and sets up the touch and click event handlers
    // when it's called at the start of the game
    function resetCanvas(game, el) {
      // $("#canvas").replaceWith($("#canvas").clone());
      $("#canvas").innerHTML = "";
      $("#canvas").appendChild(el);
      window.onkeydown = (e) => keyHandler(game, e);
      window.onkeyup = arrowStop;
      game.listening = true;
      if (usePointer) { $("#canvas").addEventListener(clickevt, function (ev) {
        ev.preventDefault();
        if (game.touchScreen) { return; }
        if (!game.listening) { return; }
        let dir = resolvePointing(game,ev);
        movePlayer(game, dir);
      }); };
      if (useArrows) {
        document.ontouchstart = handleArrowTouch;
        document.ontouchend = arrowStop;
      };
      showScreen("game");
    }
  

  
    /*************************
     *** UI event handlers ***
     *************************/
  
  
//     // when keyboard input happens this even handler is called
//     // and the position of the player is updated
//     function keyHandler(ev) {
//       const code = ev.keyCode;
//       // prevent zoom
//       if (code == 187 || code == 189) {
//         ev.preventDefault();
//         return;
//       }
//       // full screen
//       if (code == 70 && ev.altKey && ev.ctrlKey && ev.shiftKey) {
//         document.body.requestFullscreen();
//         console.log("Full screen pressed.");
//         return;
//       }
//       if (code == 81) { destroy(Game); return; }
//       // if (code == 73) { toggleInventory(ev, true); return; }
//       // if (code == 27) { toggleInventory(ev, true, true); return; } ; escape button should only close
//       if (code == 190) { Game.engine.unlock(); return; } // skip turn
//       /* one of numpad directions? */
//       if (code in moveSelectMap) {
//         console.log("move selector: ",code, moveSelectMap[code]);
//         Game.player.controls.selectMove(moveSelectMap[code]);
//         Game.player.controls.dirty = true;
//         return;
//       }
//       if (code in targetSelectMap) {
//         console.log("target selector:", code, targetSelectMap[code]);
//         console.log("player:", Game.player);
//         console.log("current target:", Game.player.controls.currentTarget);
//         let currentTarget = Game.player.controls.currentTarget
//         let awakeTargets = Game.monsters.filter( (m) => m.awake).map( (m) => m.id);
//         let currentTargetIndex = awakeTargets.indexOf(currentTarget);
//         console.log("currentTargetIndex:",currentTargetIndex,"awake targets:",awakeTargets)
//         let newTargetIndex = currentTargetIndex + targetSelectMap[code];
//         if (newTargetIndex < 0) { 
//           Game.player.controls.currentTarget = awakeTargets[awakeTargets.length - 1];
//         } else if (newTargetIndex >= awakeTargets.length) {
//           Game.player.controls.currentTarget = awakeTargets[0];
//         } else {
//           Game.player.controls.currentTarget = awakeTargets[newTargetIndex];
//         }
//         Game.player.controls.dirty = true;
//         return;
//       }
//       if (code in actionMap) {
//         console.log("ACTION!");
//         if (Game.player.controls.currentTarget) {
//           let target = Game.monsters.filter( (m) => m.id == Game.player.controls.currentTarget )[0];
//           let angle = Math.atan2(  Game.player._y - target._y,  Game.player._x - target._x );
// //          let angle = Math.atan2(  target._y - Game.player._y,  target._x - Game.player._x );
//           let orientation = 0;
//           let frac = angle / Math.PI;
//           if (frac < 0) {
//             frac += 1
//           }

//           if (frac < 1/16) {
//             orientation = 0;
//           } else if (frac < 3/16) {
//             orientation = 1;
//           } else if (frac < 5/16) {
//             orientation = 2;
//           } else if (frac < 7/16) {
//             orientation = 3;
//           } else if (frac < 9/16) {
//             orientation = 4;
//           } else if (frac < 11/16) {
//             orientation = 5;
//           } else if (frac < 13/16) {
//             orientation = 6;
//           } else if (frac < 15/16) {
//             orientation = 7
//           }


//           console.log(`spawning arrow with ${angle} (${angle / Math.PI}) [${orientation}] from player at`,Game.player._x, Game.player._y, `target at`,target._x,target._y);
//           let id = uuidv4();

//           let particle = {
//             id: id,
//             char: "A",
//             orientation: orientation,
//             startPos: [Game.player._x, Game.player._y],
//             endPos: [target._x, target._y],
//             startTime: Game.lastFrame,
//             endTime: Game.lastFrame + 300
//           }
//           Game.particles.push(particle);


//         }
//         return;
//       }
//       if (!(code in keyMap)) { return; }
//       if (code in keyMap) {
//         const dir = ROT.DIRS[8][keyMap[code]];
//         if (Game.display) {
//           ev.preventDefault();
//         }
//         arrowStart(dir);  
//         Game.player.controls.dirty = true;
//       }
//     }
  
  
    // when the on-screen arrow buttons are clicked
    function handleArrowTouch(ev) {
      ev.preventDefault();
      if (ev.target["id"] == "btn-skip") {
        Game.engine.unlock(); return;
      }
      // translate the button to the direction
      const dir = ROT.DIRS[8][arrowMap[ev.target["id"]]];
      // actually move the player in that direction
      arrowStart(dir);
    }
  
    // // handle an on-screen or keyboard arrow
    // function arrowStart(dir) {
    //   let last = Game.arrowHeld;
    //   Game.arrowHeld = dir;
    //   // Game.player.lastArrow = dir;
    //   console.log("arrowHeld:");
    //   console.log(Game.arrowHeld);
    //   if (!last) {
    //     movePlayer(dir)
    //     // document.dispatchEvent(new Event("arrow"));
    //   }
    // }
  
    // when the fingers have been lifted
    function arrowStop(ev) {
      Game.arrowHeld = null;
    }
    
    // this function gets called from the first screen
    // when the "play" button is clicked.
    function startGame(ev) {
      showScreen("game");
      sfx["rubber"].play();
      // if this was a touch event show the arrows buttons
      if (ev["touches"]) {
        $("#arrows").style.display = "block";
        Game.touchScreen = true;
      }
      init(Game);
    }
  
    // this function gets called when the user selects
    // a menu item on the front page and shows the 
    // relevant screen
    function handleMenuChange(which, ev) {
      ev.preventDefault();
      const choice = which.getAttribute("value");
      showScreen(choice);
      sfx["choice"].play();
    }
  
    // this helper function hides any of the menu
    // screens above, shows the title screen again,
    // and plays a sound as it does so
    function hideModal(ev) {
      ev.preventDefault();
      showScreen("title");
      sfx['hide'].play();
    }
  
    function cleanup() {
      destroy(Game);
      $("#play").removeEventListener(clickevt, startGame);
    }
  
  
    /***************
     *** Startup ***
     ***************/
  
  
    // this code is called at load time and sets the game title
    // to the `gametitle` variable at the top
    document.querySelectorAll(".game-title-text")
    .forEach(function(t) {
      t.textContent = gametitle;
    })
  
    // listen for the start game button
    $("#play").addEventListener(clickevt, startGame);
    
    // allow live reloading of the game code
    if (w["rbb"]) {
      w["rbb"].cleanup();
    } else {
      // listen for the end of the title
      // animation to show the first screen
    //   $("#plate").addEventListener(
    //       "animationend", showScreen.bind(null, 'title'));
      // listen for clicks on the front screen menu options
      document.querySelectorAll("#options #menu input")
      .forEach(function(el) {
        el.addEventListener("touchstart",
            handleMenuChange.bind(null, el));
        el.addEventListener("click",
            handleMenuChange.bind(null, el));
      });
      // listen for inventory interactions
      $("#inventory").addEventListener(clickevt, toggleInventory);
      // listen for "close modal" ok buttons
      document.querySelectorAll(".modal button.action")
      .forEach(function(el) {
        el.addEventListener(clickevt, hideModal);
      });
      // listen for back button navigation
      window.onpopstate = function(ev) {
        //console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
        if (Game.engine) {
          destroy(Game);
        } else {
          hideModal(ev);
        }
      };
    }
  
    w["rbb"] = Game;
    
};

export { runGame };