import { hideModalGame, renderTown, showScreen } from "../ui/ui";
import { init } from "./GameLogic";
const clickevt = !!('ontouchstart' in window) ? "touchstart" : "click";

// type TownState = [string, string][]
export interface TownState {
  zone: string,
  icon: string,
  description: string,
  choices: [string, string][]
}

export function getTownState(game,zone):TownState {
  let i = "town";
  let d = `<p>zone: ${zone}</p>
  <p>hp:${game.player.stats.hp}/${game.player.stats.maxHP} gp:${game.player.stats.gold} xp:${game.player.stats.xp}</p>
  <p>food:${game.player.stats.food}/${game.player.stats.maxFood} arrows:${game.player.stats.arrows}/${game.player.stats.maxArrows}`
  if (zone == "town") {
    return {
      zone: "town",
      icon: i,
      description: d,
      choices: [
      ["inn", "Inn [Restore HP] (5 GP)"],
      ["shop", "Shop"],
      ["train", "Train"],
      ["castle", "The Castle"],
      ["test", "Test"],
      ["return", "Return"]
    ]}
  } else if (zone == "shop") {
    return {
      zone: "shop",
      icon: i,
      description: d,
      choices: [
      ["food", "Buy food"],
      ["maxfood", "Increase max food"],
      ["arrows", "Buy arrows"],
      ["maxarrows", "Increase max arrows"],
      ["town", "Return"]
    ]}
  } else if (zone == "train") {
    return {
      zone: "train",
      icon: i,
      description: d,
      choices: [
      ["dex", "Improve DEX"],
      ["agi", "Improve AGI"],
      ["town", "Return"]
    ]}
  } else {
    return {
      zone: "town",
      icon: i,
      description: d,
      choices: [
      ["inn", "Inn (5 gold)"],
      ["shop", "Shop"],
      ["train", "Train"],
      ["return", "Return"]
    ]}
  }
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
  } else if (choice == "inn") {
    let nextState = handleInn(game, choice);
    renderTown(game, nextState);
  } else if (choice == "train" || zone == "train") {
    let nextState = handleTrain(game, choice)
    renderTown(game, nextState);
  } else if (choice == "shop" || zone == "shop") {
    let nextState = handleShop(game, choice)
    renderTown(game, nextState);  
  } else if (choice == "castle" || zone == "castle") {
    let nextState = handleCastle(game, choice)
    renderTown(game, nextState)
  } else if (choice == "test" || zone == "test") {
    showScreen("townmenu",ev)
  } else if (choice.startsWith("dungeon")) {
    let level = parseInt(choice.slice(-1));
    console.log("loading level ",level);
    init(game, level);
    hideModalGame(ev);
    // let nextState = getTownState(game, "town");
    // renderTown(game, nextState);  
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
  if (p.stats.gold >= 5) {
    p.stats.gold -= 5;
    p.stats.hp = p.stats.maxHP;
  } else {

  }
  return getTownState(game, "town");
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

  let next_max_food = game.player.stats.maxFood + 1
  let next_max_food_cost = maxFoodCosts[next_max_food]

  let next_max_arrows = undefined
  let next_max_arrows_cost = undefined
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
  
  let options: [string, string][] = [["food","buy food [10 GP]"]]
  if (next_max_food_cost) {
    options.push(["maxfood",`max food ${game.player.stats.maxFood} -> ${next_max_food} (${next_max_food_cost} GP)`])
  }
  options.push(["morearrows", "buy more arrows [5GP]"])
  if (next_max_arrows) {
    options.push(["maxarrows", `max arrows ${game.player.stats.maxArrows} -> ${next_max_arrows} (${next_max_arrows_cost} GP)`])
  }
  options.push(["town","return"])
   



  let p = game.player;

  if (p.stats.gold >= 5) {
    if (choice == "food" && p.stats.food < p.stats.maxFood) {
      p.stats.gold -= 5; // maybe bump to 10?
      p.stats.food = p.stats.maxFood;
    } else if (choice == "morearrows" && p.stats.arrows < p.stats.maxArrows) {
      p.stats.gold -= 5;
      p.stats.food = p.stats.maxArrows;
    }
  } else {

  }

  if (choice == "maxfood") {
    game.player.stats.maxFood = next_max_food;
    game.player.baseStats.maxFood = next_max_food;
    return handleShop(game, "shop");
  } else if (choice == "maxarrows") {
    game.player.stats.maxArrows = next_max_arrows;
    game.player.baseStats.maxArrows = next_max_arrows;
    return handleShop(game, "shop");
  } else if (choice == "return") {
    return getTownState(game, "town");
  }


  let i = "town";
  let d = `<p>zone: train</p>
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
  let hasAmulet = game.player.inventory.map( i => i[0]).indexOf("amulet") != -1;
  console.log("loading town, has amulet:", hasAmulet, "inventory:", game.player.inventory);
  let options: [string, string][] = [["town","return"]]
  let i = "castle"  

  if (choice == "castle" && hasAmulet == false) {
    let d = `<p>zone: castle</p>
    <p>Bring me the amulet of Yendor!</p>`
    return {
      zone: "castle",
      icon: i,
      description: d,
      choices: options
    }  
  }

  if (choice == "castle" && hasAmulet == true) {
    let d = `<p>zone: castle</p>
    <p>Give me the amulet of Yendor!</p>`
    options.unshift(["turnin", "Hand over the amulet"])
    return {
      zone: "castle",
      icon: i,
      description: d,
      choices: options
    }
  }

  if (choice == "turnin" && hasAmulet == true) {
    console.log("inventory before:", game.player.inventory)
    game.player.inventory = game.player.inventory.filter( i => i[0] == "amulet")
    console.log("inventory after:", game.player.inventory)
    let d = `<p>zone: castle</p>
    <p>Here are some coins. Please leave now.</p>`
    options = [["return", "You won?"]]
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

export function handleTrain(game, choice): TownState {
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

  let options: [string,string][] = [["town", "Return"]]
  if (next_agi_cost) {
    options.unshift(["agi", `AGI ${game.player.stats.AGI} -> ${next_agi} (${next_agi_cost} XP)`])
  }
  if (next_dex_cost) {
    options.unshift(["dex", `DEX ${game.player.stats.DEX} -> ${next_dex} (${next_dex_cost} XP)`])
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