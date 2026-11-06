const guildPlayers = [
  {
    name: "Fernie Fizz",
    creature: "Moss Mite",
    creatureId: 0,
    characterNumber: 1,
    face: "🌱",
    level: 4,
    wins: 8,
    losses: 2,
    power: 15
  },
  {
    name: "Captain Sog",
    creature: "Dread Hollow",
    creatureId: 199,
    characterNumber: 2,
    face: "👹",
    level: 3,
    wins: 5,
    losses: 4,
    power: 30
  },
  {
    name: "Wobble Wizard",
    creature: "Crackle Wisp",
    creatureId: 2,
    characterNumber: 3,
    face: "⚡",
    level: 2,
    wins: 3,
    losses: 3,
    power: 45
  },
  {
    name: "Crumb Goblin",
    creature: "Flicker Puff",
    creatureId: 78,
    characterNumber: 4,
    face: "🦇",
    level: 1,
    wins: 1,
    losses: 5,
    power: 60
  }
];

const guildList = document.querySelector("#guild-players");
const profileCard = document.querySelector("#profile-card");
const duelMessage = document.querySelector("#duel-message");
const regularBattleView = document.querySelector("#regular-battle-view");
const duelBattleView = document.querySelector("#duel-battle-view");
let selectedPlayer = null;
let duelScore = loadDuelScore();
let playerHealth = 100;
let rivalHealth = 100;
let playerIsGuarding = false;
let rivalIsGuarding = false;
let duelMode = "computer";
let currentTurn = "player";

function loadDuelScore() {
  const score = { spent: 0, wins: 0, losses: 0, wonPoints: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem("oddquest-duels") || "null");
    if (saved && Number.isInteger(saved.spent) && saved.spent >= 0) score.spent = saved.spent;
    if (saved && Number.isInteger(saved.wins) && saved.wins >= 0) score.wins = saved.wins;
    if (saved && Number.isInteger(saved.losses) && saved.losses >= 0) score.losses = saved.losses;
    if (saved && Number.isInteger(saved.wonPoints) && saved.wonPoints >= 0) score.wonPoints = saved.wonPoints;
  } catch (error) {
    console.error("Could not load duel score.", error);
    duelMessage.textContent = "Could not load your duel score.";
  }
  return score;
}

function getHabitPoints() {
  let points = 0;
  try {
    const savedHabits = JSON.parse(localStorage.getItem("little-wins-habits") || "[]");
    if (Array.isArray(savedHabits)) {
      for (let i = 0; i < savedHabits.length; i += 1) {
        if (savedHabits[i] && Array.isArray(savedHabits[i].completedDates)) {
          points += savedHabits[i].completedDates.length * 10;
        }
      }
    }
  } catch (error) {
    console.error("Could not count your habit points.", error);
    duelMessage.textContent = "Could not read your habit points.";
  }
  return points;
}

function renderGuild() {
  guildList.replaceChildren();
  for (let i = 0; i < guildPlayers.length; i += 1) {
    const player = guildPlayers[i];
    const row = document.createElement("div");
    row.className = "guild-player";

    const face = document.createElement("span");
    face.className = "guild-face";
    face.textContent = player.face;

    const copy = document.createElement("span");
    copy.className = "guild-player-copy";
    const name = document.createElement("strong");
    name.textContent = player.name;
    const creature = document.createElement("small");
    creature.textContent = player.creature;
    copy.append(name, creature);

    const button = document.createElement("button");
    button.className = "view-profile";
    button.type = "button";
    button.textContent = "Profile";
    button.dataset.playerNumber = i;
    row.append(face, copy, button);
    guildList.append(row);
  }
  updateDuelPoints();
}

