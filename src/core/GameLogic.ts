import { sfx } from "../sound/sfx";
import { v4 as uuidv4 } from 'uuid';
import { RNG, Scheduler, Engine } from "rot-js/lib";
import { battleMessage, createGhost, damageNum, hideToast, removeListeners, renderStats, renderTargets, setEndScreenValues, showScreen, toast } from "../ui/ui";
import { mkTurnLogic } from "../core/TurnLogic";
import { genMap } from "../mapgen/MapGen";
import { spawnLevelFrom } from "../mapgen/Spawner";
import { goldAmountTable, levels } from "../mapgen/Levels"
import { render } from "../display/DisplayLogic";
import { Player } from "../entities/player";
import GameState from "../gamestate";
import { AllCellContents, getCell, initLevel } from "../mapgen/Level";

// these map tiles are walkable
export const walkable = [".", "*", "g"]

// this gets called at the end of the game when we want
// to exit back out and clean everything up to display
// the menu and get ready for next round

export function init(game:GameState, n: number) {
  let width = 80
  let height = 60
  game.map = {};
  game.mapDisplay.clear();
  game.items = {};
  game.running = true;
  game.level = initLevel(n, width, height);

  game.currentLevel = n;
  if (game.maxLevel < n) {
    game.maxLevel = n;
  }
  game.player.in_map = true;

  // this is where we populate the map data structure
  // with all of the background tiles, items,
  // player and the monster positions
  let [zeroCells, freeCells, digger] = genMap(game, width, height, game.tileOptions, game.mapDisplay);
  console.log("spawning map, game state now:",game);
  // spawnLevel(game, digger, freeCells);
  if (n <= 3) {
    spawnLevelFrom(game, digger, levels[n]);
  } else {
    spawnLevelFrom(game, digger, levels[3]);
  }

  // let ROT.js schedule the player and monster entities
  game.scheduler = new Scheduler.Simple();
  let turnLogic = mkTurnLogic(game);
  game.scheduler.add(game.player, true);
  game.scheduler.add(turnLogic, true);
  // game.monsters.map((m) => game.scheduler.add(m, true));

  // kick everything off
  game.engine = new Engine(game.scheduler);
  game.engine.start();

  function drawScene(timestamp) {
    if (game.running == false) {
      return;
    }
    requestAnimationFrame(drawScene);
    if (game.player && game.player.controls.dirty && game.monsters) {
      console.log("ui dirty");
      renderStats(game.player);
      renderTargets(game);
    }
    // TODO: check if key held and not animating player
    render(game,timestamp);
  }

  requestAnimationFrame(drawScene);

}

export function unload(game) {
  game.map = {};
  game.visibleMap = {};
  game.exploreMap = {};
  game.mapDisplay.clear();
  game.level = null;

  game.items = {};
  game.engine = null;
  game.entities = {};
  game.scheduler.clear();
  game.scheduler = null;
  game.monsters = null;
  game.amulet = null;
  game.running = false;
  game.player.in_map = false;

}


export function destroy(game) {
  // remove all listening event handlers
  removeListeners(game);

  // tear everything down and
  // reset all our variables back
  // to null as before init()
  // TODO: all new state
  if (game.engine) {
    unload(game);
    game.player = null;
  }

  // hide the toast message
  hideToast(true);
  // close out the game screen and show the title
  showScreen("title", null);
}

// this gets called when the player loses the game
export function lose(game) {
  game.engine.lock();
  // change the player into a tombstone tile
  const p = game.player;
  p.character = "T";
  // create an animated div element over the top of the game
  // holding a rising ghost image above the tombstone
  const ghost = createGhost(16, 16, [p._x, p._y]);
  // we stop listening for user input while the ghost animates
  removeListeners(game);
  // play the lose sound effect
  sfx["lose"].play();
  // wait 2 seconds for the ghost animation to finish
  setTimeout(function() {
    // set our stats for the end screen
    setEndScreenValues(game.player.stats.xp, game.player.stats.gold);
    // tear down the game
    destroy(game);
    // show the "lose" screen to the user
    showScreen("lose", null);
  }, 2000);
}

