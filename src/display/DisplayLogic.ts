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
            game.display.draw_monster(posX, posY, m.baseTile,pose,orientation);
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
            game.display.draw_monster(m._x, m._y, m.baseTile,pose,orientation);
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

export function render(game:GameState,timestamp) {
    if (game.running == false) {
        return;
    }
    if (game.player.in_map == false) {
        return;
    }
    let elapsed = timestamp - game.lastFrame;

    if (elapsed > 30) {
        // console.log(`in drawScene, ${elapsed} elapsed, timestamp ${timestamp}`);
        game.lastFrameDur = elapsed;
        game.lastFrame = timestamp;
        game.frameCount += 1;
        game.glDisplay.clear(0.025,0.025,0.025,1.0);
        // re-draw the player

        let playerPos = [game.player._x, game.player._y];

        if (game.animatingEntities[game.player.id]) {
            console.log("animating player");
            let [posX, posY, isDone] = updateAnimation(game, game.animatingEntities[game.player.id])
            console.log("drawing player", posX, posY);
            playerPos = [posX, posY];
            if (isDone) {
                delete game.animatingEntities[game.player.id];
            }
        } 
        game.glDisplay.drawBackground(playerPos[0], playerPos[1]);

        for (let cell of game.level.cells) {
            if (cell.contents.length > 0) {
                console.log("cell", cell.x, cell.y, "has contents", cell.contents);
                //TODO: set sprite at spawn time
                let item_sprites = {
                    "*": [256, 192], // barrel
                    "&": [272, 192], // empty barrel
                    "g": [448, 448], // gold
                    "<": [464, 0], // stairs up
                    ">": [448, 0], // stairs down
                
                    "x": [256, 192], // axe
                    "p": [256, 192], // potion
                    "f": [256, 192], // food (chest)
                    "h": [464, 432], // food (opened)
                    "r": [256, 192], // ammo (chest)
                    "s": [400, 480], // ammo (opened)
                    "t": [224, 672], // reticle

                    "A": [256, 368], // arrow particle
                    "F": [224, 640], // white flash
                    "G": [192, 672], // red flash
                    "H": [144, 672], // green flash
                    "Q": [496, 462], // quest item (unopened)
                    "T": [400, 192], // tombstone
                    "U": [448, 208], // blood splatter
                
                }
                if (cell.contents[0].item in item_sprites) {
                    let cell_sprite = item_sprites[cell.contents[0].item];                
                    game.glDisplay.drawForeground(cell_sprite[0] / 16, cell_sprite[1] / 16, cell.x, cell.y, playerPos[0], playerPos[1]);
                }
            }
        }

        game.glDisplay.drawForeground(0, 0, playerPos[0], playerPos[1], playerPos[0], playerPos[1]);

        for (let monster of game.monsters) {
            let monsterPos = [monster._x, monster._y];
            if (game.animatingEntities[monster.id]) {
                let [posX, posY, isDone] = updateAnimation(game, game.animatingEntities[monster.id])
                monsterPos = [posX, posY];
                if (isDone) {
                    delete game.animatingEntities[monster.id];
                }
            }
            game.glDisplay.drawForeground(monster.baseTile[0] / 16 ,monster.baseTile[1] / 16, monsterPos[0], monsterPos[1], playerPos[0], playerPos[1]);
        }
        game.glDisplay.drawLighting(playerPos[0], playerPos[1], playerPos[0], playerPos[1], playerPos[0], playerPos[1]);

        // for (let key in game.map) {
        //     drawTile(game, key);
        // }
        // for (let monster of game.monsters) {
        //     drawMonster(game,monster);
        // }
        // drawPlayer(game);
        // for (let particle of game.particles) {
        //     console.log("drawing particle", particle);
        //     drawParticle(game, particle);
        // }
    }
}