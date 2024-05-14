import { handleTownAction, TownState } from "../core/TownLogic";
import { Player } from "../entities/player";
import GameState from "../gamestate";
import { sfx, setVolume } from "../sound/sfx";
import { music } from "../sound/music";
import { Quest, QuestStatus, quests } from "../mapgen/Quests";


const clickevt = !!('ontouchstart' in window) ? "touchstart" : "click";

const usePointer = true;
const useArrows = true;

// handy shortcuts and shims for manipulating the dom
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
// NodeList.prototype.forEach = Array.prototype.forEach;

export let UI = {
  lastScreen: "title",
  inHudModal: false,
  music_vol: "music_vol_full",
  sound_vol: "music_vol_full",
  clickevt: !!('ontouchstart' in window) ? "touchstart" : "click"
}

// hides all screens and shows the requested screen
export function showScreen(which, ev) {
  ev && ev.preventDefault();
  history.pushState(null, which, "#" + which);
  const el = $("#" + which);
  const actionbutton = $("#" + which + ">.action");
  document.querySelectorAll(".screen")
  .forEach(function(s) {
    s.classList.remove("show");
    s.classList.add("hide");
  });
  el.classList.remove("hide");
  el.classList.remove("show");
  void(el.offsetHeight); // trigger CSS reflow
  el.classList.add("show");
  if (actionbutton) { actionbutton.focus(); };
  UI.lastScreen = which;
}

// // this code resets the ROT.js display canvas
// // and sets up the touch and click event handlers
// // when it's called at the start of the game
// function resetCanvas(el) {
//   $("#canvas").innerHTML = "";
//   $("#canvas").appendChild(el);
//   window.onkeydown = keyHandler;
//   window.onkeyup = arrowStop;
//   if (usePointer) { $("#canvas").addEventListener(clickevt, handlePointing); };
//   if (useArrows) {
//     document.ontouchstart = handleArrowTouch;
//     document.ontouchend = arrowStop;
//   };
//   showScreen("game");
// }

// while showing the lose animation we don't want
// any event handlers to fire so we remove them
// and lock the game
export function removeListeners(game) {
  if (game.engine) {
    game.arrowHeld = null;
    game.engine.lock();
    game.scheduler.clear();
    window.onkeydown = null;
    window.onkeyup = null;
    game.listening = false;
    // if (usePointer) { $("#canvas").removeEventListener(clickevt, handlePointing); };
    if (useArrows) {
      document.ontouchstart = null;
      document.ontouchend = null;
    };
  }
}  

// set the end-screen message to show
// how well the player did
export function setEndScreenValues(xp, gold) {
  $$(".xp-stat").forEach(el=>el.textContent = Math.floor(xp));
  $$(".gold-stat").forEach(el=>el.textContent = gold);
}
    
      // updates the contents of the inventory UI
      // with a list of things you want in there
      // items is an array of ["C", "Words"]
      // where "C" is the character from the tileset
      // and "Words" are whatever words you want next
      // to it
export function renderInventory(tileOptions,items) {
    const inv = $("#inventory ul");
    inv.innerHTML = "";
    items.forEach(function(i, idx) {
          const tile = tileOptions.tileMap[i[0]];
          const words = i[1];
          attach(inv,
               el("li", {"onclick": selectedInventory.bind(null, i, idx, items),
                         "className": "inventory-item",},
                  [el("div", {
                    "className": "sprite",
                    "style": "background-position: -" +
                      tile[0] + "px -" + tile[1] + "px;"
                  }), words]));
    });
}

// export function renderTown(game:GameState, town:any) {
//   const town_el = $("#town");
//   town_el.innerHTML = "";
//   let content = `<table class="nes-table is-dark is-bordered" style="margin: 0 auto 0 auto; background-color: #000;">
//   <tr>
//     <td colspan="4"><div class="sprite ${town.icon}"></div>
//       <p>${town.description}</p>
//     </td>
//   </tr>`
//   let trailing_content = ""

//   let quests_available = false;
//   let quests_ready = false;

