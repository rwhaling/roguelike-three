import { hideModalGame, renderTown } from "../ui/ui";
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
  if (choice == "return") {
    hideModalGame(ev);
  } else if (choice == "town") {
    let nextState = getTownState(game, choice);
    renderTown(game, nextState);
  } else if (choice == "inn") {
    let nextState = handleInn(game, ev);
    renderTown(game, nextState);
  } else if (choice == "train" || zone == "train") {
    let nextState = handleTrain(game, choice)
    renderTown(game, nextState);
  } else if (choice == "shop" || zone == "shop") {
    let nextState = handleShop(game, choice)
    renderTown(game, nextState);  
  } else if (choice == "food") { 
    let nextState = handleShop(game, ev);
    renderTown(game, nextState);
  } else if (choice == "ammo") {
    let nextState = handleShop(game, ev);
    renderTown(game, nextState);
  } else {
    let state = getTownState(game, choice);
    if (state) {
      console.log("rendering town for ", choice)
      renderTown(game, state);
    } else {
      console.log("noop");
    }
  }
}

export function handleInn(game, ev):TownState {
  let p = game.player;
  if (p.stats.gold >= 5) {
    p.stats.gold -= 5;
    p.stats.hp = p.stats.maxHP;
  } else {

  }
  return getTownState(game, "town");
}

export function handleShop(game, ev):TownState {
  let choice = ev.target['id'];
  console.log("shop action", ev, choice, ev.target.classList);

  let p = game.player;

  if (p.stats.gold >= 5) {
    if (choice == "food" && p.stats.food < p.stats.maxFood) {
      p.stats.gold -= 5; // maybe bump to 10?
      p.stats.food = p.stats.maxFood;
    } else if (choice == "arrows" && p.stats.arrows < p.stats.maxArrows) {
      p.stats.gold -= 5;
      p.stats.food = p.stats.maxArrows;
    }
  } else {

  }
  return getTownState(game, "shop");
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