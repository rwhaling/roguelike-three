import { sfx } from "../sound/sfx";
import { v4 as uuidv4 } from 'uuid';
import { RNG, Scheduler, Engine } from "rot-js/lib";
import { battleMessage, createGhost, damageNum, hideToast, removeListeners, renderLoseScreen, renderStats, renderTargets, setEndScreenValues, showScreen, toast } from "../ui/ui";
import { checkNextTurn, mkTurnLogic } from "../core/TurnLogic";
import { genMap } from "../mapgen/MapGen";
import { RoomContents, spawnLevelFrom } from "../mapgen/Spawner";
import { goldAmountTable, dungeonLevels, cryptLevels } from "../mapgen/Levels"
import { render } from "../display/DisplayLogic";
import { makePlayer } from "../entities/player";
import GameState from "../gamestate";
import { AllCellContents, DecorItemContent, getCell, initLevel, ItemContent, QuestItemContent } from "../mapgen/Level";
import { Quest, QuestStatus, quests } from "../mapgen/Quests";
import { play, musicState, stopMusic } from "../sound/music";
import Display from "../mydisplay";
import MyDisplay from "../myglbackend";
import { createMapArray } from "../display/WebGLDisplay";
import { animationDone, purgeAnimations } from "../display/Animation";

// these map tiles are walkable
export const walkable = [".", "*", "g"]

// this gets called at the end of the game when we want
// to exit back out and clean everything up to display
// the menu and get ready for next round

