import Display from "./mydisplay";
import { Animation, Particle } from "./display/Animation"
import { Engine } from "rot-js/lib/index"
import Simple from "rot-js/lib/scheduler/simple";
import { Player } from "./entities/player";
import { Monster } from "./entities/monster";
import { Level } from "./mapgen/Level"
import { Quest, quests } from "./mapgen/Quests";
import { WebGLDisplay } from "./display/WebGLDisplay";

export default class GameState {
    running: boolean
    level: Level
    currentLevel: number
    currentBiome: string
    tileOptions: any
    glDisplay: WebGLDisplay
    display: Display
    mapDisplay: any
    map: Object
    items: Object
    engine: Engine
    scheduler: Simple
    player: Player
    playerClass: String
    monsters: Array<Monster>
    entities: {[key:string]: any}
    animatingEntities: {[key:string]: Animation}
    particles: Particle[]
    visibleMap: {[key:string]: boolean}
    exploreMap: {[key:string]: boolean}
    quests: {[key:string]: Quest}  
    currentQuest: string  
    biomeUnlock: {[key:string]: number}
    levelSelect: string
    amulet: Object
    arrowHeld: [number, number]
    lastFrame: number
    lastFrameDur: number
    frameCount: number
    listening: boolean
    cleanup: any
    tick: Function
    debugMode: boolean

    constructor() {
        this.running = false;
        this.level = null;
        this.currentLevel = null;
        this.currentBiome = null;
        this.tileOptions = null;
        this.glDisplay = null;
        this.display = null;
        this.map = {};
        this.items = {};
        this.engine = null;
        this.scheduler = null;
        this.player = null;
        this.playerClass = "warrior";
        this.monsters = null;
        this.entities = {};
        this.animatingEntities = {};
        this.particles = [];
        this.visibleMap = {};
        this.exploreMap = {};
        this.quests = quests;
        this.currentQuest = null;
        this.amulet = null;
        this.biomeUnlock = {"dungeon":1,"crypt":0}
        this.levelSelect = "dungeon1"
        this.arrowHeld = null;
        this.lastFrame = 0.0;
        this.lastFrameDur = 0.0;
        this.frameCount = 0;
        this.listening = false;
        this.cleanup = null;
        this.tick = null;
        this.debugMode = false;
    }   
}