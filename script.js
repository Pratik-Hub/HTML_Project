const habitList = document.querySelector("#habit-list");
const habitInput = document.querySelector("#habit-name");
const saveNote = document.querySelector("#save-note");
const playerPicker = document.querySelector("#player-picker");
const enemyPicker = document.querySelector("#enemy-picker");
const today = dateKey(new Date());

const firstNames = [
  "Moss", "Gloom", "Crackle", "Velvet", "Gravel", "Moon", "Bog", "Flicker",
  "Mallow", "Rattle", "Thorn", "Cinder", "Feral", "Soggy", "Shiver", "Lantern",
  "Grumble", "Doodle", "Wobbly", "Dread"
];
const lastNames = [
  "Mite", "Maw", "Wisp", "Moth", "Toad", "Stag", "Wyrm", "Imp", "Puff", "Hollow"
];
const creatureTypes = ["MOSS", "DUSK", "EMBER", "TIDE", "STATIC"];
const creatureFaces = ["🌱", "👻", "🔥", "🫧", "⚡"];
const rivalFaces = ["👹", "👻", "😈", "🦇", "🕷️"];
const creatures = makeCreatures();
const pretendPlayers = [
  { name: "Fernie Fizz", points: 160 },
  { name: "Captain Sog", points: 120 },
  { name: "Wobble Wizard", points: 80 },
  { name: "Crumb Goblin", points: 40 },
  { name: "Bloop", points: 20 }
];

let habits = loadHabits();
let game = loadGame();

document.querySelector("#today-label").textContent =
  new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" })
    .format(new Date()).toUpperCase();

document.querySelector("#play-button").addEventListener("click", openSelection);
document.querySelector("#habits-button").addEventListener("click", openHabits);
document.querySelector("#habits-menu-button").addEventListener("click", openMenu);
document.querySelector("#habits-game-button").addEventListener("click", openSelection);
document.querySelector("#back-button").addEventListener("click", openMenu);
document.querySelector("#change-button").addEventListener("click", openSelection);
document.querySelector("#game-habits-button").addEventListener("click", openHabits);
document.querySelector("#game-menu-button").addEventListener("click", openMenu);
document.querySelector("#battle-button").addEventListener("click", startBattle);
playerPicker.addEventListener("change", updateSelection);
enemyPicker.addEventListener("change", updateSelection);

document.querySelector("#add-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = habitInput.value.trim();
  if (name === "") return;

  const newHabit = {
    id: `${Date.now()}-${Math.random()}`,
    name: name,
    completedDates: []
  };
  habits.push(newHabit);
  habitInput.value = "";
  saveAndRender();
});

habitList.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;

  const card = button.closest("[data-habit-id]");
  if (!card) return;

  let habitNumber = -1;
  for (let i = 0; i < habits.length; i += 1) {
    if (habits[i].id === card.dataset.habitId) {
      habitNumber = i;
    }
  }
  if (habitNumber === -1) return;

  if (button.classList.contains("quest-check")) {
    let alreadyDone = false;
    for (let i = 0; i < habits[habitNumber].completedDates.length; i += 1) {
      if (habits[habitNumber].completedDates[i] === today) {
        alreadyDone = true;
      }
    }

    if (alreadyDone) {
      const newDates = [];
      for (let i = 0; i < habits[habitNumber].completedDates.length; i += 1) {
        if (habits[habitNumber].completedDates[i] !== today) {
          newDates.push(habits[habitNumber].completedDates[i]);
        }
      }
      habits[habitNumber].completedDates = newDates;
    } else {
      habits[habitNumber].completedDates.push(today);
      playAttack();
    }
    saveAndRender();
  } else if (button.classList.contains("delete-button")) {
    const newHabits = [];
    for (let i = 0; i < habits.length; i += 1) {
      if (habits[i].id !== card.dataset.habitId) {
        newHabits.push(habits[i]);
      }
    }
    habits = newHabits;
    saveAndRender();
  }
});