function updateDuelPoints() {
  const pointsLeft = getHabitPoints() + duelScore.wonPoints - duelScore.spent;
  document.querySelector("#duel-points").textContent = Math.max(0, pointsLeft);
  document.querySelector("#your-duel-record").textContent =
    duelScore.wins + " W · " + duelScore.losses + " L";
  if (selectedPlayer) {
    document.querySelector("#profile-record").textContent =
      selectedPlayer.wins + " W · " + selectedPlayer.losses + " L";
    document.querySelector("#duel-button").disabled = pointsLeft < 10;
  }
}

function showProfile(player) {
  selectedPlayer = player;
  profileCard.hidden = false;
  document.querySelector("#profile-face").textContent = player.face;
  document.querySelector("#profile-name").textContent = player.name;
  document.querySelector("#profile-creature").textContent = player.creature;
  document.querySelector("#profile-level").textContent = "LEVEL " + player.level;
  document.querySelector("#profile-record").textContent =
    player.wins + " W · " + player.losses + " L";
  duelBattleView.hidden = true;
  document.querySelector("#duel-button").hidden = false;
  document.querySelector("#duel-mode-picker").hidden = false;
  document.querySelector("#duel-button").disabled =
    getHabitPoints() + duelScore.wonPoints - duelScore.spent < 10;
}

function saveDuelScore(newScore) {
  try {
    localStorage.setItem("oddquest-duels", JSON.stringify(newScore));
    duelScore = newScore;
    return true;
  } catch (error) {
    console.error("Could not save your duel score.", error);
    duelMessage.textContent = "Could not save your duel. No points were spent.";
    return false;
  }
}

function startDuel() {
  if (!selectedPlayer) {
    duelMessage.textContent = "Pick a profile first.";
    return;
  }

  const points = getHabitPoints() + duelScore.wonPoints - duelScore.spent;
  if (points < 10) {
    duelMessage.textContent = "Complete a habit to earn 10 points.";
    updateDuelPoints();
    return;
  }

  const newScore = {
    spent: duelScore.spent + 10,
    wins: duelScore.wins,
    losses: duelScore.losses,
    wonPoints: duelScore.wonPoints
  };
  if (!saveDuelScore(newScore)) return;

  playerHealth = 100;
  rivalHealth = 100;
  playerIsGuarding = false;
  rivalIsGuarding = false;
  currentTurn = "player";
  regularBattleView.hidden = true;
  duelBattleView.hidden = false;
  document.querySelector("#duel-button").hidden = true;
  document.querySelector("#duel-mode-picker").hidden = true;
  document.querySelector("#duel-moves").hidden = false;
  document.querySelector("#duel-result").hidden = true;
  document.querySelector("#duel-battle-title").textContent = selectedPlayer.name;
  document.querySelector("#duel-stage-mode").textContent =
    duelMode === "pvp" ? "LOCAL PLAYER 2" : "VS COMPUTER";
  const myCreature = creatures[game.player];
  const theirCreature = creatures[selectedPlayer.creatureId];
  showDuelCharacter("#duel-player-face", game.player % 32 + 1);
  showDuelCharacter("#duel-rival-face", selectedPlayer.characterNumber);
  document.querySelector("#duel-player-name").textContent = myCreature.name;
  document.querySelector("#duel-player-trainer").textContent = "Your team";
  document.querySelector("#duel-rival-name").textContent = theirCreature.name;
  document.querySelector("#duel-rival-trainer").textContent = selectedPlayer.name;
  document.querySelector("#duel-player-face").setAttribute("aria-label", myCreature.name + " character");
  document.querySelector("#duel-rival-face").setAttribute("aria-label", theirCreature.name + " character");
  if (duelMode === "pvp") {
    document.querySelector("#duel-turn").textContent = "Player 1: choose a move.";
  } else {
    document.querySelector("#duel-turn").textContent = "Your move.";
  }
  drawDuelHealth();
  guildList.hidden = true;
  profileCard.hidden = true;
  updateDuelPoints();
}

