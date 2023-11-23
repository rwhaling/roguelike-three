import Display from "./mydisplay";
import { Animation, Particle } from "./display/DisplayLogic"
import { Engine } from "rot-js/lib/index"
import Simple from "rot-js/lib/scheduler/simple";
import { Player } from "./entities/player";
import { Monster } from "./entities/monster";

export default class GameState {
    running: boolean
    currentLevel: number
    maxLevel: number
    tileOptions: any
    display: Display
    mapDisplay: any
    map: Object
    items: Object
    engine: Engine
    scheduler: Simple
    player: Player
    monsters: Array<Monster>
    entities: {[key:string]: any}
    animatingEntities: {[key:string]: Animation}
    particles: Particle[]
    visibleMap: {[key:string]: boolean}
    exploreMap: {[key:string]: boolean}
    amulet: Object
    arrowHeld: [number, number]
    lastFrame: number
    lastFrameDur: number
    frameCount: number
    listening: boolean
    cleanup: any
    tick: Function

    constructor() {
        this.running = false;
        this.currentLevel = null;
        this.maxLevel = null;
        this.tileOptions = null;
        this.display = null;
        this.map = {};
        this.items = {};
        this.engine = null;
        this.scheduler = null;
        this.player = null;
        this.monsters = null;
        this.entities = {};
        this.animatingEntities = {};
        this.particles = [];
        this.visibleMap = {};
        this.exploreMap = {};
        this.amulet = null;
        this.arrowHeld = null;
        this.lastFrame = 0.0;
        this.lastFrameDur = 0.0;
        this.frameCount = 0;
        this.listening = false;
        this.cleanup = null;
        this.tick = null;
    }   
}