function makeCreatures() {
  const list = [];
  for (let row = 0; row < firstNames.length; row += 1) {
    for (let column = 0; column < lastNames.length; column += 1) {
      const typeNumber = (row + column) % creatureTypes.length;
      const creature = {
        id: list.length,
        name: firstNames[row] + " " + lastNames[column],
        type: creatureTypes[typeNumber],
        face: creatureFaces[typeNumber],
        rivalFace: rivalFaces[(row + column) % rivalFaces.length],
        color: getCreatureColor(typeNumber),
        shape: (row + column) % 4
      };
      list.push(creature);
    }
  }
  return list;
}

function getCreatureColor(typeNumber) {
  if (typeNumber === 0) return "#91bd7c";
  else if (typeNumber === 1) return "#9180a7";
  else if (typeNumber === 2) return "#df966b";
  else if (typeNumber === 3) return "#74b5b1";
  else return "#d0b96f";
}

function dateKey(date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  return year + "-" + month + "-" + day;
}

function loadHabits() {
  const starters = [
    { id: "starter-water", name: "Drink a glass of water", completedDates: [] },
    { id: "starter-read", name: "Read a few pages", completedDates: [] },
    { id: "starter-walk", name: "Get outside for 10 minutes", completedDates: [] }
  ];

  try {
    const savedHabits = JSON.parse(localStorage.getItem("little-wins-habits") || "[]");
    const hasStarted = localStorage.getItem("oddquest-started");
    if (Array.isArray(savedHabits) && (savedHabits.length > 0 || hasStarted)) {
      const goodHabits = [];
      for (let i = 0; i < savedHabits.length; i += 1) {
        const habit = savedHabits[i];
        if (habit && typeof habit.id === "string" && typeof habit.name === "string" &&
            Array.isArray(habit.completedDates)) {
          goodHabits.push(habit);
        }
      }
      return goodHabits;
    } else {
      localStorage.setItem("oddquest-started", "yes");
      localStorage.setItem("little-wins-habits", JSON.stringify(starters));
      return starters;
    }
  } catch (error) {
    console.error("Could not load your quests.", error);
    saveNote.textContent = "Couldn’t load your saved quests.";
    return starters;
  }
}

function loadGame() {
  const newGame = {
    unlocked: [0, 11, 22],
    player: 0,
    enemy: 199,
    startedDate: ""
  };

  try {
    const savedGame = JSON.parse(localStorage.getItem("oddquest-roster") || "null");
    if (savedGame) {
      if (Array.isArray(savedGame.unlocked)) {
        const savedCreatures = [];
        for (let i = 0; i < savedGame.unlocked.length; i += 1) {
          const creatureId = savedGame.unlocked[i];
          let alreadyAdded = false;
          for (let j = 0; j < savedCreatures.length; j += 1) {
            if (savedCreatures[j] === creatureId) alreadyAdded = true;
          }
          if (Number.isInteger(creatureId) && creatures[creatureId] && !alreadyAdded) {
            savedCreatures.push(creatureId);
          }
        }
        if (savedCreatures.length > 0) newGame.unlocked = savedCreatures;
      }
      if (Number.isInteger(savedGame.player) && creatures[savedGame.player]) {
        newGame.player = savedGame.player;
      }
      if (Number.isInteger(savedGame.enemy) && creatures[savedGame.enemy]) {
        newGame.enemy = savedGame.enemy;
      }
      if (typeof savedGame.startedDate === "string") {
        newGame.startedDate = savedGame.startedDate;
      }
    }
    let playerIsUnlocked = false;
    for (let i = 0; i < newGame.unlocked.length; i += 1) {
      if (newGame.unlocked[i] === newGame.player) playerIsUnlocked = true;
    }
    if (!playerIsUnlocked) newGame.player = newGame.unlocked[0];
  } catch (error) {
    console.error("Could not load your creatures.", error);
    saveNote.textContent = "Couldn’t load your creature collection.";
  }
  return newGame;
}

