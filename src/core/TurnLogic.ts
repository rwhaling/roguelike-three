import GameState from "../gamestate";
import { Monster,  BehaviorState, monsterAct } from "../entities/monster";
import { Path } from "rot-js/lib"
import { walkable } from "../core/GameLogic"

function distance(a,b):number {
    return Math.abs(a._x - b._x) + Math.abs(a._y - b._y);
}

export function mkTurnLogic(game:GameState) {
    return { act: () => {
        let p = game.player;
        let map = game.map;

        let min_x = p._x;
        let min_y = p._y;
        let max_x = p._x;
        let max_y = p._y;

        let activeMonsters:{ [key:string]:Monster } = {}
        for (let m of game.monsters) {
            let dist = distance(p,m);
            if (dist >= 16 && m.behaviorState == BehaviorState.INACTIVE) {
                continue 
            } else {
                let key = `${m._x},${m._y}`;
                activeMonsters[key] = m;
            }
            console.log("found bounding box: ", min_x, min_y, ":", max_x, max_y);
        }

        console.log("adjusted bounding box: ", min_x, min_y, ":", max_x, max_y);

        for (let [pos,m] of Object.entries(activeMonsters)) {
            console.log(`activating monster at ${pos} : ${m.id}`)
            console.log("activeMonsters:",activeMonsters);


            const passableCallback = function(x, y) {
                // let k = `${x},${y}`
                // if (k != pos && k in activeMonsters) {
                //   console.log("tile occupied", k, activeMonsters);
                //   return false
                // }
                return (walkable.indexOf(map[x + "," + y]) != -1);
            }
            const monster_astar = new Path.AStar(p._x, p._y, passableCallback, {topology:4});
            const player_path: any[] = [];
            const player_path_callback = (x,y) => {
              player_path.push([x, y]);
            }
            monster_astar.compute(m._x, m._y, player_path_callback);
            player_path.shift();            
            console.log("path from monster at ", m._x, m._y, " to player at ", p._x, p._y, player_path);
            monsterAct(game, m, player_path, activeMonsters);
            let pos_after = `${m._x},${m._y}`;
            delete activeMonsters[pos];
            activeMonsters[pos_after] = m;            
            // monster.act();
        }
    }}
}