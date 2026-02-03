// -----------------------------
// ESTADO DEL JUEGO
// -----------------------------
let state = {
  scene: "subterraneo",
  visited: {
    subterraneo: true
  },
  obsesion: 0,
  obediencia: 0,
  retardo: 0,
  literal: 0
};

let calmProgress = 0;
let sceneBlocked = false;

// -----------------------------
// MEMORIA DEL JUGADOR
// -----------------------------
let memory = {
  words: {},
  lastWords: [],
  echoes: []
};

let lastIntent = null;
let repetitionCount = 0;

// -----------------------------
// ESCENAS
// -----------------------------
const scenes = {
  subterraneo: `
El aire es pesado.
El suelo está húmedo.
La luz parpadea sin ritmo.

No sabes cuánto tiempo llevas aquí.
No recuerdas haber llegado.
`,

  transicion: `
No estás donde estabas.

El aire ya no pesa igual,
pero sigues respirándolo con cuidado.

Algo cambió.
No sabes qué hiciste para que ocurriera.
`,

  contradiccion: `
Las paredes parecen más lejanas,
aunque el espacio es el mismo.

Cada acción se siente correcta
y equivocada al mismo tiempo.
`,

  inversion: `
Aquí, esperar produce ruido.
Pensar deja marcas.
Obedecer altera el entorno.
`,

  presencia: `
No hay lugar aquí.

Ya no estás solo,
aunque nunca lo estuviste.
`
};

// -----------------------------
// REGLAS DE ESCENA
// -----------------------------
const sceneRules = {
  subterraneo: { calmNeeded: 5, next: "transicion" },
  transicion: { calmNeeded: 4, next: "contradiccion" },
  contradiccion: { calmNeeded: 3, next: "inversion" },
  inversion: { calmNeeded: 3, next: "presencia" }
};

// -----------------------------
// PRESENCIA
// -----------------------------
const presence = {
  obsesion: ["No era necesario.", "Esto no cambió nada."],
  obediencia: ["No era la forma."],
  retardo: ["Aquí alguien esperó demasiado."],
  literal: ["Pensar no abre puertas."]
};

// -----------------------------
// INTENCIONES
// -----------------------------
const intents = {
  exploracion: [
    "explor","busc","mir","observ","examin","recorr","revis",
    "investig","inspeccion","verif","escudriñ","husme",
    "rastre","indag","sonde","oje","detall",
    "curiose","averigu","analiz","reconoc","patrull",
    "registr","map"
  ],

  fuerza: [
    "forz","romp","golp","empuj","pate","arranc","destroz",
    "quebr","revent","viol","aplast","impact",
    "sacud","estrell","agarr","tirone","dobl",
    "torc","rasg","part","machac","clav",
    "presion","hund"
  ],

  espera: [
    "esper","qued","deten","par","aguant","resist",
    "paus","inmov","permanec","repos","contempl",
    "dej","silenc","call","quiet",
    "suspend","retard","dilat","posterg","aplaz",
    "demor","estanc","fren","paraliz"
  ],

  obediencia: [
    "obedec","segu","acept","acat","cumpl","somet",
    "ced","rend","asent","consent",
    "permit","respet","ejecut","aline",
    "acced","dobleg","clausur","disciplin",
    "subordin","conform","ajust","deleg",
    "impos"
  ],

  reflexion: [
    "pens","reflexion","record","entend","analiz",
    "medit","consider","evalu","razon","dud",
    "cuestion","interpret","comprend","imagin",
    "intu","discern","contempl","ponder",
    "examin","replante","asoci",
    "memoriz","visualiz","proyect"
  ]
};


const negations = ["no", "nunca", "jamás", "jamas", "ni"];

// -----------------------------
// DOM
// -----------------------------
const textBox = document.getElementById("text");
const input = document.getElementById("input");
const button = document.getElementById("actionBtn");

textBox.innerHTML = scenes[state.scene];

// -----------------------------
// EVENTOS
// -----------------------------
button.addEventListener("click", handleAction);
input.addEventListener("keypress", e => {
  if (e.key === "Enter") handleAction();
});

// -----------------------------
// UTILIDADES
// -----------------------------
function normalizeText(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function extractWords(text) {
  return text.split(" ").map(w => w.trim()).filter(w => w.length > 2);
}

function detectIntent(action, keywords) {
  return keywords.some(k => action.includes(k));
}

// -----------------------------
// LÓGICA PRINCIPAL
// -----------------------------
function handleAction() {
  const raw = input.value.trim();
  input.value = "";

  if (raw === "" || raw === "..." || raw === "silencio") {
    registerCalmAction();
    textBox.innerHTML += `<br><span style="opacity:.5">Permaneces en silencio.</span>`;
    return;
  }

  analyzeAction(normalizeText(raw));
  render();
}
  if (!lastIntent) registerCalmAction();



function analyzeAction(action) {
  const words = extractWords(action);

  words.forEach(w => {
    memory.words[w] = (memory.words[w] || 0) + 1;
    if (memory.words[w] === 2) memory.echoes.push(w);
  });

  let intent = null;

for (const key in intents) {
  if (detectIntent(action, intents[key])) {
    intent = key;
    break; // ← CLAVE
  }
}


  if (intent === lastIntent) repetitionCount++;
  else repetitionCount = 0;
  lastIntent = intent;

  if (intent === "espera") {
  textBox.innerHTML += `<br>El tiempo no se detiene aquí.`;
  registerCalmAction();
}
else if (intent) {
  textBox.innerHTML += `<br>No ocurre nada inmediato.`;
}
else {
  textBox.innerHTML += `
    <br><span style="opacity:.6">
    El lugar no reacciona a eso.
    </span>`;
}

}

// -----------------------------
// AVANCE DE ESCENA
// -----------------------------
function registerCalmAction() {
  calmProgress++;
  const rule = sceneRules[state.scene];

  if (rule && calmProgress >= rule.calmNeeded) {
    advanceScene();
  }
}

function advanceScene() {
  calmProgress = 0;
  state.scene = sceneRules[state.scene].next;

  textBox.innerHTML += `
  <br><br>
  <strong>De pronto cambia la intensidad de la luz y se torna todo diferente.</strong>
  <br>
  <span style="opacity:.7">${scenes[state.scene]}</span>
  `;

  state.visited[state.scene] = true;
}

// -----------------------------
// RENDER
// -----------------------------
function render() {
  // intencionalmente vacío: el flujo ya escribe
}
