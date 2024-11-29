import GameState from "../gamestate";
import { Monster, monsterAct } from "../entities/monster";
import { getActiveMonsters, targetPath, fullMap} from "./Pathfinding"
import { updateBuffs } from "../entities/player";
import { animationDone } from "../display/Animation";
import { keyHandler } from "../ui/hid";

enum TurnState {
  WaitingForPlayer,
  AnimatingIdlePlayer,
  AnimatingPlayer,
  AnimatingMonster
}


var currentTurn: TurnState = TurnState.WaitingForPlayer

export function mkTurnLogic(game:GameState) {
    return { 
      act: () => {
        monsterTurn(game)
        // playerTurnStart(game)
        /*
        - wait for player input
        - if input present
        - process player turn
        - wait for animation
        - create list of monster turns
        - for each active monster
        - process monster turn
        - wait for animation
        */
    }
  }
}

export function getCurrentTurnState(): TurnState {
  return currentTurn;
}

export function checkNextTurn(game:GameState) {
  if (!animationDone(game) && currentTurn == TurnState.WaitingForPlayer) {
    console.log("player input received?")
    currentTurn = TurnState.AnimatingPlayer
  } else if (animationDone(game)) {
    if (currentTurn == TurnState.WaitingForPlayer) {
      // console.log("checking for player input");
      if (game.lastKeyDown && game.listening) {
        console.log("player input received");
        let ret = keyHandler(game, game.lastKeyDown);
        console.log("keyHandler returned", ret);
        game.lastKeyDown = null;
        // todo: check better
        if (ret == false) {
          currentTurn = TurnState.AnimatingIdlePlayer;
        } else if (ret == true) {
          currentTurn = TurnState.AnimatingPlayer;
        }
      }
      return
    } else if (currentTurn == TurnState.AnimatingIdlePlayer) {
      currentTurn = TurnState.WaitingForPlayer;
      return
    } else if (currentTurn == TurnState.AnimatingPlayer) {
      console.log("player turn done, beginning monster turn")
      monsterTurn(game)
      currentTurn = TurnState.AnimatingMonster
      // somehow check if any monsters are active?
      
    } else if (currentTurn == TurnState.AnimatingMonster) {
      console.log("monster turn done, waiting for player input")
      game.player.act()
      currentTurn = TurnState.WaitingForPlayer
      
    }

  }
}

function playerTurnStart(game:GameState) {
  game.engine.lock();
  updateBuffs(game.player);
  game.player.controls.dirty = true;
}

function monsterTurn(game:GameState) {
  let p = game.player;
  let map = game.map;

  let activeMonsters = getActiveMonsters(game, 16);

  for (let [pos,m] of Object.entries(activeMonsters)) {
      // console.log(`activating monster at ${pos} : ${m.id}`)
      // console.log("activeMonsters:",activeMonsters);

      let player_path = targetPath(game, m, p, [], fullMap(game));
      // console.log("path from monster at ", m._x, m._y, " to player at ", p._x, p._y, player_path);
      monsterAct(game, m as Monster, player_path, activeMonsters);
      let pos_after = `${m._x},${m._y}`;
      delete activeMonsters[pos];
      activeMonsters[pos_after] = m;            
      // monster.act();
  }
}