function saveGame() {
  try {
    localStorage.setItem("oddquest-roster", JSON.stringify(game));
  } catch (error) {
    console.error("Could not save your creatures.", error);
    saveNote.textContent = "Couldn’t save your creature collection.";
  }
}

function saveAndRender() {
  try {
    localStorage.setItem("oddquest-started", "yes");
    localStorage.setItem("little-wins-habits", JSON.stringify(habits));
    saveNote.textContent = "";
  } catch (error) {
    console.error("Could not save your quests.", error);
    saveNote.textContent = "Couldn’t save your quests.";
  }
  saveGame();
  renderGame();
  window.dispatchEvent(new Event("habitDataChanged"));
}

function openMenu() {
  document.querySelector("#menu-screen").hidden = false;
  document.querySelector("#habits-screen").hidden = true;
  document.querySelector("#selection-screen").hidden = true;
  document.querySelector("#game-screen").hidden = true;
}

function openHabits() {
  document.querySelector("#menu-screen").hidden = true;
  document.querySelector("#habits-screen").hidden = false;
  document.querySelector("#selection-screen").hidden = true;
  document.querySelector("#game-screen").hidden = true;
  renderGame();
}

function openSelection() {
  document.querySelector("#menu-screen").hidden = true;
  document.querySelector("#habits-screen").hidden = true;
  document.querySelector("#selection-screen").hidden = false;
  document.querySelector("#game-screen").hidden = true;
  fillChoices();
  updateSelection();

  if (game.startedDate === today) {
    playerPicker.disabled = true;
    enemyPicker.disabled = true;
    document.querySelector("#lock-note").textContent = "Fighters are set for today.";
    document.querySelector("#battle-button").textContent = "Continue";
  } else {
    playerPicker.disabled = false;
    enemyPicker.disabled = false;
    document.querySelector("#lock-note").textContent = "Complete three habits to recruit your rival.";
    document.querySelector("#battle-button").textContent = "Battle";
  }
}

function fillChoices() {
  playerPicker.replaceChildren();
  enemyPicker.replaceChildren();

  for (let i = 0; i < creatures.length; i += 1) {
    const creature = creatures[i];
    const rivalOption = document.createElement("option");
    rivalOption.value = creature.id;
    rivalOption.textContent = creature.name + " · " + creature.type;
    if (creature.id === game.enemy) rivalOption.selected = true;
    enemyPicker.append(rivalOption);

    let isUnlocked = false;
    for (let j = 0; j < game.unlocked.length; j += 1) {
      if (game.unlocked[j] === creature.id) isUnlocked = true;
    }
    if (isUnlocked) {
      const playerOption = document.createElement("option");
      playerOption.value = creature.id;
      playerOption.textContent = creature.name + " · " + creature.type;
      if (creature.id === game.player) playerOption.selected = true;
      playerPicker.append(playerOption);
    }
  }
}

function updateSelection() {
  game.player = Number(playerPicker.value);
  game.enemy = Number(enemyPicker.value);
  const player = creatures[game.player];
  const enemy = creatures[game.enemy];

  if (player) {
    showBattleSprite("#pick-player-face", player);
    document.querySelector("#pick-player-face").setAttribute("aria-label", player.name);
    document.querySelector("#pick-player-name").textContent = player.name;
    document.querySelector("#pick-player-type").textContent = player.type + " TYPE";
  }
  if (enemy) {
    showBattleSprite("#pick-enemy-face", enemy);
    document.querySelector("#pick-enemy-face").setAttribute("aria-label", enemy.name);
    document.querySelector("#pick-enemy-name").textContent = enemy.name;
    document.querySelector("#pick-enemy-type").textContent = enemy.type + " TYPE";
  }
}