//   for (let q in quests) {
//     let qu = quests[q]
//     if (qu.status == "available") {
//       quests_available = true;
//     } if (qu.status == "ready") {
//       quests_ready = true;
//     }
//   }  

//   for (let b of town.choices) {
//   // for (let b of town.choices) {
//     if (b[1] == "castle" && quests_ready) {
//       trailing_content += `<button class="nes-btn townaction is-primary" id="${b[1]}">${b[2]}</button>`
//     } else if (b[1] == "castle" && quests_available) {
//       trailing_content += `<button class="nes-btn townaction is-success" id="${b[1]}">${b[2]}</button>`
//     } else if (town.zone == "castle") {
//       if (b[1].startsWith("accept_")) {
//         trailing_content += `<button class="nes-btn townaction is-success" id="${b[1]}">${b[2]}</button>`
//       } else if (b[1].startsWith("handin_")) {
//         trailing_content += `<button class="nes-btn townaction is-primary" id="${b[1]}">${b[2]}</button>`
//       } else {
//         trailing_content += `<button class="nes-btn townaction" id="${b[1]}">${b[2]}</button>`
//       }
//     } else if (b[0] == "nav") {
//     // if (b[0] == "town" || b[0] == "return") {
//       trailing_content += `<button class="nes-btn townaction" id="${b[1]}">${b[2]}</button>`
//     } else {
//       content += `<tr><td colspan="3">${b[2]}</td><td><button class="nes-btn townaction" id="${b[1]}">Buy</button></td></tr>`;
//     }
//   }
//   town_el.innerHTML = `${content}</table>${trailing_content}`

//   document.querySelectorAll(".modal button.townaction")
//   .forEach(function(el) {
//     el.addEventListener(clickevt, ev => { 
//       console.log("click", ev.target['id'], ev);
//       handleTownAction(game, town.zone, ev);
//     });
//     // el.addEventListener(clickevt, hideModalGame);
//   });

// }

// export function renderLevelSelect(game:GameState, levels:string[]) {
//   const town_el = $("#town");
//   town_el.innerHTML = "";
//   let content = `<table class="nes-table is-dark is-bordered" style="margin: 0 auto 0 auto; background-color: #000;">
//   <tr>
//     <td colspan="4"></div>
//       <p>Select a level to return to:</p>
//     </td>
//   </tr>`
//   let trailing_content = ""
//   for (let i = 0; i < levels.length; i += 2) {
//     content += `<tr><td colspan="2"><button class="nes-btn townaction is-primary" id="${levels[i]}">${levels[i]}</button></td>`
//     if (i + 1 < levels.length) {
//       content += `<td colspan="2"><button class="nes-btn townaction is-primary" id="${levels[i+1]}">${levels[i+1]}</button></td>`
//     } else {
//       content += '<td colspan="2"></td>'
//     }
//     content += "</tr>"
//   }
//   content += "</table>"
//   trailing_content += '<button class="nes-btn townaction" id="town">Return</button>'
//   town_el.innerHTML = content + trailing_content

//   document.querySelectorAll(".modal button.townaction")
//   .forEach(function(el) {
//     el.addEventListener(clickevt, ev => { 
//       console.log("click", ev.target['id'], ev);
//       handleTownAction(game, "levelselect", ev);
//     });
//   });
// }
    
export function hideModalGame(ev) {
  console.log("hiding modal and returning to game", ev);
  ev.preventDefault();
  showScreen("game", ev);
  sfx['choice'].play();
}


// called when an inventory item is selected
export function selectedInventory(which, index, items, ev) {
  // this function is called when an inventory item is clicked
  // toast(which[1] + " selected");
  // toggleInventory(ev, true, Game);
  // if you want to remove an item from the inventory
  // inventoryRemove(items, which);
}
    
// call this to remove an item from the inventory
export function inventoryRemove(items, which) {
  const idx = items.indexOf(which);
  items.splice(idx, 1);
  // renderInventory(items);
}
    
