import GameState from "../gamestate";
import { hideModalGame, renderLevelSelect, renderTown, showScreen } from "../ui/ui";
import { init } from "./GameLogic";
const clickevt = !!('ontouchstart' in window) ? "touchstart" : "click";
import { Quest, QuestStatus, quests, updateQuestStatus } from "../mapgen/Quests";


export type TownNavChoice = ['nav',string, string]
export type TownShopChoice = ['shop',string, string]
export type TownChoice = TownNavChoice | TownShopChoice

export interface TownState {
  zone: string,
  icon: string,
  description: string,
  choices: TownChoice[]
}

export function getTownState(game,zone):TownState {
  let i = "town";
  let d = `<p>zone: ${zone}</p>
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
    ["nav","castle", "The Castle"],
    ["nav","levelselect", "Level Select"],
    ["nav","return", "Return"]
  ]}

}

export function handleTownAction(game, zone, ev) {
  let choice = ev.target['id'];
  console.log("town action in zone", zone, ev, choice, ev.target.classList);
  showScreen("town",ev)
  if (choice == "return") {
    init(game, 1);
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
      console.log("loading level ",level);
      init(game, level, "dungeon");
      hideModalGame(ev);
    } else if (choice.startsWith("cave")) {
      let level = parseInt(choice.slice(-1));
      console.log("loading CAVE (CRYPT) level ",level);
      init(game, level, "crypt");
      hideModalGame(ev);
    }
  } else {
    // This is an error at this point.
    let state = getTownState(game, choice);
    if (state) {
      console.log("rendering town for ", choice)
      renderTown(game, state);
    } else {
      console.log("noop");
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
    if (p.stats.gold >= 10) {
      p.stats.gold -= 10;
      p.stats.food = p.stats.maxFood;
      p.stats.arrows = p.stats.maxArrows;
    }
  }
  let options: TownChoice[] = [
    ["shop","rest","Rest<br/> recover full HP [5 GP]"],
    ["shop","resupply","Resupply<br/> full food and arrows [10 GP]"],
    ["nav","return","Return"]
  ]

  let d = `<p>zone: inn</p>
  <p>Welcome! You can recover here <br/>before you go back</p>
  <p>hp:${game.player.stats.hp}/${game.player.stats.maxHP} gp:${game.player.stats.gold} xp:${game.player.stats.xp}</p>
  <p>food:${game.player.stats.food}/${game.player.stats.maxFood} arrows:${game.player.stats.arrows}/${game.player.stats.maxArrows}
  <p>STR:${game.player.stats.STR} DEF:${game.player.stats.DEF} DEX:${game.player.stats.DEX} AGI:${game.player.stats.AGI}</p>`

  return {
    zone: "inn",
    icon: "town",
    description: d,
    choices: options
  }
}

export function handleShop(game, choice):TownState {
  // let choice = ev.target['id'];
  console.log("shop action", choice);

  let maxFoodCosts = {
    2: 30,
    3: 50,
    4: 100,
    5: 200
  }

  let maxArrowCosts = {
    8: 30,
    12: 50,
    15: 150
  }

  let armorCosts = {
    1: 75,
    2: 150,
    3: 300
  }

  let next_max_food = game.player.stats.maxFood + 1
  let next_max_food_cost = maxFoodCosts[next_max_food]

  let next_max_arrows = undefined
  let next_max_arrows_cost = undefined

  let next_def = game.player.stats.DEF + 1
  let next_def_cost = armorCosts[next_def]

  switch(game.player.stats.maxArrows) {
    case 5: 
      next_max_arrows = 8
      next_max_arrows_cost = maxArrowCosts[next_max_arrows]
      break;
    case 8:
      next_max_arrows = 12
      next_max_arrows_cost = maxArrowCosts[next_max_arrows]
      break;
    case 12:
      next_max_arrows = 15;
      next_max_arrows_cost = maxArrowCosts[next_max_arrows]
      break
    default:
      break
  }
  
  let options: TownChoice[] = []
  if (next_max_food_cost) {
    options.push(["shop","maxfood",`max food<br/>${game.player.stats.maxFood} -> ${next_max_food} [${next_max_food_cost} GP]`])
  }
  if (next_max_arrows) {
    options.push(["shop","maxarrows", `max arrows<br/>${game.player.stats.maxArrows} -> ${next_max_arrows} [${next_max_arrows_cost} GP]`])
  }
  if (next_def_cost) {
    options.push(["shop","armor",`Increase DEF +1<br/>${game.player.stats.DEF} -> ${game.player.stats.DEF + 1} [${next_def_cost} GP]`])
  }
  options.push(["nav","town","return"])
  let p = game.player;

  if (choice == "maxfood") {
    game.player.stats.maxFood = next_max_food;
    game.player.baseStats.maxFood = next_max_food;
    return handleShop(game, "shop");
  } else if (choice == "maxarrows") {
    game.player.stats.maxArrows = next_max_arrows;
    game.player.baseStats.maxArrows = next_max_arrows;
    return handleShop(game, "shop");
  } else if (choice == "armor") {
    game.player.stats.DEF = next_def;
    game.player.baseStats.DEF = next_def;
    return handleShop(game, "shop");
  } else if (choice == "return") {
    return getTownState(game, "town");
  }


  let i = "town";
  let d = `<p>zone: shop</p>
  <p>Spend GP to improve your gear.</p>
  <p>hp:${game.player.stats.hp}/${game.player.stats.maxHP} gp:${game.player.stats.gold} xp:${game.player.stats.xp}</p>
  <p>food:${game.player.stats.food}/${game.player.stats.maxFood} arrows:${game.player.stats.arrows}/${game.player.stats.maxArrows}
  <p>STR:${game.player.stats.STR} DEF:${game.player.stats.DEF} DEX:${game.player.stats.DEX} AGI:${game.player.stats.AGI}</p>`

  return {
    zone: "shop",
    icon: i,
    description: d,
    choices: options

  }
}

export function handleCastle(game, choice): TownState {
  console.log("loading castle, choice:", choice)


  let hasAmulet = game.player.inventory.map( i => i[0]).indexOf("amulet") != -1;
  console.log("loading town, has amulet:", hasAmulet, "inventory:", game.player.inventory);

  let d = `<p>zone: castle</p>`

  let options: TownChoice[] = []

  if (choice.startsWith("accept_")) {
    let questName = choice.slice(7)
    console.log("accepting:", questName)
    quests[questName].status = "accepted"
    d = d + quests[questName].giveDescription
  } else if (choice.startsWith("check_")) {
    let questName = choice.slice(6)
    console.log("checking:", questName)
    d = d + quests[questName].giveDescription
  } else if (choice.startsWith("handin_")) {
    let questName = choice.slice(7)
    console.log("handing in:", questName)
    quests[questName].status = "completed"
    d = d + quests[questName].handInDescription
    quests[questName].rewardFunction(game)
    // show handin splash
  }

  updateQuestStatus()

  for (let questName in quests) {
    let quest = quests[questName];
    console.log("quest:",questName, quest.status)
    if (quest.status == "available") {
      options = options.concat([["nav",`accept_${questName}`,`accept quest ${quest.name}`]])
    } else if (quest.status == "accepted") {
      options = options.concat([["nav",`check_${questName}`,`accepted quest ${quest.name}`]])
    } else if (quest.status == "ready") {
      options = options.concat([["nav",`handin_${questName}`,`hand in quest ${quest.name}`]])
    }
  }

  options = options.concat([["nav","town","return"]])
  console.log(options);
  let i = "castle"  

  return {
    zone: "castle",
    icon: i,
    description: d,
    choices: options
  }  

  // if (choice == "castle" && hasAmulet == false) {
  //   let d = `<p>zone: castle</p>`
  //   return {
  //     zone: "castle",
  //     icon: i,
  //     description: d,
  //     choices: options
  //   }  
  // }

  // if (choice == "castle" && hasAmulet == true) {
  //   let d = `<p>zone: castle</p>
  //   <p>Give me the amulet of Yendor!</p>`
  //   options.unshift(["nav","turnin", "Hand over the amulet"])
  //   return {
  //     zone: "castle",
  //     icon: i,
  //     description: d,
  //     choices: options
  //   }
  // }

  if (choice == "turnin" && hasAmulet == true) {
    console.log("inventory before:", game.player.inventory)
    game.player.inventory = game.player.inventory.filter( i => i[0] == "amulet")
    console.log("inventory after:", game.player.inventory)
    let d = `<p>zone: castle</p>
    <p>Here are some coins. Please leave now.</p>`
    options = [["nav","return", "You won?"]]
    return {
      zone: "castle",
      icon: i,
      description: d,
      choices: options
    }
  }

  if (choice == "return") {
    return getTownState(game, "town");
  }
}