export function init(game:GameState, n: number, biome:string = "dungeon") {
  let width = 40
  let height = 40
  game.map = {};
  game.mapDisplay.clear();
  game.items = {};
  game.running = true;
  game.level = initLevel(n, biome, width, height);
  game.visibleMap = {};
  game.exploreMap = {};

  game.currentLevel = n;
  game.currentBiome = biome;
  game.player.in_map = true;
  game.player.character = "@";

  if (game.biomeUnlock[biome] < n) {
    game.biomeUnlock[biome] = n
  }


  game.currentQuest = null;
  let questRoom: RoomContents[] = null;

  for (let questName in quests) {
    let quest = quests[questName];
    if (quest.status == "accepted") {
      // console.log(`checking if accepted quest ${questName} is loadable`);
      if (quest.biome == biome && quest.depth == n) {
        // console.log(`loading quest ${questName} for biome ${biome} level ${n}`);
        game.currentQuest = questName;
        questRoom = quest.room;
        break;
      }
    }
  }
  
  let levels = dungeonLevels
  if (biome == "crypt") {
    levels = cryptLevels
  } 

  // // new small-grid tiles 
  // game.display._options.tileMap["."] = [27,7]
  // game.display._options.tileMap["╔"] = [22,5]
  // game.display._options.tileMap["╗"] = [22,5]
  // game.display._options.tileMap["╝"] = [22,5]
  // game.display._options.tileMap["╚"] = [22,5]
  // game.display._options.tileMap["═"] = [22,5]
  // game.display._options.tileMap["║"] = [22,5]
  // game.display._options.tileMap["o"] = [22,5]

    // // new small-grid tiles 
    let newTileset: {[key:string]:[number,number][]} = {
      ".":[[27,7],[28,7],[29,7],[30,7],[31,7],[22,7],[22,7],[22,7]],
      "╔":[[22,5]],
      "╗":[[22,5]],
      "╝":[[27,5]],
      "╚":[[27,5]],
      "═":[[27,5]],
      "║":[[22,5]],
      "o":[[22,5]]
    }

    if (biome == "crypt") {
      newTileset = {
        ".":[[27,8],[28,8],[29,8],[30,8],[31,8],[22,8],[22,8],[22,8]],
        "╔":[[22,6]],
        "╗":[[22,6]],
        "╝":[[27,6]],
        "╚":[[27,6]],
        "═":[[27,6]],
        "║":[[22,6]],
        "o":[[22,6]]  
      }
    }
  // if (biome == "crypt") {
  //   levels = cryptLevels;
  //   game.display._options.tileMap["."] = [272,80]

  //   game.display._options.tileMap["╔"] = [352,32]
  //   game.display._options.tileMap["╗"] = [368,32]
  //   game.display._options.tileMap["╝"] = [272,32]
  //   game.display._options.tileMap["╚"] = [288,32]
  //   game.display._options.tileMap["═"] = [256,32]
  //   game.display._options.tileMap["║"] = [368,32]
  //   game.display._options.tileMap["o"] = [384,32]

  // } else {
  //   game.display._options.tileMap["."] = [400,64]

  //   game.display._options.tileMap["╔"] = [352,48]
  //   game.display._options.tileMap["╗"] = [368,48]
  //   game.display._options.tileMap["╝"] = [272,48]
  //   game.display._options.tileMap["╚"] = [288,48]
  //   game.display._options.tileMap["═"] = [256,48]
  //   game.display._options.tileMap["║"] = [368,48]
  //   game.display._options.tileMap["o"] = [384,48]
  // }
  // if (game.playerClass == "ranger") {
  //   game.display._options.tileMap["@"] = [128,64]
  // } else if (game.playerClass == "bard") {
  //   game.display._options.tileMap["@"] = [192,64]
  // }
  // this is where we populate the map data structure
  // with all of the background tiles, items,
  // player and the monster positions
  // console.log(`generating map (BIOME ${biome}), game state now:`,game);
  // spawnLevel(game, digger, freeCells);
  let [zeroCells, freeCells, digger] = genMap(game, width, height, game.tileOptions, game.mapDisplay);

  // console.log('generating new-style map array for texture with width', width, "height", height);
  let tilemapArray = createMapArray(game.map, width, height, newTileset);
  // console.log(tilemapArray)
  let tilemapTexture = game.glDisplay.loadTilemap(tilemapArray,width,height)
  // console.log("loading into texture",tilemapTexture)

  // console.log("spawning map contents with ", biome, n, game.currentQuest);
  
  if (n <= 7) {
    spawnLevelFrom(game, digger, levels[n], quests[game.currentQuest]);
  } else {
    spawnLevelFrom(game, digger, levels[7], quests[game.currentQuest]);
  }

  // let ROT.js schedule the player and monster entities
  game.scheduler = new Scheduler.Simple();
  // let turnLogic = mkTurnLogic(game);
  // game.scheduler.add(game.player, true);
  // game.scheduler.add(turnLogic, true);
  // game.monsters.map((m) => game.scheduler.add(m, true));

  // kick everything off
  game.engine = new Engine(game.scheduler);
  game.engine.start();
  game.listening = true;

  function drawScene(timestamp) {
    if (game.running == false) {
      return;
    }
    requestAnimationFrame(drawScene);
    if (game.player && game.player.controls.dirty && game.monsters) {
      // console.log("ui dirty");
      renderStats(game.player);
      renderTargets(game);
    }
    // TODO: check if key held and not animating player
    // TODO: update all animations
    render(game,timestamp);
    purgeAnimations(game);

    checkNextTurn(game);

    // TODO: purge done animations
    /*
      - if no more animations:
        - if player_waiting stage: keep waiting
        - if player_animating stage:
          - create list of monster turns
          - update state to monster_animating
          - execute first monster turn
        - if monster_animating:
          - if there are remaining monster turns:
            - ui dirty
            - take next monster turn and execute
          - if there are not:
            - switch to player_waiting stage
            - maybe check for player death?
            - maybe check for a held key and/or interrupt?
            - else set game.listening = true
    */

  }

  requestAnimationFrame(drawScene);
  if (musicState != "dungeon") {
    // HACK - this causes problems on restart after death since we init() and then immediately load town
    play("dungeon");
    // music.stop();
    // music.play("dungeon");  
    // setMusicState("dungeon");

  }
  // music.stop();
  // music.play("dungeon");  

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
  game.listening = false;
  // change the player into a tombstone tile
  const p = game.player;
  p.character = "T";
  let oldsprite = p.sprite;
  p.sprite = [25,48];
  // create an animated div element over the top of the game
  // holding a rising ghost image above the tombstone
  const ghost = createGhost(16, 16, [p._x, p._y]);

  // // we stop listening for user input while the ghost animates
  // removeListeners(game);

  // play the lose sound effect
  sfx["lose"].play();
  stopMusic();
  // wait 2 seconds for the ghost animation to finish
  game.listening = false;
  setTimeout(function() {
    // set our stats for the end screen
    setEndScreenValues(game.player.stats.xp, game.player.stats.gold);
    // // tear down the game
    // destroy(game);
    // show the "lose" screen to the user
    showScreen("lose", null);
    renderLoseScreen(game);
    p.sprite = oldsprite;
  }, 2000);
}

