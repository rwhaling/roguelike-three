import { Monster } from "../entities/monster";
import { Player } from "../entities/player";
import { BehaviorState } from "../entities/monster";
import { walkable } from "../core/GameLogic"
import { Path } from "rot-js/lib"
import GameState from "../gamestate";

export type Entity = Player | Monster;
export type BoundingBox = [number, number, number, number]

export function manhattan(a,b):number {
    return Math.abs(a._x - b._x) + Math.abs(a._y - b._y);
}

export function getActiveMonsters(game,d): { [key:string]:Entity } {
    let p = game.player;
  
    let activeMonsters:{ [key:string]:Monster } = {}
    for (let m of game.monsters) {
        let dist = manhattan(p,m);
        if (dist >= d && m.behaviorState == BehaviorState.INACTIVE) {
            continue 
        } else {
            let key = `${m._x},${m._y}`;
            activeMonsters[key] = m;
        }
    }
  
    return activeMonsters;
}

export function fullMap(game:GameState):BoundingBox {
  return [0,0,game.mapDisplay._options.width, game.mapDisplay._options.height]
}

export function getBoundingBox(entities: Entity[], buffer: number):BoundingBox {
    if (entities.length == 0) {
        throw new Error("empty entity list for bounding box")
    }
    let min_x = entities[0]._x;
    let min_y = entities[0]._y;
    let max_x = entities[0]._x;
    let max_y = entities[0]._y;

    for (let e of entities) {
      // console.log("adding entity at ", [e._x, e._y], " to bounding box: ", [min_x, min_y, max_x, max_y])
        if (e._x < min_x) {
            min_x = e._x;
        }
        if (e._y < min_y) {
            min_y = e._y;
        }
        if (e._x > max_x) {
            max_x = e._x;
        }
        if (e._y > max_y) {
            max_y = e._y;
        }
    }

    return [min_x - buffer, min_y - buffer, max_x + buffer, max_y + buffer];
}

export function targetPath(game: GameState, entity: Entity, target: Entity, obstacles: Entity[], box:BoundingBox): [number,number][] {
    let target_key = `${target._x},${target._y}`
    let e_pos = `${entity._x},${entity._y}`
    let obstacle_keys = obstacles.map( e => `${`${e._x},${e._y}`}`)

    const passableCallback = function(x, y) {
        let k = `${x},${y}`
        if (k != e_pos && k != target_key && k in obstacle_keys) {
          // console.log("tile occupied", k, obstacle_keys);
          return false;
        }
        else if (x < box[0] || y < box[1] || x > box[2] || y > box[3]) {
          // console.log("point ", [x,y], " outside of bounding box ",box);
          return false;
        }
        return (walkable.indexOf(game.map[x + "," + y]) != -1);
    }
    const entity_astar = new Path.AStar(entity._x, entity._y, passableCallback, {topology:4});
    const target_path: [number, number][] = [];
    const target_path_cb = (x,y) => {
      target_path.push([x, y]);
    }
    entity_astar.compute(target._x, target._y, target_path_cb);
    target_path.pop();
    target_path.reverse();
    // target_path.shift();         
    // target_path.reverse();
    return target_path;   
}

export function get_neighbors(i:[number, number]): [number,number][] {
  return [[i[0] - 1, i[1]],
            [i[0], i[1] - 1],
            [i[0] + 1, i[1]],
            [i[0], i[1] + 1]]
}

// export function get_neighbor_by_key(i:string): string {
//   let matches = i.match(/\d+/g);
//   if (matches.length == 2) {
//     let x = parseInt(matches[0].toString())
//     let y = parseInt(matches[1].toString())
//     return `${x},${y}`
//   }
// }

export function dijkstraMap(game:GameState, targets: any[], obstacles:[], box: BoundingBox) {
  // console.log("constructing dijkstra map in bounding box:", box, "targets:", targets);
  let frontier: [number, number][] = [];
  let cost_so_far: {[key:string]:number} = {}
  for (let target of targets) {
    let k = `${target._x},${target._y}`;
    frontier.push([target._x,target._y]);
    cost_so_far[k] = 0;
  }

  while (frontier.length > 0) {
    let current = frontier.shift();
    // console.log("current node:",current);
    let current_k = `${current[0]},${current[1]}`
    let neighbors = get_neighbors(current);
    for (let next of neighbors) {
      let next_k = `${next[0]},${next[1]}`;
      if ( walkable.indexOf(game.map[next_k]) == -1) {
         continue
      }
      if ( next[0] < box[0] || next[1] < box[1] || next[0] > box[2] || next[1] > box[3]) {
        continue
      } else {
        if (!(next_k in cost_so_far)) {
          cost_so_far[next_k] = cost_so_far[current_k] + 1;
          frontier.push(next);
        }
      }
    }
  }

  return cost_so_far
}