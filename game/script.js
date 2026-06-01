const ROWS = 8;
const COLS = 8;
const MASK_TOTAL = 100;
const HINT_INTERVAL_MS = 1200;
const HINT_IDLE_MS = 900;

const PIECE_TYPES = [
  { key: "azul", shape: "circulo", label: "bola" },
  { key: "amarelo", shape: "triangulo", label: "triângulo" },
  { key: "verde", shape: "estrela", label: "estrela" },
  { key: "vermelho", shape: "quadrado", label: "quadrado" },
  { key: "roxo", shape: "hexagono", label: "hexágono" }
];

const PHASES = [
  {
    title: "Fase 1 — Jardim Solar",
    subtitle: "Fase introdutória com tabuleiro completo.",
    themeText: "Tema quente e colorido com layout completo para começar.",
    pointsGoal: 500,
    moves: 24,
    cactusCount: 3,
    revealCover: 70,
    revealFactor: 1.5,
    cactusRevealFactor: 2,
    revealStartProgress: 0.62,
    finalRevealBoost: 2.5,
    theme: {
      bgStart: "#4cb8ff",
      bgMid: "#1e7bff",
      bgEnd: "#0f2d6b",
      boardBg1: "rgba(22,22,22,.98)",
      boardBg2: "rgba(0,0,0,.96)",
      frame1: "rgba(255,255,255,.40)",
      frame2: "rgba(110,110,110,.30)"
    },
    layout: [
      "11111111","11111111","11111111","11111111","11111111","11111111","11111111","11111111"
    ]
  },
  {
    title: "Fase 2 — Lago Neon",
    subtitle: "Cantos cortados e fundo azulado.",
    themeText: "O tabuleiro muda de forma com cantos vazios e visual azul neon.",
    pointsGoal: 900,
    moves: 26,
    cactusCount: 4,
    revealCover: 76,
    revealFactor: 1.35,
    cactusRevealFactor: 2,
    revealStartProgress: 0.66,
    finalRevealBoost: 2.8,
    theme: {
      bgStart: "#45e6c3",
      bgMid: "#0a9f88",
      bgEnd: "#0a4b46",
      boardBg1: "rgba(22,22,22,.98)",
      boardBg2: "rgba(0,0,0,.96)",
      frame1: "rgba(255,255,255,.40)",
      frame2: "rgba(110,110,110,.30)"
    },
    layout: [
      "00111100","01111110","11111111","11111111","11111111","11111111","01111110","00111100"
    ]
  },
  {
    title: "Fase 3 — Vale Esmeralda",
    subtitle: "Mais difícil, figurinha mais protegida e layout com passagens.",
    themeText: "A figurinha demora mais para abrir e o layout tem corredores diferentes.",
    pointsGoal: 1300,
    moves: 28,
    cactusCount: 5,
    revealCover: 84,
    revealFactor: 1.1,
    cactusRevealFactor: 2,
    revealStartProgress: 0.70,
    finalRevealBoost: 3.2,
    theme: {
      bgStart: "#ffd24d",
      bgMid: "#d38b00",
      bgEnd: "#6a3c00",
      boardBg1: "rgba(22,22,22,.98)",
      boardBg2: "rgba(0,0,0,.96)",
      frame1: "rgba(255,255,255,.40)",
      frame2: "rgba(110,110,110,.30)"
    },
    layout: [
      "11111111",
      "11100111",
      "11100111",
      "11111111",
      "11111111",
      "11001111",
      "11001111",
      "11111111"
    ]
  },
  {
    title: "Fase 4 — Nebulosa Roxa",
    subtitle: "Layout em cruz e fundo espacial.",
    themeText: "Mais espaço vazio no tabuleiro, exigindo planejamento.",
    pointsGoal: 1700,
    moves: 30,
    cactusCount: 6,
    revealCover: 88,
    revealFactor: 1.0,
    cactusRevealFactor: 2,
    revealStartProgress: 0.72,
    finalRevealBoost: 3.5,
    theme: {
      bgStart: "#7cb8ff",
      bgMid: "#315cff",
      bgEnd: "#162a73",
      boardBg1: "rgba(22,22,22,.98)",
      boardBg2: "rgba(0,0,0,.96)",
      frame1: "rgba(255,255,255,.40)",
      frame2: "rgba(110,110,110,.30)"
    },
    layout: [
      "00111100",
      "00111100",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "00111100",
      "00111100"
    ]
  },
  {
    title: "Fase 5 — Coroa Rubi",
    subtitle: "Layout diamante e figurinha mais fechada.",
    themeText: "Última fase com fundo rubi e tabuleiro em forma de diamante.",
    pointsGoal: 2200,
    moves: 32,
    cactusCount: 7,
    revealCover: 90,
    revealFactor: 0.95,
    cactusRevealFactor: 2,
    revealStartProgress: 0.74,
    finalRevealBoost: 3.8,
    theme: {
      bgStart: "#8be15c",
      bgMid: "#2c9a3e",
      bgEnd: "#153f1e",
      boardBg1: "rgba(22,22,22,.98)",
      boardBg2: "rgba(0,0,0,.96)",
      frame1: "rgba(255,255,255,.40)",
      frame2: "rgba(110,110,110,.30)"
    },
    layout: [
      "00011000",
      "00111100",
      "01111110",
      "11111111",
      "11111111",
      "01111110",
      "00111100",
      "00011000"
    ]
  }
];

const CONFIG = window.FIGURINHAS_CONFIG || { total: 72, arquivos: [] };