function playerMove(move) {
  if (currentTurn === "rival") {
    rivalPlayerMove(move);
    return;
  }

  const attackButton = document.querySelector("#attack-move");
  const guardButton = document.querySelector("#guard-move");
  attackButton.disabled = true;
  guardButton.disabled = true;

  if (move === "attack") {
    let damage = 20;
    if (rivalIsGuarding) damage = 8;
    rivalHealth -= damage;
    if (rivalHealth < 0) rivalHealth = 0;
    rivalIsGuarding = false;
    animateDuel("#duel-player-face");
    if (duelMode === "pvp") {
      document.querySelector("#duel-turn").textContent = "Player 1 deals " + damage + " damage.";
    } else {
      document.querySelector("#duel-turn").textContent = "You deal " + damage + " damage.";
    }
  } else if (move === "guard") {
    playerIsGuarding = true;
    if (duelMode === "pvp") {
      document.querySelector("#duel-turn").textContent = "Player 1 guards.";
    } else {
      document.querySelector("#duel-turn").textContent = "You guard.";
    }
  }

  drawDuelHealth();
  if (rivalHealth === 0) {
    finishDuel(true);
    return;
  }

  if (duelMode === "pvp") {
    document.querySelector("#duel-turn").textContent += " Pass the device.";
    setTimeout(showRivalTurn, 900);
  } else {
    document.querySelector("#duel-turn").textContent += " " + selectedPlayer.name + "'s turn.";
    setTimeout(rivalMove, 1100);
  }
}

function showRivalTurn() {
  currentTurn = "rival";
  if (duelMode === "pvp") {
    document.querySelector("#duel-turn").textContent =
      selectedPlayer.name + "'s move.";
  } else {
    document.querySelector("#duel-turn").textContent = "Computer's move.";
    setTimeout(rivalMove, 900);
    return;
  }
  document.querySelector("#attack-move").disabled = false;
  document.querySelector("#guard-move").disabled = false;
}

function rivalPlayerMove(move) {
  document.querySelector("#attack-move").disabled = true;
  document.querySelector("#guard-move").disabled = true;

  if (move === "attack") {
    let damage = 20;
    if (playerIsGuarding) damage = 5;
    playerHealth -= damage;
    if (playerHealth < 0) playerHealth = 0;
    playerIsGuarding = false;
    animateDuel("#duel-rival-face");
    document.querySelector("#duel-turn").textContent =
      selectedPlayer.name + " deals " + damage + " damage.";
  } else if (move === "guard") {
    rivalIsGuarding = true;
    document.querySelector("#duel-turn").textContent = selectedPlayer.name + " guards.";
  }

  drawDuelHealth();
  if (playerHealth === 0) {
    finishDuel(false);
    return;
  }

  document.querySelector("#duel-turn").textContent += " Pass the device.";
  setTimeout(showPlayerTurn, 900);
}

function showPlayerTurn() {
  currentTurn = "player";
  if (duelMode === "pvp") {
    document.querySelector("#duel-turn").textContent = "Player 1: choose a move.";
  } else {
    document.querySelector("#duel-turn").textContent = "Your move.";
  }
  document.querySelector("#attack-move").disabled = false;
  document.querySelector("#guard-move").disabled = false;
}

function rivalMove() {
  let rivalMove = "attack";
  if (Math.random() < 0.3) rivalMove = "guard";

  if (rivalMove === "guard") {
    rivalIsGuarding = true;
    document.querySelector("#duel-turn").textContent = selectedPlayer.name + " guards.";
  } else {
    let damage = 20;
    if (playerIsGuarding) damage = 5;
    playerHealth -= damage;
    if (playerHealth < 0) playerHealth = 0;
    playerIsGuarding = false;
    animateDuel("#duel-rival-face");
    document.querySelector("#duel-turn").textContent =
      selectedPlayer.name + " deals " + damage + " damage.";
  }

  drawDuelHealth();
  if (playerHealth === 0) {
    finishDuel(false);
    return;
  }

  document.querySelector("#duel-turn").textContent += " Your move.";
  setTimeout(showPlayerTurn, 700);
}

