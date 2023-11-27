import { LevelSpawner } from "./Spawner";

let level1: LevelSpawner = {
  level: 1,
  default: [
    ["monster", "a goblin", 0.3],
    ["monster", "a rat", 0.75],
    ["monster", "a snake", 0.5],
    ["item", "g", 1.0],
    ["item", "*", 1.0],
    ["item", "r", 1.0]
  ],
  last: [
    ["monster", "a goblin", 1.0],
    ["monster", "a snake", 1.0],
    ["item", "g", 1.0],
    ["item", "g", 1.0],
    ["item", "r", 1.0]
  ],
  rooms: [
    [
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "r", 1.0],
      ["item", "Q", 1.0]
    ],[
      ["monster", "a rat", 1.0],
      ["monster", "a snake", 1.0],  
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "f", 1.0]
    ]
  ]
}


let level2: LevelSpawner = {
  level: 2,
  default: [
    ["monster", "a goblin", 0.75],
    ["monster", "a rat", 0.75],
    ["monster", "a snake", 0.75],
    ["item", "g", 1.0],
    ["item", "*", 1.0],
    ["item", "r", 1.0]
  ],
  last: [
    ["monster", "a goblin", 1.0],
    ["monster", "a goblin mage", 1.0],
    ["item", "g", 1.0],
    ["item", "g", 1.0],
    ["item", "r", 1.0]
  ],
  rooms: [
    [
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "r", 1.0]  
    ],[
      ["monster", "a goblin mage", 1.0],
      ["monster", "a rat", 1.0],
      ["monster", "a snake", 1.0],  
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "f", 1.0]
    ]
  ]
}

let level3: LevelSpawner = {
  level: 3,
  default: [
    ["monster", "a goblin mage", 0.5],
    ["monster", "a goblin", 0.75],
    ["monster", "a snake", 0.75],
    ["monster", "a rat", 0.5],
    ["item", "g", 1.0],
    ["item", "*", 1.0],
    ["item", "r", 1.0]
  ],
  last: [
    ["monster", "a goblin", 1.0],
    ["monster", "a goblin", 1.0],
    ["monster", "a goblin peltast", 1.0],
    ["item", "g", 1.0],
    ["item", "g", 1.0],
    ["item", "r", 1.0]
  ],
  rooms: [
    [
      ["monster", "a rat", 1.0],
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "r", 1.0]  
    ],[
      ["monster", "a goblin", 1.0],
      ["monster", "a goblin mage", 1.0],
      ["monster", "a snake", 1.0],  
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "f", 1.0]
    ]
  ]
}

export let levels: {[key:number]: LevelSpawner} = {
  1: level1,
  2: level2,
  3: level3,
}

export let goldAmountTable: {[key:number]: [number, number, number]} = {
  1: [1,4,5],
  2: [3,6,7],
  3: [5,9,15]
}
