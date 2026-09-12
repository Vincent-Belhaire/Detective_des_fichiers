(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const screens = $$(".screen");
  const welcomeScreen = $("#welcomeScreen");
  const challengeScreen = $("#challengeScreen");
  const finalScreen = $("#finalScreen");
  const missionBar = $("#missionBar");
  const arena = $("#challengeArena");
  const feedback = $("#feedback");
  const nextButton = $("#nextButton");
  const helpDialog = $("#helpDialog");
  const propertiesDialog = $("#propertiesDialog");
  const toast = $("#toast");

  const pointsPerChallenge = [12, 12, 12, 12, 12, 12, 12, 16];
  const challengeInfo = [
    {
      eyebrow: "DÉFI 01 · IDENTITÉ",
      title: "Carte d’identité des fichiers",
      label: "GLISSE ET DÉPOSE",
      text: "Fais glisser chaque fichier vers son bon type. Tu peux aussi cliquer sur la bonne zone.",
      color: "",
      help: "L’extension se trouve après le dernier point. <strong>.odt</strong> est un texte LibreOffice, <strong>.ods</strong> un tableur, <strong>.odp</strong> un diaporama, <strong>.pdf</strong> un document figé, et <strong>.jpg/.png</strong> des images."
    },
    {
      eyebrow: "DÉFI 02 · DÉCRYPTAGE",
      title: "Nom, extension ou chemin&nbsp;?",
      label: "OBSERVE ET CHOISIS",
      text: "Identifie précisément la partie demandée dans la carte du fichier.",
      color: "purple-card",
      help: "Dans <strong>affiche_planetes.odt</strong>, le nom est <strong>affiche_planetes</strong> et l’extension est <strong>.odt</strong>. Le chemin indique tous les dossiers à parcourir pour atteindre le fichier."
    },
    {
      eyebrow: "DÉFI 03 · EXPLORATEUR",
      title: "La brigade du tri",
      label: "CLIQUE SUR LES COLONNES",
      text: "Dans le faux Explorateur, clique sur l’en-tête qui permet d’effectuer le tri demandé.",
      color: "teal-card",
      help: "Chaque colonne sert de critère. <strong>Nom</strong> classe par ordre alphabétique, <strong>Date</strong> par modification, <strong>Taille</strong> par poids et <strong>Type</strong> regroupe les formats."
    },
    {
      eyebrow: "DÉFI 04 · PROPRIÉTÉS",
      title: "La fiche secrète",
      label: "EXAMINE PUIS RÉPONDS",
      text: "Ouvre la fenêtre Propriétés du fichier, relève les informations puis réponds aux questions.",
      color: "blue-card",
      help: "Dans l’Explorateur Windows, un clic droit sur un fichier puis <strong>Propriétés</strong> affiche notamment son type, sa taille, son emplacement et sa date de modification."
    },
    {
      eyebrow: "DÉFI 05 · RECROUPEMENT",
      title: "Retrouve le bon fichier",
      label: "CROISE LES INDICES",
      text: "Lis tous les indices avant de sélectionner le seul fichier qui les respecte.",
      color: "",
      help: "Élimine les fichiers un indice après l’autre : d’abord le type ou l’extension, puis la date, la taille et enfin l’emplacement."
    },
    {
      eyebrow: "DÉFI 06 · RECHERCHE",
      title: "La loupe et les jokers",
      label: "SAISIS LA RECHERCHE",
      text: "Tape le mot-clé ou le joker demandé dans la barre de recherche du faux Explorateur.",
      color: "purple-card",
      help: "Le signe <strong>*</strong> remplace un ou plusieurs caractères. Ainsi, <strong>*.pdf</strong> signifie : « tous les fichiers dont l’extension est .pdf »."
    },
    {
      eyebrow: "DÉFI 07 · DOSSIER CLASSÉ",
      title: "Le fichier mystère",
      label: "ENQUÊTE COMPLÈTE",
      text: "Combine le nom, le type, la date, la taille et le chemin pour résoudre l’affaire.",
      color: "coral-card",
      help: "Fais une mini-checklist. Un fichier doit respecter <strong>tous</strong> les indices, pas seulement deux ou trois. Vérifie en dernier son chemin complet."
    },
    {
      eyebrow: "BONUS · ENQUÊTE EXPRESS",
      title: "45 secondes chrono&nbsp;!",
      label: "RÉPONDS SANS TRAÎNER",
      text: "Réponds à huit questions rapides avant la fin du chronomètre. Chaque bonne réponse vaut 2 points.",
      color: "coral-card",
      help: "Reste méthodique même quand le temps file : repère le dernier point pour l’extension et lis les chemins de gauche à droite."
    }
  ];

  const state = {
    current: 0,
    score: 0,
    scores: Array(8).fill(0),
    stages: Array(8).fill(0),
    done: Array(8).fill(false),
    timerId: null,
    timeLeft: 45,
    expressStarted: false,
    propertiesViewed: false
  };

  const files = [
    { name: "bilan_constellations.odt", ext: "odt", type: "Document Texte", size: 86, date: "18/02/2026", iso: "2026-02-18", folder: "Documents" },
    { name: "mission_orbite.pdf", ext: "pdf", type: "Document PDF", size: 428, date: "12/02/2026", iso: "2026-02-12", folder: "Documents" },
    { name: "mesures_cratere.ods", ext: "ods", type: "Feuille de calcul", size: 64, date: "21/01/2026", iso: "2026-01-21", folder: "Documents" },
    { name: "diaporama_etoiles.odp", ext: "odp", type: "Présentation", size: 1480, date: "03/02/2026", iso: "2026-02-03", folder: "À rendre" },
    { name: "photo_nebuleuse.jpg", ext: "jpg", type: "Image JPEG", size: 720, date: "28/01/2026", iso: "2026-01-28", folder: "Images" },
    { name: "schema_fusee.png", ext: "png", type: "Image PNG", size: 315, date: "15/02/2026", iso: "2026-02-15", folder: "Images" }
  ];

  function showScreen(target) {
    screens.forEach(screen => screen.classList.toggle("is-active", screen === target));
    missionBar.hidden = target !== challengeScreen;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setFeedback(message, type = "") {
    feedback.className = `feedback${type ? ` ${type}` : ""}`;
    feedback.innerHTML = message;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 1600);
  }

  function updateMissionBar() {
    const percent = Math.round((state.done.filter(Boolean).length / 8) * 100);
    $("#missionCount").textContent = `Défi ${state.current + 1} sur 8`;
    $("#scoreValue").textContent = state.score;
    $("#progressFill").style.width = `${percent}%`;
    $(".progress-track").setAttribute("aria-valuenow", String(percent));
  }

  function award(points) {
    state.score += points;
    state.scores[state.current] += points;
    updateMissionBar();
    showToast(`Bonne piste ! +${points} points`);
  }

  function completeChallenge(message) {
    state.done[state.current] = true;
    nextButton.disabled = false;
    nextButton.textContent = state.current === 7 ? "Voir mon bilan →" : "Défi suivant →";
    setFeedback(message, "success");
  }

  function renderChallenge() {
    clearTimer();
    const info = challengeInfo[state.current];
    $("#challengeEyebrow").innerHTML = info.eyebrow;
    $("#challengeTitle").innerHTML = info.title;
    $("#instructionNumber").textContent = String(state.current + 1);
    $("#instructionLabel").textContent = info.label;
    $("#instructionText").innerHTML = info.text;
    $("#instructionCard").className = `instruction-card ${info.color}`.trim();
    nextButton.disabled = !state.done[state.current];
    nextButton.textContent = state.current === 7 ? "Voir mon bilan →" : "Défi suivant →";
    setFeedback(state.done[state.current] ? "Défi déjà résolu. Tu peux poursuivre la mission." : "Observe les indices, puis mène l’enquête.");
    updateMissionBar();
    [renderExtensions, renderIdentity, renderSort, renderProperties, renderClues, renderSearch, renderMystery, renderExpress][state.current]();
  }

  function renderExtensions() {
    const rounds = [
      ["compte_rendu.odt", "odt"],
      ["carte_lunaire.png", "image"],
      ["tableau_mesures.ods", "ods"],
      ["consignes.pdf", "pdf"],
      ["expose_planetes.odp", "odp"],
      ["photo_satellite.jpg", "image"]
    ];
    const typeLabels = [
      ["odt", "📝", "Texte LibreOffice", ".odt"],
      ["pdf", "📕", "Document PDF", ".pdf"],
      ["image", "🖼️", "Image", ".jpg ou .png"],
      ["ods", "▦", "Tableur LibreOffice", ".ods"],
      ["odp", "▤", "Diaporama LibreOffice", ".odp"]
    ];
    const stage = Math.min(state.stages[0], rounds.length - 1);
    const current = rounds[stage];
    arena.innerHTML = `
      <div class="arena arena-pad">
        <div class="arena-top"><span class="round-pill">CARTE ${Math.min(stage + 1, rounds.length)} / ${rounds.length}</span><span class="mini-progress">${state.stages[0]} association(s) réussie(s)</span></div>
        <div class="extension-layout">
          <div class="file-card draggable-file" draggable="true" tabindex="0" data-type="${current[1]}" aria-label="Fichier ${current[0]}, à déplacer">
            <div class="file-card__icon">${current[0].split(".").pop().toUpperCase()}</div>
            <strong>${current[0]}</strong>
            <small>Fais-moi glisser →</small>
          </div>
          <div class="drop-grid" aria-label="Types de fichiers">
            ${typeLabels.map(type => `<button class="type-drop" type="button" data-type="${type[0]}"><span class="type-icon">${type[1]}</span><span>${type[2]}<br><small>${type[3]}</small></span></button>`).join("")}
          </div>
        </div>
      </div>`;
    if (state.done[0]) return;
    const draggable = $(".draggable-file", arena);
    draggable.addEventListener("dragstart", event => event.dataTransfer.setData("text/plain", current[1]));
    $$(".type-drop", arena).forEach(zone => {
      zone.addEventListener("dragover", event => { event.preventDefault(); zone.classList.add("drag-over"); });
      zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
      zone.addEventListener("drop", event => { event.preventDefault(); zone.classList.remove("drag-over"); checkExtension(zone, event.dataTransfer.getData("text/plain")); });
      zone.addEventListener("click", () => checkExtension(zone, current[1]));
    });
  }

  function checkExtension(zone, answer) {
    if (zone.dataset.type !== answer) {
      zone.classList.add("wrong");
      setFeedback("Pas tout à fait. Regarde les lettres placées après le dernier point.", "error");
      window.setTimeout(() => zone.classList.remove("wrong"), 650);
      return;
    }
    zone.classList.add("correct");
    award(2);
    state.stages[0]++;
    if (state.stages[0] >= 6) {
      completeChallenge("Toutes les extensions sont identifiées. Tu sais reconnaître les principaux types de fichiers.");
      return;
    }
    setFeedback("Bien vu ! L’extension révèle le type du fichier.", "success");
    window.setTimeout(renderExtensions, 480);
  }

  function renderIdentity() {
    const questions = [
      { q: "Quelle partie est l’extension ?", answers: ["affiche_planetes", ".odt", "P:\\Documents\\TICE", "Document texte"], correct: 1 },
      { q: "Quel est le nom du fichier, sans l’extension ?", answers: ["affiche_planetes", ".odt", "Documents", "P:"], correct: 0 },
      { q: "Quel élément est le chemin du dossier ?", answers: [".odt", "Document texte", "P:\\Documents\\TICE\\Documents", "affiche_planetes"], correct: 2 },
      { q: "Quel est le type du fichier ?", answers: ["Documents", "P:", "affiche_planetes", "Document texte LibreOffice"], correct: 3 }
    ];
    const stage = Math.min(state.stages[1], questions.length - 1);
    const item = questions[stage];
    arena.innerHTML = `
      <div class="arena identity-board">
        <div class="arena-top"><span class="round-pill">INDICE ${Math.min(stage + 1, 4)} / 4</span><span class="mini-progress">Nom ≠ extension ≠ chemin</span></div>
        <div class="evidence-file">
          <p class="evidence-path">📁 P:\\Documents\\TICE\\Documents</p>
          <div class="filename-anatomy"><span class="name-zone">affiche_planetes</span><span class="extension-zone">.odt</span></div>
        </div>
        <h2>${item.q}</h2>
        <div class="identity-choices">${item.answers.map((answer, index) => `<button class="answer-button" type="button" data-answer="${index}">${answer}</button>`).join("")}</div>
      </div>`;
    if (state.done[1]) return;
    $$(".answer-button", arena).forEach(button => button.addEventListener("click", () => {
      const chosen = Number(button.dataset.answer);
      if (chosen !== item.correct) {
        button.classList.add("wrong");
        setFeedback("Ce n’est pas cet élément. Reprends la carte d’identité depuis la gauche.", "error");
        return;
      }
      button.classList.add("correct");
      award(3);
      state.stages[1]++;
      if (state.stages[1] >= questions.length) completeChallenge("Bravo : tu distingues le nom, l’extension, le type et le chemin.");
      else window.setTimeout(renderIdentity, 450);
    }));
  }

  function explorerMarkup(list, selectable = false, searchValue = "") {
    return `
      <div class="explorer-titlebar"><span>📁 Explorateur de fichiers — TICE</span><span class="window-controls">— □ ×</span></div>
      <div class="explorer-toolbar">
        <div class="breadcrumb"><span>Ce PC</span><span>P:</span><span>Documents</span><span>TICE</span></div>
        <input class="search-box" aria-label="Rechercher dans TICE" placeholder="Rechercher dans TICE" value="${searchValue}">
      </div>
      <div class="explorer-body">
        <nav class="folder-tree" aria-label="Arborescence des dossiers">
          <button class="tree-item" type="button">▾ 📁 P:</button>
          <div class="tree-sub">
            <button class="tree-item active" type="button">▾ 📁 Documents</button>
            <button class="tree-item active" type="button">▾ 📁 TICE</button>
            <button class="tree-item" type="button">📁 Documents</button>
            <button class="tree-item" type="button">📁 Images</button>
            <button class="tree-item" type="button">📁 À rendre</button>
          </div>
        </nav>
        <div class="file-pane">
          <table class="file-table">
            <thead><tr>
              <th><button type="button" data-sort="name">Nom</button></th>
              <th><button type="button" data-sort="date">Modifié le</button></th>
              <th><button type="button" data-sort="type">Type</button></th>
              <th><button type="button" data-sort="size">Taille</button></th>
            </tr></thead>
            <tbody>${list.map((file, index) => `<tr class="${selectable ? "selectable" : ""}" data-file="${file.name}" data-index="${index}"><td class="file-name" data-ext="${file.ext}">${file.name}</td><td>${file.date}</td><td>${file.type}</td><td>${file.size >= 1000 ? (file.size / 1000).toFixed(2).replace(".", ",") + " Mo" : file.size + " Ko"}</td></tr>`).join("")}</tbody>
          </table>
        </div>
      </div>`;
  }

  function renderSort() {
    const tasks = [
      { label: "Classe les fichiers par nom (A → Z).", key: "name", sort: (a,b) => a.name.localeCompare(b.name, "fr") },
      { label: "Affiche les fichiers les plus récents en premier.", key: "date", sort: (a,b) => b.iso.localeCompare(a.iso) },
      { label: "Affiche les fichiers les plus légers en premier.", key: "size", sort: (a,b) => a.size - b.size },
      { label: "Regroupe les fichiers par type (A → Z).", key: "type", sort: (a,b) => a.type.localeCompare(b.type, "fr") }
    ];
    const stage = Math.min(state.stages[2], tasks.length - 1);
    const task = tasks[stage];
    const shownFiles = stage > 0 ? [...files].sort(tasks[stage - 1].sort) : files;
    arena.innerHTML = `<div class="arena explorer">${explorerMarkup(shownFiles)}<div class="sort-task"><strong>Ordre demandé :</strong> <span class="sort-status">${task.label}</span></div></div>`;
    if (state.done[2]) return;
    $$('[data-sort]', arena).forEach(button => button.addEventListener("click", () => {
      if (button.dataset.sort !== task.key) {
        setFeedback(`La colonne « ${button.textContent} » ne permet pas ce tri. Cherche l’en-tête qui correspond exactement à l’indice.`, "error");
        return;
      }
      award(3);
      state.stages[2]++;
      const sorted = [...files].sort(task.sort);
      $("tbody", arena).innerHTML = sorted.map(file => `<tr><td class="file-name" data-ext="${file.ext}">${file.name}</td><td>${file.date}</td><td>${file.type}</td><td>${file.size >= 1000 ? "1,48 Mo" : file.size + " Ko"}</td></tr>`).join("");
      if (state.stages[2] >= tasks.length) completeChallenge("Mission tri accomplie : tu sais choisir le bon critère dans l’Explorateur.");
      else { setFeedback("Tri réussi ! Passe au critère suivant.", "success"); window.setTimeout(renderSort, 650); }
    }));
  }

  function renderProperties() {
    const questions = [
      { q: "Quel est le type du fichier ?", answers: ["Image PNG", "Document PDF", "Présentation"], correct: 1 },
      { q: "Quelle est sa taille ?", answers: ["428 Ko", "64 Ko", "1,48 Mo"], correct: 0 },
      { q: "Dans quel dossier se trouve-t-il ?", answers: ["Images", "À rendre", "Documents"], correct: 2 },
      { q: "Quand a-t-il été modifié ?", answers: ["12/02/2026", "18/02/2026", "21/01/2026"], correct: 0 }
    ];
    const stage = Math.min(state.stages[3], questions.length - 1);
    const item = questions[stage];
    arena.innerHTML = `
      <div class="arena properties-launch">
        <div class="arena-top"><span class="round-pill">QUESTION ${Math.min(stage + 1,4)} / 4</span><span class="mini-progress">Clic droit → Propriétés</span></div>
        <div class="selected-file-card">
          <span class="big-icon">📕</span>
          <span><strong>mission_orbite.pdf</strong><br><small>P:\\Documents\\TICE\\Documents</small></span>
          <button class="secondary-button" id="openProperties" type="button">Ouvrir Propriétés</button>
        </div>
        <div class="property-question">
          <p>${item.q}</p>
          <div class="compact-answers">${item.answers.map((answer,index) => `<button type="button" data-answer="${index}" ${state.propertiesViewed ? "" : "disabled"}>${answer}</button>`).join("")}</div>
        </div>
      </div>`;
    $("#openProperties").addEventListener("click", () => {
      state.propertiesViewed = true;
      $$('[data-answer]', arena).forEach(button => button.disabled = false);
      propertiesDialog.showModal();
    });
    if (state.done[3]) return;
    $$('[data-answer]', arena).forEach(button => button.addEventListener("click", () => {
      const chosen = Number(button.dataset.answer);
      if (chosen !== item.correct) {
        button.classList.add("wrong");
        setFeedback("Cette information ne correspond pas à la fiche Propriétés. Ouvre-la et vérifie la bonne ligne.", "error");
        return;
      }
      button.classList.add("correct");
      award(3);
      state.stages[3]++;
      if (state.stages[3] >= questions.length) completeChallenge("Tu sais lire une fiche Propriétés et vérifier les informations essentielles.");
      else window.setTimeout(renderProperties, 450);
    }));
  }

  function renderClues() {
    const cases = [
      {
        clues: ["Document PDF", "Moins de 500 Ko", "Modifié après le 01/02/2026", "Dans TICE › Documents"],
        filter: "pdf",
        candidates: [
          { ...files[1], category: "pdf" },
          { name: "guide_eclipse.pdf", type: "Document PDF", size: 610, date: "14/02/2026", folder: "Documents", category: "pdf" },
          { name: "archives_orbite.pdf", type: "Document PDF", size: 320, date: "20/01/2026", folder: "Documents", category: "pdf" },
          { ...files[0], category: "libreoffice" }
        ],
        answer: "mission_orbite.pdf"
      },
      {
        clues: ["Une image", "Extension .png", "Moins de 400 Ko", "Dans TICE › Images"],
        filter: "image",
        candidates: [
          { ...files[4], category: "image" },
          { ...files[5], category: "image" },
          { name: "carte_comete.png", type: "Image PNG", size: 530, date: "16/02/2026", folder: "Images", category: "image" },
          { ...files[2], category: "libreoffice" }
        ],
        answer: "schema_fusee.png"
      },
      {
        clues: ["Présentation LibreOffice", "Plus de 1 Mo", "Modifiée en février", "Dans TICE › À rendre"],
        filter: "presentation",
        candidates: [
          { ...files[3], category: "presentation" },
          { name: "quiz_etoiles.odp", type: "Présentation", size: 620, date: "10/02/2026", folder: "À rendre", category: "presentation" },
          { name: "diaporama_soleil.odp", type: "Présentation", size: 1720, date: "29/01/2026", folder: "À rendre", category: "presentation" },
          { ...files[1], category: "pdf" }
        ],
        answer: "diaporama_etoiles.odp"
      }
    ];
    const stage = Math.min(state.stages[4], cases.length - 1);
    const item = cases[stage];
    arena.innerHTML = `
      <div class="arena clue-board">
        <article class="clue-note">
          <span class="round-pill">DOSSIER ${Math.min(stage + 1,3)} / 3</span>
          <h2>Portrait-robot</h2>
          <ul class="clue-list">${item.clues.map(clue => `<li>${clue}</li>`).join("")}</ul>
        </article>
        <div><h2>1. Filtre, puis choisis</h2>
          <div class="filter-strip" aria-label="Filtres par type">
            <button type="button" data-filter="pdf">PDF</button><button type="button" data-filter="image">Images</button><button type="button" data-filter="presentation">Présentations</button><button type="button" data-filter="libreoffice">Autres LibreOffice</button>
          </div>
          <div class="candidate-list">
          ${item.candidates.map(file => `<button class="candidate-button" type="button" data-file="${file.name}" data-category="${file.category}" disabled><strong>${file.name}</strong><span>${file.size >= 1000 ? (file.size / 1000).toFixed(2).replace(".", ",") + " Mo" : file.size + " Ko"}</span><small>${file.type} · ${file.date}</small><small>TICE › ${file.folder}</small></button>`).join("")}
        </div></div>
      </div>`;
    if (state.done[4]) return;
    $$('[data-filter]', arena).forEach(filterButton => filterButton.addEventListener("click", () => {
      if (filterButton.dataset.filter !== item.filter) {
        filterButton.classList.add("wrong");
        setFeedback("Ce filtre masque le type recherché. Repars du premier indice.", "error");
        return;
      }
      $$('[data-filter]', arena).forEach(button => button.classList.toggle("active", button === filterButton));
      $$(".candidate-button", arena).forEach(candidate => {
        const matches = candidate.dataset.category === item.filter;
        candidate.hidden = !matches;
        candidate.disabled = !matches;
      });
      setFeedback("Bon filtre ! Il reste maintenant à comparer la taille, la date et le dossier.", "success");
    }));
    $$(".candidate-button", arena).forEach(button => button.addEventListener("click", () => {
      if (button.dataset.file !== item.answer) {
        button.classList.add("wrong");
        setFeedback("Fausse piste : au moins un indice ne correspond pas. Vérifie la taille, la date et le dossier.", "error");
        return;
      }
      button.classList.add("correct");
      award(4);
      state.stages[4]++;
      if (state.stages[4] >= cases.length) completeChallenge("Excellent recoupement : tu sais retrouver un fichier à partir de plusieurs indices.");
      else window.setTimeout(renderClues, 550);
    }));
  }

  function matchesQuery(file, query) {
    const q = query.trim().toLowerCase();
    if (q.startsWith("*.")) return file.ext === q.slice(2);
    return file.name.toLowerCase().includes(q);
  }

  function renderSearch() {
    const tasks = [
      { label: "Retrouve tous les fichiers PDF.", expected: "*.pdf", hint: "Utilise le joker * suivi de l’extension." },
      { label: "Retrouve les fichiers dont le nom contient mission.", expected: "mission", hint: "Un simple mot-clé suffit." },
      { label: "Retrouve tous les textes LibreOffice.", expected: "*.odt", hint: "Le joker * peut remplacer le nom." }
    ];
    const stage = Math.min(state.stages[5], tasks.length - 1);
    const task = tasks[stage];
    arena.innerHTML = `
      <div class="arena explorer search-lab">
        ${explorerMarkup(files)}
        <div class="search-explainer">
          <div class="arena-top"><span class="round-pill">RECHERCHE ${Math.min(stage + 1,3)} / 3</span><span class="mini-progress">${task.hint}</span></div>
          <h2>${task.label}</h2>
          <form class="search-form" id="searchForm">
            <input id="searchInput" autocomplete="off" aria-label="Ta recherche" placeholder="Exemple : *.pdf">
            <button class="primary-button" type="submit">Rechercher</button>
          </form>
          <div class="search-results" id="searchResults">Les résultats apparaîtront ici.</div>
          <p class="joker-card"><strong>Joker :</strong> <kbd>*</kbd> remplace un ou plusieurs caractères.</p>
        </div>
      </div>`;
    const toolbarInput = $(".explorer-toolbar .search-box", arena);
    toolbarInput.disabled = true;
    if (state.done[5]) return;
    $("#searchForm").addEventListener("submit", event => {
      event.preventDefault();
      const value = $("#searchInput").value.trim().toLowerCase();
      const results = files.filter(file => matchesQuery(file, value));
      $("#searchResults").innerHTML = results.length ? results.map(file => `<span class="search-result-chip">🔎 ${file.name}</span>`).join("") : "Aucun fichier trouvé.";
      if (value !== task.expected) {
        setFeedback("La recherche donne peut-être un résultat, mais elle ne correspond pas exactement à la consigne. Utilise le bon mot-clé ou le bon joker.", "error");
        return;
      }
      award(4);
      state.stages[5]++;
      if (state.stages[5] >= tasks.length) completeChallenge("Recherche maîtrisée : mots-clés, extensions et joker * sont dans ta boîte à outils.");
      else { setFeedback("Recherche efficace ! Une nouvelle requête t’attend.", "success"); window.setTimeout(renderSearch, 650); }
    });
  }

  function renderMystery() {
    const suspects = [
      { name: "rapport_aurore.odt", type: "Texte ODT", size: "94 Ko", date: "14/02/2026", path: "P:\\Documents\\TICE\\Documents" },
      { name: "rapport_aurore.pdf", type: "Document PDF", size: "482 Ko", date: "17/02/2026", path: "P:\\Documents\\TICE\\À rendre" },
      { name: "rapport_comete.pdf", type: "Document PDF", size: "391 Ko", date: "16/02/2026", path: "P:\\Documents\\TICE\\À rendre" },
      { name: "rapport_aurore.pdf", type: "Document PDF", size: "482 Ko", date: "17/02/2026", path: "P:\\Documents\\TICE\\Documents" }
    ];
    arena.innerHTML = `
      <div class="arena mystery-board">
        <div class="mystery-case">
          <article class="case-file">
            <span class="case-stamp">FICHIER MYSTÈRE</span>
            <h2>Indices de Pixel</h2>
            <ul class="clue-list">
              <li>Son nom contient « aurore ».</li>
              <li>C’est un PDF de moins de 500 Ko.</li>
              <li>Il a été modifié après le 15/02/2026.</li>
              <li>Il est dans P: › Documents › TICE › À rendre.</li>
            </ul>
          </article>
          <div class="candidate-list">${suspects.map((file,index) => `<button class="candidate-button" type="button" data-answer="${index}"><strong>${file.name}</strong><span>${file.size}</span><small>${file.type} · ${file.date}</small><small>${file.path}</small></button>`).join("")}</div>
        </div>
      </div>`;
    if (state.done[6]) return;
    $$(".candidate-button", arena).forEach(button => button.addEventListener("click", () => {
      if (Number(button.dataset.answer) !== 1) {
        button.classList.add("wrong");
        setFeedback("Ce suspect ne respecte pas tous les indices. Vérifie surtout le dossier final du chemin.", "error");
        return;
      }
      button.classList.add("correct");
      award(12);
      state.stages[6] = 1;
      completeChallenge("Affaire résolue ! Tu as combiné toutes les informations sans tomber dans les pièges.");
    }));
  }

  const expressQuestions = [
    { q: "Quelle extension correspond à un diaporama LibreOffice ?", a: [".ods", ".odp", ".odt"], c: 1 },
    { q: "Dans photo_lune.jpg, quelle est l’extension ?", a: ["photo_lune", ".jpg", "Image"], c: 1 },
    { q: "Quelle recherche affiche tous les PDF ?", a: ["pdf*", "*.pdf", "*pdf*"], c: 1 },
    { q: "Quelle colonne sert à classer du plus léger au plus lourd ?", a: ["Taille", "Type", "Date"], c: 0 },
    { q: "Où trouver l’emplacement exact d’un fichier ?", a: ["Dans Propriétés", "Dans son nom", "Dans l’extension"], c: 0 },
    { q: "Quelle extension correspond à un tableur LibreOffice ?", a: [".ods", ".odp", ".pdf"], c: 0 },
    { q: "P:\\Documents\\TICE\\Images est…", a: ["un nom", "un type", "un chemin"], c: 2 },
    { q: "Dans expose.odt, « expose » est…", a: ["le nom", "le type", "le chemin"], c: 0 }
  ];

  function renderExpress() {
    if (state.done[7]) {
      arena.innerHTML = `<div class="arena timer-arena"><div class="timer-ring">✓</div><h2>Enquête express terminée</h2><p>Tu as marqué ${state.scores[7]} point(s) sur 16.</p></div>`;
      return;
    }
    if (!state.expressStarted) {
      arena.innerHTML = `<div class="arena timer-arena"><div class="express-start"><div class="timer-ring">45</div><h2>Prêt pour huit questions&nbsp;?</h2><p>Le chrono démarre quand tu appuies sur le bouton. Une réponse donnée ne peut pas être modifiée.</p><button class="primary-button" id="startTimer" type="button">Lancer le chrono</button></div></div>`;
      $("#startTimer").addEventListener("click", startExpress);
      return;
    }
    const index = state.stages[7];
    const item = expressQuestions[Math.min(index, expressQuestions.length - 1)];
    arena.innerHTML = `
      <div class="arena timer-arena">
        <div class="timer-ring ${state.timeLeft <= 10 ? "urgent" : ""}" id="timerRing">${state.timeLeft}</div>
        <span class="round-pill coral-round">QUESTION ${index + 1} / 8</span>
        <div class="express-question"><h2>${item.q}</h2><div class="answer-grid">${item.a.map((answer,i) => `<button class="answer-button" type="button" data-answer="${i}">${answer}</button>`).join("")}</div></div>
      </div>`;
    $$(".answer-button", arena).forEach(button => button.addEventListener("click", () => answerExpress(Number(button.dataset.answer), item.c, button)));
  }

  function startExpress() {
    state.expressStarted = true;
    state.timeLeft = 45;
    state.timerId = window.setInterval(() => {
      state.timeLeft--;
      const ring = $("#timerRing");
      if (ring) {
        ring.textContent = state.timeLeft;
        ring.classList.toggle("urgent", state.timeLeft <= 10);
      }
      if (state.timeLeft <= 0) finishExpress("Temps écoulé !");
    }, 1000);
    renderExpress();
    setFeedback("Le chrono tourne. Lis vite, mais lis bien !");
  }

  function answerExpress(chosen, correct, button) {
    $$(".answer-button", arena).forEach(item => item.disabled = true);
    if (chosen === correct) {
      button.classList.add("correct");
      award(2);
      setFeedback("Bonne réponse !", "success");
    } else {
      button.classList.add("wrong");
      const correctButton = $$('[data-answer]', arena)[correct];
      if (correctButton) correctButton.classList.add("correct");
      setFeedback("Réponse notée. Passe vite à la suivante !", "error");
    }
    state.stages[7]++;
    if (state.stages[7] >= expressQuestions.length) finishExpress("Toutes les questions sont terminées !");
    else window.setTimeout(renderExpress, 360);
  }

  function finishExpress(prefix) {
    clearTimer();
    state.done[7] = true;
    nextButton.disabled = false;
    nextButton.textContent = "Voir mon bilan →";
    arena.innerHTML = `<div class="arena timer-arena"><div class="timer-ring">✓</div><h2>${prefix}</h2><p>Score du bonus : <strong>${state.scores[7]} / 16</strong></p></div>`;
    completeChallenge(`${prefix} Tu as obtenu ${state.scores[7]} point(s) pendant l’enquête express.`);
  }

  function clearTimer() {
    if (state.timerId) window.clearInterval(state.timerId);
    state.timerId = null;
  }

  function showFinal() {
    clearTimer();
    showScreen(finalScreen);
    const score = state.score;
    const stars = score >= 85 ? 3 : score >= 60 ? 2 : score >= 35 ? 1 : 0;
    const rank = score >= 85 ? "Détective expert" : score >= 60 ? "Enquêteur confirmé" : score >= 35 ? "Apprenti détective" : "Observateur en progrès";
    $("#finalScore").textContent = score;
    $("#starRow").textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
    $("#starRow").setAttribute("aria-label", `${stars} étoile(s) obtenue(s) sur 3`);
    $("#rankBadge").textContent = rank;
    $("#resultDetails").innerHTML = `
      <div><strong>${state.done.filter(Boolean).length}/8</strong><small>défis terminés</small></div>
      <div><strong>6</strong><small>extensions reconnues</small></div>
      <div><strong>4</strong><small>critères de tri</small></div>
      <div><strong>${state.scores[7]}/16</strong><small>bonus express</small></div>`;
  }

  function resetMission() {
    clearTimer();
    state.current = 0;
    state.score = 0;
    state.scores.fill(0);
    state.stages.fill(0);
    state.done.fill(false);
    state.timeLeft = 45;
    state.expressStarted = false;
    state.propertiesViewed = false;
    showScreen(challengeScreen);
    renderChallenge();
  }

  $("#startButton").addEventListener("click", () => { showScreen(challengeScreen); renderChallenge(); });
  $("#homeButton").addEventListener("click", () => { clearTimer(); showScreen(welcomeScreen); });
  $("#quitButton").addEventListener("click", () => { clearTimer(); showScreen(welcomeScreen); });
  $("#replayButton").addEventListener("click", resetMission);
  $("#printButton").addEventListener("click", () => window.print());
  nextButton.addEventListener("click", () => {
    if (!state.done[state.current]) return;
    if (state.current === 7) { showFinal(); return; }
    state.current++;
    renderChallenge();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function openHelp() {
    const inChallenge = challengeScreen.classList.contains("is-active");
    $("#helpTitle").textContent = inChallenge ? "Coup de pouce du défi" : "Comment mener l’enquête ?";
    $("#helpContent").innerHTML = inChallenge
      ? `<p>${challengeInfo[state.current].help}</p><p><strong>Méthode :</strong> lis toute la consigne, observe les détails, puis vérifie ta réponse avant de cliquer.</p>`
      : "<ul><li>Chaque défi donne un retour immédiat.</li><li>Une erreur ne retire aucun point : essaie à nouveau.</li><li>Les boutons et zones de jeu fonctionnent aussi au clavier.</li><li>Ton bilan final indique les compétences travaillées.</li></ul>";
    helpDialog.showModal();
  }

  $("#helpButton").addEventListener("click", openHelp);
  $("#hintButton").addEventListener("click", openHelp);
  $$('[data-close-dialog]').forEach(button => button.addEventListener("click", () => helpDialog.close()));
  $$('[data-close-properties]').forEach(button => button.addEventListener("click", () => propertiesDialog.close()));
  helpDialog.addEventListener("click", event => { if (event.target === helpDialog) helpDialog.close(); });
  propertiesDialog.addEventListener("click", event => { if (event.target === propertiesDialog) propertiesDialog.close(); });
})();
