import { handleTownAction, TownState } from "../core/TownLogic";
import { Player } from "../entities/player";
import GameState from "../gamestate";
import { sfx, setVolume } from "../sound/sfx";
import { music } from "../sound/music";
import { Quest, QuestStatus, quests } from "../mapgen/Quests";
import { UI } from "./ui"

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

let clickevt = UI.clickevt

let menus: [string, string][] = [
    ["hud_modal_status","Status"],
    ["hud_modal_inventory","Inventory"],
    ["hud_modal_journal","Journal"],
    ["hud_modal_options","Options"]
  ]
  
  function renderHudModal(page:string, game:GameState) {
    let modal_st = $("#hud_modal");
  
    let menu_html = "";
    for (let [i,d] of menus) {
      console.log("checking menu:",i,d);
      if (i == page) {
        menu_html += `<th id="${i}"><span class='nes-badge'><span class='is-primary'>${d}</span></span></th>`
      } else {
        menu_html += `<th id="${i}"><span class='nes-badge'>${d}</span></th>`
      }
    }
    modal_st.innerHTML = '<table class="nes-table is-dark is-bordered"><tr id="hud_modal_headers"></tr></table>';
    let header_row = $("#hud_modal_headers")
    header_row.innerHTML = menu_html;
  
    if (page == "hud_modal_status") {
      let table_body = header_row.closest("tbody");
      let player = game.player;
      table_body.append(el("tr", {colspan:4}, ["CLASS: Warrior"]));
      table_body.append(el("tr", {colspan:4}, [`HP: ${player.stats.hp}`]));
      table_body.append(el("tr", {colspan:4}, [`STR: ${player.stats.STR}`]));
      table_body.append(el("tr", {colspan:4}, [`DEF: ${player.stats.DEF}`]));
      table_body.append(el("tr", {colspan:4}, [`DEX: ${player.stats.DEX}`]));
      table_body.append(el("tr", {colspan:4}, [`AGI: ${player.stats.AGI}`]));
      table_body.append(el("tr", {colspan:4}, [`XP: ${player.stats.xp}`]));
      table_body.append(el("tr", {colspan:4}, [`GOLD: ${player.stats.gold}`]));
      table_body.append(el("tr", {colspan:4}, [`FOOD: ${player.stats.food}`]));
      table_body.append(el("tr", {colspan:4}, [`AMMO: ${player.stats.arrows}`]));
    } else if (page == "hud_modal_inventory") {
      let table_body = header_row.closest("tbody");
  
      for (let i of game.player.inventory) {
        console.log(i);
        table_body.append(el("tr", {colspan:4}, [i[1]]));
      }
    } else if (page == "hud_modal_journal") {
      let table_body = header_row.closest("tbody");
  
      for (let questName in quests) {
        let quest = quests[questName];
        if (quest.status == "accepted") {
          console.log(quest);
          table_body.append(el("tr", {colspan:4}, [`accepted: ${quest.giveDescription}`]))
        } else if (quest.status == "ready") {
          console.log(quest);
          table_body.append(el("tr", {colspan:4}, [`ready: ${quest.giveDescription}`]))
        }
      }
  
    } else if (page == "hud_modal_options") {
      let music_row = document.createElement("tr")
      header_row.after(music_row)
      music_row.innerHTML = 
  
  '<td>Music Vol:</td> \
  <td><label> \
  <input type="radio" class="nes-radio" name="music_vol" value="music_vol_full" checked /> \
  <span>Full</span> \
  </label></td>\
  <td><label> \
  <input type="radio" class="nes-radio" name="music_vol" value="music_vol_quiet" /> \
  <span>Quiet</span> \
  </label></td>\
  <td><label> \
  <input type="radio" class="nes-radio" name="music_vol" value="music_vol_off" checked /> \
  <span>Off</span> \
  </label></td>'
  
      let sound_row = document.createElement("tr")
      sound_row.innerHTML = 
  
  '<td>Sound Vol:</td> \
  <td><label> \
  <input type="radio" class="nes-radio" name="sound_vol" value="sound_vol_full" checked /> \
  <span>Full</span> \
  </label></td>\
  <td><label> \
  <input type="radio" class="nes-radio" name="sound_vol" value="sound_vol_quiet" /> \
  <span>Quiet</span> \
  </label></td>\
  <td><label> \
  <input type="radio" class="nes-radio" name="sound_vol" value="sound_vol_off" /> \
  <span>Off</span> \
  </label></td>'
  
      music_row.after(sound_row); 
    }
    return true;
  }
  
  export function toggleHudModal(ev, game:GameState,) {
    let modal_st = $("#hud_modal");
    let header_row = $("#hud_modal_headers")  
    console.log(modal_st);
    if (modal_st.style.visibility == "visible") {
      modal_st.style.visibility = "hidden";
      game.listening = true;
      UI.inHudModal = false;
    } else {
      modal_st.style.visibility = "visible";
      renderHudModal("hud_modal_journal", game);
      game.listening = false;
      UI.inHudModal = true;
  
      let handleHudModal = (e) => {
        console.log("click!",e)
  
        let parent_th = e.target.closest("th");
        let parent_input = e.target.closest("input");
        if (parent_input) {
          console.log("clicked modal body:", parent_input, parent_input.name, parent_input.value);
          if (parent_input.value == "music_vol_full") {
            music.volume(0.25);
          } else if (parent_input.value == "music_vol_quiet") {
            music.volume(0.1);
          } else if (parent_input.value == "music_vol_off") {
            music.volume(0);
          } else if (parent_input.value == "sound_vol_full") {
            setVolume(1.0);
          } else if (parent_input.value == "sound_vol_quiet") {
            setVolume(0.5);
          } else if (parent_input.value == "sound_vol_off") {
            setVolume(0);
          }
          return
        }
  
        let menu_id = parent_th.id
        console.log("clicked modal submenu:",menu_id)
        renderHudModal(menu_id, game);
  
        return true;
      }
  
      modal_st.removeEventListener(clickevt, handleHudModal);
      modal_st.addEventListener(clickevt, handleHudModal);
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