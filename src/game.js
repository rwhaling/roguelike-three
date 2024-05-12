import MyDisplay from "./mydisplay";
import { render } from "./display/DisplayLogic";
import { destroy, init } from "./core/GameLogic";
import { Display } from "rot-js/lib/index";
import GameState from "./gamestate"
import { makePlayer } from "./entities/player";
import { sfx } from "./sound/sfx";
import { showScreen, renderStats, toggleInventory, renderTargets, renderTown, hideToast } from "./ui/ui";
import { keyHandler, resolvePointing } from "./ui/hid";
import { getTownState } from "./core/TownLogic";

// import Crypto from "cryptojs";
import * as Crypto from "crypto-js";

function runGame(w,mydisplay) {

    // Update this string to set the game title
    const gametitle = "Barrow 2";
  
    /*****************
     *** resources ***
     *****************/
  
    // This tileset is from kenney.nl
    // It's the "microrogue" tileset
  
    const tileSet = document.createElement("img");

    tileSet.src = ""
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
        "<": [464, 0], // stairs up
        ">": [448, 0], // stairs down

        "x": [256, 192], // axe
        "p": [256, 192], // potion
        "f": [288, 192], // food (chest)
        "h": [464, 432], // food (opened)
        "r": [288, 192], // ammo (chest)
        "s": [400, 480], // ammo (opened)
        "t": [224, 672], // reticle

        "a": [336, 256], // tree 1
        "b": [336, 256], // tree 2
        "c": [336, 256], // tree 3
        "d": [336, 256], // tree 4
        "e": [336, 256], // tree 5

        "A": [256, 368], // arrow particle
        "F": [224, 640], // white flash
        "G": [192, 672], // red flash
        "H": [144, 672], // green flash
        "Q": [496, 462], // quest item (unopened)
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
    Game.tileOptions = tileOptions;
    Game.cleanup = cleanup;
  
    // this gets called by the menu system
    // to launch the actual game
    function setup(game) {
      game.player = makePlayer(game);

      console.log("about to retrieve encrypted image")

      // var picture = document.getElementById("picture");
      var data = new XMLHttpRequest();
      data.open('GET', 'tiny_dungeon_world_3.png.enc.b64', true);
      data.onreadystatechange = function(){
          if(this.readyState == 4 && this.status==200){
              console.log("got back data", data.responseText.length, "bytes")
              console.log("Crypto:",Crypto);
              var dec = Crypto.AES.decrypt(data.responseText, process.env.ASSET_KEY);
              var plain = Crypto.enc.Base64.stringify( dec );
              tileSet.src = "data:image/png;base64,"+plain;

              // first create a ROT.js display manager
              // TODO: picking up map width as display width, not ideal
              game.display = new MyDisplay(tileOptions);
              game.mapDisplay = new Display({width: 80, height: 60, fontSize:3, });

              init(game,1)

              // first create a ROT.js display manager
              // TODO: picking up map width as display width, not ideal
              // game.display = new MyDisplay(tileOptions);
              resetCanvas(game, game.display.getContainer());
              // let mapDisplay = new Display({width: 80, height: 60, fontSize:3, });

              $("#mapcanvas").innerHTML = "";
              $("#mapcanvas").appendChild(game.mapDisplay.getContainer());  
        } else {
            console.log("bad response: ", this)
          }
      };
      data.send(null);
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
        game.player.controls.movePlayer(game, dir);
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
      setup(Game);
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
      let choice = ev.target['id'];
      console.log("hiding modal, returning to title", ev);
      ev.preventDefault();
      if (choice == "lose-cheat") {
        console.log("cheat selected", Game);
        Game.player.stats.hp = Game.player.stats.maxHP;
        hideToast(true);
        init(Game,Game.level.depth,Game.level.biome);
        let nextState = getTownState(Game, "town");
        renderTown(Game, nextState);
        showScreen("town");
      } else {
        // tear down the game
        destroy(Game);

        showScreen("title");
      }
      sfx['hide'].play();
    }

    // this helper function hides any of the menu
    // screens above, shows the title screen again,
    // and plays a sound as it does so
    function hideModalGame(ev) {
      console.log("hiding modal and returning to game", ev);
      ev.preventDefault();
      showScreen("game");
      sfx['choice'].play();
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
      // $("#inventory").addEventListener(clickevt, toggleInventory);
      $("#inventory").addEventListener(clickevt, (e) => {
        console.log("inventory clicked");
        toggleInventory(e,false, Game);
      });
    


      // listen for "close modal" ok buttons
      document.querySelectorAll(".modal button.action")
      .forEach(function(el) {
        if (el.id == "return") {
          el.addEventListener(clickevt, hideModalGame);
        } else {
          el.addEventListener(clickevt, hideModal);
        }
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