// if the monster is dead remove it from the game
export function checkDeath(game,m) {
  if (m.stats.hp < 1) {
    if (m == game.player) {
      toast(game, "You died!");
      lose(game);
    } else {
      let xp = m.stats["xpValue"];
      game.player.stats.xp += xp;
      const key = m._x + "," + m._y;
      removeMonster(game,m);      
      sfx["kill"].play();
      return true;
    }
  }
}

// remove a monster from the game
function removeMonster(game, m) {
  const key = m._x + "," + m._y;
  game.scheduler.remove(m);
  game.monsters = game.monsters.filter(mx=>mx!=m);     
  if (game.player.controls.currentTarget == m.id) {
    game.player.controls.currentTarget = null;
  }
  delete game.entities[m.id];
}

// this is how the player fights a monster
export function combat(game, hitter, receiver) {

  const names = ["you", "the monster"];
  // a description of the combat to tell
  // the user what is happening
  let msg: string[] = [];

  let hitRoll = RNG.getUniformInt(1,14)
  if (hitRoll + hitter.stats.DEX > receiver.stats.AGI) {
    let damageRoll = RNG.getUniformInt(0,hitter.stats.varDAM);
    let dam = hitter.stats.baseDAM + damageRoll + hitter.stats.STR - receiver.stats.DEF;
    damage(game, hitter, receiver, dam);
  } else {
    sfx["miss"].play();
    msg.push(hitter.name + " missed " + receiver.name + ".");
    toast(game, battleMessage(msg));
    let id = uuidv4();
    let particle = {
        id: id,
        char: "F",
        startPos: [receiver._x, receiver._y],
        endPos: [receiver._x, receiver._y],
        startTime: game.lastFrame,
        endTime: game.lastFrame + 100
    }
    game.particles.push(particle);
  }
}

export function damage(game, hitter, receiver, amount) {
  let msg: string[] = [];

  // add to the combat message
  msg.push(hitter.name + " hit " + receiver.name + " for " + amount + " hp");
  // remove hitpoints from the receiver
  receiver.stats.hp -= amount;

  // todo: actually calulate, fewer magic numbers
  let x_offset = 64 * (5 + receiver._x - game.player._x) + 4;
  let y_offset = 64 * (5 + receiver._y - game.player._y) - 24;
  console.log(`printing damage for ${receiver.name} at ${x_offset},${y_offset}`);

  let id = uuidv4();
  let particle = {
      id: id,
      char: "G",
      startPos: [receiver._x, receiver._y],
      endPos: [receiver._x, receiver._y],
      startTime: game.lastFrame,
      endTime: game.lastFrame + 100
  }
  game.particles.push(particle);


  damageNum(x_offset,y_offset,amount);
  // play the hit sound
  sfx["hit"].play();
  
  toast(game, battleMessage(msg));
  checkDeath(game,receiver);
}

// this gets called when the player wins the game
export function win(game) {
  game.engine.lock();
  // play the win sound effect a bunch of times
  for (let i=0; i<5; i++) {
    setTimeout(function() {
      sfx["win"].play();
    }, 100 * i);
  }
  // set our stats for the end screen
  setEndScreenValues(game.player.stats.xp, game.player.stats.gold);
  // tear down the game
  destroy(game);
  // show the blingy "win" screen to the user
  showScreen("win", null);
}