const boardEl = document.getElementById("tabuleiro");
const faseAtualEl = document.getElementById("faseAtual");
const pontosEl = document.getElementById("pontos");
const movimentosEl = document.getElementById("movimentos");
const figurinhaNumeroEl = document.getElementById("figurinhaNumero");
const metaPontosEl = document.getElementById("metaPontos");
const metaCactosEl = document.getElementById("metaCactos");
const metaFigurinhaEl = document.getElementById("metaFigurinha");
const progressoEl = document.getElementById("progresso");
const descricaoFaseEl = document.getElementById("descricaoFase");
const tituloFaseEl = document.getElementById("tituloFase");
const subtituloFaseEl = document.getElementById("subtituloFase");
const temaFaseEl = document.getElementById("temaFase");
const btnProximaFase = document.getElementById("btnProximaFase");
const btnEmbaralhar = document.getElementById("btnEmbaralhar");
const btnReiniciar = document.getElementById("btnReiniciar");
const btnAudio = document.getElementById("btnAudio");
const statusBoosterEl = document.getElementById("statusBooster");
const boosterBombaBtn = document.getElementById("boosterBomba");
const boosterFogueteBtn = document.getElementById("boosterFoguete");
const boosterPaBtn = document.getElementById("boosterPa");
const qtdBombaEl = document.getElementById("qtdBomba");
const qtdFogueteEl = document.getElementById("qtdFoguete");
const qtdPaEl = document.getElementById("qtdPa");
const stickerImageEl = document.getElementById("stickerImage");
const stickerPreviewEl = document.getElementById("stickerPreview");
const stickerMaskEl = document.getElementById("stickerMask");
const fallbackNumeroEl = document.getElementById("fallbackNumero");
const figurinhaArquivoEl = document.getElementById("figurinhaArquivo");
const coberturaRestanteEl = document.getElementById("coberturaRestante");
const porcentagemVisivelEl = document.getElementById("porcentagemVisivel");
const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const btnModalPrincipal = document.getElementById("btnModalPrincipal");
const btnModalSecundario = document.getElementById("btnModalSecundario");
const audioFundo = document.getElementById("audioFundo");
const audioClick = document.getElementById("audioClick");
const audioSwipe = document.getElementById("audioSwipe");
const audioMatch = document.getElementById("audioMatch");
const audioSparkle = document.getElementById("audioSparkle");
const audioBomba = document.getElementById("audioBomba");
const audioFoguete = document.getElementById("audioFoguete");
const audioPa = document.getElementById("audioPa");
const audioErro = document.getElementById("audioErro");
const audioVitoria = document.getElementById("audioVitoria");

let board = [];
let phaseIndex = 0;
let score = 0;
let moves = 0;
let cactusBroken = 0;
let cactusTarget = 0;
let phaseFinished = false;
let audioOn = false;
let boosters = { bomb: 3, rocket: 3, shovel: 3 };
let activeBooster = null;
let selectedIndex = null;
let dragOrigin = null;
let dragStartX = 0;
let dragStartY = 0;
let dragConsumed = false;
let currentStickerNumber = 1;
let currentRevealGoal = 70;
let stickerMaskState = [];
let hintMoves = [];
let hintInterval = null;
let hintTimeout = null;
let currentHintIndex = -1;
let modalPrimaryAction = null;
let modalSecondaryAction = null;

function idx(r, c) { return r * COLS + c; }
function rowOf(index) { return Math.floor(index / COLS); }
function colOf(index) { return index % COLS; }
function cloneCell(cell) { return cell ? JSON.parse(JSON.stringify(cell)) : null; }
function isPiece(cell) { return cell && cell.kind === "piece"; }
function isCactus(cell) { return cell && cell.kind === "cactus"; }
function isBlocked(cell) { return cell && cell.kind === "blocked"; }
function isBarrier(cell) { return isCactus(cell) || isBlocked(cell); }
function isPlayableCell(cell) { return isPiece(cell) || isCactus(cell); }
function sameType(a, b) { return isPiece(a) && isPiece(b) && a.type === b.type; }

function buildStickerFileList() {
  if (Array.isArray(CONFIG.arquivos) && CONFIG.arquivos.length > 0) return CONFIG.arquivos;
  const total = Number(CONFIG.total || 72);
  return Array.from({ length: total }, (_, i) => `${String(i + 1).padStart(3, "0")}.webp`);
}
const STICKER_FILES = buildStickerFileList();

function randomPiece() {
  const picked = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  return { kind: "piece", type: picked.key, shape: picked.shape, label: picked.label, special: null };
}
function createCactus() { return { kind: "cactus", hp: 3 }; }
function createBlocked() { return { kind: "blocked" }; }

function play(audio, volume = 1) {
  if (!audioOn || !audio) return;
  try { audio.pause(); audio.currentTime = 0; audio.volume = volume; audio.play().catch(() => {}); } catch (e) {}
}

function markInteraction() {
  clearHintTimers();
  clearHintClasses();
}

function toggleAudio() {
  audioOn = !audioOn;
  if (audioOn) {
    audioFundo.volume = 0.22;
    audioFundo.play().catch(() => {});
    btnAudio.textContent = "Desativar áudio";
  } else {
    audioFundo.pause();
    btnAudio.textContent = "Ativar áudio";
  }
}

function resetGame() {
  phaseIndex = 0;
  score = 0;
  boosters = { bomb: 3, rocket: 3, shovel: 3 };
  startPhase();
}

function getCurrentPhase() {
  return PHASES[phaseIndex];
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--bg-start", theme.bgStart);
  root.style.setProperty("--bg-mid", theme.bgMid);
  root.style.setProperty("--bg-end", theme.bgEnd);
  root.style.setProperty("--board-bg1", theme.boardBg1);
  root.style.setProperty("--board-bg2", theme.boardBg2);
  root.style.setProperty("--board-frame1", theme.frame1);
  root.style.setProperty("--board-frame2", theme.frame2);
}

