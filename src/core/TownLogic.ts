import { hideModalGame, renderTown } from "../ui/ui";
const clickevt = !!('ontouchstart' in window) ? "touchstart" : "click";

type TownState = [string, string][]

export function getTownState(game,zone):TownState {
  if (zone == "town") {
    return [
      ["inn", "Inn (5 gold)"],
      ["shop", "Shop"],
      ["train", "Train"],
      ["return", "Return"]
    ]  
  } else if (zone == "shop") {
    return [
      ["weapon", "Upgrade weapon"],
      ["armor", "Upgrade armor"],
      ["food", "Buy food"],
      ["arrows", "Buy arrows"],
      ["town", "Return"]
    ]
  } else if (zone == "train") {
    return [
      ["str", "Improve STR"],
      ["def", "Improve DEF"],
      ["town", "Return"]
    ]
  } else {
    return [
      ["inn", "Inn (5 gold)"],
      ["shop", "Shop"],
      ["train", "Train"],
      ["return", "Return"]
    ]      
  }
}

export function handleTownAction(game, ev) {
  let choice = ev.target['id'];
  console.log("town action", ev, choice, ev.target.classList);
  if (choice == "return") {
    hideModalGame(ev);
  } else if (choice == "inn") {
    let nextState = handleInn(game, ev);
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