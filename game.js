// -----------------------------
// ESTADO DEL JUEGO
// -----------------------------
let state = {
    scene: "subterraneo",
    obsesion: 0,
    obediencia: 0,
    retardo: 0,
    literal: 0
  };

// -----------------------------
// MEMORIA DEL JUGADOR
// -----------------------------
let memory = {
  words: {},        // palabra -> conteo
  lastWords: [],    // últimas palabras usadas
  echoes: []        // palabras que la Presencia puede usar
};

  
let lastIntent = null;
let repetitionCount = 0;

   
  
  // -----------------------------
  // TEXTO INICIAL
  // -----------------------------
  const scenes = {
    subterraneo: `
  El aire es pesado.
  El suelo está húmedo.
  La luz parpadea sin ritmo.
  No sabes cuánto tiempo llevas aquí.
  `
  };
  
  // -----------------------------
  // FRASES DE LA PRESENCIA
  // -----------------------------
  const presence = {
    obsesion: [
      "No era necesario.",
      "Insistir no lo hizo distinto.",
      "Esto no cambió nada."
    ],
    obediencia: [
      "No era la forma.",
      "Eso ya había terminado."
    ],
    retardo: [
      "Aquí alguien esperó más de lo que debía.",
      "No todos se fueron cuando pudieron."
    ],
    literal: [
      "Algunas puertas no se abren para salir."
    ]
  };


  // INTENCIONES //

  const intents = {
    exploracion: ["explor", "busc", "mir", "exam", "recorr", "revis"],
    fuerza: ["forz", "romp", "golp", "empuj"],
    espera: ["esper", "qued", "deten", "par"],
    obediencia: ["obedec", "segu", "acept"],
    reflexion: ["pens", "entend", "record"]
  };
  
  const negations = ["no", "nunca", "jamás", "jamas", "ni"];

  
  // -----------------------------
  // INICIO
  // -----------------------------
  const textBox = document.getElementById("text");
  const input = document.getElementById("input");
  const button = document.getElementById("actionBtn");
  
  textBox.innerHTML = scenes[state.scene];
  
  // -----------------------------
  // EVENTO PRINCIPAL
  // -----------------------------
  button.addEventListener("click", handleAction);
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") handleAction();
  });
  
  // -----------------------------
  // LÓGICA DEL JUEGO
  // -----------------------------
  function handleAction() {
    const raw = input.value.trim();
    input.value = "";
  
    if (raw === "" || raw === "..." || raw.toLowerCase() === "silencio") {
      handleSilence();
      return;
    }
  
    const action = normalizeText(raw);
    analyzeAction(action);
    render();
  }
  
  function speakToPlayer() {
    if (memory.echoes.length === 0) return;
  
    const word = memory.echoes[Math.floor(Math.random() * memory.echoes.length)];
    textBox.innerHTML += `
      <br><span style="opacity:0.75; font-style:italic">
      Dijiste "${word}".
      </span>`;
  }

  function lieWithWords() {

    // activar distorsión
    document.body.classList.add("lie");
  
    // quitarla sola (como un espasmo)
    setTimeout(() => {
      document.body.classList.remove("lie");
    }, 600);
  
    // mentir con palabras del jugador
    const word =
      memory.echoes[Math.floor(Math.random() * memory.echoes.length)];
  
    const lies = [
      `"${word}" ya fue usado correctamente.`,
      `Eso no es "${word}".`,
      `"${word}" te alejó más.`,
      `Creíste entender "${word}".`,
      `"${word}" no era tuyo.`
    ];
  
    const phrase = lies[Math.floor(Math.random() * lies.length)];
  
    textBox.innerHTML += `
      <br><span class="presence">
      ${phrase}
      </span>`;
  }
  

  function showPresence(type) {
    const lines = presence[type];
    if (!lines) return;
  
    const line = lines[Math.floor(Math.random() * lines.length)];
    textBox.innerHTML += `
      <br><span style="opacity:0.7">
      ${line}
      </span>`;
  }
  
  function handleSilence() {
    state.retardo++;
    textBox.innerHTML += `
      <br><span style="opacity:0.5">
      Permaneces en silencio.
      </span>`;
  }
  
  
 // DETECTA INTENCION// linea 49

 function detectNegation(action) {
  return negations.some(neg => action.includes(` ${neg} `) || action.startsWith(neg + " "));
}


 function detectIntent(action, keywords) {
  return keywords.some(word => action.includes(word));
}

  // -----------------------------
  // ANALIZADOR SIMPLE
  // -----------------------------

  // QUITA TILDES//

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
  
  function analyzeAction(action) {

    // -----------------------------
    // MEMORIA DE PALABRAS
    // -----------------------------
    const words = extractWords(action);

    function extractWords(text) {
      return text
        .split(" ")
        .map(w => w.trim())
        .filter(w => w.length > 2);
    }
    
  
    words.forEach(word => {
      memory.words[word] = (memory.words[word] || 0) + 1;
  
      if (memory.words[word] === 2) {
        memory.echoes.push(word); // palabra empieza a obsesionar
      }
    });
  
    memory.lastWords = words.slice(-3);
  
    // -----------------------------
    // NEGACIÓN
    // -----------------------------
    const hasNegation = detectNegation(action);
  
    // -----------------------------
    // DETECTAR INTENCIÓN
    // -----------------------------
    let currentIntent = null;
  
    if (detectIntent(action, intents.exploracion)) currentIntent = "exploracion";
    else if (detectIntent(action, intents.espera)) currentIntent = "espera";
    else if (detectIntent(action, intents.obediencia)) currentIntent = "obediencia";
    else if (detectIntent(action, intents.fuerza)) currentIntent = "fuerza";
    else if (detectIntent(action, intents.reflexion)) currentIntent = "reflexion";
  
    // -----------------------------
    // REPETICIÓN
    // -----------------------------
    if (currentIntent && currentIntent === lastIntent) {
      repetitionCount++;
    } else {
      repetitionCount = 0;
    }
  
    lastIntent = currentIntent;
  
    // -----------------------------
    // RESPUESTAS POR INTENCIÓN
    // -----------------------------
    if (currentIntent === "exploracion") {
      state.obsesion++;
      if (hasNegation) state.obsesion++;
  
      textBox.innerHTML += `<br>Exploras, pero nada se ordena.`;
      showPresence("obsesion");
    }
  
    else if (currentIntent === "fuerza") {
      state.obsesion += 2;
      textBox.innerHTML += `<br>La fuerza no responde.`;
      showPresence("obsesion");
    }
  
    else if (currentIntent === "obediencia") {
      state.obediencia++;
      textBox.innerHTML += `<br>Sigues una instrucción que no recuerdas haber recibido.`;
      showPresence("obediencia");
    }
  
    else if (currentIntent === "espera") {
      state.retardo++;
      textBox.innerHTML += `<br>El tiempo no se detiene aquí.`;
      showPresence("retardo");
    }
  
    else if (currentIntent === "reflexion") {
      state.literal++;
      textBox.innerHTML += `<br>Pensar no aclara este lugar.`;
      showPresence("literal");
    }
  
    else {
      textBox.innerHTML += `<br>No ocurre nada inmediato.`;
    }
  
    // -----------------------------
    // RESPUESTA A REPETICIÓN
    // -----------------------------
    if (repetitionCount >= 2) {
      textBox.innerHTML += `
      <br><span style="opacity:0.6">
      Lo intentas otra vez. No es distinto.
      </span>`;
    }
  
    // -----------------------------
    // LA PRESENCIA HABLA (O CALLA)
    // -----------------------------
    if (Math.random() < 0.35 || repetitionCount >= 2) {
      speakToPlayer();
    }
  
    // -----------------------------
    // FINAL AUTOMÁTICO (FALSO)
    // -----------------------------
    checkAutoEnding();
  }
  
  function checkAutoEnding() {
    if (state.obsesion >= 6 && repetitionCount >= 3) {
      triggerFalseEnding();
    }
  }
  
  
  function triggerFalseEnding() {
    textBox.innerHTML += `
    <br><br>
    <strong>
    Todo se detiene.
    </strong><br>
    Has hecho todo lo posible.<br>
    <span style="opacity:0.6">
    Eso no era suficiente.
    </span>
    `;
    
    input.disabled = true;
    button.disabled = true;
  }
  
 


  // -----------------------------
  // RENDER
  // -----------------------------
  function render() {
    // Aquí luego conectamos música, escenas, finales
  }
  