function startPhase() {
  const phase = getCurrentPhase();
  phaseFinished = false;
  selectedIndex = null;
  activeBooster = null;
  dragOrigin = null;
  dragConsumed = false;
  score = 0;
  moves = phase.moves;
  cactusBroken = 0;
  cactusTarget = phase.cactusCount;
  currentRevealGoal = phase.revealCover;
  currentStickerNumber = (phaseIndex % STICKER_FILES.length) + 1;

  faseAtualEl.textContent = phaseIndex + 1;
  tituloFaseEl.textContent = phase.title;
  subtituloFaseEl.textContent = phase.subtitle;
  temaFaseEl.textContent = phase.themeText;
  descricaoFaseEl.textContent = "Conclua pontos e cactos para a figurinha começar a abrir mais perto do fim da fase.";
  btnProximaFase.disabled = true;

  applyTheme(phase.theme);
  initStickerReveal(phase.revealCover);
  updateBoostersUI();
  buildBoard(phase);
  ensureBoardReady();
  renderBoard();
  updateUI();
  scheduleHints();
}

function buildBoard(phase) {
  board = new Array(ROWS * COLS).fill(null);
  const activePositions = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const active = phase.layout[r][c] === "1";
      const index = idx(r, c);
      if (active) {
        board[index] = randomPiece();
        activePositions.push(index);
      } else {
        board[index] = createBlocked();
      }
    }
  }

  pickCactusPositions(activePositions, phase.cactusCount).forEach(i => { board[i] = createCactus(); });
}

function pickCactusPositions(activePositions, count) {
  const pool = activePositions.filter(index => {
    const r = rowOf(index), c = colOf(index);
    return r > 0 && r < ROWS - 1 && c > 0 && c < COLS - 1;
  });
  shuffle(pool);
  const selected = [];
  for (const pos of pool) {
    const neighbors = orthogonalNeighbors(pos);
    const tooClose = selected.some(s => neighbors.includes(s) || s === pos);
    if (!tooClose) {
      selected.push(pos);
      if (selected.length >= count) break;
    }
  }
  while (selected.length < count) {
    const fallback = pool.find(p => !selected.includes(p));
    if (fallback == null) break;
    selected.push(fallback);
  }
  return selected;
}

function ensureBoardReady() {
  ensureNoInitialMatches();
  ensurePlayableBoard();
}

function ensureNoInitialMatches() {
  let safety = 0;
  while (getMatchGroups().length > 0 && safety < 80) {
    getMatchGroups().flat().forEach(i => { if (isPiece(board[i])) board[i] = randomPiece(); });
    safety++;
  }
}

function ensurePlayableBoard() {
  let safety = 0;
  while (getPossibleMoves().length === 0 && safety < 80) {
    shuffleOnlyPieces();
    ensureNoInitialMatches();
    safety++;
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function shuffleOnlyPieces() {
  const pieces = board.filter(isPiece).map(cloneCell);
  shuffle(pieces);
  let p = 0;
  board = board.map(cell => isPiece(cell) ? cloneCell(pieces[p++]) : cell);
}

function initStickerReveal(coveredCount) {
  stickerMaskState = Array(MASK_TOTAL).fill(false);
  const indices = Array.from({ length: MASK_TOTAL }, (_, i) => i);
  shuffle(indices);
  indices.slice(0, coveredCount).forEach(i => { stickerMaskState[i] = true; });
  loadStickerImage();
  renderStickerMask();
}

function loadStickerImage() {
  const fileName = STICKER_FILES[currentStickerNumber - 1] || `${String(currentStickerNumber).padStart(3, "0")}.webp`;
  const stickerNumText = String(currentStickerNumber).padStart(3, "0");
  figurinhaNumeroEl.textContent = stickerNumText;
  fallbackNumeroEl.textContent = stickerNumText;
  figurinhaArquivoEl.textContent = fileName;
  stickerImageEl.src = `figurinhas/${fileName}`;
  stickerImageEl.onload = () => stickerPreviewEl.classList.remove("sem-imagem");
  stickerImageEl.onerror = () => stickerPreviewEl.classList.add("sem-imagem");
}

function renderStickerMask() {
  stickerMaskEl.innerHTML = "";
  for (let i = 0; i < MASK_TOTAL; i++) {
    const cell = document.createElement("div");
    if (stickerMaskState[i]) cell.className = "mask-cell";
    else cell.style.background = "transparent";
    stickerMaskEl.appendChild(cell);
  }
  updateStickerStats();
}

function getCoveredCount() { return stickerMaskState.filter(Boolean).length; }
function getRevealedCoverCount() { return currentRevealGoal - getCoveredCount(); }
function updateStickerStats() {
  const covered = getCoveredCount();
  const visible = MASK_TOTAL - covered;
  coberturaRestanteEl.textContent = `${covered} blocos cobrindo`;
  porcentagemVisivelEl.textContent = `${visible}% visível`;
}

function getNonStickerProgress() {
  const phase = getCurrentPhase();
  const pointsProgress = Math.min(score / phase.pointsGoal, 1);
  const cactusProgress = cactusTarget > 0 ? Math.min(cactusBroken / cactusTarget, 1) : 1;
  return (pointsProgress + cactusProgress) / 2;
}

function getLateRevealAmount(baseAmount) {
  const phase = getCurrentPhase();
  const progress = getNonStickerProgress();
  const start = phase.revealStartProgress || 0.65;
  if (progress < start) return 0;

  const normalized = Math.min((progress - start) / Math.max(0.01, 1 - start), 1);
  const multiplier = 0.55 + normalized * (phase.finalRevealBoost || 2.5);
  let amount = Math.ceil(baseAmount * multiplier);

  if (progress >= 0.95) amount += 6;
  else if (progress >= 0.85) amount += 3;

  return amount;
}

function revealStickerBlocks(amount) {
  const coveredIndices = [];
  for (let i = 0; i < stickerMaskState.length; i++) if (stickerMaskState[i]) coveredIndices.push(i);
  if (!coveredIndices.length) return 0;
  shuffle(coveredIndices);
  const qty = Math.min(amount, coveredIndices.length);
  for (let i = 0; i < qty; i++) stickerMaskState[coveredIndices[i]] = false;
  renderStickerMask();
  return qty;
}

function renderBoard() {
  boardEl.innerHTML = "";
  board.forEach((cell, index) => {
    const cellEl = document.createElement("div");
    cellEl.className = "celula";

    if (isBlocked(cell)) {
      cellEl.classList.add("bloqueada");
      boardEl.appendChild(cellEl);
      return;
    }

    if (isPiece(cell)) {
      const pieceEl = document.createElement("div");
      pieceEl.className = `peca tipo-${cell.type}`;
      pieceEl.dataset.index = index;
      if (selectedIndex === index) pieceEl.classList.add("selecionada");

      const symbol = document.createElement("span");
      symbol.className = `forma forma-${cell.shape}`;
      symbol.setAttribute("aria-label", cell.label || cell.shape);
      pieceEl.appendChild(symbol);

      if (cell.special === "rocketH" || cell.special === "bomb") {
        const badge = document.createElement("span");
        badge.className = "badge-especial";
        badge.textContent = cell.special === "rocketH" ? "🚀" : "💣";
        pieceEl.appendChild(badge);
      }

      pieceEl.addEventListener("click", () => onCellClick(index));
      pieceEl.addEventListener("pointerdown", e => onPointerDown(e, index));
      pieceEl.addEventListener("pointermove", e => onPointerMove(e));
      pieceEl.addEventListener("pointerup", () => onPointerUp());
      pieceEl.addEventListener("pointercancel", () => cancelDrag());
      cellEl.appendChild(pieceEl);
    } else if (isCactus(cell)) {
      const cactusEl = document.createElement("div");
      cactusEl.className = "cacto";
      if (cell.hp === 2) cactusEl.classList.add("dano-2");
      if (cell.hp === 1) cactusEl.classList.add("dano-1");
      cactusEl.innerHTML = `<span class="cacto-corpo">🌵</span><span class="cacto-hp">${cell.hp}</span>`;
      cactusEl.addEventListener("click", () => onCellClick(index));
      cellEl.appendChild(cactusEl);
    } else {
      const emptyEl = document.createElement("div");
      emptyEl.className = "bloco-vazio";
      cellEl.appendChild(emptyEl);
    }

    boardEl.appendChild(cellEl);
  });

  applyCurrentHint();
}

function onPointerDown(e, index) {
  if (phaseFinished || moves <= 0 || activeBooster || !isPiece(board[index])) return;
  markInteraction();
  dragOrigin = index;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragConsumed = false;
  const piece = getPieceEl(index);
  if (piece) {
    piece.classList.add("arrastando");
    piece.classList.add("selecionada");
    piece.setPointerCapture?.(e.pointerId);
  }
}

function onPointerMove(e) {
  if (dragOrigin == null || dragConsumed || phaseFinished || moves <= 0 || activeBooster) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  const limit = 24;
  if (Math.abs(dx) < limit && Math.abs(dy) < limit) return;
  let target = null;
  const r = rowOf(dragOrigin), c = colOf(dragOrigin);
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && c < COLS - 1) target = dragOrigin + 1;
    if (dx < 0 && c > 0) target = dragOrigin - 1;
  } else {
    if (dy > 0 && r < ROWS - 1) target = dragOrigin + COLS;
    if (dy < 0 && r > 0) target = dragOrigin - COLS;
  }
  if (target != null) {
    dragConsumed = true;
    trySwap(dragOrigin, target);
    cancelDrag();
  }
}