function startBattle() {
  if (game.startedDate !== today) {
    game.player = Number(playerPicker.value);
    game.enemy = Number(enemyPicker.value);
    game.startedDate = today;
    saveGame();
  }
  document.querySelector("#menu-screen").hidden = true;
  document.querySelector("#habits-screen").hidden = true;
  document.querySelector("#selection-screen").hidden = true;
  document.querySelector("#game-screen").hidden = false;
  renderGame();
}

function drawHabits() {
  habitList.replaceChildren();

  for (let i = 0; i < habits.length; i += 1) {
    const habit = habits[i];
    let done = false;
    for (let j = 0; j < habit.completedDates.length; j += 1) {
      if (habit.completedDates[j] === today) done = true;
    }

    const card = document.createElement("div");
    card.className = "quest-card";
    if (done) card.className = "quest-card is-done";
    card.dataset.habitId = habit.id;

    const check = document.createElement("button");
    check.className = "quest-check";
    check.type = "button";
    if (done) check.textContent = "✓";
    check.setAttribute("aria-label", "Complete " + habit.name);

    const copy = document.createElement("div");
    copy.className = "quest-copy";
    const name = document.createElement("strong");
    name.className = "quest-name";
    name.textContent = habit.name;
    copy.append(name);

    const points = document.createElement("span");
    points.className = "quest-xp";
    if (done) points.textContent = "✓ +10 XP";
    else points.textContent = "+10 XP";

    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Remove " + habit.name);

    card.append(check, copy, points, remove);
    habitList.append(card);
  }

  if (habits.length === 0) {
    const empty = document.createElement("p");
    empty.className = "quest-card";
    empty.textContent = "No habits yet.";
    habitList.append(empty);
  }
}

function playAttack() {
  const stage = document.querySelector("#battle-stage");
  stage.classList.remove("attacking");
  stage.offsetWidth;
  stage.classList.add("attacking");
}

function showBattleSprite(place, creature) {
  const characterNumber = creature.id % 32 + 1;
  const image = "assets/SuperRetroWorld_CharacterPack_Full/sprite_split/character_" +
    characterNumber + "/character_" + characterNumber + "_frame32x32.png";
  const sprite = document.querySelector(place);
  sprite.style.backgroundImage = "url('" + image + "')";
  sprite.style.backgroundPosition = "50% 0";
}

