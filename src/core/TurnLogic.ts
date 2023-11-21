import GameState from "../gamestate";
import { Monster,  BehaviorState, monsterAct } from "../entities/monster";
import { Path } from "rot-js/lib"
import { walkable } from "../core/GameLogic"
import { getActiveMonsters, targetPath, fullMap} from "./Pathfinding"
import { updateBuffs } from "../entities/player";

function distance(a,b):number {
    return Math.abs(a._x - b._x) + Math.abs(a._y - b._y);
}

export function mkTurnLogic(game:GameState) {
    return { 
      act: () => {
        monsterTurn(game)
        // playerTurnStart(game)
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
      console.log(`activating monster at ${pos} : ${m.id}`)
      console.log("activeMonsters:",activeMonsters);

      let player_path = targetPath(game, m, p, [], fullMap(game));
      console.log("path from monster at ", m._x, m._y, " to player at ", p._x, p._y, player_path);
      monsterAct(game, m as Monster, player_path, activeMonsters);
      let pos_after = `${m._x},${m._y}`;
      delete activeMonsters[pos];
      activeMonsters[pos_after] = m;            
      // monster.act();
  }
}