// if the monster is dead remove it from the game
export function checkDeath(game:GameState,m) {
  if (m.stats.hp < 1) {
    if (m == game.player) {
      renderStats(game.player);
      toast(game, "You died!");
      let cell = getCell(game.level, m._x, m._y)
      let i:ItemContent = {
        kind: "ItemContent",
        x: m._x,
        y: m._y,
        item: "U",
      }
      cell.contents.push(i)
      game.items[`${m._x},${m._y}`] = "U"

      lose(game);
    } else {
      let xp = m.stats["xpValue"];
      game.player.stats.xp += xp;
      const key = m._x + "," + m._y;
      removeMonster(game,m);      
      if (m.loot) {
        // console.log('spawning loot drop:', m.loot);

        let cell = getCell(game.level, m._x, m._y)
        if (m.loot[0] == "Q") {
          let i:QuestItemContent = {
            kind: "QuestItemContent",
            x: m._x,
            y: m._y,
            item: m.loot[1]
          }
          cell.contents.push(i)
          game.items[key] = m.loot[0]  
        } else {
          let i:ItemContent = {
            kind: "ItemContent",
            x: m._x,
            y: m._y,
            item: m.loot[1]
          }
          cell.contents.push(i)
          game.items[key] = m.loot[0]
        }
        game.level.newDrops.push([m._x, m._y])
      } else {
        // console.log("generating loot at random");
        let roll = RNG.getUniformInt(0,19);
        if (roll > 4) {
          // console.log('spawning loot drop for level:', game.level.biome, game.level.depth);

          let cell = getCell(game.level, m._x, m._y)

          let i:ItemContent = {
            kind: "ItemContent",
            x: m._x,
            y: m._y,
            item: "g"
          }
          cell.contents.push(i)
          game.items[key] = "g"
          game.level.newDrops.push([m._x, m._y])

        } else {
          // console.log(`rolled ${roll},no loot`)
          if (!(key in game.items)) {
            let cell = getCell(game.level, m._x, m._y)
            let i:ItemContent = {
              kind: "ItemContent",
              x: m._x,
              y: m._y,
              item: "U",
            }
            cell.contents.push(i)
            game.items[key] = "U"
          }
        }
      }
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
    if (dam <= 0) {
      // TODO: plink formula
      dam = 1
    }
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
        duration: 100,
        delay: 0,
        elapsed: 0
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
  // console.log(`printing damage for ${receiver.name} at ${x_offset},${y_offset}`);

  let id = uuidv4();
  let particle = {
      id: id,
      char: "G",
      startPos: [receiver._x, receiver._y],
      endPos: [receiver._x, receiver._y],
      duration: 100,
      delay: 0,
      elapsed: 0
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
  let stairs = undefined;
  for (let idx = 0; idx < cell.contents.length; idx++) {
    let item = cell.contents[idx];
    if (item.kind == "GoldContent") {
      // Not implemented
      game.player.stats.gold += item.quantity;
      renderStats(game.player);
      toast(game, `You found ${item.quantity} gold!`);
      // game.player.inventory.push([item.item,""]);
      sfx["win"].play();
      delete game.items[key];  
    } else if (item.kind == "ItemContent") {

      if (item.item == "f" || item.item == "h") {
        if (game.player.stats.food < game.player.stats.maxFood) {
          toast(game, `You found food!`);
          game.player.stats.food += 1;
            // re-enable EAT
            sfx["win"].play();
            delete game.items[key];
        } else {
          toast(game, "You found food! (But your bags are full)");
          item.item = "h";
          newContents.push(item)
          game.items[key] = "h"
        }
      } else if (item.item == "r" || item.item == "s") {
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
          item.item = "s";
          newContents.push(item)
          game.items[key] = "s";
        }
      } else if (item.item == "g") {
        let goldAmountLevel = game.currentLevel;
        if (game.currentBiome == "crypt") {
          goldAmountLevel = game.currentLevel + 4;
        }
        let [lower, upper, bonus] = goldAmountTable[goldAmountLevel];
        let goldAmount = RNG.getUniformInt(lower, upper);
        game.player.stats.gold += goldAmount;
        renderStats(game.player);
        toast(game, `You found ${goldAmount} gold!`);
        sfx["win"].play();
        delete game.items[key];            
      } else if (item.item == "*") {
        toast(game, "This barrel is empty.");
        sfx["empty"].play();
        game.items[key] = "&";
        item.item = "&";
        newContents.push(item);
        // delete game.items[key];    
      } else if (item.item == "&") {
        newContents.push(item);
      } else if (item.item == "U") {
        newContents.push(item);
      } else if (item.item == "<") {
        toast(game, "These are the stairs up (press USE to RETURN to TOWN)");
        stairs = "<"
        newContents.push(item)
      } else if (item.item == ">") {
        toast(game, "These are the stairs down (press USE)");
        stairs = ">"
        newContents.push(item)
      }
    } else if (item.kind == "QuestItemContent") {
      // let questItemName = game.quests[game.currentQuest].questItem
      let questItemName = item.item;
      let quest = game.quests[questItemName];
      let displayName = quest.questItem;
      game.player.inventory.push([questItemName,displayName]);
      toast(game, `You found the ${displayName}`);
      let itemCount = game.player.inventory.filter( ([a,b]) => { 
        // console.log('checking inventory item:', a, b[0]);
        return a === questItemName;
      }).length;
      // console.log(`found ${itemCount} ${questItemName} in inventory:`, game.player.inventory)

      if (itemCount >= quest.itemCount) {
        // console.log("marking quest as ready:", quest)
        quest.status = "ready"
      } else {
        // console.log("quest item count not fulfilled:", quest)
      }
      sfx["win"].play();
      delete game.items[key];      
    } else if (item.kind == "ContainerContent") {
        // Not implemented

        toast(game, "This chest is empty.");
        sfx["empty"].play();
        delete game.items[key];  
    } else if (item.kind == "ExitContent") {
      // Not implemented
      newContents.push(item)
      
    }
  }
  cell.contents = newContents;
  if (!(key in game.items)) {
    if (stairs) {
      game.items[key] = stairs
    }
  }
}