import GameState from "../gamestate";
import { hideModalGame, showScreen } from "../ui/ui";
import { renderLevelSelect, renderTown } from "../ui/TownUI";
import { init } from "./GameLogic";
const clickevt = !!('ontouchstart' in window) ? "touchstart" : "click";
import { Quest, QuestStatus, quests, updateQuestStatus } from "../mapgen/Quests";


export type TownNavChoice = ['nav',string, string]
export type TownShopChoice = ['shop',string, string, string]
export type TownChoice = TownNavChoice | TownShopChoice
export type TownPrices = {[key:string]: [number,number]}

export interface TownState {
  zone: string,
  icon: string,
  description: string,
  choices: TownChoice[]
}

export function getTownState(game,zone):TownState {
  let i = "town";  
  let d = `<p>Location: ${zone.charAt(0).toUpperCase() + zone.slice(1)}</p>
  <p>hp:${game.player.stats.hp}/${game.player.stats.maxHP} gp:${game.player.stats.gold} xp:${game.player.stats.xp}</p>
  <p>food:${game.player.stats.food}/${game.player.stats.maxFood} arrows:${game.player.stats.arrows}/${game.player.stats.maxArrows}`
  return {
    zone: "town",
    icon: i,
    description: d,
    choices: [
    ["nav","inn", "Inn"],
    ["nav","shop", "Shop"],
    ["nav","train", "Train"],
    ["nav","castle", "The Castle [QUESTS]"],
    ["nav","levelselect", "Level Select"],
    ["nav","return", `Return (${levelDisplayName(game.levelSelect)})`]
  ]}

}

export function handleTownAction(game, zone, ev) {
  let choice = ev.target['id'];
  // console.log("town action in zone", zone, ev, choice, ev.target.classList);
  showScreen("town",ev)
  if (choice == "return") {
    // parse levelSelect here
    let biome = game.levelSelect.substr(0,game.levelSelect.length - 1)
    let depth = parseInt(game.levelSelect.substr(-1))
    // console.log("loading level selection:",game.levelSelect, biome, depth)
    init(game, depth, biome);
    hideModalGame(ev);
  } else if (choice == "town") {
    let nextState = getTownState(game, choice);
    renderTown(game, nextState);
  } else if (choice == "inn" || zone == "inn") {
    let nextState = handleInn(game, choice);
    renderTown(game, nextState);
  } else if (choice == "train" || zone == "train") {
    let nextState = handleTrain(game, choice);
    renderTown(game, nextState);
  } else if (choice == "shop" || zone == "shop") {
    let nextState = handleShop(game, choice);
    renderTown(game, nextState);  
  } else if (choice == "castle" || zone == "castle") {
    let nextState = handleCastle(game, choice);
    renderTown(game, nextState)
  } else if (choice == "levelselect" || zone == "levelselect") {
    if (choice == "levelselect") {
      let choices = getLevelSelections(game);
      renderLevelSelect(game, choices);  
    } else if (choice.startsWith("dungeon")) {
      let level = parseInt(choice.slice(-1));
      // console.log("selecting dungeon level ",level);
      game.levelSelect = choice
      let state = getTownState(game, "town");
      renderTown(game, state);
      // init(game, level, "dungeon");
      // hideModalGame(ev);
    } else if (choice.startsWith("crypt")) {
      let level = parseInt(choice.slice(-1));
      // console.log("selecting CRYPT level ",level);
      game.levelSelect = choice
      let state = getTownState(game, "town");
      renderTown(game, state);

      // init(game, level, "crypt");
      // hideModalGame(ev);
    }
  } else {
    // This is an error at this point.
    let state = getTownState(game, choice);
    if (state) {
      // console.log("rendering town for ", choice)
      renderTown(game, state);
    } else {
      // console.log("noop");
    }
  }
}