function showDuelCharacter(place, number) {
  const image = "assets/SuperRetroWorld_CharacterPack_Full/sprite_split/character_" +
    number + "/character_" + number + "_frame32x32.png";
  document.querySelector(place).style.backgroundImage = "url('" + image + "')";
  document.querySelector(place).style.backgroundPosition = "50% 0";
}

function animateDuel(place) {
  const sprite = document.querySelector(place);
  sprite.classList.remove("duel-hit");
  sprite.offsetWidth;
  sprite.classList.add("duel-hit");
}

function setDuelMode(mode) {
  duelMode = mode;
  const computerButton = document.querySelector("#computer-mode");
  const pvpButton = document.querySelector("#pvp-mode");

  computerButton.classList.remove("is-selected");
  pvpButton.classList.remove("is-selected");
  computerButton.setAttribute("aria-pressed", "false");
  pvpButton.setAttribute("aria-pressed", "false");

  if (mode === "pvp") {
    pvpButton.classList.add("is-selected");
    pvpButton.setAttribute("aria-pressed", "true");
    document.querySelector("#duel-mode-note").textContent = "Pass and play.";
  } else {
    computerButton.classList.add("is-selected");
    computerButton.setAttribute("aria-pressed", "true");
    document.querySelector("#duel-mode-note").textContent = "Play against the computer.";
  }
}

function drawDuelHealth() {
  document.querySelector("#duel-player-health").textContent = playerHealth;
  document.querySelector("#duel-rival-health").textContent = rivalHealth;
  document.querySelector("#duel-player-bar").style.width = playerHealth + "%";
  document.querySelector("#duel-rival-bar").style.width = rivalHealth + "%";
}

function finishDuel(playerWon) {
  drawDuelHealth();
  const newScore = {
    spent: duelScore.spent,
    wins: duelScore.wins,
    losses: duelScore.losses,
    wonPoints: duelScore.wonPoints
  };
  if (playerWon) {
    newScore.wins += 1;
    newScore.wonPoints += 10;
  }
  else newScore.losses += 1;

  if (saveDuelScore(newScore)) {
    if (playerWon) {
      document.querySelector("#duel-result-title").textContent = "YOU WIN!";
      document.querySelector("#duel-result-copy").textContent =
        "+10 points from " + selectedPlayer.name + "!";
    } else {
      document.querySelector("#duel-result-title").textContent = "YOU LOSE";
      document.querySelector("#duel-result-copy").textContent =
        selectedPlayer.name + " wins this round. Try again!";
    }
    document.querySelector("#duel-turn").textContent = "";
    document.querySelector("#duel-moves").hidden = true;
    document.querySelector("#attack-move").disabled = false;
    document.querySelector("#guard-move").disabled = false;
    document.querySelector("#duel-result").hidden = false;
    updateDuelPoints();
  }
}

function backToMainBattle() {
  duelBattleView.hidden = true;
  regularBattleView.hidden = false;
  guildList.hidden = false;
  profileCard.hidden = true;
  document.querySelector("#duel-mode-picker").hidden = false;
  document.querySelector("#duel-button").hidden = false;
}

guildList.addEventListener("click", function (event) {
  const button = event.target.closest(".view-profile");
  if (!button) return;
  const playerNumber = Number(button.dataset.playerNumber);
  if (guildPlayers[playerNumber]) showProfile(guildPlayers[playerNumber]);
});

document.querySelector("#computer-mode").addEventListener("click", function () {
  setDuelMode("computer");
});
document.querySelector("#pvp-mode").addEventListener("click", function () {
  setDuelMode("pvp");
});
document.querySelector("#duel-button").addEventListener("click", startDuel);
document.querySelector("#back-to-battle").addEventListener("click", backToMainBattle);
document.querySelector("#attack-move").addEventListener("click", function () {
  playerMove("attack");
});
document.querySelector("#guard-move").addEventListener("click", function () {
  playerMove("guard");
});
window.addEventListener("habitDataChanged", updateDuelPoints);

renderGuild();