function onPointerUp() {
  cancelDrag();
  if (!phaseFinished) scheduleHints();
}

function cancelDrag() {
  document.querySelectorAll(".peca").forEach(el => el.classList.remove("arrastando"));
  dragOrigin = null;
  dragConsumed = false;
}

function onCellClick(index) {
  if (phaseFinished) return;
  markInteraction();

  if (activeBooster) {
    applyActiveBooster(index);
    return;
  }

  if (moves <= 0) return;

  if (!isPiece(board[index])) {
    selectedIndex = null;
    renderBoard();
    scheduleHints();
    return;
  }

  play(audioClick, 0.7);

  if (selectedIndex == null) {
    selectedIndex = index;
    renderBoard();
    return;
  }

  if (selectedIndex === index) {
    selectedIndex = null;
    renderBoard();
    scheduleHints();
    return;
  }

  if (!areAdjacent(selectedIndex, index)) {
    selectedIndex = index;
    renderBoard();
    return;
  }

  const origin = selectedIndex;
  selectedIndex = null;
  trySwap(origin, index);
}

function areAdjacent(a, b) {
  return (rowOf(a) === rowOf(b) && Math.abs(colOf(a) - colOf(b)) === 1) ||
         (colOf(a) === colOf(b) && Math.abs(rowOf(a) - rowOf(b)) === 1);
}

function trySwap(a, b) {
  if (!isPiece(board[a]) || !isPiece(board[b]) || !areAdjacent(a, b)) return;
  markInteraction();
  play(audioSwipe, 0.7);
  swapCells(a, b);
  moves--;
  renderBoard();
  updateUI();

  const groups = getMatchGroups();
  if (groups.length === 0) {
    setTimeout(() => {
      swapCells(a, b);
      renderBoard();
      updateUI();
      play(audioErro, 0.6);
      checkEndByMoves();
      scheduleHints();
    }, 120);
    return;
  }

  resolveGroups(groups, b);
}

function swapCells(a, b) {
  const temp = board[a];
  board[a] = board[b];
  board[b] = temp;
}

function getMatchGroups() {
  const groups = [];

  for (let r = 0; r < ROWS; r++) {
    let run = [idx(r, 0)];
    for (let c = 1; c < COLS; c++) {
      const current = idx(r, c);
      const prev = run[0];
      if (sameType(board[current], board[prev])) run.push(current);
      else {
        if (run.length >= 3) groups.push([...run]);
        run = [current];
      }
    }
    if (run.length >= 3) groups.push([...run]);
  }

  for (let c = 0; c < COLS; c++) {
    let run = [idx(0, c)];
    for (let r = 1; r < ROWS; r++) {
      const current = idx(r, c);
      const prev = run[0];
      if (sameType(board[current], board[prev])) run.push(current);
      else {
        if (run.length >= 3) groups.push([...run]);
        run = [current];
      }
    }
    if (run.length >= 3) groups.push([...run]);
  }

  return groups;
}

