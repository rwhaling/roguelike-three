import {Howl, Howler} from 'howler';

export let musicState:string = "null";
export function setMusicState(state:string) {
    musicState = state;
}

export const music = new Howl({
    src: ['barrow_2_v1_bounce.mp3'],
    sprite: {
        "dungeon": [0,120000,true],
        "town": [120000,240000,true]
    },
    volume: 0.25 
});