function renderGame() {
  drawHabits();

  let done = 0;
  let totalDone = 0;
  for (let i = 0; i < habits.length; i += 1) {
    let doneToday = false;
    for (let j = 0; j < habits[i].completedDates.length; j += 1) {
      totalDone += 1;
      if (habits[i].completedDates[j] === today) doneToday = true;
    }
    if (doneToday) done += 1;
  }

  if (done >= 3) {
    let enemyFound = false;
    for (let i = 0; i < game.unlocked.length; i += 1) {
      if (game.unlocked[i] === game.enemy) enemyFound = true;
    }
    if (!enemyFound) {
      game.unlocked.push(game.enemy);
      saveGame();
    }
  }

  let percent = 0;
  if (habits.length > 0) percent = Math.round(done / habits.length * 100);
  const xp = totalDone * 10;
  const weeklyXP = getWeeklyXP();
  const player = creatures[game.player];
  const enemy = creatures[game.enemy];
  let enemyHealth = 100 - done * 34;
  if (enemyHealth < 0) enemyHealth = 0;

  document.querySelector("#level-number").textContent = String(Math.floor(xp / 100) + 1).padStart(2, "0");
  document.querySelector("#xp-label").textContent = (xp % 100) + " / 100 XP";
  document.querySelector("#xp-fill").style.width = (xp % 100) + "%";
  document.querySelector("#progress-number").textContent = done + " / " + habits.length;
  document.querySelector("#progress-fill").style.width = percent + "%";
  renderLeaderboard(weeklyXP);

  document.querySelector("#player-name").textContent = player.name;
  document.querySelector("#player-type").textContent = player.type + " TYPE · LV. " + String(Math.floor(xp / 100) + 1).padStart(2, "0");
  showBattleSprite("#player-sprite", player);
  document.querySelector("#player-sprite").setAttribute("aria-label", player.name);
  document.querySelector("#enemy-name").textContent = enemy.name;
  document.querySelector("#enemy-type").textContent = enemy.type + " TYPE · RIVAL";
  showBattleSprite("#enemy-sprite", enemy);
  document.querySelector("#enemy-sprite").setAttribute("aria-label", enemy.name);
  document.querySelector("#enemy-hp-label").textContent = enemyHealth + " / 100";
  document.querySelector("#enemy-hp").style.width = enemyHealth + "%";
  document.querySelector("#battle-stage").classList.toggle("enemy-down", enemyHealth === 0);

  if (enemyHealth === 0) document.querySelector("#battle-message").textContent = enemy.name + " joined your collection.";
  else document.querySelector("#battle-message").textContent = enemy.name + ": " + enemyHealth + " HP. Complete three habits to recruit it.";

  document.querySelector("#hit-number").textContent = "−" + Math.min(34, done * 34);
  document.querySelector("#collection-fill").style.width = (game.unlocked.length / creatures.length * 100) + "%";
  document.querySelector("#collection-note").textContent =
    game.unlocked.length + " / " + creatures.length + " collected";

  const recent = document.querySelector("#recent-unlocks");
  recent.replaceChildren();
  for (let i = 0; i < game.unlocked.length; i += 1) {
    if (i >= game.unlocked.length - 5) {
      const creature = creatures[game.unlocked[i]];
      const icon = document.createElement("span");
      icon.className = "mini-creature";
      icon.textContent = creature.face;
      icon.title = creature.name;
      recent.append(icon);
    }
  }
}

function getWeeklyXP() {
  const weekDates = [];
  const date = new Date();
  for (let i = 0; i < 7; i += 1) {
    weekDates.push(dateKey(date));
    date.setDate(date.getDate() - 1);
  }

  let points = 0;
  for (let i = 0; i < habits.length; i += 1) {
    for (let j = 0; j < habits[i].completedDates.length; j += 1) {
      for (let day = 0; day < weekDates.length; day += 1) {
        if (habits[i].completedDates[j] === weekDates[day]) points += 10;
      }
    }
  }
  return points;
}

function addRankRow(rank, name, points, isPlayer) {
  const row = document.createElement("li");
  if (isPlayer) row.className = "your-rank";

  const rankNumber = document.createElement("span");
  rankNumber.className = "leaderboard-rank";
  rankNumber.textContent = "#" + rank;

  const playerName = document.createElement("span");
  playerName.className = "leaderboard-name";
  playerName.textContent = name;

  const score = document.createElement("span");
  score.className = "leaderboard-score";
  score.textContent = points + " XP";

  row.append(rankNumber, playerName, score);
  document.querySelector("#leaderboard-list").append(row);
}

function renderLeaderboard(weeklyXP) {
  const list = document.querySelector("#leaderboard-list");
  list.replaceChildren();

  let playerRank = pretendPlayers.length + 1;
  for (let i = 0; i < pretendPlayers.length; i += 1) {
    if (weeklyXP >= pretendPlayers[i].points) {
      playerRank = i + 1;
      break;
    }
  }
  document.querySelector("#leaderboard-position").textContent = "#" + playerRank;

  let rank = 1;
  let playerAdded = false;
  for (let i = 0; i < pretendPlayers.length; i += 1) {
    if (!playerAdded && weeklyXP >= pretendPlayers[i].points) {
      addRankRow(rank, "You", weeklyXP, true);
      rank += 1;
      playerAdded = true;
    }
    addRankRow(rank, pretendPlayers[i].name, pretendPlayers[i].points, false);
    rank += 1;
  }
  if (!playerAdded) addRankRow(rank, "You", weeklyXP, true);
}

openMenu();
