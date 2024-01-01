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
      ["item", "r", 1.0]
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
    ["monster", "a goblin mage", 0.4],
    ["monster", "a goblin", 0.6],
    ["monster", "a goblin peltast", 0.5],
    ["monster", "a snake", 0.75],
    ["monster", "a rat", 0.5],
    ["item", "g", 1.0],
    ["item", "*", 1.0],
    ["item", "r", 1.0]
  ],
  last: [
    ["monster", "a goblin", 1.0],
    ["monster", "a goblin", 1.0],
    ["monster", "a death knight", 1.0],
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

let level4: LevelSpawner = {
  level: 4,
  default: [
    ["monster", "a skeleton", 0.3],
    ["monster", "a bat", 0.75],
    ["monster", "a spider", 0.5],
    ["item", "g", 1.0],
    ["item", "*", 1.0],
    ["item", "r", 1.0]
  ],
  last: [
    ["monster", "a skeleton", 1.0],
    ["monster", "a spider", 1.0],
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
      ["monster", "a bat", 1.0],
      ["monster", "a spider", 1.0],  
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "f", 1.0]
    ]
  ]
}


let level5: LevelSpawner = {
  level: 5,
  default: [
    ["monster", "a skeleton", 0.5],
    ["monster", "a skeleton warrior", 0.75],
    ["monster", "a bat", 0.75],
    ["monster", "a spider", 0.75],
    ["item", "g", 1.0],
    ["item", "*", 1.0],
    ["item", "r", 1.0]
  ],
  last: [
    ["monster", "a skeleton warrior", 1.0],
    ["monster", "a skeleton mage", 1.0],
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
      ["monster", "a skeleton mage", 1.0],
      ["monster", "a bat", 1.0],
      ["monster", "a spider", 1.0],  
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "f", 1.0]
    ]
  ]
}

let level6: LevelSpawner = {
  level: 6,
  default: [
    ["monster", "a skeleton mage", 0.5],
    ["monster", "a skeleton warrior", 0.75],
    ["monster", "a spider", 0.75],
    ["monster", "a bat", 0.5],
    ["item", "g", 1.0],
    ["item", "*", 1.0],
    ["item", "r", 1.0]
  ],
  last: [
    ["monster", "a skeleton", 1.0],
    ["monster", "a skeleton", 1.0],
    ["monster", "a reaper", 1.0],
    ["item", "g", 1.0],
    ["item", "g", 1.0],
    ["item", "r", 1.0],
    ["item", "Q", 1.0]
  ],
  rooms: [
    [
      ["monster", "a bat", 1.0],
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "r", 1.0]  
    ],[
      ["monster", "a skeleton", 1.0],
      ["monster", "a skeleton mage", 1.0],
      ["monster", "a spider", 1.0],  
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
  4: level4,
  5: level5,
  6: level6
}

export let goldAmountTable: {[key:number]: [number, number, number]} = {
  1: [1,4,5],
  2: [2,6,7],
  3: [3,8,15],
  4: [8,15,18],
  5: [10,18,21],
  6: [12,21,24]
}
