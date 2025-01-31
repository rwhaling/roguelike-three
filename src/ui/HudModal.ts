import { handleTownAction, TownState } from "../core/TownLogic";
import { Player } from "../entities/player";
import GameState from "../gamestate";
import { sfx, setVolume } from "../sound/sfx";
import { setMusicVolume } from "../sound/music";
import { Quest, QuestStatus, quests } from "../mapgen/Quests";
import { UI } from "./ui"

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

let clickevt = UI.clickevt

let menus: [string, string][] = [
    ["hud_modal_status","Status"],
    ["hud_modal_inventory","Inventory"],
    ["hud_modal_journal","Journal"],
    ["hud_modal_options","Options"],
    ["hud_modal_dismiss","Back"]

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
      let contents = el("tr", {}, [])
      table_body.append(contents)
      contents.innerHTML = `
      <td colspan=5>CLASS: Warrior<br/>
      HP: ${player.stats.hp}<br/>
      STR: ${player.stats.STR}<br/>
      DEF: ${player.stats.DEF}<br/>
      DEX: ${player.stats.DEX}<br/>
      AGI: ${player.stats.AGI}<br/>
      XP: ${player.stats.xp}<br/>
      GOLD: ${player.stats.gold}<br/>
      FOOD: ${player.stats.food}<br/>
      AMMO: ${player.stats.arrows}</td></tr>
      `
    //   table_body.append(el("tr", {colspan:4}, ["CLASS: Warrior"]));
    //   table_body.append(el("tr", {colspan:4}, [`HP: ${player.stats.hp}`]));
    //   table_body.append(el("tr", {colspan:4}, [`STR: ${player.stats.STR}`]));
    //   table_body.append(el("tr", {colspan:4}, [`DEF: ${player.stats.DEF}`]));
    //   table_body.append(el("tr", {colspan:4}, [`DEX: ${player.stats.DEX}`]));
    //   table_body.append(el("tr", {colspan:4}, [`AGI: ${player.stats.AGI}`]));
    //   table_body.append(el("tr", {colspan:4}, [`XP: ${player.stats.xp}`]));
    //   table_body.append(el("tr", {colspan:4}, [`GOLD: ${player.stats.gold}`]));
    //   table_body.append(el("tr", {colspan:4}, [`FOOD: ${player.stats.food}`]));
    //   table_body.append(el("tr", {colspan:4}, [`AMMO: ${player.stats.arrows}`]));
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
        let quest_row = el("tr", {}, [])
        table_body.append(quest_row)
        if (quest.status == "accepted") {
          console.log(quest);
          quest_row.innerHTML = `<td colspan=5>accepted: ${quest.name} - ${quest.biome} LV ${quest.depth}</td>`
        //   table_body.append(el("tr", {colspan:4}, [`accepted: ${quest.name} - ${quest.biome} LV ${quest.depth}`]))
        } else if (quest.status == "ready") {
          console.log(quest);
          quest_row.innerHTML = `<td colspan=5>ready: ${quest.name} - RETURN to Town</td>`
        //   table_body.append(el("tr", {colspan:4}, [`ready: ${quest.name} - RETURN to Town`]))
        }
      }
  
    } else if (page == "hud_modal_options") {
      let music_row = document.createElement("tr")
      header_row.after(music_row)
      music_row.innerHTML = 
  
  '<td colspan=2>Music Vol:</td> \
  <td colspan=3><label> \
  <input type="radio" class="nes-radio" name="music_vol" value="music_vol_full" checked /> \
  <span>Full</span> \
  </label> \
  <label> \
  <input type="radio" class="nes-radio" name="music_vol" value="music_vol_quiet" /> \
  <span>Quiet</span> \
  </label>\
  <label> \
  <input type="radio" class="nes-radio" name="music_vol" value="music_vol_off" checked /> \
  <span>Off</span> \
  </label></td>'
  
      let sound_row = document.createElement("tr")
      sound_row.innerHTML = 
  
  '<td colspan=2>Sound Vol:</td> \
  <td colspan=3><label> \
  <input type="radio" class="nes-radio" name="sound_vol" value="sound_vol_full" checked /> \
  <span>Full</span> \
  </label>\
  <label> \
  <input type="radio" class="nes-radio" name="sound_vol" value="sound_vol_quiet" /> \
  <span>Quiet</span> \
  </label>\
  <label> \
  <input type="radio" class="nes-radio" name="sound_vol" value="sound_vol_off" /> \
  <span>Off</span> \
  </label></td>'
  
      music_row.after(sound_row); 

      let debug_row = document.createElement("tr")
      debug_row.innerHTML = 

    '<td colspan=2>Debug Mode:</td> \
    <td colspan=3><label> \
    <input type="radio" class="nes-radio" name="debug_mode" value="debug_mode_off" checked /> \
    <span>OFF</span> \
    </label>\
    <label> \
    <input type="radio" class="nes-radio" name="debug_mode" value="debug_mode_on" /> \
    <span>ON</span> \
    </label></td>'

      sound_row.after(debug_row);
 
    }
    return true;
  }
  
  export function toggleHudModal(ev, game:GameState,) {
    let modal_st = $("#hud_modal");
    // clone and splice in a new div to get rid of hanging event listeners
    var new_element = modal_st.cloneNode(true);
    modal_st.parentNode.replaceChild(new_element, modal_st);
    modal_st =  $("#hud_modal");
    
    let header_row = $("#hud_modal_headers")  
    // console.log(modal_st);
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
        // console.log("click!",e)
  
        let parent_th = e.target.closest("th");
        let parent_input = e.target.closest("input");
        if (parent_input) {
          // console.log("clicked modal body:", parent_input, parent_input.name, parent_input.value);
          if (parent_input.value == "music_vol_full") {
            setMusicVolume(0.25);
          } else if (parent_input.value == "music_vol_quiet") {
            setMusicVolume(0.1);
          } else if (parent_input.value == "music_vol_off") {
            setMusicVolume(0);
          } else if (parent_input.value == "sound_vol_full") {
            setVolume(1.0);
          } else if (parent_input.value == "sound_vol_quiet") {
            setVolume(0.5);
          } else if (parent_input.value == "sound_vol_off") {
            setVolume(0);
          } else if (parent_input.value == "debug_mode_on") {
            game.debugMode = true;
          } else if (parent_input.value == "debug_mode_off") {
            game.debugMode = false;
          }
          return
        }
  
        let menu_id = parent_th?.id;
        if (!menu_id) return;
        
        // console.log("clicked modal submenu:", menu_id);
        if (menu_id == "hud_modal_dismiss") {
          // console.log("dismissing")
          hideHudModal(game)
        } else {
          renderHudModal(menu_id, game);
        }
  
        return true;
      }
  
      modal_st.removeEventListener(clickevt, handleHudModal);
      modal_st.addEventListener(clickevt, handleHudModal);
    }
  }

