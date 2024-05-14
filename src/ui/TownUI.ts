import { handleTownAction, TownState } from "../core/TownLogic";
import GameState from "../gamestate";
import { quests } from "../mapgen/Quests";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

let clickevt = !!('ontouchstart' in window) ? "touchstart" : "click"


export function renderTown(game:GameState, town:any) {
    const town_el = $("#town");
    town_el.innerHTML = "";
    let content = `<table class="nes-table is-dark is-bordered" style="margin: 0 auto 0 auto; background-color: #000;">
    <tr>
      <td colspan="4"><div class="sprite ${town.icon}"></div>
        <p>${town.description}</p>
      </td>
    </tr>`
    let trailing_content = ""
  
    let quests_available = false;
    let quests_ready = false;
  
    for (let q in quests) {
      let qu = quests[q]
      if (qu.status == "available") {
        quests_available = true;
      } if (qu.status == "ready") {
        quests_ready = true;
      }
    }  
  
    for (let b of town.choices) {
    // for (let b of town.choices) {
      if (b[1] == "castle" && quests_ready) {
        trailing_content += `<button class="nes-btn townaction is-primary" id="${b[1]}">${b[2]}</button>`
      } else if (b[1] == "castle" && quests_available) {
        trailing_content += `<button class="nes-btn townaction is-success" id="${b[1]}">${b[2]}</button>`
      } else if (town.zone == "castle") {
        if (b[1].startsWith("accept_")) {
          trailing_content += `<button class="nes-btn townaction is-success" id="${b[1]}">${b[2]}</button>`
        } else if (b[1].startsWith("handin_")) {
          trailing_content += `<button class="nes-btn townaction is-primary" id="${b[1]}">${b[2]}</button>`
        } else {
          trailing_content += `<button class="nes-btn townaction" id="${b[1]}">${b[2]}</button>`
        }
      } else if (b[0] == "nav") {
      // if (b[0] == "town" || b[0] == "return") {
        trailing_content += `<button class="nes-btn townaction" id="${b[1]}">${b[2]}</button>`
      } else {
        content += `<tr><td colspan="3">${b[2]}</td><td><button class="nes-btn townaction" id="${b[1]}">Buy</button></td></tr>`;
      }
    }
    town_el.innerHTML = `${content}</table>${trailing_content}`
  
    document.querySelectorAll(".modal button.townaction")
    .forEach(function(el) {
      el.addEventListener(clickevt, ev => { 
        console.log("click", ev.target['id'], ev);
        handleTownAction(game, town.zone, ev);
      });
      // el.addEventListener(clickevt, hideModalGame);
    });
  
  }
  
  export function renderLevelSelect(game:GameState, levels:string[]) {
    const town_el = $("#town");
    town_el.innerHTML = "";
    let content = `<table class="nes-table is-dark is-bordered" style="margin: 0 auto 0 auto; background-color: #000;">
    <tr>
      <td colspan="4"></div>
        <p>Select a level to return to:</p>
      </td>
    </tr>`
    let trailing_content = ""
    for (let i = 0; i < levels.length; i += 2) {
      content += `<tr><td colspan="2"><button class="nes-btn townaction is-primary" id="${levels[i]}">${levels[i]}</button></td>`
      if (i + 1 < levels.length) {
        content += `<td colspan="2"><button class="nes-btn townaction is-primary" id="${levels[i+1]}">${levels[i+1]}</button></td>`
      } else {
        content += '<td colspan="2"></td>'
      }
      content += "</tr>"
    }
    content += "</table>"
    trailing_content += '<button class="nes-btn townaction" id="town">Return</button>'
    town_el.innerHTML = content + trailing_content
  
    document.querySelectorAll(".modal button.townaction")
    .forEach(function(el) {
      el.addEventListener(clickevt, ev => { 
        console.log("click", ev.target['id'], ev);
        handleTownAction(game, "levelselect", ev);
      });
    });
  }
  