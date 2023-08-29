import Backend from "rot-js/lib/display/backend.js";
import Hex from "rot-js/lib/display/hex.js";
import Rect from "rot-js/lib/display/rect.js";
import Tile from "rot-js/lib/display/tile.js";
import TileGL from "rot-js/lib/display/tile-gl.js";
import Term from "rot-js/lib/display/term.js";

import * as Text from "rot-js/lib/text.js";
import { DisplayOptions, DisplayData } from "rot-js/lib/display/types.js";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "rot-js/lib/constants.js";

import MyGLBackend from "./myglbackend"

const BACKENDS = {
	"hex": Hex,
	"rect": Rect,
	"tile": Tile,
	"tile-gl": TileGL,
    "my-tile-gl": MyGLBackend,
	"term": Term
}

const DEFAULT_OPTIONS: DisplayOptions = {
	width: DEFAULT_WIDTH,
	height: DEFAULT_HEIGHT,
	transpose: false,
	layout: "rect",
	fontSize: 15,
	spacing: 1,
	border: 0,
	forceSquareRatio: false,
	fontFamily: "monospace",
	fontStyle: "",
	fg: "#ccc",
	bg: "#000",
	tileWidth: 32,
	tileHeight: 32,
	tileMap: {},
	tileSet: null,
	tileColorize: false
}

/**
 * @class Visual map display
 */
export default class Display {
	_data: { [pos:string] : DisplayData };
	_dirty: boolean | { [pos: string]: boolean };
	_options!: DisplayOptions;
	_backend!: MyGLBackend;
    _t: number;

    _player_pos: [number, number];

	static Rect = Rect;
	static Hex = Hex;
	static Tile = Tile;
	static TileGL = TileGL;
	static Term = Term;

	constructor(options: Partial<DisplayOptions> = {}) {
		this._data = {};
		this._dirty = false; // false = nothing, true = all, object = dirty cells
		this._options = {} as DisplayOptions;
        this._player_pos = [0,0];
        this._t = 0;

		options = Object.assign({}, DEFAULT_OPTIONS, options);
		this.setOptions(options);
		this.DEBUG = this.DEBUG.bind(this);

		// this._tick = this._tick.bind(this);
		// this._backend.schedule(this._tick);
	}

	/**
	 * Debug helper, ideal as a map generator callback. Always bound to this.
	 * @param {int} x
	 * @param {int} y
	 * @param {int} what
	 */
	DEBUG(x: number, y: number, what: number) {
		let colors = [this._options.bg, this._options.fg];
		// this.draw(x, y, null, null, colors[what % colors.length]);
	}

	/**
	 * Clear the whole display (cover it with background color)
	 */
	clear() {
		this._data = {};
		this._dirty = true;
        this._t += 1;
        
        this._backend.clear();
	}

	/**
	 * @see ROT.Display
	 */
	setOptions(options: Partial<DisplayOptions>) {
		Object.assign(this._options, options);

		if (options.width || options.height || options.fontSize || options.fontFamily || options.spacing || options.layout) {
			if (options.layout) {
				// let ctor = BACKENDS[options.layout];
				// this._backend = new ctor();
				this._backend = new MyGLBackend();

            }

			this._backend.setOptions(this._options);
			this._dirty = true;
		}
		return this;
	}

	/**
	 * Returns currently set options
	 */
	getOptions() { return this._options; }

	/**
	 * Returns the DOM node of this display
	 */
	getContainer() { return this._backend.getContainer(); }

	/**
	 * Compute the maximum width/height to fit into a set of given constraints
	 * @param {int} availWidth Maximum allowed pixel width
	 * @param {int} availHeight Maximum allowed pixel height
	 * @returns {int[2]} cellWidth,cellHeight
	 */
	computeSize(availWidth: number, availHeight: number) {
		return this._backend.computeSize(availWidth, availHeight);
	}

	/**
	 * Compute the maximum font size to fit into a set of given constraints
	 * @param {int} availWidth Maximum allowed pixel width
	 * @param {int} availHeight Maximum allowed pixel height
	 * @returns {int} fontSize
	 */
	computeFontSize(availWidth: number, availHeight: number) {
		return this._backend.computeFontSize(availWidth, availHeight);
	}

	computeTileSize(availWidth: number, availHeight: number) {
		let width = Math.floor(availWidth / this._options.width);
		let height = Math.floor(availHeight / this._options.height);
		return [width, height];		
	}

	/**
	 * Convert a DOM event (mouse or touch) to map coordinates. Uses first touch for multi-touch.
	 * @param {Event} e event
	 * @returns {int[2]} -1 for values outside of the canvas
	 */
	eventToPosition(e: TouchEvent | MouseEvent) {
		let x, y;
		if ("touches" in e) {
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		} else {
			x = e.clientX;
			y = e.clientY;
		}

		return this._backend.eventToPosition(x, y);
	}

    setPlayerPos(x: number, y:number) {
        // console.log('setting player pos to %o %o',x,y);
        this._player_pos = [x,y];
    }

    draw_immediate(x:number,y:number,ch:string[]) {
        let glyphs:Glyph[] = ch.map((c) => new Glyph(c))
        this._backend.draw_immediate(x,y,this._player_pos,glyphs);
    }
}

export class Glyph {
    glyph: string
    orientation: number
    pose: number

    constructor(glyph:string, orientation?: number, pose?: number) {
        this.glyph = glyph;
        this.orientation = orientation || 0;
        this.pose = pose || 0;
    }
}
