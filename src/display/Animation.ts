import GameState from "../gamestate";

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

export type AnimationResult = [number, number]

export function updateAnimation(game:GameState, animation:Animation):AnimationResult {
    let animDuration = animation.endTime - animation.startTime;
    let animElapsed = game.lastFrame - animation.startTime;
    if (animElapsed < 0) {
        return [animation.startPos[0], animation.startPos[1]]
    }
    let animProgress = animElapsed / animDuration;
    if (animProgress > 1.0) { animProgress = 1.0 };

    let animX = lerp( animation.startPos[0], animation.endPos[0], animProgress);
    let animY = lerp( animation.startPos[1], animation.endPos[1], animProgress);

    return [animX, animY]

}

export function purgeAnimations(game:GameState) {
    let entities_to_remove: string[] = []
    for (let a in game.animatingEntities) {
        let anim = game.animatingEntities[a]
        if(game.lastFrame + game.lastFrameDur > anim.endTime) {
            entities_to_remove.push(a)
        }
    }
    for (let a of entities_to_remove) {
        console.log("deleting animation",a)
        delete game.animatingEntities[a]
    }

    let particles_to_remove: Particle[] = [];
    for (let p of game.particles) {
        if(game.lastFrame + game.lastFrameDur > p.endTime) {
            particles_to_remove.push(p)
        }
    }

    for (let p of particles_to_remove) {
        game.particles.splice(game.particles.indexOf(p), 1);
    }
}

export function animationDone(game:GameState) {
    if (Object.keys(game.animatingEntities).length > 0) {
        return false 
    } else {
        return true
    }
}