export function handleInn(game, choice):TownState {
  let p = game.player;

  if (choice == "rest") {
    if (p.stats.gold >= 5) {
      p.stats.gold -= 5;
      p.stats.hp = p.stats.maxHP;
    }
  } else if (choice == "resupply") {
    if (p.stats.gold >= 10 || game.debugMode == true) {
      p.stats.gold -= 10;
      p.stats.food = p.stats.maxFood;
      p.stats.arrows = p.stats.maxArrows;
    }
  }

  let rest_ready = "is-disabled"
  if (p.stats.hp < p.stats.maxHP && p.stats.gold >= 5) {
    rest_ready = "is-warning"
  }
  if (game.debugMode == true) {
    rest_ready = ""
  }

  let resupply_ready = "is-disabled"
  if (p.stats.gold >= 10 && (p.stats.arrows < p.stats.maxArrows || p.stats.food < p.stats.maxFood)) {
    resupply_ready = "is-warning"
  }
  if (game.debugMode == true) {
    resupply_ready = ""
  }

  let options: TownChoice[] = [
    ["shop","rest","Rest<br/> recover full HP [5 GP]", rest_ready],
    ["shop","resupply","Resupply<br/> full food and arrows [10 GP]", resupply_ready],
    ["nav","town","Return"]
  ]

  let d = `<p>Location: Inn</p>
  <p>Welcome! You can recover here <br/>before you go back</p>
  <p>hp:${game.player.stats.hp}/${game.player.stats.maxHP} gp:${game.player.stats.gold} xp:${game.player.stats.xp}
  <br/>food:${game.player.stats.food}/${game.player.stats.maxFood} arrows:${game.player.stats.arrows}/${game.player.stats.maxArrows}
  <br/>STR:${game.player.stats.STR} DEF:${game.player.stats.DEF} DEX:${game.player.stats.DEX} AGI:${game.player.stats.AGI}</p>`

  return {
    zone: "inn",
    icon: "town",
    description: d,
    choices: options
  }
}

export function getShopPrices(game): TownPrices {
  let maxFoodCosts = {
    2: 30,
    3: 50,
    4: 100,
    5: 200
  }

  let maxArrowCosts = {
    6: 30,
    7: 50,
    8: 150
  }

  let armorCosts = {
    1: 50,
    2: 150,
    3: 400,
    4: 1200,
    5: 2000,
    6: 2500,
    // 3: 1500,
    // 4: 450,
    // 4: 1500,
    // 5: 4500
  }

  let swordCosts = {
    1: 75,
    2: 250,
    3: 500,
    4: 800,
    5: 1250,
    6: 2000,
    7: 2500,
    8: 3000
    // 3: 700,
    // 4: 2000,
    // 5: 6000
  }

  let next_max_food = game.player.stats.maxFood + 1
  let next_max_food_cost = maxFoodCosts[next_max_food]

  let next_max_arrows = undefined
  let next_max_arrows_cost = undefined

  let next_def = game.player.stats.DEF + 1
  let next_def_cost = armorCosts[next_def]

  let next_str = game.player.stats.STR + 1
  let next_str_cost = swordCosts[next_str]

  switch(game.player.stats.maxArrows) {
    case 5: 
      next_max_arrows = 6
      next_max_arrows_cost = maxArrowCosts[next_max_arrows]
      break;
    case 6:
      next_max_arrows = 7
      next_max_arrows_cost = maxArrowCosts[next_max_arrows]
      break;
    case 7:
      next_max_arrows = 8;
      next_max_arrows_cost = maxArrowCosts[next_max_arrows]
      break
    default:
      break
  }
  return {
    "max_food":[next_max_food_cost,next_max_food],
    "max_arrows":[next_max_arrows_cost,next_max_arrows],
    "def":[next_def_cost,next_def],
    "str":[next_str_cost,next_str]
  }
}

function checkReadyGold(game:GameState, price: number): boolean {
  let gold = game.player.stats.gold  
  if (price <= gold) {
    return true
  } else {
    return false
  }
}

function checkReadyXp(game:GameState, price: number): boolean {
  let xp = game.player.stats.xp  
  if (price <= xp) {
    return true
  } else {
    return false
  }
}


