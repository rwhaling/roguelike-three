import { sfx } from "../sound/sfx";
import { RNG } from "rot-js/lib";
import { battleMessage, createGhost, damageNum, hideToast, removeListeners, renderStats, setEndScreenValues, showScreen, toast } from "../ui/ui";

// these map tiles are walkable
export const walkable = [".", "*", "g"]

// this gets called at the end of the game when we want
// to exit back out and clean everything up to display
// the menu and get ready for next round
export function destroy(game) {
  // remove all listening event handlers
  removeListeners(game);

  // tear everything down and
  // reset all our variables back
  // to null as before init()
  // TODO: all new state
  if (game.engine) {
    game.engine.lock();
    game.display = null;
    game.map = {};
    game.items = {};
    game.engine = null;
    game.entities = {};
    game.scheduler.clear();
    game.scheduler = null;
    game.player = null;
    game.monsters = null;
    game.amulet = null;
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
export function checkItem(game, entity) {
  const key = entity._x + "," + entity._y;
  if (key == game.amulet) {
    // the amulet is hit initiate the win flow below
    win(game);
  } else if (game.items[key] == "g") {
    // if the player stepped on gold
    // increment their gold stat,
    // show a message, re-render the stats
    // then play the pickup/win sound
    game.player.stats.gold += 1;
    renderStats(game.player);
    toast(game, "You found gold!");
    sfx["win"].play();
    delete game.items[key];
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
  
// move the player on the tilemap to a particular position
export function movePlayerTo(game, x, y) {
  // get a reference to our global player object
  // this is needed when called from the tap/click handler
  const p = game.player;
  // does this go here or somewhere else?
  p.controls.dirty = true;

  // map lookup - if we're not moving onto a floor tile
  // or a treasure chest, then we should abort this move
  const newKey = x + "," + y;
  if (walkable.indexOf(game.map[newKey]) == -1) { return; }

  // check if we've hit the monster
  // and if we have initiate combat
  const hitMonster = monsterAt(game, x, y);
  if (hitMonster) {
    p.controls.currentTarget = hitMonster.id;
    // we enter a combat situation
    combat(game, p, hitMonster);
    // pass the turn on to the next entity
    setTimeout(function() {
      game.engine.unlock();
    }, 250);
  } else {
    // we're taking a step

    // hide the toast message when the player moves
    hideToast(false);

    let oldPos = [p._x, p._y]

    // update the player's coordinates
    p._x = x;
    p._y = y;

    let newPos = [p._x, p._y]
    let animation = {
        id: p.id,
        startPos: oldPos,
        endPos: newPos,
        startTime: game.lastFrame,
        endTime: game.lastFrame + 200
    }
    // Game.animating[newKey] = animation;
    game.animatingEntities[p.id] = animation;

    game.engine.unlock();
    // play the "step" sound
    sfx["step"].play();
    // check if the player stepped on an item
    checkItem(game,p);
  }
}

function monsterAt(game, x, y) {
  if (game.monsters && game.monsters.length) {
    for (let mi=0; mi<game.monsters.length; mi++) {
      const m = game.monsters[mi];
      if (m && m._x == x && m._y == y) {
        return m;
      }
    }
  }
}