import { hideModalGame, renderTown } from "../ui/ui";
const clickevt = !!('ontouchstart' in window) ? "touchstart" : "click";

export function getTownState(game,zone):[string,string][] {
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
  console.log("town action", ev, choice);
  if (choice == "return") {
    hideModalGame(ev);
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
