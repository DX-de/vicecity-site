/* Génère les pages HTML du site (en-tête, menu et pied de page identiques partout).
   Utilisation, depuis la racine du site : node tools/build-pages.js .
   Attention : cela réécrit les fichiers .html — modifiez ici plutôt que dans les .html. */
const fs = require("fs");
const path = require("path");
const OUT = process.argv[2];

const NAME = "ViceCity";
const NAV = [["index.html", "Accueil"], ["reglement.html", "Règlement"], ["entreprises.html", "Entreprises"], ["streamers.html", "Streamers"], ["patchnotes.html", "Patchnotes"], ["equipe.html", "Équipe"], ["postuler.html", "Postuler"], ["boutique.html", "Boutique"]];
const ic = (i) => (i.includes("fa-brands") ? i : "fa-solid " + i);
const DESC = `Rejoignez ${NAME} RP, un serveur FiveM roleplay sérieux et immersif. Postulez dès maintenant !`;

function page({ file, title, desc, body, robots, bodyClass = "" }) {
  const nav = NAV.map(([href, label]) => `<li><a href="${href}"${href === file ? ' aria-current="page"' : ""}>${label}</a></li>`).join("\n          ");
  const footNav = NAV.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("");
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  ${robots ? '<meta name="robots" content="noindex">\n  ' : ""}<meta name="theme-color" content="#1a1a2e">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${NAME} RP">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="img/og-image.png"><!-- [Image de partage 1200x630 à fournir] -->
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800;900&family=Roboto+Mono:wght@500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
  <link rel="stylesheet" href="css/style.css">
  <script>document.documentElement.classList.add("js");</script>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
  <a class="skip-link" href="#main">Aller au contenu</a>
  <header class="site-header">
    <nav class="nav container" aria-label="Navigation principale">
      <a class="logo" href="index.html" aria-label="${NAME} RP — Accueil">
        <span class="logo-mark" aria-hidden="true">VC</span>
        <span>${NAME}<span class="rp"> RP</span></span>
      </a>
      <button class="nav-toggle" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="nav-links"><i class="fa-solid fa-bars" aria-hidden="true"></i></button>
      <ul class="nav-links" id="nav-links">
          ${nav}
          <li class="nav-cta"><a data-discord href="#"><i class="fa-brands fa-discord" aria-hidden="true"></i> Discord</a></li>
      </ul>
    </nav>
  </header>

  <main id="main">
${body}
  </main>

  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a class="logo" href="index.html" aria-label="${NAME} RP — Accueil">
          <span class="logo-mark" aria-hidden="true">VC</span>
          <span>${NAME}<span class="rp"> RP</span></span>
        </a>
        <p>[Phrase de présentation courte du serveur.]</p>
        <div class="social">
          <a data-discord href="#" aria-label="Rejoindre notre Discord"><i class="fa-brands fa-discord" aria-hidden="true"></i></a>
        </div>
      </div>
      <nav aria-label="Liens du pied de page">
        <h2 class="footer-title">Navigation</h2>
        <ul class="footer-links">${footNav}</ul>
      </nav>
      <div>
        <h2 class="footer-title">Rejoindre la ville</h2>
        <p class="footer-ip">IP du serveur</p>
        <button class="copy-ip copy-ip-lg" data-copy-ip type="button" aria-label="Copier l'adresse IP du serveur"><i class="fa-solid fa-copy" aria-hidden="true"></i> <span data-ip>[IP du serveur]</span></button>
        <p class="status footer-status" data-status data-state="loading"><span class="status-dot" aria-hidden="true"></span><span class="status-label">Chargement...</span></p>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>&copy; <span data-year></span> ${NAME} RP — Tous droits réservés.</p>
      <p>Serveur non affilié à Rockstar Games, Take-Two ou Cfx.re.</p>
    </div>
  </footer>

  <button class="back-to-top" type="button" aria-label="Retour en haut de la page"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>

  <script src="js/patchnotes.js"></script>
  <script src="js/data.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
`;
}
const header = (eyebrow, h1, p) => `    <section class="page-header">
      <div class="container">
        <span class="eyebrow">${eyebrow}</span>
        <h1>${h1}</h1>
        <p>${p}</p>
      </div>
    </section>`;
const loading = (msg = "Chargement...") => `<div class="state"><div class="spinner" aria-hidden="true"></div>${msg}</div>`;
const title = (id, h, p = "", eyebrow = "") => `<div class="section-title reveal">
          ${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}
          <h2 id="${id}">${h}</h2>${p ? `\n          <p>${p}</p>` : ""}
        </div>`;
const feature = (icon, h, p) => `<article class="card feature reveal">
            <div class="feature-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></div>
            <h3>${h}</h3>
            <p>${p}</p>
          </article>`;
const step = (n, icon, h, p, extra = "") => `<li class="step reveal">
            <span class="step-num" aria-hidden="true">${n}</span>
            <i class="${ic(icon)} step-icon" aria-hidden="true"></i>
            <h3>${h}</h3>
            <p>${p}</p>${extra}
          </li>`;
const field = (id, icon, label, input, hint = "") => `<div class="field">
              <label for="${id}"><i class="${ic(icon)}" aria-hidden="true"></i>${label} <span class="req" aria-hidden="true">*</span></label>
              ${input}${hint}
              <span class="field-error" id="err-${id}"></span>
            </div>`;

const pages = {
  "index.html": {
    title: `${NAME} RP - Serveur FiveM Roleplay`, desc: DESC, bodyClass: "home",
    body: `    <section class="hero" aria-labelledby="hero-title">
      <img class="hero-bg" src="img/hero-placeholder.svg" alt="Illustration placeholder : skyline d'une ville côtière de nuit avec palmiers" fetchpriority="high">
      <div class="container hero-grid">
        <div class="hero-art">
          <img class="hero-character" src="img/hero-personnage.webp" width="1122" height="1402" fetchpriority="high"
               alt="Personnage de ${NAME} en survêtement violet tendant un ticket « ViceCity Personnage »">
        </div>
        <aside class="hero-panel" aria-labelledby="hero-title">
          <h1 id="hero-title" class="sr-only">${NAME} RP — Serveur FiveM Roleplay</h1>
          <span class="eyebrow">Bienvenue sur ${NAME} RP</span>
          <h2 class="panel-title">Prêt à entrer en ville ?</h2>
          <p>Rejoignez la communauté sur Discord, lisez le règlement puis déposez votre candidature.</p>
          <div class="status-card">
            <span class="status" data-status data-state="loading"><span class="status-dot" aria-hidden="true"></span><span class="status-label">Chargement...</span></span>
            <span class="status-meta" data-players>— joueurs</span>
            <div class="players-bar" aria-hidden="true"><span data-players-bar></span></div>
          </div>
          <div class="btn-group">
            <a class="btn btn-glow" data-discord href="#"><i class="fa-brands fa-discord" aria-hidden="true"></i> Nous rejoindre</a>
            <a class="btn btn-secondary" href="postuler.html"><i class="fa-solid fa-file-signature" aria-hidden="true"></i> Postuler</a>
            <a class="btn btn-primary" data-connect href="#" hidden><i class="fa-solid fa-play" aria-hidden="true"></i> Se connecter</a>
          </div>
          <div class="panel-ip">
            <span>Adresse IP</span>
            <button class="copy-ip" data-copy-ip type="button" aria-label="Copier l'adresse IP du serveur"><span data-ip></span> <i class="fa-solid fa-copy" aria-hidden="true"></i></button>
          </div>
        </aside>
      </div>
      <a class="scroll-hint" href="#about" aria-label="Défiler vers la présentation"><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></a>
    </section>

    <section class="section" id="about" aria-labelledby="about-title">
      <div class="container">
        ${title("about-title", `Bienvenue à ${NAME}`, "", "L'univers")}
        <p class="about-text reveal">[Description du serveur — 3 à 4 phrases présentant l'univers de la ville, son ambiance, son économie et sa communauté. Contenu à rédiger par l'équipe.]</p>
        <div class="grid grid-4">
          ${feature("fa-city", "Ville réaliste", "[Texte de présentation de l'univers et de la carte.]")}
          ${feature("fa-coins", "Économie", "[Texte sur l'économie, les métiers et les entreprises.]")}
          ${feature("fa-shield-halved", "Services publics", "[Texte sur la police, l'EMS et les institutions.]")}
          ${feature("fa-users", "Communauté", "[Texte sur l'esprit communautaire et les événements.]")}
        </div>
      </div>
    </section>

    <section class="stats-band" aria-labelledby="stats-title">
      <div class="container section">
        <h2 id="stats-title" class="sr-only">Statistiques du serveur</h2>
        <div class="grid grid-4">
          <div class="stat reveal"><i class="fa-solid fa-gamepad" aria-hidden="true"></i><span class="stat-value" data-stat="players">—</span><span class="stat-label">Joueurs en ligne</span></div>
          <div class="stat reveal"><i class="fa-brands fa-discord" aria-hidden="true"></i><span class="stat-value" data-stat="discordMembers">—</span><span class="stat-label">Membres Discord</span></div>
          <div class="stat reveal"><i class="fa-solid fa-clock" aria-hidden="true"></i><span class="stat-value" data-stat="totalHours">—</span><span class="stat-label">Heures de jeu totales</span></div>
          <div class="stat reveal"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i><span class="stat-value" data-stat="events">—</span><span class="stat-label">Événements organisés</span></div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="news-title">
      <div class="container">
        ${title("news-title", "Dernières actualités", "Mises à jour, événements et annonces de la ville.", "Le journal")}
        <div class="grid grid-3" data-news>${loading()}</div>
        <div class="btn-group center-group mt">
          <a class="btn btn-secondary" href="patchnotes.html"><i class="fa-solid fa-code-branch" aria-hidden="true"></i> Voir les patchnotes</a>
          <a class="btn btn-ghost" data-discord href="#"><i class="fa-brands fa-discord" aria-hidden="true"></i> Toutes les annonces sur Discord</a>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="jobs-title">
      <div class="container">
        ${title("jobs-title", "Métiers & factions", "Choisissez votre camp et construisez votre histoire.", "Votre rôle")}
        <div class="grid grid-3" data-jobs>${loading()}</div>
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="join-title">
      <div class="container">
        ${title("join-title", "Comment nous rejoindre", "Quatre étapes pour commencer votre aventure.", "Démarrer")}
        <ol class="steps">
          ${step(1, "fa-brands fa-discord", "Rejoindre le Discord", "Toutes les annonces, le support et la communauté s'y trouvent.", `\n            <a class="step-link" data-discord href="#">Ouvrir Discord <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`)}
          ${step(2, "fa-book", "Lire le règlement", "Sa connaissance est obligatoire avant d'entrer en ville.", `\n            <a class="step-link" href="reglement.html">Voir le règlement <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`)}
          ${step(3, "fa-id-card", "Accès au serveur", "[Processus d'accès : whitelist, entretien ou accès libre — à préciser.]")}
          ${step(4, "fa-plug", "Se connecter", "Dans FiveM, appuyez sur F8 et tapez :", `\n            <button class="copy-ip step-code" data-copy-connect type="button" aria-label="Copier la commande de connexion"><code data-connect-cmd>connect [IP du serveur]</code> <i class="fa-solid fa-copy" aria-hidden="true"></i></button>`)}
        </ol>
      </div>
    </section>

    <section class="section" aria-labelledby="team-title">
      <div class="container">
        ${title("team-title", "L'équipe dirigeante", `Les personnes qui font vivre ${NAME} au quotidien.`, "Le staff")}
        <div class="grid grid-3" data-team="featured">${loading()}</div>
        <p class="center mt"><a class="btn btn-secondary" href="equipe.html">Voir toute l'équipe <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></p>
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="faq-title">
      <div class="container">
        ${title("faq-title", "Questions fréquentes", "Une autre question ? Ouvrez un ticket sur notre Discord.", "FAQ")}
        <div class="accordion" data-faq>${loading()}</div>
      </div>
    </section>

    <section class="section" aria-labelledby="cta-title">
      <div class="container">
        <div class="cta reveal">
          <h2 id="cta-title">Prêt à faire vos preuves ?</h2>
          <p>Police, EMS ou staff : déposez votre candidature et rejoignez ceux qui font vivre la ville.</p>
          <div class="btn-group center-group">
            <a class="btn btn-primary" href="postuler.html"><i class="fa-solid fa-file-signature" aria-hidden="true"></i> Postuler</a>
            <a class="btn btn-secondary" data-discord href="#"><i class="fa-brands fa-discord" aria-hidden="true"></i> Rejoindre le Discord</a>
          </div>
        </div>
      </div>
    </section>`,
  },

  "reglement.html": {
    title: `Règlement - ${NAME} RP`, desc: `Consultez le règlement du serveur FiveM ${NAME} RP : règles générales, RP, vie/mort et plus.`,
    body: `${header("Règlement", "Règlement du Serveur", "La lecture du règlement est obligatoire avant de rejoindre la ville. Toute infraction peut entraîner une sanction.")}
    <section class="section" aria-label="Catégories du règlement">
      <div class="container">
        <p class="notice"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Structure d'exemple — le contenu de chaque règle est à rédiger et valider par le staff dans <code>js/data.js</code>.</p>
        <div class="toolbar rules-toolbar">
          <div class="search">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <label for="rules-search" class="sr-only">Rechercher une règle</label>
            <input id="rules-search" type="search" placeholder="Rechercher une règle (ex : metagaming)" autocomplete="off">
          </div>
          <button class="btn btn-secondary btn-sm" type="button" data-toggle-all>Tout ouvrir</button>
        </div>
        <p class="rules-meta muted">Dernière mise à jour : <span data-rules-updated>—</span> · <span data-rules-count>0</span> règles</p>
        <p class="state" data-rules-empty hidden>Aucune règle ne correspond à votre recherche.</p>
        <div class="accordion" data-rules>${loading()}</div>
      </div>
    </section>`,
  },

  "equipe.html": {
    title: `Équipe - ${NAME} RP`, desc: `Découvrez l'équipe de ${NAME} RP : fondateurs, administrateurs et modérateurs.`,
    body: `${header("Staff", "Notre Équipe", "Une équipe à l'écoute pour garantir une expérience de jeu juste et immersive.")}
    <section class="section" aria-label="Membres de l'équipe">
      <div class="container" data-team="grouped">${loading()}</div>
    </section>
    <section class="section" style="padding-top:0" aria-labelledby="staff-cta">
      <div class="container">
        <div class="cta reveal">
          <h2 id="staff-cta">Envie de rejoindre le staff ?</h2>
          <p>Nous cherchons des personnes impliquées, patientes et justes.</p>
          <a class="btn btn-primary" href="postuler.html"><i class="fa-solid fa-file-signature" aria-hidden="true"></i> Postuler</a>
        </div>
      </div>
    </section>`,
  },

  "postuler.html": {
    title: `Candidature - ${NAME} RP`, desc: `Postulez pour rejoindre le staff, la police ou l'EMS de ${NAME} RP.`,
    body: `${header("Rejoindre l'aventure", "Candidature", "Remplissez le formulaire ci-dessous avec soin. Les candidatures incomplètes ou bâclées ne seront pas traitées.")}
    <section class="section" aria-label="Formulaire de candidature">
      <div class="container form-wrap" id="form-container">
        <ol class="mini-steps wizard-steps" aria-label="Étapes du formulaire">
          <li class="active" data-step-label="1"><span>1</span> Identité</li>
          <li data-step-label="2"><span>2</span> Candidature</li>
          <li data-step-label="3"><span>3</span> Validation</li>
        </ol>
        <div class="wizard-progress" aria-hidden="true"><span data-wizard-bar></span></div>
        <form class="card form" id="apply-form" novalidate>
          <div id="form-alert" class="form-alert" role="alert" tabindex="-1" hidden></div>
          <p class="draft-note" data-draft-note hidden><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Brouillon restauré. <button type="button" class="link-btn" data-clear-draft>Effacer</button></p>

          <fieldset class="wizard-step" data-step="1">
            <legend class="form-section-title">Étape 1 sur 3 · Qui êtes-vous ?</legend>
            <div class="form-row">
              ${field("nom_rp", "fa-id-card", "Nom RP", `<input id="nom_rp" name="nom_rp" type="text" autocomplete="off" required aria-describedby="err-nom_rp" placeholder="Prénom Nom">`)}
              ${field("age", "fa-cake-candles", "Âge", `<input id="age" name="age" type="number" min="13" max="99" inputmode="numeric" required aria-describedby="err-age">`)}
            </div>
            <div class="form-row">
              ${field("email", "fa-envelope", "Adresse email", `<input id="email" name="email" type="email" autocomplete="email" required aria-describedby="err-email" placeholder="vous@exemple.com">`)}
              ${field("discord", "fa-brands fa-discord", "Pseudo Discord", `<input id="discord" name="discord" type="text" autocomplete="off" required aria-describedby="err-discord" placeholder="pseudo">`)}
            </div>
          </fieldset>

          <fieldset class="wizard-step" data-step="2" hidden>
            <legend class="form-section-title">Étape 2 sur 3 · Votre candidature</legend>
            ${field("poste", "fa-briefcase", "Poste souhaité", `<select id="poste" name="poste" required aria-describedby="err-poste hint-poste">
                <option value="">— Choisir —</option>
                <option value="Staff">Staff</option>
                <option value="Police">Police</option>
                <option value="EMS">EMS</option>
              </select>`, `\n              <p class="hint" id="hint-poste" data-poste-hint hidden></p>`)}
            ${field("experience", "fa-masks-theater", "Expérience RP", `<textarea id="experience" name="experience" required minlength="50" maxlength="1000" aria-describedby="err-experience count-experience" placeholder="Serveurs précédents, rôles joués, durée..."></textarea>`, `\n              <span class="counter" id="count-experience" data-counter-for="experience"></span>`)}
            ${field("motivation", "fa-heart", "Pourquoi nous ?", `<textarea id="motivation" name="motivation" required minlength="50" maxlength="1000" aria-describedby="err-motivation count-motivation" placeholder="Ce qui vous attire sur ${NAME} et ce que vous pouvez apporter..."></textarea>`, `\n              <span class="counter" id="count-motivation" data-counter-for="motivation"></span>`)}
          </fieldset>

          <fieldset class="wizard-step" data-step="3" hidden>
            <legend class="form-section-title">Étape 3 sur 3 · Vérifiez et envoyez</legend>
            <dl class="recap" data-recap></dl>
            <div class="field">
              <label class="check" for="rules_ok">
                <input id="rules_ok" name="rules_ok" type="checkbox" value="oui" required aria-describedby="err-rules_ok">
                <span>J'ai lu et j'accepte le <a href="reglement.html" target="_blank">règlement du serveur</a>. <span class="req" aria-hidden="true">*</span></span>
              </label>
              <span class="field-error" id="err-rules_ok"></span>
            </div>
            <p class="muted small"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Après l'envoi, le staff étudie votre candidature puis vous répond sur Discord.</p>
          </fieldset>

          <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none">
          <div class="wizard-nav">
            <button class="btn btn-ghost" type="button" data-wizard-prev hidden><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Retour</button>
            <span class="muted small wizard-note">* Champs obligatoires · Brouillon enregistré sur cet appareil</span>
            <button class="btn btn-primary" type="button" data-wizard-next>Suivant <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
            <button class="btn btn-primary" type="submit" hidden><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Envoyer</button>
          </div>
        </form>
      </div>
    </section>`,
  },

  "entreprises.html": {
    title: `Entreprises - ${NAME} RP`, desc: `Découvrez les entreprises, services publics et organisations de ${NAME} RP.`,
    body: `${header(`${NAME} · Vie économique`, "Entreprises", "Découvrez les entreprises du serveur et rejoignez leur Discord pour les contacter.")}
    <section class="section" style="padding-top:var(--s3)" aria-label="Annuaire des entreprises">
      <div class="container">
        <div class="toolbar">
          <div class="search">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <label for="company-search" class="sr-only">Rechercher une entreprise</label>
            <input id="company-search" type="search" placeholder="Rechercher une entreprise..." autocomplete="off">
          </div>
          <span class="toolbar-count" data-company-count aria-live="polite">0 entreprise</span>
        </div>
        <div class="filters" role="group" aria-label="Filtrer par catégorie" data-company-filters></div>
        <p class="state" data-company-empty hidden>Aucune entreprise ne correspond à votre recherche.</p>
        <div data-companies>${loading()}</div>
      </div>
    </section>`,
  },

  "streamers.html": {
    title: `Streamers - ${NAME} RP`, desc: `Les streamers partenaires de ${NAME} RP.`,
    body: `${header(`${NAME} · Créateurs`, "Streamers", "Suivez les aventures de la ville en direct avec nos créateurs de contenu partenaires.")}
    <section class="section" style="padding-top:var(--s3)" aria-label="Liste des streamers">
      <div class="container">
        <div class="grid grid-3" data-streamers>${loading()}</div>
        <div class="cta reveal mt">
          <h2>Vous êtes créateur de contenu ?</h2>
          <p>Contactez le staff sur Discord pour rejoindre le programme streamers.</p>
          <a class="btn btn-primary" data-discord href="#"><i class="fa-brands fa-discord" aria-hidden="true"></i> Contacter le staff</a>
        </div>
      </div>
    </section>`,
  },

  "patchnotes.html": {
    title: `Patchnotes - ${NAME} RP`, desc: `Toutes les mises à jour de ${NAME} RP : ajouts, améliorations et corrections.`,
    body: `${header(`${NAME} · Mises à jour`, "Patchnotes", "Toutes les nouveautés, améliorations et corrections apportées à la ville, version par version.")}
    <section class="section" style="padding-top:var(--s3)" aria-label="Historique des mises à jour">
      <div class="container patch-wrap">
        <div class="patch-toolbar">
          <div class="filters" role="group" aria-label="Filtrer par type de changement" data-patch-filters></div>
          <button class="btn btn-ghost btn-sm" type="button" data-patch-toggle>Tout ouvrir</button>
        </div>
        <p class="state" data-patch-empty hidden>Aucun changement de ce type.</p>
        <div class="patch-timeline" data-patchnotes>${loading()}</div>
      </div>
    </section>`,
  },

  "boutique.html": {
    title: `Boutique - ${NAME} RP`, desc: `Les avantages donateurs de ${NAME} RP.`,
    body: `${header("Soutenir le serveur", "Boutique", "Les dons aident à financer l'hébergement et le développement du serveur. Aucun paiement en ligne : contactez-nous sur Discord.")}
    <section class="section" aria-label="Paliers donateurs">
      <div class="container">
        <p class="notice"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> Aucun avantage pay-to-win : les dons n'offrent pas d'avantage en jeu sur les autres joueurs.</p>
        <div class="grid grid-3" data-shop>${loading()}</div>
      </div>
    </section>`,
  },

  "404.html": {
    title: `Page introuvable - ${NAME} RP`, desc: DESC, robots: true,
    body: `    <section class="container error-page">
      <div>
        <div class="error-code" aria-hidden="true">404</div>
        <h1>Vous vous êtes perdu en ville</h1>
        <p class="muted">Cette rue n'existe pas sur la carte. Retournez au centre avant que la police ne vous remarque.</p>
        <div class="btn-group center-group">
          <a class="btn btn-primary" href="index.html"><i class="fa-solid fa-house" aria-hidden="true"></i> Retour à l'accueil</a>
          <a class="btn btn-secondary" data-discord href="#"><i class="fa-brands fa-discord" aria-hidden="true"></i> Discord</a>
        </div>
      </div>
    </section>`,
  },
};

for (const [file, p] of Object.entries(pages)) fs.writeFileSync(path.join(OUT, file), page({ file, ...p }));
console.log("built", Object.keys(pages).join(", "));
