import GameState from "../gamestate";

export default class Monster {
    id: string
    _x: number
    _y: number
    character: string
    name: string
    stats: { [key: string]: number }
    lastArrow: [number, number]
    act: any
}

// // basic ROT.js entity with position and stats
// export function makeMonster(game, x, y):Monster {
//     let monsterAct = function(game) {

//     }
//     return {
//         // monster position
//         _x: x,
//         _y: y,
//         // which tile to draw the player with
//         character: "M",
//         // the name to display in combat
//         name: "the monster",
//         // the monster's stats
//         stats: {"hp": 14},
//         lastArrow: [1,0],
//         // called by the ROT.js scheduler
//         act: function() {

//         },
//     }
// }
    
//       // the ROT.js scheduler calls this method when it is time
//       // for the monster to act
//       function monsterAct(game) {
//         // reference to the monster itself
//         const m = this;
//         // the monster wants to know where the player is
//         const p = game.player;
//         // reference to the game map
//         const map = game.map;
//         // reference to ROT.js display
//         const display = game.display;
    
//         // in this whole code block we use the ROT.js "astar" path finding
//         // algorithm to help the monster figure out the fastest way to get
//         // to the player - for implementation details check out the doc:
//         // http://ondras.github.io/rot.js/manual/#path
//         const passableCallback = function(x, y) {
//           return (walkable.indexOf(map[x + "," + y]) != -1);
//         }
//         const astar = new ROT.Path.AStar(p._x, p._y, passableCallback, {topology:4});
//         const path = [];
//         const pathCallback = function(x, y) {
//           path.push([x, y]);
//         }
//         astar.compute(m._x, m._y, pathCallback);
    
//         // ignore the first move on the path as it is the starting point
//         path.shift();
//         // if the distance from the monster to the player is less than one
//         // square then initiate combat
//         if (path.length <= 1) {
//           combat(m, p);
//         } else {
//           // draw whatever was on the last tile the monster was one
//           let oldKey = m._x + "," + m._y;
//           // the player is safe for now so update the monster position
//           // to the first step on the path and redraw
//           let delta = [path[0][0] - m._x, path[0][1] - m._y ];
//           console.log("moving monster");
//           console.log(delta);
//           m.lastArrow = delta;
  
//           m._x = path[0][0];
//           m._y = path[0][1];
//           let newKey = m._x + "," + m._y;
//           let animation = {
//               startPos: oldKey,
//               endPos: newKey,
//               startTime: Game.lastFrame,
//               endTime: Game.lastFrame + 250
//           }
//           Game.animating[newKey] = animation;
//         }
//       }