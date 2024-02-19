import { Room } from "rot-js/lib/map/features"
import { Player } from "../entities/player"

export interface Level {
    biome: string,
    depth: number
    cells: MapCell[]
    rooms: Room[]
    roomItems: [number, number][][]
    newDrops: [number, number][]
    w: number
    h: number
}

export interface MapCell {
    x: number
    y: number
    walkable: boolean
    discovered: boolean
    visited: boolean
    baseTile: string
    contents: AllCellContents[]
}

export interface DecorItemContent {
    kind: "DecorContent"
    x: number,
    y: number,
    item: string
}

export interface ContainerContent {
    kind: "ContainerContent"
    x: number,
    y: number,
    item: string    
}

export interface GoldContent {
    kind: "GoldContent"
    x: number,
    y: number,
    item: string,
    quantity: number
}

export interface QuestItemContent {
    kind: "QuestItemContent"
    x: number,
    y: number,
    item: string    
}

export interface ItemContent {
    kind: "ItemContent"
    x: number,
    y: number,
    item: string    
}

export interface ExitContent {
    kind: "ExitContent"
    x: number,
    y: number,
    item: string
}

export type AllCellContents = ItemContent | QuestItemContent | ContainerContent | ExitContent | GoldContent;

export function initLevel(d: number, biome: string, w:number, h:number): Level {
    let len = w * h
    let cells: MapCell[] = new Array(len)
    for (let i = 0; i < len; i++) {
        let [x,y] = arrayToCoords(i, w, h)
        cells[i] = {
            x: x,
            y: y,
            walkable: false,
            discovered: false,
            visited: false,
            baseTile: "_",
            contents: []
        }
    }

    return {
        biome: biome,
        depth: d,
        cells: cells,
        rooms: [],
        roomItems: [],
        newDrops: [],
        w: w,
        h: h
    }
}

function arrayToCoords(i:number, w: number, h: number): [number, number] {
    let y = Math.floor(i / w)
    let x = i % w
    return [x,y]
}

function coordsToArray(x: number, y: number, w: number, h: number): number {
    return x + (y * w)
}

export function getCell(level:Level, x:number, y:number):MapCell {
    let i = coordsToArray(x,y,level.w,level.h)
    return level.cells[i];
}

export function getRoomItems(level:Level, player:Player): [number,number][] {
    for (let [idx, r] of level.rooms.entries()) {
        // console.log("checking if", [player._x, player._y], "in room", [r._x1, r._x2, r._y1, r._y2])
        if (roomContains(r, player._x, player._y)) {
            let items = level.roomItems[idx];
            console.log("found room",r,idx,items)

            return items.filter( i => {
                let cell = getCell(level, i[0], i[1])
                if (cell.visited == false) { 
                    return true
                } else {
                    return false
                }
            })
        }
    }
    return []
}

export function roomContains(room:Room, x:number, y:number): boolean {
    if (x >= room._x1 && x <= room._x2) {
        if (y >= room._y1 && y <= room._y2) {
            return true
        }
    }
    return false
}