// updates the stats listed at the bottom of the screen
// pass in an object containing key value pairs where
// the key is the name of the stat and the value is the
// number
export function renderStats(player:Player) {
  player.controls.dirty = false;

  const playerStats = $("#playerdata");
  playerStats.innerHTML = "";
  attach(playerStats, el("tr", {}, ["Player"]));
  attach(playerStats, el("tr", {}, ["CLASS: Warrior"]));
  attach(playerStats, el("tr", {}, [`HP: ${player.stats.hp}`]));
  attach(playerStats, el("tr", {}, [`STR: ${player.stats.STR}`]));
  attach(playerStats, el("tr", {}, [`DEF: ${player.stats.DEF}`]));
  attach(playerStats, el("tr", {}, [`DEX: ${player.stats.DEX}`]));
  attach(playerStats, el("tr", {}, [`AGI: ${player.stats.AGI}`]));
  attach(playerStats, el("tr", {}, [`XP: ${player.stats.xp}`]));
  attach(playerStats, el("tr", {}, [`GOLD: ${player.stats.gold}`]));
  attach(playerStats, el("tr", {}, [`FOOD: ${player.stats.food}`]));
  attach(playerStats, el("tr", {}, [`AMMO: ${player.stats.arrows}`]));

  const st = $("#hud");
  st.innerHTML = "";
  let lower_skills_content = ""
  let moves = player.controls.moves;
  let selected = player.controls.selectedMove;
  console.log("selected move:", selected);
  // for (let s in stats) {
  moves.forEach((s,idx) => {
    let decoration = idx == selected ? "underline" : "none";
    let color = s.ready ? "white" : "darkgrey"
    let key = ["Q","W","E","R","T","Y"][idx]
    lower_skills_content += `<span class='skill' style='text-decoration: ${decoration}; color: ${color}'>${key}-${s.name}</span>  `
  });
  st.innerHTML = lower_skills_content;

  const skills_st = $("#skillhud");
  skills_st.innerHTML = "";
  let skills = player.controls.skills;
  let skills_content = ""

  skills.forEach((s,idx) => {
    let real_idx = idx + moves.length;
    let decoration = real_idx === selected ? "underline" : "none";
    let color = s.ready ? "white" : "darkgrey";
    skills_content += `<span class ='skill' style='text-decoration: ${decoration}; color: ${color}'>${idx + 1}-${s.name}</span>  `
  });
  skills_st.innerHTML = skills_content;
  
}

export function renderTargets(game:GameState) {
  game.player.controls.dirty = false;
  const st = $("#enemies");
  st.innerHTML = "";
  const targetStats = $("#targetstatus");
  targetStats.innerHTML = "";

  for (let m of game.monsters) {
    if (m.awake && m.id == game.player.controls.currentTarget) {
      let row = attach(st, el("tr", { "style": "text-decoration: underline;" }, [m.name]));

      attach(targetStats,el("tr",{},[m.name]))
      attach(targetStats,el("tr",{},[`HP: ${m.stats.hp}`]))

    } else if (m.awake) {
      let row = attach(st, el("tr", { "style": "" }, [m.name]));
    }
  }

  const map_st = $("#mapdata")

  let objective:String = "RETURN to town"

  if (game.currentQuest && quests[game.currentQuest].status == "accepted") {
    objective = `GOAL: ${quests[game.currentQuest].questItem}`
  } else if (game.currentQuest && quests[game.currentQuest].status == "ready") {
    objective = `RETURN to Town`
  } else {
    for (let q in quests) {
      let qu = quests[q]
      if (qu.status == "accepted" && qu.biome == game.currentBiome && qu.depth > game.currentLevel) {
        objective = `DESCEND ${qu.depth - game.currentLevel} Lv`
        break
      } if (qu.status == "accepted" && qu.biome == game.currentBiome && qu.depth < game.currentLevel) {
        objective = `ASCEND ${game.currentLevel - qu.depth} Lv`
        break
      } else {
        objective = `RETURN to Town`
      } 
    }  
  }

  map_st.innerHTML = `<table><tr><td>${game.currentBiome} Level: ${game.currentLevel}</td></tr>
  <tr><td>Enemies: ${game.monsters.length}</td></tr>
  <tr><td>Items: ${Object.values(game.items).length - 2}</td></tr>
  <tr><td>${objective}</table>`
}
    
