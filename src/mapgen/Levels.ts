import { LevelSpawner } from "./Spawner";

let level1: LevelSpawner = {
  level: 1,
  default: [
    ["monster", "a goblin", 0.3],
    ["monster", "a rat", 0.75],
    ["monster", "a snake", 0.5],
    ["item", "g", 1.0],
    ["item", "*", 1.0]
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
      ["item", "*", 1.0]
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
  ],
  last: [
    ["monster", "a goblin", 1.0],
    ["monster", "a goblin", 1.0],
    ["monster", "an ogre", 1.0],
    ["item", "g", 1.0],
    ["item", "g", 1.0],
    ["item", "*", 1.0]
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
  ],
  last: [
    ["monster", "a skeleton", 1.0],
    ["monster", "a spider", 1.0],
    ["item", "g", 1.0],
    ["item", "g", 1.0],
  ],
  rooms: [
    [
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "r", 1.0]
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
    ["monster", "a ghoul", 0.75],
    ["monster", "a bat", 0.75],
    ["monster", "a spider", 0.75],
    ["item", "g", 1.0],
    ["item", "*", 1.0],
  ],
  last: [
    ["monster", "a ghoul", 1.0],
    ["monster", "a skeleton mage", 1.0],
    ["item", "g", 1.0],
    ["item", "g", 1.0],
    ["item", "r", 1.0]
  ],
  rooms: [
    [
      ["item", "g", 1.0],
      ["item", "*", 1.0],
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
    ["monster", "a ghoul", 0.75],
    ["monster", "a spider", 0.75],
    ["monster", "a bat", 0.5],
    ["item", "g", 1.0],
    ["item", "*", 1.0],
  ],
  last: [
    ["monster", "a skeleton warrior", 1.0],
    ["monster", "a skeleton", 1.0],
    ["monster", "a skeleton", 1.0],
    ["monster", "a skeleton king", 1.0],
    ["item", "g", 1.0],
    ["item", "g", 1.0],
  ],
  rooms: [
    [
      ["monster", "a bat", 1.0],
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "r", 1.0]  
    ],[
      ["monster", "a skeleton warrior", 1.0],
      ["monster", "a skeleton mage", 1.0],
      ["monster", "a spider", 1.0],  
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "f", 1.0]
    ]
  ]
}

let cave_2_1: LevelSpawner = {
  level: 1,
  default: [
    ["monster", "a hobgoblin", 0.75],
    ["monster", "a hobgoblin", 0.5],
    ["monster", "a rat", 0.75],
    ["monster", "a snake", 0.75],
    ["item", "g", 1.0],
    ["item", "*", 1.0],
  ],
  last: [
    ["monster", "a hobgoblin", 1.0],
    ["monster", "an ogre", 1.0],
    ["item", "g", 1.0],
    ["item", "g", 1.0],
  ],
  rooms: [
    [
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "r", 1.0]  
    ],[
      ["monster", "a hobgoblin", 1.0],
      ["monster", "a rat", 1.0],
      ["monster", "a snake", 1.0],  
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "f", 1.0]
    ]
  ]
}

let crypt_2_1: LevelSpawner = {
  level: 1,
  default: [
    ["monster", "a revenant", 0.5],
    ["monster", "a revenant", 0.75],
    ["monster", "a bat", 0.75],
    ["monster", "a spider", 0.75],
    ["item", "g", 1.0],
    ["item", "*", 1.0],
  ],
  last: [
    ["monster", "a revenant", 1.0],
    ["monster", "a reaper", 1.0],
    ["item", "g", 1.0],
    ["item", "g", 1.0],
  ],
  rooms: [
    [
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "r", 1.0]  
    ],[
      ["monster", "a revenant", 1.0],
      ["monster", "a bat", 1.0],
      ["monster", "a spider", 1.0],  
      ["item", "g", 1.0],
      ["item", "*", 1.0],
      ["item", "f", 1.0]
    ]
  ]
}

export let dungeonLevels: {[key:number]: LevelSpawner} = {
  1: level1,
  2: level1,
  3: level2,
  4: level2,
  5: level3,
  6: level3,
  7: cave_2_1
}

export let cryptLevels: {[key:number]: LevelSpawner} = {
  1: level4,
  2: level4,
  3: level5,
  4: level5,
  5: level6,
  6: level6,
  7: crypt_2_1
}

export let goldAmountTable: {[key:number]: [number, number, number]} = {
  1: [1,4,5],
  2: [2,6,7],
  3: [3,8,15],
  4: [8,15,18],
  5: [10,18,21],
  6: [12,21,24],
  7: [20,30,40],
  8: [50,75,80]
}
