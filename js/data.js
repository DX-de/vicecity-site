/* =========================================================
   ViceCity RP — CONFIGURATION & CONTENU
   Toutes les valeurs entre [crochets] sont des placeholders
   à remplacer par le contenu final du serveur.
   ========================================================= */
window.SITE = {
  server: {
    name: "ViceCity",
    description:
      "[Description du serveur — 3 à 4 phrases présentant l'univers, l'ambiance et ce qui rend ViceCity RP unique. À rédiger par l'équipe.]",
    ip: "[IP du serveur]",            // ex : "connect cfx.re/join/xxxxxx"
    cfxCode: "",                       // code cfx.re/join (ex : "abc123") — vide = statut indisponible
    maxPlayers: null,                  // ex : 128 (utilisé si l'API ne le fournit pas)
    discordUrl: "https://discord.gg/8H2jghS7x",   // lien d'invitation du Discord
  },

  /* Statistiques : null = affiché "—" tant que non renseigné */
  stats: {
    discordMembers: null,
    totalHours: null,
    events: null,
  },

  /* Envoi du formulaire de candidature (remplir UNE des deux options) */
  form: {
    formspreeEndpoint: "",   // ex : "https://formspree.io/f/xxxxxxx"
    discordWebhook: "",      // ex : "https://discord.com/api/webhooks/..." (visible publiquement : préférez Formspree)
  },

  team: [
    /* discordId : ID Discord du membre → sa photo de profil Discord est chargée automatiquement
       (si elle ne peut pas être récupérée, "image" est utilisée à la place)
       discord : pseudo Discord optionnel affiché sous la carte */
    { name: "B4N", role: "Fondateur", description: "[Courte description du membre]", image: "img/avatar-placeholder.svg", discordId: "1033809189497225266", featured: true, discord: "" },
    { name: "InconnueOP", role: "Fondateur", description: "[Courte description du membre]", image: "img/avatar-placeholder.svg", discordId: "1272305972320403537", featured: true, discord: "" },
    { name: "[Pseudo]", role: "Administrateur", description: "[Courte description du membre]", image: "img/avatar-placeholder.svg", featured: true },
    { name: "[Pseudo]", role: "Administrateur", description: "[Courte description du membre]", image: "img/avatar-placeholder.svg" },
    { name: "[Pseudo]", role: "Modérateur", description: "[Courte description du membre]", image: "img/avatar-placeholder.svg" },
    { name: "[Pseudo]", role: "Modérateur", description: "[Courte description du membre]", image: "img/avatar-placeholder.svg" },
  ],

  /* Structure type d'un règlement RP — contenu d'exemple à valider/réécrire par le staff */
  rules: [
    {
      category: "Règles générales",
      icon: "fa-scale-balanced",
      items: [
        "<strong>Respect</strong> — [Règle sur le respect entre joueurs et envers le staff]",
        "<strong>Âge minimum</strong> — [Âge requis pour jouer sur le serveur]",
        "<strong>Micro</strong> — [Exigences concernant le micro et la qualité audio]",
        "<strong>Triche</strong> — [Règle sur les cheats, mods interdits et exploits de bugs]",
      ],
    },
    {
      category: "Règles de RP",
      icon: "fa-masks-theater",
      items: [
        "<strong>Metagaming</strong> — [Interdiction d'utiliser des informations HRP en jeu]",
        "<strong>Powergaming</strong> — [Interdiction d'actions irréalistes ou forcées]",
        "<strong>Freekill / RDM / VDM</strong> — [Règles sur les meurtres et collisions sans raison RP]",
        "<strong>Fear RP</strong> — [Obligation de jouer la peur face à une menace]",
      ],
    },
    {
      category: "Règles de vie / mort",
      icon: "fa-heart-pulse",
      items: [
        "<strong>New Life Rule</strong> — [Règle d'oubli des événements après une mort]",
        "<strong>Coma</strong> — [Durée et comportement en état de coma]",
        "<strong>Mort RP définitive</strong> — [Conditions et validation d'une mort définitive]",
      ],
    },
    {
      category: "Règles illégales & braquages",
      icon: "fa-user-secret",
      items: [
        "<strong>Effectifs</strong> — [Nombre minimum de policiers en service pour un braquage]",
        "<strong>Otages</strong> — [Règles concernant les prises d'otages]",
        "<strong>Zones safe</strong> — [Liste des zones où les actions illégales sont interdites]",
      ],
    },
  ],

  rulesUpdated: "[JJ/MM/AAAA]",   // date de dernière mise à jour du règlement

  /* Métiers & factions — recruiting : true = "Recrute", false = "Complet", null = pas de badge */
  jobs: [
    { name: "Police", icon: "fa-shield-halved", description: "[Présentation des forces de l'ordre]", recruiting: null },
    { name: "EMS", icon: "fa-truck-medical", description: "[Présentation des services médicaux]", recruiting: null },
    { name: "Mécaniciens", icon: "fa-wrench", description: "[Présentation des garages]", recruiting: null },
    { name: "Entreprises", icon: "fa-briefcase", description: "[Présentation des entreprises légales]", recruiting: null },
    { name: "Gouvernement", icon: "fa-landmark", description: "[Présentation des institutions]", recruiting: null },
    { name: "Illégal", icon: "fa-user-secret", description: "[Présentation des organisations illégales]", recruiting: null },
  ],

  /* Annuaire des entreprises & organisations (page Entreprises)
     category : doit correspondre à une entrée de companyCategories
     hiring : true = bouton "Postuler", discord : lien du Discord de l'entreprise (optionnel) */
  companyCategories: [
    { id: "public", name: "Services publics", icon: "fa-building-columns" },
    { id: "garage", name: "Mécanos & garages", icon: "fa-screwdriver-wrench" },
    { id: "commerce", name: "Commerces & services", icon: "fa-store" },
    { id: "illegal", name: "Groupes illégaux", icon: "fa-user-secret" },
  ],
  companies: [
    { name: "[Nom de l'entreprise]", category: "public", description: "[Courte description de l'activité]", employees: null, hiring: true, discord: "", logo: "" },
    { name: "[Nom de l'entreprise]", category: "public", description: "[Courte description de l'activité]", employees: null, hiring: false, discord: "", logo: "" },
    { name: "[Nom de l'entreprise]", category: "garage", description: "[Courte description de l'activité]", employees: null, hiring: true, discord: "", logo: "" },
    { name: "[Nom de l'entreprise]", category: "commerce", description: "[Courte description de l'activité]", employees: null, hiring: false, discord: "", logo: "" },
    { name: "[Nom du groupe]", category: "illegal", description: "[Courte description du groupe]", employees: null, hiring: false, discord: "", logo: "" },
  ],

  /* Streamers partenaires — platform : "twitch" | "youtube" | "kick" ; live : true pour afficher "En direct" */
  streamers: [
    { name: "[Pseudo streamer]", platform: "twitch", url: "", character: "[Personnage RP]", image: "img/avatar-placeholder.svg", live: false },
    { name: "[Pseudo streamer]", platform: "youtube", url: "", character: "[Personnage RP]", image: "img/avatar-placeholder.svg", live: false },
    { name: "[Pseudo streamer]", platform: "kick", url: "", character: "[Personnage RP]", image: "img/avatar-placeholder.svg", live: false },
  ],

  /* Actualités affichées sur l'accueil (les 3 plus récentes en premier dans la liste)
     tag : "Mise à jour" | "Événement" | "Annonce" | "Recrutement" (ou autre texte) */
  news: [
    { date: "[JJ/MM/AAAA]", tag: "Annonce", title: "[Titre de l'actualité]", text: "[Résumé de l'actualité en une ou deux phrases.]" },
    { date: "[JJ/MM/AAAA]", tag: "Mise à jour", title: "[Titre de l'actualité]", text: "[Résumé de l'actualité en une ou deux phrases.]" },
    { date: "[JJ/MM/AAAA]", tag: "Événement", title: "[Titre de l'actualité]", text: "[Résumé de l'actualité en une ou deux phrases.]" },
  ],

  /* Publication des patchnotes sur Discord via Embed Sender
     Bouton visible uniquement en "mode staff" : ouvrez une fois patchnotes.html?staff
     (et patchnotes.html?staff=0 pour le désactiver). Le webhook reste dans Embed Sender. */
  discordPublish: {
    embedSenderUrl: "https://dx-de.github.io/embed-sender/",   // adresse en ligne d'Embed Sender — vide = copier/coller
    siteUrl: "https://dx-de.github.io/vicecity-site/",          // adresse en ligne du site ViceCity — ajoute un bouton "Voir sur le site"
    username: "ViceCity RP • Patchnotes",
    avatarUrl: "",        // image du profil du message (adresse en ligne)
    mention: "",          // ex : "@everyone" ou "<@&ID_DU_ROLE>" — vide = pas de mention
    color: "#3b82f6",
    imageUrl: "",         // bannière en bas de l'embed (adresse en ligne, optionnel)
  },

  /* Patchnotes : voir js/patchnotes.js (mis à jour par Embed Sender) */
  patchnotes: window.VC_PATCHNOTES || [],

  /* Questions fréquentes — réponses à rédiger par l'équipe */
  faq: [
    { q: "Le serveur est-il en whitelist ?", a: "[Réponse à compléter]" },
    { q: "Dois-je avoir un micro pour jouer ?", a: "[Réponse à compléter]" },
    { q: "Comment me connecter au serveur ?", a: "[Réponse à compléter — ex. : ouvrir FiveM, appuyer sur F8 et taper la commande connect]" },
    { q: "Quel âge faut-il avoir ?", a: "[Réponse à compléter]" },
    { q: "Comment contacter le staff ?", a: "[Réponse à compléter — ex. : ouvrir un ticket sur Discord]" },
  ],

  /* Indications affichées selon le poste choisi dans le formulaire */
  postes: {
    Staff: "[Prérequis pour le staff — âge minimum, disponibilités, expérience de modération...]",
    Police: "[Prérequis pour la police — disponibilités, connaissance du code pénal RP...]",
    EMS: "[Prérequis pour l'EMS — disponibilités, intérêt pour le RP médical...]",
  },

  /* Boutique : selon les conditions de Cfx.re/Rockstar, privilégiez des avantages
     sans impact sur le gameplay (cosmétiques, priorité de file...). À vérifier avant publication. */
  shop: [
    { tier: "[Palier 1]", price: "[Prix]", perks: ["[Avantage]", "[Avantage]"] },
    { tier: "[Palier 2]", price: "[Prix]", perks: ["[Avantage]", "[Avantage]", "[Avantage]"], highlight: true },
    { tier: "[Palier 3]", price: "[Prix]", perks: ["[Avantage]", "[Avantage]", "[Avantage]", "[Avantage]"] },
  ],
};