let help_menus: [string,string][] = [
  ["help_modal_basics","Welcome!"],
  ["help_modal_combat_1","Combat 1"],
  ["help_modal_combat_2","Combat 2"],
  ["help_modal_exploration","Exploration"],
  ["help_modal_advanced","Advanced"],
  ["help_modal_dismiss","Back"]
]

export function hideHudModal(game) {
  let modal_st = $("#hud_modal");
  modal_st.style.visibility = "hidden";
  game.listening = true;
  UI.inHudModal = false;
}

export function renderHelpModal(game,page) {
  let modal_st = $("#hud_modal");
  // clone and splice in a new div to get rid of hanging event listeners
  var new_element = modal_st.cloneNode(true);
  modal_st.parentNode.replaceChild(new_element, modal_st);
  modal_st =  $("#hud_modal");

  // console.log(modal_st);
  modal_st.style.visibility = "visible";
  game.listening = false;
  UI.inHudModal = true;

  let menu_html = "";
  for (let [i,d] of help_menus) {
    // console.log("checking menu:",i,d);
    if (i == page) {
      menu_html += `<th id="${i}"><span class='nes-badge'><span class='is-primary'>${d}</span></span></th>`
    } else {
      menu_html += `<th id="${i}"><span class='nes-badge'>${d}</span></th>`
    }
  }
  modal_st.innerHTML = '<table class="nes-table is-dark is-bordered"><tr id="hud_modal_headers"></tr></table>';
  let header_row = $("#hud_modal_headers")
  header_row.innerHTML = menu_html;

  let table_body = header_row.closest("tbody");
  let contents = el("tr", {}, [])
  table_body.append(contents)

  if (page == "help_modal_basics") {
    contents.innerHTML = "<td colspan=6>Barrow 2: The Three is an accessible take on a traditional roguelike:<br/><br/><ul>" +
                         "<li/>Use the direction keys to move, or to attack if you are next to an enemy" +
                         "<li/>Note the skill palette at the bottom of your screen.  QWERTY and 123456 keys each have a different function" +                       
                         "<li/>If the monsters are too hard, upgrade your gear and skills in TOWN!<br/>" +
                         "<li/>To return to TOWN, find the STAIRS up, and press the USE button [1]<br/>" + 
                         "<li/>In TOWN, you can exchange GOLD for items and gear upgrades, or XP for stat and skill upgrades.</ul>" + 
                         "If you are well prepared, you can overcome any obstacle.</td>"
  } else if (page == "help_modal_combat_1") {
    contents.innerHTML = "<td colspan=6><ul><li/>Healing is powerful! Press EAT to consume 1 food and fully restore your hitpoints - but food is scarce, so time it well.<br/>" +
                         "<li/>Your character can eventually unlock three combat skills - BASH, BOW, and DASH - all are very powerful!<br/>" +
                         "<li/>BASH and DASH have cooldowns - if you use them often, you'll get the most value - and you can shorten their cooldown, if you have enough XP<br/>" + 
                         "</ul></td>"
  } else if (page == "help_modal_combat_2") {
    contents.innerHTML = "<td colspan=6><ul><li/>BOW consumes 1 arrow - arrows are scarce, so use them wisely.<br/>" + 
                         "<li/>If you want to target a specific enemy, try using the I and K keys to toggle targets." +
                         "<li/>If you are doing it right, you'll see the target display in the upper-right corner change."  +
                         "<li/>Press DFND [5] to use your defensive buff - this can be very helpful against the strongest enemies!<br/>" +
                         "<li/>DFND has a lengthy cooldown, but you can shorten it with XP in town." +
                         "</ul></td>"
  } else if (page == "help_modal_exploration") {
    contents.innerHTML = "<td colspan=6><ul><li/>Barrow 2 has an advanced auto-explore functionality.  Try holding down the SEARCH button, and see what happens.  <li/>Try holding FLEE as well!<br/>" + 
                         "<li/>There are multiple dungeons to explore!  Advance the Quartermaster's quest-line to gain access to the CRYPT, and then use the Level Select function in TOWN to enter the CRYPT.<br/>" +
                         "<li/>As you go deeper into any dungeon, the monsters will become harder, and more numerous - but there are greater treasures to discover as well!" +
                         "</ul></td>"
  } else if (page == "help_modal_advanced") {
    contents.innerHTML = "<td colspan=6></td>"
  } else {
    contents.innerHTML = "<td colspan=6></td>"
  }

  let handleHudModal = (e) => {
    // console.log("click!",e)

    let parent_th = e.target.closest("th");
    let menu_id = parent_th.id
    // console.log("clicked modal submenu:",menu_id)
    if (menu_id == "help_modal_dismiss") {
      hideHudModal(game)
    } else {
      renderHelpModal(game, menu_id);
    }
    return true;
  }

  modal_st.removeEventListener(clickevt, handleHudModal);
  modal_st.addEventListener(clickevt, handleHudModal);
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