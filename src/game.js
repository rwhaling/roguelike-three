import MyDisplay from "./mydisplay";
import { drawTile, drawPlayer, drawMonster, render } from "./display/DisplayLogic";
import { Display } from "rot-js/lib/index"
import GameState from "./gamestate"
import { genMap, createBeing } from "./mapgen/MapGen";
import { Player, makePlayer } from "./entities/player";
import { showScreen, setEndScreenValues, renderInventory, selectedInventory, inventoryRemove, renderStats, toggleInventory, createGhost, toast, battleMessage, hideToast } from "./ui/ui";
function runGame(w,mydisplay) {

    // Update this string to set the game title
    const gametitle = "The 3";
  
    /*****************
     *** resources ***
     *****************/
  
    // This tileset is from kenney.nl
    // It's the "microrogue" tileset
  
    const tileSet = document.createElement("img");
    tileSet.src = "tiny_dungeon_sprites_1.png"
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

        "T": [400, 192], // tombstone

        "╔": [352, 0],  // room corner
        "╗": [368, 0], // room corner
        "╝": [272, 0], // room corner
        "╚": [288, 0], // room corner
        "═": [256, 0],  // room edge
        "║": [368, 0], // room edge
        "o": [384, 0], // room corner
      },
      width: 20,
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
  
    // These sound effects are generated using sfxr.me
    //
    // You can generate your own and click the "copy" button
    // to get the sound code and paste it here.
    // Play sounds using this code: `sfxr[soundname].play()`
  
    const sfx = {
      "rubber": "5EoyNVaezhPnpFZjpkcJkF8FNCioPncLoztbSHU4u9wDQ8W3P7puffRWvGMnrLRdHa61kGcwhZK3RdoDRitmtwn4JjrQsZCZBmDQgkP5uGUGk863wbpRi1xdA",
      "step": "34T6PkwiBPcxMGrK7aegATo5WTMWoP17BTc6pwXbwqRvndwRjGYXx6rG758rLSU5suu35ZTkRCs1K2NAqyrTZbiJUHQmra9qvbBrSdbBbJ7JvmyBFVDo6eiVD",
      "choice": "34T6PkzXyyB6jHiwFztCFWEWsogkzrhzAH3FH2d97BCuFhqmZgfuXG3xtz8YYSKMzn95yyX8xZXJyesKmpcjpEL3dPP5h2e8mt5MmhExAksyqZyqgavBgsWMd",
      "hide": "34T6PkzXyyB6jHiwFztCFWEniygA1GJtjsQuGxcd38JLDquhRqTB28dQgigseMjQSjSY14Z3aBmAtzz9KWcJZ2o9S1oCcgqQY4dxTAXikS7qCs3QJ3KuWJUyD",
      "empty": "111112RrwhZ2Q7NGcdAP21KUHHKNQa3AhmK4Xea8mbiXfzkxr9aX41M8XYt5xYaaLeo9iZdUKUVL3u2N6XASue2wPv2wCCDy6W6TeFiUjk3dXSzFcBY7kTAM",
      "hit": "34T6Pks4nddGzchAFWpSTRAKitwuQsfX8bfzRpJx5eDR7NSqxeeLMEkLjcuwvTCDS1ve7amXBg4eipzDdgKWoYnJBsQVESZh2X1DFV2GWybY5bAihB2EdHsbd",
      "miss": "8R25jogvbp3Qy6A4GTPxRP4aT2SywwsAgoJ2pKmxUFMExgNashjgd311MnmZ2ThwrPQz71LA53QCfFmYQLHaXo6SocUv4zcfNAU5SFocZnoQSDCovnjpioNz3",
      "win": "34T6Pkv34QJsqDqEa8aV4iwF2LnASMc3683oFUPKZic6kVUHvwjUQi6rz8qNRUHRs34cu37P5iQzz2AzipW3DHMoG5h4BZgDmZnyLhsXgPKsq2r4Fb2eBFVuR",
      "lose": "7BMHBGHKKnn7bgcmGprqiBmpuRaTytcd4JS9eRNDzUTRuQy8BTBzs5g8XzS7rrp4C9cNeSaqAtWR9qdvXvtnWVTmTC8GXgDuCXD2KyHJNXzfUahbZrce8ibuy",
      "kill": "7BMHBGKMhg8NZkxKcJxNfTWXKtMPiZVNsLR4aPEAghCSpz5ZxpjS5k4j4ZQpJ65UZnHSr4R2d7ALCHJe41pAS2ZPjauM7SveudhDGAxw2dhXpiNwEhG8xUYkX",
    }
  
    // here we are turning the sfxr sound codes into
    // audio objects that can be played with `sfx[name].play()`
    for (let s in sfx) {
      sfx[s] = (new SoundEffect(sfx[s])).generate().getAudio();
    }
  
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
      game.display = new MyDisplay(tileOptions);
    //   game.display._backend = new MyDisplay();
      resetCanvas(game.display.getContainer());
      let mapDisplay = new Display({width: 20, height: 20, fontSize:6, });

      $("#mapcanvas").innerHTML = "";
      $("#mapcanvas").appendChild(mapDisplay.getContainer());

      // this is where we populate the map data structure
      // with all of the background tiles, items,
      // player and the monster positions
      let [zeroCells, freeCells] = genMap(game, tileOptions, mapDisplay);
      game.player = createBeing(game, makePlayer, freeCells);
      game.monsters = [createBeing(game, makeMonster, freeCells)];
      game.display.setPlayerPos(game.player._x, game.player._y);

      //   generateMap(game);
  
      // let ROT.js schedule the player and monster entities
      game.scheduler = new ROT.Scheduler.Simple();
      game.scheduler.add(game.player, true);
      game.monsters.map((m) => game.scheduler.add(m, true));
  
      // render some example items in the inventory
      renderInventory(tileOptions, game.player.inventory);
  
      // render the stats hud at the bottom of the screen
      renderStats(game.player);
  
      // kick everything off
      game.engine = new ROT.Engine(game.scheduler);
      game.engine.start();
      requestAnimationFrame(drawScene);
    }
  
    // this gets called at the end of the game when we want
    // to exit back out and clean everything up to display
    // the menu and get ready for next round
    function destroy(game) {
      // remove all listening event handlers
      removeListeners(game);
  
      // tear everything down and
      // reset all our variables back
      // to null as before init()
      if (game.engine) {
        game.engine.lock();
        game.display = null;
        game.map = {};
        game.items = {};
        game.engine = null;
        game.scheduler.clear();
        game.scheduler = null;
        game.player = null;
        game.monsters = null;
        game.amulet = null;
      }
  
      // hide the toast message
      hideToast(true);
      // close out the game screen and show the title
      showScreen("title");
    }
      
    function drawScene(timestamp) {
        if (Game.display === null) {
            return;
        }
        if (Game.player && Game.player.controls.dirty) {
          renderStats(Game.player);
        }
        // TODO: check if key held and not animating player
        requestAnimationFrame(drawScene);
        render(Game,timestamp);
    }

    // this method gets called by the `movePlayer` function
    // in order to check whether they hit an empty box
    // or The Amulet
    function checkItem(entity) {
      const key = entity._x + "," + entity._y;
      if (key == Game.amulet) {
        // the amulet is hit initiate the win flow below
        win();
      } else if (Game.items[key] == "g") {
        // if the player stepped on gold
        // increment their gold stat,
        // show a message, re-render the stats
        // then play the pickup/win sound
        Game.player.stats.gold += 1;
        renderStats(Game.player);
        toast(Game, "You found gold!");
        sfx["win"].play();
        delete Game.items[key];
      } else if (Game.items[key] == "*") {
        // if an empty box is opened
        // by replacing with a floor tile, show the user
        // a message, and play the "empty" sound effect
        toast(Game, "This chest is empty.");
        sfx["empty"].play();
        delete Game.items[key];
      }
    }
  
    // move the player according to a direction vector
    // called from the keyboard event handler below
    // `keyHandler()`
    // and also from the click/tap handler `handlePointing()` below
    function movePlayer(dir) {
      const p = Game.player;
      Game.player.lastArrow = dir;
      console.log("moving player");
      console.log(dir);
      return movePlayerTo(p._x + dir[0], p._y + dir[1]);
    }
  
    // move the player on the tilemap to a particular position
    function movePlayerTo(x, y) {
      // get a reference to our global player object
      // this is needed when called from the tap/click handler
      const p = Game.player;
  
      // map lookup - if we're not moving onto a floor tile
      // or a treasure chest, then we should abort this move
      const newKey = x + "," + y;
      if (walkable.indexOf(Game.map[newKey]) == -1) { return; }
  
      // check if we've hit the monster
      // and if we have initiate combat
      const hitMonster = monsterAt(x, y);
      if (hitMonster) {
        // we enter a combat situation
        combat(p, hitMonster);
        // pass the turn on to the next entity
        setTimeout(function() {
          Game.engine.unlock();
        }, 250);
      } else {
        // we're taking a step
  
        // hide the toast message when the player moves
        hideToast();
  
        // update the old tile to whatever was there before
        // (e.g. "." floor tile)
        let oldKey = p._x + "," + p._y;

        // update the player's coordinates
        p._x = x;
        p._y = y;

        let newKey = p._x + "," + p._y;
        let animation = {
            startPos: oldKey,
            endPos: newKey,
            startTime: Game.lastFrame,
            endTime: Game.lastFrame + 200
        }
        Game.animating[newKey] = animation;

        Game.engine.unlock();
        // play the "step" sound
        sfx["step"].play();
        // check if the player stepped on an item
        checkItem(p);
      }
    }
  
  
    /*******************
     *** The monster ***
     *******************/
  
  
    // basic ROT.js entity with position and stats
    function makeMonster(game, x, y) {
      return {
        // monster position
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
        combat(m, p);
      } else {
        // draw whatever was on the last tile the monster was one
        let oldKey = m._x + "," + m._y;
        // the player is safe for now so update the monster position
        // to the first step on the path and redraw
        let delta = [path[0][0] - m._x, path[0][1] - m._y ];
        console.log("moving monster");
        console.log(delta);
        m.lastArrow = delta;

        m._x = path[0][0];
        m._y = path[0][1];
        let newKey = m._x + "," + m._y;
        let animation = {
            startPos: oldKey,
            endPos: newKey,
            startTime: Game.lastFrame,
            endTime: Game.lastFrame + 250
        }
        Game.animating[newKey] = animation;
      }
    }
  
    function monsterAt(x, y) {
      if (Game.monsters && Game.monsters.length) {
        for (let mi=0; mi<Game.monsters.length; mi++) {
          const m = Game.monsters[mi];
          if (m && m._x == x && m._y == y) {
            return m;
          }
        }
      }
    }
  
    function playerAt(x, y) {
      return Game.player && Game.player._x == x && Game.player._y == y ? Game.player : null;
    }
  
    // if the monster is dead remove it from the game
    function checkDeath(m) {
      if (m.stats.hp < 1) {
        if (m == Game.player) {
          toast(Game, "You died!");
          lose();
        } else {
          const key = m._x + "," + m._y;
          removeMonster(m);
          sfx["kill"].play();
          return true;
        }
      }
    }
  
    // remove a monster from the game
    function removeMonster(m) {
      const key = m._x + "," + m._y;
      Game.scheduler.remove(m);
      Game.monsters = Game.monsters.filter(mx=>mx!=m);
    }
  
  
    /******************************
     *** combat/win/lose events ***
     ******************************/
  
  
    // this is how the player fights a monster
    function combat(hitter, receiver) {
      const names = ["you", "the monster"];
      // a description of the combat to tell
      // the user what is happening
      let msg = [];
      // roll a dice to see if the player hits
      const roll1 = ROT.RNG.getItem([1,2,3,4,5,6]);
      // a hit is a four or more
      if (roll1 > 3) {
        // add to the combat message
        msg.push(hitter.name + " hit " + receiver.name + ".");
        // remove hitpoints from the receiver
        receiver.stats.hp -= roll1;
        // play the hit sound
        sfx["hit"].play();
      } else {
        sfx["miss"].play();
        msg.push(hitter.name + " missed " + receiver.name + ".");
      }
      // if there is a message to display do so
      if (msg) {
        toast(Game, battleMessage(msg));
      }
      // check if the receiver has died
      checkDeath(receiver);
    }
  
    // this gets called when the player wins the game
    function win() {
      Game.engine.lock();
      // play the win sound effect a bunch of times
      for (let i=0; i<5; i++) {
        setTimeout(function() {
          sfx["win"].play();
        }, 100 * i);
      }
      // set our stats for the end screen
      setEndScreenValues(Game.player.stats.xp, Game.player.stats.gold);
      // tear down the game
      destroy(Game);
      // show the blingy "win" screen to the user
      showScreen("win");
    }
  
    // this gets called when the player loses the game
    function lose() {
      Game.engine.lock();
      // change the player into a tombstone tile
      const p = Game.player;
      p.character = "T";
      // create an animated div element over the top of the game
      // holding a rising ghost image above the tombstone
      const ghost = createGhost(tileOptions, [p._x, p._y]);
      // we stop listening for user input while the ghost animates
      removeListeners(Game);
      // play the lose sound effect
      sfx["lose"].play();
      // wait 2 seconds for the ghost animation to finish
      setTimeout(function() {
        // set our stats for the end screen
        setEndScreenValues(Game.player.stats.xp, Game.player.stats.gold);
        // tear down the game
        destroy(Game);
        // show the "lose" screen to the user
        showScreen("lose");
      }, 2000);
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
    function resetCanvas(el) {
      $("#canvas").innerHTML = "";
      $("#canvas").appendChild(el);
      window.onkeydown = keyHandler;
      window.onkeyup = arrowStop;
      if (usePointer) { $("#canvas").addEventListener(clickevt, handlePointing); };
      if (useArrows) {
        document.ontouchstart = handleArrowTouch;
        document.ontouchend = arrowStop;
      };
      showScreen("game");
    }
  
    // while showing the lose animation we don't want
    // any event handlers to fire so we remove them
    // and lock the game
    function removeListeners(game) {
      if (game.engine) {
        game.arrowHeld = null;
        game.engine.lock();
        game.scheduler.clear();
        window.onkeydown = null;
        window.onkeyup = null;
        if (usePointer) { $("#canvas").removeEventListener(clickevt, handlePointing); };
        if (useArrows) {
          document.ontouchstart = null;
          document.ontouchend = null;
        };
      }
    }  
  
    /*************************
     *** UI event handlers ***
     *************************/
  
  
    // when a touch event happens
    // this is where it is caught
    function handlePointing(ev) {
      ev.preventDefault();
      if (Game.touchScreen) { return; }
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
      const dir = ROT.DIRS[8][tapMap[qs]];
      // actually move the player in that direction
      movePlayer(dir);
    }
  
    // when keyboard input happens this even handler is called
    // and the position of the player is updated
    function keyHandler(ev) {
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
      if (code == 81) { destroy(Game); return; }
      // if (code == 73) { toggleInventory(ev, true); return; }
      // if (code == 27) { toggleInventory(ev, true, true); return; } ; escape button should only close
      if (code == 190) { Game.engine.unlock(); return; } // skip turn
      /* one of numpad directions? */
      if (code in moveSelectMap) {
        console.log("move selector: ",code, moveSelectMap[code]);
        Game.player.controls.selectMove(moveSelectMap[code]);
        return;
      }
      if (code in targetSelectMap) {
        console.log("target selector:", code, targetSelectMap[code]);
        return;
      }
      if (!(code in keyMap)) { return; }
      if (code in keyMap) {
        const dir = ROT.DIRS[8][keyMap[code]];
        if (Game.display) {
          ev.preventDefault();
        }
        arrowStart(dir);  
      }
    }
  
  
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
  
    // handle an on-screen or keyboard arrow
    function arrowStart(dir) {
      let last = Game.arrowHeld;
      Game.arrowHeld = dir;
      // Game.player.lastArrow = dir;
      console.log("arrowHeld:");
      console.log(Game.arrowHeld);
      if (!last) {
        movePlayer(dir)
        // document.dispatchEvent(new Event("arrow"));
      }
    }
  
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