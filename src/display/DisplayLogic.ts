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

export class Animation {
    id: string
    startPos: [number, number]
    endPos: [number, number]
    startTime: number
    endTime: number
}

export class Particle extends Animation {
    id: string
    char: string
    orientation: number
    startPos: [number, number]
    endPos: [number, number]
    startTime: number
    endTime: number
}

export type AnimationResult = [number, number, boolean]

export function drawPlayer(game:GameState) {
    let playerPos = game.player._x + "," + game.player._y;
    let pose = game.frameCount % 8 >= 4 ? 1 : 0;
    let ori_string = game.player.lastArrow[0] + "," + game.player.lastArrow[1];
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
        if (game.animatingEntities[game.player.id]) {
            let [posX, posY, isDone] = updateAnimation(game, game.animatingEntities[game.player.id])
            game.display.setPlayerPos(posX, posY);
            // game.display.draw(animX, animY, ["@"], null, null);
            game.display.draw_immediate(posX, posY, game.player.character,pose,orientation);
            if (isDone) {
                delete game.animatingEntities[game.player.id];
            }
        } else {
            drawTile(game, playerPos);

            game.display.setPlayerPos(game.player._x, game.player._y);
            game.display.draw_immediate(game.player._x, game.player._y, game.player.character,pose,orientation);
        }
    }                
}

function updateAnimation(game, animation):AnimationResult {
    let animDuration = animation.endTime - animation.startTime;
    let animElapsed = game.lastFrame - animation.startTime;
    if (animElapsed < 0) {
        return [animation.startPos[0], animation.startPos[1], false]
    }
    let animProgress = animElapsed / animDuration;
    if (animProgress > 1.0) { animProgress = 1.0 };

    let animX = lerp( animation.startPos[0], animation.endPos[0], animProgress);
    let animY = lerp( animation.startPos[1], animation.endPos[1], animProgress);

    if (game.lastFrame + game.lastFrameDur > animation.endTime) {
        return [animX, animY, true]
    } else {
        return [animX, animY, false]
    }
}

export function drawMonster(game:GameState,m) {
    let monsterPos = m._x + "," + m._y;

    if (monsterPos) {
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

        if (game.animatingEntities[m.id]) {
            let [posX, posY, isDone] = updateAnimation(game, game.animatingEntities[m.id])
            // game.display.draw(animX, animY, ["@"], null, null);
            console.log
            game.display.draw_immediate(posX, posY, "M",pose,orientation);
            if (m.id == game.player.controls.currentTarget) {
                game.display.draw_immediate(posX, posY, "t",0,0);
            }
            if (isDone) {
                delete game.animatingEntities[m.id];
            }
        } else {
            // console.log(`monster at ${monsterPos}`);
            drawTile(game, monsterPos);
            // game.display.draw(game.monsters[0]._x, game.monsters[0]._y, ["M"], null, null);
            game.display.draw_immediate(m._x, m._y, "M",pose,orientation);
            if (m.id == game.player.controls.currentTarget) {
                game.display.draw_immediate(m._x, m._y, "t",0,0);
            }

        }
    }
}

export function drawParticle(game, particle) {
    if (particle.startTime > game.lastFrame) {
        console.log(`particle ${particle.id} delayed starttime ${particle.startTime} > ${game.lastFrame}`, );
        return
    }
    let [posX, posY, isDone] = updateAnimation(game, particle);
    game.display.draw_immediate(posX, posY, particle.char, 0, particle.orientation);
    if (isDone) {
        game.particles.splice(game.particles.indexOf(particle), 1);
        // delete game.particles[game.particles.indexOf(particle)];
    }
}

export function render(game,timestamp) {
    let elapsed = timestamp - game.lastFrame;

    if (elapsed > 30) {
        // console.log(`in drawScene, ${elapsed} elapsed, timestamp ${timestamp}`);
        game.lastFrameDur = elapsed;
        game.lastFrame = timestamp;
        game.frameCount += 1;
        game.display.clear();
        // re-draw the player

        for (let key in game.map) {
            drawTile(game, key);
        }
        for (let monster of game.monsters) {
            drawMonster(game,monster);
        }
        drawPlayer(game);
        for (let particle of game.particles) {
            console.log("drawing particle", particle);
            drawParticle(game, particle);
        }
    }
}