function getPossibleMoves() {
  const movesList = [];
  const seen = new Set();
  for (let i = 0; i < board.length; i++) {
    if (!isPiece(board[i])) continue;
    const neighbors = [];
    const r = rowOf(i), c = colOf(i);
    if (c < COLS - 1) neighbors.push(i + 1);
    if (r < ROWS - 1) neighbors.push(i + COLS);

    for (const j of neighbors) {
      if (!isPiece(board[j])) continue;
      swapCells(i, j);
      const creates = getMatchGroups().length > 0;
      swapCells(i, j);
      if (creates) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          movesList.push([i, j]);
        }
      }
    }
  }
  return movesList;
}

function clearHintClasses() {
  document.querySelectorAll('.peca.dica').forEach(el => el.classList.remove('dica'));
}

function clearHintTimers() {
  if (hintInterval) { clearInterval(hintInterval); hintInterval = null; }
  if (hintTimeout) { clearTimeout(hintTimeout); hintTimeout = null; }
  currentHintIndex = -1;
}

function applyCurrentHint() {
  clearHintClasses();
  if (!hintMoves.length || currentHintIndex < 0 || phaseFinished || selectedIndex != null || dragOrigin != null || activeBooster) return;
  const pair = hintMoves[currentHintIndex];
  pair.forEach(index => {
    const el = getPieceEl(index);
    if (el) el.classList.add('dica');
  });
}

function scheduleHints() {
  clearHintTimers();
  if (phaseFinished || moves <= 0 || selectedIndex != null || dragOrigin != null || activeBooster) return;
  hintMoves = getPossibleMoves();
  if (!hintMoves.length) return;
  hintTimeout = setTimeout(() => {
    currentHintIndex = 0;
    applyCurrentHint();
    hintInterval = setInterval(() => {
      if (phaseFinished || moves <= 0 || selectedIndex != null || dragOrigin != null || activeBooster) {
        clearHintTimers();
        clearHintClasses();
        return;
      }
      hintMoves = getPossibleMoves();
      if (!hintMoves.length) {
        clearHintTimers();
        clearHintClasses();
        return;
      }
      currentHintIndex = (currentHintIndex + 1) % hintMoves.length;
      applyCurrentHint();
    }, HINT_INTERVAL_MS);
  }, HINT_IDLE_MS);
}

function resolveGroups(groups, anchorIndex = null) {
  if (groups.length === 0) {
    finalizeResolution();
    return;
  }

  const phase = getCurrentPhase();
  let specialCreate = null;
  if (anchorIndex != null && isPiece(board[anchorIndex])) {
    const related = groups.filter(g => g.includes(anchorIndex));
    const maxLength = related.length ? Math.max(...related.map(g => g.length)) : 0;
    if (maxLength >= 5) specialCreate = { index: anchorIndex, cell: { ...board[anchorIndex], special: "bomb" } };
    else if (maxLength === 4) specialCreate = { index: anchorIndex, cell: { ...board[anchorIndex], special: "rocketH" } };
  }

  const clearSet = new Set(groups.flat());
  if (specialCreate) clearSet.delete(specialCreate.index);
  expandSpecialEffects(clearSet);

  const directCactusHits = new Set();
  const clearedPieces = new Set();
  clearSet.forEach(i => {
    if (isPiece(board[i])) clearedPieces.add(i);
    if (isCactus(board[i])) directCactusHits.add(i);
  });

  const adjacentCactusHits = findAdjacentCactuses(clearedPieces);
  animateRemoval(clearedPieces);

  setTimeout(() => {
    score += clearedPieces.size * 50;
    damageCactuses(directCactusHits, 1);
    damageCactuses(adjacentCactusHits, 1);
    clearedPieces.forEach(i => { if (isPiece(board[i])) board[i] = null; });
    if (specialCreate) board[specialCreate.index] = specialCreate.cell;

    const baseRevealQty = Math.max(2, Math.ceil(clearedPieces.size * phase.revealFactor));
    const baseCactusReveal = (directCactusHits.size + adjacentCactusHits.size) * phase.cactusRevealFactor;
    const finalRevealQty = getLateRevealAmount(baseRevealQty + baseCactusReveal);
    if (finalRevealQty > 0) {
      revealStickerBlocks(finalRevealQty);
      play(audioSparkle, 0.5);
    }
    play(audioMatch, 0.65);

    collapseBoard();
    fillEmptyCells();
    ensureBoardReady();
    renderBoard();
    updateUI();

    const nextGroups = getMatchGroups();
    if (nextGroups.length > 0) setTimeout(() => resolveGroups(nextGroups, null), 180);
    else finalizeResolution();
  }, 220);
}

function animateRemoval(indicesSet) {
  indicesSet.forEach(i => {
    const piece = getPieceEl(i);
    if (piece) piece.classList.add("removendo");
  });
}

function expandSpecialEffects(clearSet) {
  const queue = [...clearSet];
  const visited = new Set();
  while (queue.length) {
    const index = queue.pop();
    const cell = board[index];
    if (!isPiece(cell) || !cell.special || visited.has(index)) continue;
    visited.add(index);
    getEffectIndices(index, cell.special).forEach(i => {
      if (!clearSet.has(i)) {
        clearSet.add(i);
        queue.push(i);
      }
    });
  }
}