export function handleTrain(game, choice):TownState {
  let dexCosts = { 
    1: 10,
    2: 20,
    3: 30,
    4: 50,
    5: 75,
    6: 90
  }

  let agiCosts = {
    3: 5,
    4: 10,
    5: 20,
    6: 25,
    7: 50,
    8: 100
  }

  let next_dex = game.player.stats.DEX + 1
  let next_agi = game.player.stats.AGI + 1

  let next_dex_cost = dexCosts[next_dex]
  let next_agi_cost = agiCosts[next_agi]

  let options: TownChoice[] = [["nav","town", "Return"]]
  if (next_agi_cost) {
    options.unshift(["shop","agi", `AGI ${game.player.stats.AGI} -> ${next_agi} (${next_agi_cost} XP)`])
  }
  if (next_dex_cost) {
    options.unshift(["shop","dex", `DEX ${game.player.stats.DEX} -> ${next_dex} (${next_dex_cost} XP)`])
  }

  if (choice == "dex") {
    game.player.stats.DEX = next_dex;
    game.player.baseStats.DEX = next_dex;
    return handleTrain(game, "train");
  } else if (choice == "agi") {
    game.player.stats.AGI = next_agi;
    game.player.baseStats.AGI = next_agi;
    return handleTrain(game, "train");
  } else if (choice == "return") {
    return getTownState(game, "town");
  }

  let i = "town";
  let d = `<p>zone: train</p>
  <p>Spend XP to improve your stats.</p>
  <p>hp:${game.player.stats.hp}/${game.player.stats.maxHP} gp:${game.player.stats.gold} xp:${game.player.stats.xp}</p>
  <p>food:${game.player.stats.food}/${game.player.stats.maxFood} arrows:${game.player.stats.arrows}/${game.player.stats.maxArrows}
  <p>STR:${game.player.stats.STR} DEF:${game.player.stats.DEF} DEX:${game.player.stats.DEX} AGI:${game.player.stats.AGI}</p>`

  return {
    zone: "train",
    icon: i,
    description: d,
    choices: options
  }
}

export function getLevelSelections(game:GameState): string[] {
  return ["dungeon1","dungeon2","dungeon3","dungeon4","dungeon5","dungeon6",
          "cave1","cave2","cave3","cave4","cave5","cave6"]
}