// this method gets called by the `movePlayer` function
// in order to check whether they hit an empty box
// or The Amulet
export function checkItem(game:GameState, entity) {
  const key = entity._x + "," + entity._y;
  let cell = getCell(game.level, entity._x, entity._y);
  let newContents: AllCellContents[] = [];
  for (let idx = 0; idx < cell.contents.length; idx++) {
    let item = cell.contents[idx];
    if (item.kind == "GoldContent") {
      game.player.stats.gold += item.quantity;
      renderStats(game.player);
      toast(game, `You found ${item.quantity} gold!`);
      game.player.inventory.push([item.item,""]);
      sfx["win"].play();
      delete game.items[key];  
    } else if (item.kind == "ItemContent") {

      if (item.item == "f" || game.items == "h") {
        toast(game, `You found food!`);
        if (game.player.stats.food < game.player.stats.maxFood) {
            game.player.stats.food += 1;
            // re-enable EAT
            sfx["win"].play();
            delete game.items[key];
        } else {
          newContents.push(item)
          game.items[key] = "h"
        }
      } else if (game.items[key] == "r" || game.items[key] == "s") {
        toast(game, `You found arrows!`);
        if (game.player.stats.arrows < game.player.stats.maxArrows) {
          game.player.stats.arrows += 2;
          // re-enable BOW
          if (game.player.stats.arrows > game.player.stats.maxArrows) {
            game.player.stats.arrows = game.player.stats.maxArrows
          }
          sfx["win"].play();
          delete game.items[key];  
        } else {
          newContents.push(item)
          game.items[key] = "s";
        }
      }  

    } else if (item.kind == "QuestItemContent") {

      toast(game, `You found the ${item.item}`);
      game.player.inventory.push([item.item,""]);
      sfx["win"].play();
      delete game.items[key];    
    } else if (item.kind == "ContainerContent") {

      toast(game, "This chest is empty.");
      sfx["empty"].play();
      delete game.items[key];  
    } else if (item.kind == "ExitContent") {
      newContents.push(item)
      
    }
  }
  cell.contents = newContents;

  if (game.items[key] == "Q") {
    // the amulet is hit initiate the win flow below
    // toast(game, "You found THE AMULET");
    // game.player.inventory.push(["amulet","the cursed amulet"])
    // sfx["win"].play();
    // delete game.items[key];
    // win(game);
  } else if (game.items[key] == "g") {
    // if the player stepped on gold
    // increment their gold stat,
    // show a message, re-render the stats
    // then play the pickup/win sound
    let [lower, upper, bonus] = goldAmountTable[game.currentLevel];
    let goldAmount = RNG.getUniformInt(lower, upper);
    game.player.stats.gold += goldAmount;
    renderStats(game.player);
    toast(game, `You found ${goldAmount} gold!`);
    sfx["win"].play();
    delete game.items[key];
  } else if (game.items[key] == "f" || game.items[key] == "h") {
    // toast(game, `You found food!`);
    // if (game.player.stats.food < game.player.stats.maxFood) {
    //   game.player.stats.food += 1;
    //   // re-enable EAT
    //   sfx["win"].play();
    //   delete game.items[key];
    // } else {
    //   game.items[key] = "h"
    // }
  } else if (game.items[key] == "r" || game.items[key] == "s") {
    // toast(game, `You found arrows!`);
    // if (game.player.stats.arrows < game.player.stats.maxArrows) {
    //   game.player.stats.arrows += 2;
    //   // re-enable BOW
    //   if (game.player.stats.arrows > game.player.stats.maxArrows) {
    //     game.player.stats.arrows = game.player.stats.maxArrows
    //   }
    //   sfx["win"].play();
    //   delete game.items[key];  
    // } else {
    //   game.items[key] = "s";
    // }
  } else if (game.items[key] == "*") {
    // if an empty box is opened
    // by replacing with a floor tile, show the user
    // a message, and play the "empty" sound effect
    toast(game, "This chest is empty.");
    sfx["empty"].play();
    delete game.items[key];
  } else if (game.items[key] == "<") {
    toast(game, "These are the stairs up");
  } else if (game.items[key] == ">") {
    toast(game, "These are the stairs down");
  }
}