function getEffectIndices(index, specialType) {
  const results = [];
  if (specialType === "rocketH") {
    const r = rowOf(index);
    for (let c = 0; c < COLS; c++) results.push(idx(r, c));
  }
  if (specialType === "bomb") {
    const r = rowOf(index), c = colOf(index);
    for (let rr = r - 1; rr <= r + 1; rr++) {
      for (let cc = c - 1; cc <= c + 1; cc++) {
        if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) results.push(idx(rr, cc));
      }
    }
  }
  return results;
}

function findAdjacentCactuses(pieceIndices) {
  const hits = new Set();
  pieceIndices.forEach(index => {
    orthogonalNeighbors(index).forEach(n => {
      if (isCactus(board[n])) hits.add(n);
    });
  });
  return hits;
}

function orthogonalNeighbors(index) {
  const r = rowOf(index), c = colOf(index), list = [];
  if (r > 0) list.push(idx(r - 1, c));
  if (r < ROWS - 1) list.push(idx(r + 1, c));
  if (c > 0) list.push(idx(r, c - 1));
  if (c < COLS - 1) list.push(idx(r, c + 1));
  return list;
}

function damageCactuses(indicesSet, amount) {
  indicesSet.forEach(i => {
    if (!isCactus(board[i])) return;
    board[i].hp -= amount;
    score += 20;
    if (board[i].hp <= 0) {
      board[i] = null;
      cactusBroken++;
      score += 100;
    }
  });
}

function collapseBoard() {
  for (let c = 0; c < COLS; c++) {
    let row = ROWS - 1;
    while (row >= 0) {
      if (isBarrier(board[idx(row, c)])) { row--; continue; }
      const bottom = row;
      while (row >= 0 && !isBarrier(board[idx(row, c)])) row--;
      const top = row + 1;
      const pieces = [];
      for (let r = bottom; r >= top; r--) {
        const cell = board[idx(r, c)];
        if (isPiece(cell)) pieces.push(cloneCell(cell));
      }
      let p = 0;
      for (let r = bottom; r >= top; r--) {
        if (board[idx(r, c)] === null || isPiece(board[idx(r, c)])) {
          board[idx(r, c)] = pieces[p++] || null;
        }
      }
    }
  }
}

function fillEmptyCells() {
  for (let i = 0; i < board.length; i++) {
    if (board[i] == null) board[i] = randomPiece();
  }
}

function finalizeResolution() {
  renderBoard();
  updateUI();
  checkWin();
  if (!phaseFinished) {
    if (moves <= 0) {
      checkEndByMoves();
    } else {
      autoShuffleIfNeeded();
      scheduleHints();
    }
  }
}

function autoShuffleIfNeeded() {
  if (getPossibleMoves().length > 0) return;
  shuffleOnlyPieces();
  ensureBoardReady();
  renderBoard();
  updateUI();
  openModal(
    "Tabuleiro embaralhado",
    "Não havia mais combinações possíveis. O jogo embaralhou automaticamente para continuar.",
    { primaryText: "Continuar", primaryAction: closeModal }
  );
}

function updateUI() {
  const phase = getCurrentPhase();
  pontosEl.textContent = score;
  movimentosEl.textContent = moves;
  metaPontosEl.textContent = `${score} / ${phase.pointsGoal}`;
  metaCactosEl.textContent = `${cactusBroken} / ${cactusTarget}`;
  metaFigurinhaEl.textContent = `${getRevealedCoverCount()} / ${currentRevealGoal}`;

  const progressPoints = Math.min(score / phase.pointsGoal, 1);
  const progressCactus = cactusTarget > 0 ? Math.min(cactusBroken / cactusTarget, 1) : 1;
  const progressSticker = Math.min(getRevealedCoverCount() / currentRevealGoal, 1);
  progressoEl.style.width = `${((progressPoints + progressCactus + progressSticker) / 3) * 100}%`;

  updateBoostersUI();
}

function updateBoostersUI() {
  qtdBombaEl.textContent = boosters.bomb;
  qtdFogueteEl.textContent = boosters.rocket;
  qtdPaEl.textContent = boosters.shovel;
  boosterBombaBtn.disabled = boosters.bomb <= 0 || phaseFinished;
  boosterFogueteBtn.disabled = boosters.rocket <= 0 || phaseFinished;
  boosterPaBtn.disabled = boosters.shovel <= 0 || phaseFinished;

  [boosterBombaBtn, boosterFogueteBtn, boosterPaBtn].forEach(btn => btn.classList.remove("ativo"));
  if (activeBooster === "bomb") boosterBombaBtn.classList.add("ativo");
  if (activeBooster === "rocket") boosterFogueteBtn.classList.add("ativo");
  if (activeBooster === "shovel") boosterPaBtn.classList.add("ativo");

  const names = {
    bomb: "Bomba ativa: clique em qualquer bloco.",
    rocket: "Foguete ativo: clique em uma linha para quebrar tudo.",
    shovel: "Pá ativa: clique em 1 bloco."
  };
  statusBoosterEl.textContent = names[activeBooster] || "Nenhum booster ativo.";
}

function selectBooster(type) {
  const boosterMap = { bomb: "bomb", rocket: "rocket", shovel: "shovel" };
  if (phaseFinished || boosters[boosterMap[type]] <= 0) return;
  markInteraction();
  play(audioClick, 0.7);
  activeBooster = activeBooster === type ? null : type;
  selectedIndex = null;
  updateBoostersUI();
  renderBoard();
}


