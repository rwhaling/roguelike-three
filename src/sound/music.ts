import {Howl, Howler} from 'howler';

export let musicState:string = "null";
export function setMusicState(state:string) {
    musicState = state;
}

export function setMusicVolume(vol:number) {
    howls.town.volume(vol);
    howls.dungeon.volume(vol);
}

export function play(k:string) {
    musicState = k;
    howls.town.stop();
    howls.dungeon.stop();
    if (k == "town") {
        howls.town.play("town");
    } else if (k == "dungeon") {
        howls.dungeon.play("dungeon");
    }
}

export function stopMusic() {
    musicState = "null";
    howls.town.stop();
    howls.dungeon.stop();
}

let howls:{[key:string]:Howl} = {
    town: new Howl({
        src: ['barrow_2_v1_town_rework_2_bounce.mp3'],
        sprite: {
            "town": [0,120000,true],
        },
        volume: 0.25
    }),
    dungeon: new Howl({
        src: ['barrow_2_v3_bounce_3.mp3'],
        sprite: {
            "dungeon": [120000,240000,true]
        },
        volume: 0.25     
    })
}
// export const music = new Howl({
//     src: ['barrow_2_v1_bounce.mp3'],
//     sprite: {
//         "dungeon": [0,120000,true],
//         "town": [120000,240000,true]
//     },
//     volume: 0.25 
// });




