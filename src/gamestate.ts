import Display from "./mydisplay";
import { Animation } from "./display/DisplayLogic"
import { Engine } from "rot-js/lib/index"
import Simple from "rot-js/lib/scheduler/simple";
import { Player } from "./entities/player";

export default class GameState {
    display: Display
    map: Object
    items: Object
    engine: Engine
    scheduler: Simple
    player: Player
    monsters: Array<any>
    entities: {[key:string]: any}
    animatingEntities: {[key:string]: Animation}
    amulet: Object
    arrowHeld: [number, number]
    lastFrame: number
    lastFrameDur: number
    frameCount: number
    cleanup: any
    tick: Function

    constructor() {
        this.display = null;
        this.map = {};
        this.items = {};
        this.engine = null;
        this.scheduler = null;
        this.player = null;
        this.monsters = null;
        this.entities = {};
        this.animatingEntities = {};
        this.amulet = null;
        this.arrowHeld = null;
        this.lastFrame = 0.0;
        this.lastFrameDur = 0.0;
        this.frameCount = 0;
        this.cleanup = null;
        this.tick = null;
    }
}