function animarBombaComPavio(index, callback) {
  clearHintTimers();
  clearHintClasses();

  const celula = boardEl.children[index];
  if (!celula) {
    play(audioBomba, 0.9);
    callback();
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "pavio-wrap";
  overlay.innerHTML = `<div class="bomba-animada"></div>`;
  celula.appendChild(overlay);

  setTimeout(() => {
    overlay.innerHTML = `<div class="explosao-animada"></div>`;
    play(audioBomba, 0.95);
  }, 850);

  setTimeout(() => {
    overlay.remove();
    callback();
  }, 1280);
}


function applyActiveBooster(index) {
  if (!activeBooster || phaseFinished) return;
  markInteraction();

  if (activeBooster === "bomb" && boosters.bomb > 0) {
    boosters.bomb--;
    activeBooster = null;
    updateBoostersUI();
    animarBombaComPavio(index, () => {
      resolveManualEffect(new Set(getEffectIndices(index, "bomb")));
    });
    return;
  } else if (activeBooster === "rocket" && boosters.rocket > 0) {
    boosters.rocket--;
    play(audioFoguete, 0.75);
    resolveManualEffect(new Set(getEffectIndices(index, "rocketH")));
  } else if (activeBooster === "shovel" && boosters.shovel > 0) {
    boosters.shovel--;
    play(audioPa, 0.75);
    resolveManualEffect(new Set([index]));
  }

  activeBooster = null;
  updateBoostersUI();
}

function resolveManualEffect(targetsSet) {
  const phase = getCurrentPhase();
  const directCactusHits = new Set();
  const pieceTargets = new Set();
  expandSpecialEffects(targetsSet);
  targetsSet.forEach(i => {
    if (isPiece(board[i])) pieceTargets.add(i);
    if (isCactus(board[i])) directCactusHits.add(i);
  });

  animateRemoval(pieceTargets);

  setTimeout(() => {
    score += pieceTargets.size * 35;
    damageCactuses(directCactusHits, 1);
    pieceTargets.forEach(i => { if (isPiece(board[i])) board[i] = null; });

    const baseRevealQty = Math.max(2, Math.ceil(pieceTargets.size * phase.revealFactor) + directCactusHits.size * phase.cactusRevealFactor);
    const finalRevealQty = getLateRevealAmount(baseRevealQty);
    if (finalRevealQty > 0) {
      revealStickerBlocks(finalRevealQty);
      play(audioSparkle, 0.55);
    }

    collapseBoard();
    fillEmptyCells();
    ensureBoardReady();
    renderBoard();
    updateUI();

    const newGroups = getMatchGroups();
    if (newGroups.length > 0) setTimeout(() => resolveGroups(newGroups, null), 150);
    else finalizeResolution();
  }, 180);
}

function checkWin() {
  const phase = getCurrentPhase();
  if (phaseFinished) return;

  if (score >= phase.pointsGoal && cactusBroken >= cactusTarget && getCoveredCount() === 0) {
    phaseFinished = true;
    btnProximaFase.disabled = phaseIndex >= PHASES.length - 1;
    markInteraction();
    play(audioVitoria, 0.9);

    if (phaseIndex >= PHASES.length - 1) {
      openModal(
        "Missão concluída!",
        "Você concluiu todas as fases e o sistema está pronto para receber todas as figurinhas depois.",
        { primaryText: "Reiniciar jogo", primaryAction: () => { closeModal(); resetGame(); } }
      );
    } else {
      openModal(
        "Fase vencida!",
        "Você concluiu a fase e pode avançar para o próximo layout.",
        { primaryText: "Próxima fase", primaryAction: () => { closeModal(); nextPhase(); } }
      );
    }
  }
}

function checkEndByMoves() {
  if (phaseFinished) return;
  if (moves > 0) return;

  openModal(
    "Fim das jogadas",
    "As jogadas acabaram. A dificuldade foi mantida, mas agora você pode reiniciar esta fase sem travar o jogo.",
    {
      primaryText: "Tentar novamente",
      primaryAction: () => { closeModal(); restartCurrentPhase(); },
      secondaryText: "Fechar",
      secondaryAction: closeModal
    }
  );
}

function restartCurrentPhase() {
  startPhase();
}

function openModal(title, text, options = {}) {
  if(/fim|vencida|conclu/i.test(String(title)+' '+String(text))) liberarPremioMunicipal(title);
  modalTitulo.textContent = title;
  modalTexto.textContent = text;
  btnModalPrincipal.textContent = options.primaryText || "Continuar";
  modalPrimaryAction = options.primaryAction || closeModal;

  if (options.secondaryText) {
    btnModalSecundario.textContent = options.secondaryText;
    btnModalSecundario.classList.remove("escondido");
    modalSecondaryAction = options.secondaryAction || closeModal;
  } else {
    btnModalSecundario.classList.add("escondido");
    modalSecondaryAction = null;
  }

  modal.classList.remove("escondido");
}

function closeModal() {
  modal.classList.add("escondido");
}

function nextPhase() {
  if (phaseIndex < PHASES.length - 1) {
    phaseIndex++;
    startPhase();
  }
}

function shuffleBoardAction() {
  if (phaseFinished || moves <= 0) return;
  markInteraction();
  play(audioClick, 0.7);
  moves = Math.max(0, moves - 1);
  shuffleOnlyPieces();
  ensureBoardReady();
  renderBoard();
  updateUI();
  if (moves <= 0) checkEndByMoves(); else scheduleHints();
}

function getPieceEl(index) {
  return document.querySelector(`.peca[data-index="${index}"]`);
}

btnAudio.addEventListener("click", toggleAudio);
btnReiniciar.addEventListener("click", () => { play(audioClick, 0.7); resetGame(); });
btnEmbaralhar.addEventListener("click", shuffleBoardAction);
btnProximaFase.addEventListener("click", nextPhase);
btnModalPrincipal.addEventListener("click", () => { if (modalPrimaryAction) modalPrimaryAction(); else closeModal(); });
btnModalSecundario.addEventListener("click", () => { if (modalSecondaryAction) modalSecondaryAction(); else closeModal(); });
boosterBombaBtn.addEventListener("click", () => selectBooster("bomb"));
boosterFogueteBtn.addEventListener("click", () => selectBooster("rocket"));
boosterPaBtn.addEventListener("click", () => selectBooster("shovel"));

resetGame();



/* ===== Integração com Álbum Dupla Exclusão Municipal ===== */
const ALBUM_STORAGE_KEY_MUNICIPAL = "album_dupla_exclusao_municipal_36_v1";
let tentativaPremiadaMunicipal = false;

function carregarAlbumMunicipal(){
  try{
    return JSON.parse(localStorage.getItem(ALBUM_STORAGE_KEY_MUNICIPAL)) || {album:{}, pacotes:2, repetidas:0, historico:[], simuladosFeitos:[]};
  }catch(e){
    return {album:{}, pacotes:2, repetidas:0, historico:[], simuladosFeitos:[]};
  }
}
function salvarAlbumMunicipal(e){ localStorage.setItem(ALBUM_STORAGE_KEY_MUNICIPAL, JSON.stringify(e)); }
function regAlbumMunicipal(e,num){
  const id = "fig-"+String(num).padStart(2,"0");
  if(!e.album) e.album = {};
  if(!e.album[id]) e.album[id]={quantidade:0,colada:false};
  return e.album[id];
}
function escolherPremioMunicipal(e){
  const faltando=[];
  for(let n=1;n<=36;n++){
    const r=regAlbumMunicipal(e,n);
    if(!r.colada && Number(r.quantidade||0)===0) faltando.push(n);
  }
  return faltando.length ? faltando[Math.floor(Math.random()*faltando.length)] : Math.floor(Math.random()*36)+1;
}
function liberarPremioMunicipal(motivo){
  if(tentativaPremiadaMunicipal) return null;
  tentativaPremiadaMunicipal = true;
  const e = carregarAlbumMunicipal();
  const n = escolherPremioMunicipal(e);
  const r = regAlbumMunicipal(e,n);
  if(Number(r.quantidade||0)>0 || r.colada) e.repetidas = Number(e.repetidas||0)+1;
  r.quantidade = Number(r.quantidade||0)+1;
  if(!Array.isArray(e.historico)) e.historico=[];
  e.historico.push({tipo:"game", motivo, numero:n, data:new Date().toISOString()});
  salvarAlbumMunicipal(e);
  mostrarPremioMunicipal(n);
  return n;
}
function mostrarPremioMunicipal(n){
  const n2 = String(n).padStart(2,"0");
  let box = document.getElementById("premioAlbumMunicipal");
  if(!box){
    box = document.createElement("div");
    box.id = "premioAlbumMunicipal";
    box.className = "premio-album-municipal";
    document.body.appendChild(box);
  }
  box.innerHTML = `
    <div class="premio-album-box">
      <h2>Figurinha desbloqueada!</h2>
      <img src="../figurinhas/${n2}.webp" alt="Figurinha ${n2}">
      <p>Você ganhou a figurinha <b>${n2}</b>.</p>
      <p>Ela já foi enviada para o álbum. Volte e clique em colar.</p>
      <button onclick="window.location.href='../index.html'">Voltar ao álbum</button>
      <button onclick="document.getElementById('premioAlbumMunicipal').remove()">Continuar jogando</button>
    </div>
  `;
}



/* ===== AJUSTE MUNICIPAL: GAME GANHA 1 PACOTE POR FASE/TENTATIVA ===== */
const ALBUM_STORAGE_KEY_MUNICIPAL_PACOTE = "album_dupla_exclusao_municipal_36_v1";
let pacotePremiadoMunicipal = false;

function carregarAlbumPacoteMunicipal(){
  try{
    return JSON.parse(localStorage.getItem(ALBUM_STORAGE_KEY_MUNICIPAL_PACOTE)) || {album:{}, pacotes:2, repetidas:0, historico:[], simuladosFeitos:[]};
  }catch(e){
    return {album:{}, pacotes:2, repetidas:0, historico:[], simuladosFeitos:[]};
  }
}
function salvarAlbumPacoteMunicipal(e){
  localStorage.setItem(ALBUM_STORAGE_KEY_MUNICIPAL_PACOTE, JSON.stringify(e));
}
function liberarPacoteGameMunicipal(motivo="fase concluída"){
  if(pacotePremiadoMunicipal) return;
  pacotePremiadoMunicipal = true;
  const e = carregarAlbumPacoteMunicipal();
  e.pacotes = Number(e.pacotes || 0) + 1;
  if(!Array.isArray(e.historico)) e.historico = [];
  e.historico.push({tipo:"game-pacote", motivo, pacotes:1, data:new Date().toISOString()});
  salvarAlbumPacoteMunicipal(e);
  mostrarPacoteGameMunicipal();
}
function mostrarPacoteGameMunicipal(){
  let box = document.getElementById("premioAlbumMunicipal");
  if(!box){
    box = document.createElement("div");
    box.id = "premioAlbumMunicipal";
    box.className = "premio-album-municipal";
    document.body.appendChild(box);
  }
  box.innerHTML = `
    <div class="premio-album-box">
      <h2>Pacote desbloqueado!</h2>
      <p>Você ganhou <b>1 pacote</b> para abrir no álbum.</p>
      <p>Volte ao álbum e clique em <b>Abrir Pacote</b>.</p>
      <button onclick="window.location.href='../index.html'">Retornar ao álbum</button>
      <button onclick="document.getElementById('premioAlbumMunicipal').remove(); pacotePremiadoMunicipal=false;">Continuar jogando</button>
    </div>
  `;
}

/* Tenta conectar com modais de fim/fase do game enviado */
(function(){
  const antigoOpenModal = window.openModal;
  if(typeof antigoOpenModal === "function"){
    window.openModal = function(title, text, options){
      if(/fim|fase|venc|conclu|parab/i.test(String(title)+" "+String(text))){
        liberarPacoteGameMunicipal(title || "fase concluída");
      }
      return antigoOpenModal.apply(this, arguments);
    }
  }
  const antigoAlert = window.alert;
  window.alert = function(msg){
    if(/fim|fase|venc|conclu|parab/i.test(String(msg))){
      liberarPacoteGameMunicipal(String(msg));
    }
    return antigoAlert.apply(this, arguments);
  }
})();
