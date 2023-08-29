import GameState from "../gamestate";
import { posFromKey } from "../utils"

export function drawTile(game:GameState, key, ignore) {
    const map = game.map;
    const animating = game.animating;
    const display = game.display;
    const parts = posFromKey(key);
    if (map[key]) {
      const monster = monsterAt(game, parts[0], parts[1]);
      const player = playerAt(game, parts[0], parts[1]);
      const items = game.items;
      const draw = [map[key], items[key]];
      if (!animating[key]) {
          draw.push(monster && monster != ignore ? monster.character : null);
          draw.push(player && player != ignore ? player.character : null);    
      }
      display.draw(parts[0], parts[1], draw.filter(i=>i), null, null);
    }
}

function lerp( a, b, alpha ) {
    return a + alpha * ( b - a );
}

export function drawPlayer(game:GameState) {
    let playerPos = game.player._x + "," + game.player._y;
    if (!game.animating[playerPos]) { return; }

    if (playerPos) {
        if (game.animating[playerPos]) {
            const animation = game.animating[playerPos];
            const startPos = animation.startPos;
            const endPos = animation.endPos;

            console.log(animation);                

            let animPosStart = posFromKey(startPos);
            let animPosEnd = posFromKey(endPos);
            let animDuration = animation.endTime - animation.startTime;
            let animElapsed = game.lastFrame - animation.startTime;
            let animProgress = animElapsed / animDuration;
            if (animProgress > 1.0) { animProgress = 1.0 };

            let animX = lerp( animPosStart[0], animPosEnd[0], animProgress);
            let animY = lerp( animPosStart[1], animPosEnd[1], animProgress);
            console.log(`drawing player at progress ${animProgress}: ${animX}, ${animY}`);

            game.display.setPlayerPos(animX, animY);
            game.display.draw(animX, animY, ["@"], null, null);

            if (game.lastFrame + game.lastFrameDur > game.animating[playerPos].endTime) {
                console.log(`animation done`);
                delete game.animating[playerPos];
                return
            } 

        } else {
            console.log(`player at ${playerPos}`)
            // hack
            drawTile(game, playerPos, false);

            game.display.setPlayerPos(game.player._x, game.player._y);
            game.display.draw(game.player._x, game.player._y, ["@"], null, null);
        }
    }                
}

export function drawMonster(game:GameState) {
    let monsterPos = game.monsters[0] ? game.monsters[0]._x + "," + game.monsters[0]._y : null;
    if (monsterPos === null) { return; }
    if (!game.animating[monsterPos]) { return; }

    if (monsterPos) {
        if (game.animating[monsterPos]) {
            const animation = game.animating[monsterPos];
            const startPos = animation.startPos;
            const endPos = animation.endPos;

            console.log(animation);
            
            let animPosStart = posFromKey(startPos);
            let animPosEnd = posFromKey(endPos);
            let animDuration = animation.endTime - animation.startTime;
            let animElapsed = game.lastFrame - animation.startTime;
            let animProgress = animElapsed / animDuration;
            if (animProgress > 1.0) { animProgress = 1.0 };

            let animX = lerp( animPosStart[0], animPosEnd[0], animProgress);
            let animY = lerp( animPosStart[1], animPosEnd[1], animProgress);
            console.log(`drawing monster at progress ${animProgress}: ${animX}, ${animY}`);

            game.display.draw(animX, animY, ["M"], null, null);

            if (game.lastFrame + game.lastFrameDur > game.animating[monsterPos].endTime) {
                console.log(`animation done`);
                delete game.animating[monsterPos];
                return
            } 


        } else {
            console.log(`monster at ${monsterPos}`);
            drawTile(game, monsterPos, false);

            game.display.draw(game.monsters[0]._x, game.monsters[0]._y, ["M"], null, null);
        }
    }
}

function monsterAt(game, x, y) {
    if (game.monsters && game.monsters.length) {
        for (let mi=0; mi< game.monsters.length; mi++) {
            const m = game.monsters[mi];
            if (m && m._x == x && m._y == y) {
                return m;
            }
        }
    }
}

function playerAt(game, x, y) {
    return game.player && game.player._x == x && game.player._y == y ? game.player : null;
}

export function render(game,timestamp) {
    // if (game.display === null) {
    //     return;
    // }
    // requestAnimationFrame(drawScene);
    let elapsed = timestamp - game.lastFrame;

    if (elapsed > 30) {
        // console.log(`in drawScene, ${elapsed} elapsed, timestamp ${timestamp}`);
        game.lastFrameDur = elapsed;
        game.lastFrame = timestamp;
        game.display.clear();
        // re-draw the player

        let monsterPos = game.monsters[0] ? game.monsters[0]._x + "," + game.monsters[0]._y : null;
        let playerPos = game.player._x + "," + game.player._y;
        console.log(`drawing monster at ${monsterPos}, player at ${playerPos}`);

        for (let key in game.map) {
            drawTile(game, key, false);
            if (key === monsterPos && !game.animating[monsterPos]) {
                drawMonster(game);
            }
            if (key === playerPos && !game.animating[playerPos]) {
                drawPlayer(game);
            }
        }
        if (monsterPos != null && game.animating[monsterPos]) {
            drawMonster(game)
        }
        if (game.animating[playerPos]) {
            drawPlayer(game);
        }
        game.display._tick();
    }
}