export function handleShop(game, choice):TownState {
  // let choice = ev.target['id'];
  // console.log("shop action", choice);

  let prices = getShopPrices(game)
  
  let options: TownChoice[] = []
  if (prices["max_food"][0]) {
    let readystate = ""
    if (prices["max_food"][0] <= game.player.stats.gold) {
      readystate = "is-warning"
    } else if (game.debugMode == false) {
      readystate = "is-disabled"
    } else if (game.debugMode == true) {
      readystate = ""
    }

    options.push(["shop","maxfood",`max food<br/>${game.player.stats.maxFood} -> ${prices["max_food"][1]} [${prices["max_food"][0]} GP]`, readystate])
  }
  if (prices["max_arrows"][0]) {
    let readystate = ""
    if (prices["max_arrows"][0] <= game.player.stats.gold) {
      readystate = "is-warning"
    } else if (game.debugMode == false) {
      readystate = "is-disabled"
    } else if (game.debugMode == true) {
      readystate = ""
    }

    options.push(["shop","maxarrows", `max arrows<br/>${game.player.stats.maxArrows} -> ${prices["max_arrows"][1]} [${prices["max_arrows"][0]} GP]`, readystate])
  }
  if (prices["def"][0]) {
    let readystate = ""
    if (prices["def"][0] <= game.player.stats.gold) {
      readystate = "is-warning"
    } else if (game.debugMode == false) {
      readystate = "is-disabled"
    } else if (game.debugMode == true) {
      readystate = ""
    }

    options.push(["shop","armor",`Increase DEF +1<br/>${game.player.stats.DEF} -> ${prices["def"][1]} [${prices["def"][0]} GP]`, readystate])
  }
  if (prices["str"][0]) {
    let readystate = ""
    if (prices["str"][0] <= game.player.stats.gold) {
      readystate = "is-warning"
    } else if (game.debugMode == false) {
      readystate = "is-disabled"
    } else if (game.debugMode == true) {
      readystate = ""
    }

    options.push(["shop","sword",`Increase STR +1<br/>${game.player.stats.STR} -> ${prices["str"][1]} [${prices["str"][0]} GP]`, readystate])
  }

  options.push(["nav","town","Return"])
  let p = game.player;

  if (choice == "maxfood") {
    if (prices["max_food"][0] > game.player.stats.gold && game.debugMode == false) {
      return handleShop(game, "shop")
    }
    game.player.stats.maxFood = prices["max_food"][1];
    game.player.baseStats.maxFood = prices["max_food"][1];
    game.player.stats.gold -= prices["max_food"][0];
    return handleShop(game, "shop");
  } else if (choice == "maxarrows") {
    if (prices["max_arrows"][0] > game.player.stats.gold && game.debugMode == false) {
      return handleShop(game, "shop")
    }
    game.player.stats.maxArrows = prices["max_arrows"][1];
    game.player.baseStats.maxArrows = prices["max_arrows"][1];
    game.player.stats.gold -= prices["max_arrows"][0];

    return handleShop(game, "shop");
  } else if (choice == "armor") {
    if (prices["def"][0] > game.player.stats.gold && game.debugMode == false) {
      return handleShop(game, "shop")
    }
    game.player.stats.DEF = prices["def"][1];
    game.player.baseStats.DEF = prices["def"][1];
    game.player.stats.gold -= prices["def"][0];

    return handleShop(game, "shop");
  } else if (choice == "sword") {
    if (prices["str"][0] > game.player.stats.gold && game.debugMode == false) {
      return getTownState(game, "shop")
    }
    game.player.stats.STR = prices["str"][1];
    game.player.baseStats.STR = prices["str"][1];  
    game.player.stats.gold -= prices["str"][0];

    return handleShop(game, "shop");
  } else if (choice == "return") {
    return getTownState(game, "town");
  }


  let i = "town";
  let d = `<p>Location: Shop</p>
  <p>Spend GP to improve your gear.</p>
  <p>hp:${game.player.stats.hp}/${game.player.stats.maxHP} gp:${game.player.stats.gold} xp:${game.player.stats.xp}
  <br/>food:${game.player.stats.food}/${game.player.stats.maxFood} arrows:${game.player.stats.arrows}/${game.player.stats.maxArrows}
  <br/>STR:${game.player.stats.STR} DEF:${game.player.stats.DEF} DEX:${game.player.stats.DEX} AGI:${game.player.stats.AGI}</p>`

  return {
    zone: "shop",
    icon: i,
    description: d,
    choices: options
  }
}

export function handleCastle(game:GameState, choice): TownState {
  // console.log("loading castle, choice:", choice)


  let hasAmulet = game.player.inventory.map( i => i[0]).indexOf("amulet") != -1;
  // console.log("loading town, has amulet:", hasAmulet, "inventory:", game.player.inventory);

  let d = `<p>Location: The Castle</p>`

  let options: TownChoice[] = []

  if (choice.startsWith("accept_")) {
    let questName = choice.slice(7)
    // console.log("accepting:", questName)
    quests[questName].status = "accepted"
    d = d + quests[questName].giveDescription
    if (quests[questName].biome == "crypt" && game.biomeUnlock["crypt"] == 0) {
      game.biomeUnlock["crypt"] = 1
    }
  } else if (choice.startsWith("check_")) {
    let questName = choice.slice(6)
    // console.log("checking:", questName)
    d = d + quests[questName].giveDescription
  } else if (choice.startsWith("handin_")) {
    let questName = choice.slice(7)
    // console.log("handing in:", questName)
    quests[questName].status = "completed"
    d = d + quests[questName].handInDescription
    quests[questName].rewardFunction(game)
    game.player.inventory = game.player.inventory.filter( (i) => {
      i[0] != quests[questName].questItem
    })
    // show handin splash
  }

  updateQuestStatus()

  for (let questName in quests) {
    let quest = quests[questName];
    // console.log("quest:",questName, quest.status)
    if (quest.status == "available") {
      options = options.concat([["nav",`accept_${questName}`,`${quest.giver}: [ACCEPT] ${quest.name}`]])
    } else if (quest.status == "accepted") {
      options = options.concat([["nav",`check_${questName}`,`${quest.giver}: [INFO] ${quest.name}`]])
    } else if (quest.status == "ready") {
      options = options.concat([["nav",`handin_${questName}`,`${quest.giver}: [COMPLETE] ${quest.name}`]])
    }
  }

  options = options.concat([["nav","town","Return"]])
  // console.log(options);
  let i = "castle"  

  return {
    zone: "castle",
    icon: i,
    description: d,
    choices: options
  }  
}