// toggles the inventory UI open or closed
export function toggleInventory(ev, force, game:GameState) {
  const c = ev.target.className;
  if (c != "sprite" && c != "inventory-item" || force) {
    ev.preventDefault();
    // toggle the inventory to visible/invisible
    const b = $("#inventory>span");
    const d = $("#inventory>div");
    if (b.style.display == "none") {
      b.style.display = "block";
      d.style.display = "none";
    } else {
      b.style.display = "none";
      d.style.display = "block";
    }

    const inv_st = $("#inventory_container");
    let inv_html = ""

    for (let i of game.player.inventory) {
      console.log(i);
      inv_html += `<li>${i[1]}</li>`
    }
    inv_st.innerHTML = "<ul>" + inv_html + "</ul>"
    return false;
  }
}
    
// creates the ghost sprite when the player dies
// use this template to overlay effects on the game canvas
export function createGhost(w,h,pos) {
  // const tw = tileOptions.tileWidth;
  // const th = tileOptions.tileHeight;
  const tw = w;
  const th = h;

  // place the ghost on the map at the player's position
  const left = "left:" + (pos[0] * tw) + "px;";
  const top = "top:" + (pos[1] * th) + "px;";
  const ghost = el("div", {"className": "sprite ghost free float-up", "style": left + top});
  ghost.onanimationend = function() { rmel(ghost); };
  return attach($("#canvas"), ghost);
}

export function damageNum(x,y,n) {
  // HACK, need a stable id
  let canv = document.getElementsByTagName("canvas")[0]
  console.log("canvas position:",canv.offsetLeft, canv.offsetTop);

  const style = `left: ${x + canv.offsetLeft}px; top: ${y + canv.offsetTop}px`;
  // const num = el("div", {"className": "free float-up", "style": style});
  const num = el("div", {"className": "free bounce-up", "style": style});

  num.innerHTML = `<span>${n}</span>`
  num.onanimationend = function() { rmel(num); };
  return attach($("#canvas"), num);
}
    
// creates a battle message with highlighted outcomes
// pass it an array of strings like:
// ["Something missed something.", "Something hit something."]
// it will highlight the word "miss" and "hit"
// by giving them a CSS class
export function battleMessage(messages) {
  const components = messages.reduce(function(msgs, m) {
    return msgs.concat(m.split(" ").map(function(p) {
      const match = p.match(/hit|miss/);
      return el("span", {"className": match ? match[0] : ""}, [p, " "]);
    })).concat(el("br", {}));
  }, []);
  return el("span", {}, components);
}
    
// this function displays a message at the top
// of the game screen for the player such as
// "You have found a sneaky wurzel."
export function toast(game,message) {
  const m = $("#message");
  // if current scheduler act is player
  // then clear our messages first
  // or if we're hiding the messages anyway
  if (game.scheduler._current == game.player ||
      m.className.indexOf("show") == -1) {
    m.innerHTML = "";
  }
  m.classList.remove("fade-out");
  m.classList.add("show");
  if (typeof(message) == "string") {
    m.appendChild(el("span", {}, [message]));
  } else {
    m.appendChild(message);
  }
}
    
// hide the toast message
export function hideToast(instant) {
  const m = $("#message");
  if (instant) {
    m.classList.remove("show");
    m.classList.remove("fade-out")
    m.innerHTML = "";
  } else if (m.className.match("show")) {
    m.classList.remove("show");
    m.classList.add("fade-out");
    m.onanimationend = function() {
      m.classList.remove("fade-out");
      m.innerHTML = "";
    };
  }
}
    
// create an HTML element
export function el(tag, attrs, children?) {
  const node = document.createElement(tag);
  for (let a in attrs) { node[a] = attrs[a]; }
  (children || []).forEach(function(c) {
    if (typeof(c) == "string") {
      node.appendChild(document.createTextNode(c));
    } else {
      attach(node, c);
    }
  });
  return node;
}
    
// add an HTML element to a parent node
function attach(node, el) {
    node.appendChild(el);
    return el;
}

// remove an element from the dom
function rmel(node) {
  node.parentNode.removeChild(node);
}