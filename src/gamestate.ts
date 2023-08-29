import Display from "./mydisplay";
import { Engine } from "rot-js/lib/index"
import Simple from "rot-js/lib/scheduler/simple";

export default class GameState {
    display: Display
    map: Object
    items: Object
    animating: Object
    engine: Engine
    scheduler: Simple
    player: any
    monsters: Array<any>
    amulet: Object
    lastArrow: Object
    arrowInterval;
    arrowListener;
    lastFrame: number
    lastFrameDur: number
    cleanup: any
    tick: Function

    constructor() {
        this.display = null;
        this.map = {};
        this.animating = {};
        this.items = {};
        this.engine = null;
        this.scheduler = null;
        this.player = null;
        this.monsters = null;
        this.amulet = null;
        this.lastArrow = null;
        this.arrowInterval = null;
        this.arrowListener = null;
        this.lastFrame = 0.0;
        this.lastFrameDur = 0.0;
        this.cleanup = null;
        this.tick = null;
    }
}