export function getTrainPrices(game):TownPrices {
  let dexCosts = { 
    1: 10,
    2: 20,
    3: 30,
    4: 50,
    5: 75,
    6: 90,
    7: 120,
    8: 150
  }

  let agiCosts = {
    3: 5,
    4: 10,
    5: 20,
    6: 25,
    7: 50,
    8: 100,
    9: 130,
    10: 170,
    11: 200,
    12: 250
  }

  let next_dex = game.player.stats.DEX + 1
  let next_agi = game.player.stats.AGI + 1

  let next_dex_cost = dexCosts[next_dex]
  let next_agi_cost = agiCosts[next_agi]

  return {
    "dex":[next_dex_cost,next_dex],
    "agi":[next_agi_cost,next_agi]
  }

}

export function handleTrain(game, choice):TownState {

  let prices = getTrainPrices(game)

  let options: TownChoice[] = [["nav","town", "Return"]]
  if (prices["agi"][0]) {
    let readystate = ""
    if (prices["agi"][0] <= game.player.stats.xp) {
      readystate = "is-warning"
    } else if (game.debugMode == false) {
      readystate = "is-disabled"
    } else if (game.debugMode == true) {
      readystate = ""
    }
  
    options.unshift(["shop","agi", `AGI ${game.player.stats.AGI} -> ${prices["agi"][1]} (${prices["agi"][0]} XP)`, readystate])
  }
  if (prices["dex"][0]) {
    let readystate = ""
    if (prices["dex"][0] <= game.player.stats.xp) {
      readystate = "is-warning"
    } else if (game.debugMode == false) {
      readystate = "is-disabled"
    } else if (game.debugMode == true) {
      readystate = ""
    }

    options.unshift(["shop","dex", `DEX ${game.player.stats.DEX} -> ${prices["dex"][1]} (${prices["dex"][0]} XP)`, readystate])
  }

  if (choice == "dex") {
    if (prices["dex"][0] > game.player.stats.xp && game.debugMode == false) {
      return getTownState(game, "train")
    }
    game.player.stats.DEX = prices["dex"][1];
    game.player.baseStats.DEX = prices["dex"][1];
    game.player.stats.xp -= prices["dex"][0];
    return handleTrain(game, "train");
  } else if (choice == "agi") {
    if (prices["agi"][0] > game.player.stats.xp && game.debugMode == false) {
      return getTownState(game, "train")
    }
    game.player.stats.AGI = prices["agi"][1];
    game.player.baseStats.AGI = prices["agi"][1];
    game.player.stats.xp -= prices["agi"][0];

    return handleTrain(game, "train");
  } else if (choice == "return") {
    return getTownState(game, "town");
  }

  let i = "town";
  let d = `<p>Location: Barracks</p>
  <p>Spend XP to improve your stats.</p>
  <p>hp:${game.player.stats.hp}/${game.player.stats.maxHP} gp:${game.player.stats.gold} xp:${game.player.stats.xp}
  <br/>food:${game.player.stats.food}/${game.player.stats.maxFood} arrows:${game.player.stats.arrows}/${game.player.stats.maxArrows}
  <br/>STR:${game.player.stats.STR} DEF:${game.player.stats.DEF} DEX:${game.player.stats.DEX} AGI:${game.player.stats.AGI}</p>`

  return {
    zone: "train",
    icon: i,
    description: d,
    choices: options
  }
}

export function getLevelSelections(game:GameState): string[] {
  let selections = [];
  for (let i = 1; i <= 8; i++) {
    if (game.biomeUnlock["dungeon"] >= i) {
      selections.push(`dungeon${i}`);
    }
    if (game.biomeUnlock["crypt"] >= i) {
      selections.push(`crypt${i}`)
    }
  }
  return selections;
  // return ["dungeon1","dungeon2","dungeon3","dungeon4","dungeon5","dungeon6","dungeon7","dungeon8",
  //         "cave1","cave2","cave3","cave4","cave5","cave6","cave7","cave8"]
}

export function levelDisplayName(level:string):string {
  let len = level.length;
  let depth = level[len - 1]
  let biome = level.substring(0,len - 1)
  return `${biome} LV ${depth}`
}
