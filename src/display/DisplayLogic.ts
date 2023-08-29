import GameState from "../gamestate";
import { posFromKey } from "../utils"

export function drawTile(game:GameState, key) {
    const map = game.map;
    const display = game.display;
    const parts = posFromKey(key);
    if (map[key]) {
      const items = game.items;
      const draw = [map[key], items[key]];
      display.draw_batch(parts[0], parts[1], draw.filter(i=>i));

    }
}

function lerp( a, b, alpha ) {
    return a + alpha * ( b - a );
}

export function drawPlayer(game:GameState) {
    let playerPos = game.player._x + "," + game.player._y;
    // if (!game.animating[playerPos]) { return; }
    let pose = game.frameCount % 8 >= 4 ? 1 : 0;
    let ori_string = game.player.lastArrow[0] + "," + game.player.lastArrow[1]
    let orientation = 0;

    switch(ori_string) {
        case "0,1":
            orientation = 1;
            break;
        case "0,-1":
            orientation = 2;
            break;
        case "-1,0":
            orientation = 3;
            break;
        default:
            orientation = 0;
            break;
    }

    if (game.player.character != "@") {
        orientation = 0;
        pose = 0;
    }

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
            // console.log(`drawing player at progress ${animProgress}: ${animX}, ${animY}`);

            game.display.setPlayerPos(animX, animY);
            // game.display.draw(animX, animY, ["@"], null, null);
            game.display.draw_immediate(animX, animY, game.player.character,pose,orientation);

            if (game.lastFrame + game.lastFrameDur > game.animating[playerPos].endTime) {
                // console.log(`animation done`);
                delete game.animating[playerPos];
                return
            } 

        } else {
            // console.log(`player at ${playerPos}`)
            // hack
            drawTile(game, playerPos);

            game.display.setPlayerPos(game.player._x, game.player._y);
            // game.display.draw(game.player._x, game.player._y, ["@"], null, null);
            game.display.draw_immediate(game.player._x, game.player._y, game.player.character,pose,orientation);

        }
    }                
}

export function drawMonster(game:GameState) {
    let monsterPos = game.monsters[0] ? game.monsters[0]._x + "," + game.monsters[0]._y : null;
    if (monsterPos === null) { return; }
    // if (!game.animating[monsterPos]) { return; }

    if (monsterPos) {
        let m = game.monsters[0];
        let pose = game.frameCount % 8 >= 4 ? 1 : 0;
    
        let ori_string = m.lastArrow[0] + "," + m.lastArrow[1]
        let orientation = 0;
    
        switch(ori_string) {
            case "0,1":
                orientation = 1;
                break;
            case "0,-1":
                orientation = 2;
                break;
            case "-1,0":
                orientation = 3;
                break;
            default:
                orientation = 0;
                break;
        }

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
            // console.log(`drawing monster at progress ${animProgress}: ${animX}, ${animY}`);

            // game.display.draw(animX, animY, ["M"], null, null);
            game.display.draw_immediate(animX, animY, "M",pose,orientation);

            if (game.lastFrame + game.lastFrameDur > game.animating[monsterPos].endTime) {
                // console.log(`animation done`);
                delete game.animating[monsterPos];
                return
            } 
        } else {
            // console.log(`monster at ${monsterPos}`);
            drawTile(game, monsterPos);
            // game.display.draw(game.monsters[0]._x, game.monsters[0]._y, ["M"], null, null);
            game.display.draw_immediate(game.monsters[0]._x, game.monsters[0]._y, "M",pose,orientation);
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
        game.frameCount += 1;
        game.display.clear();
        // re-draw the player

        let monsterPos = game.monsters[0] ? game.monsters[0]._x + "," + game.monsters[0]._y : null;
        let playerPos = game.player._x + "," + game.player._y;

        for (let key in game.map) {
            drawTile(game, key);
        }
        if (monsterPos != null) {
            drawMonster(game);
        }
        drawPlayer(game);
    }
}