/* =========================================================
   ViceCity RP — PATCHNOTES
   Ce fichier est mis à jour automatiquement par Embed Sender
   (onglet Outils → « Patchnote ViceCity » → Publier sur le site).
   Vous pouvez aussi le modifier à la main, en gardant le format JSON :
   guillemets doubles, virgules entre les éléments, version la plus récente EN PREMIER.
   type : "ajout" | "amelioration" | "correction" | "suppression"
   ========================================================= */
window.VC_PATCHNOTES = [
  {
    "version": "1.0.1",
    "date": "23/11/2026",
    "title": "Patch-Note",
    "summary": "🛡️ NOUVEAUTÉS — MENU ADMIN\n\nNouvelle organisation du menu principal avec 7 catégories.\n\nConservation de l'ensemble des catégories administratives existantes.\n\nAccès direct à la liste des joueurs connectés.\n\nAmélioration de la navigation entre les menus.\n\n👥 NOUVEAU SYSTÈME DE GROUPES\n\nCréation de groupes légaux et illégaux.\n\nAjout d'un emoji personnalisé pour chaque groupe.\n\nPersonnalisation de la couleur du groupe.\n\nAttribution des membres aux gangs.\n\nLiaison des groupes légaux aux métiers ESX.\n\nSauvegarde des groupes et appartenances en base de données.\n\n🏷️ NOUVEL AFFICHAGE DES PSEUDOS\n\nAffichage de l'ID serveur à gauche du pseudo.\n\nAffichage de l'emoji du groupe.\n\nSuppression des tags textuels EMS, LSPD, BALLAS, etc.\n\nConservation de l'affichage optionnel des noms RP.\n\nPrise en charge facultative des pseudos Steam via une clé API serveur.\n\nUtilisation du pseudo FiveM lorsque Steam est indisponible.\n\nExemple : [42] 🚑 MoodyBat6423 | Lucas Moreau\n\n🚗 GESTION DES VÉHICULES\n\nNouvelle catégorie Véhicules.\n\nAjout d'un chronomètre avec démarrage, arrêt et remise à zéro.\n\nAjout d'une conduite GPS expérimentale.\n\nCommande permettant d'arrêter l'autopilote.\n\nPréparation des catégories Courses et Conduite automatique.\n\nLe suivi automatique « Me suivre » reste à développer.\n\n🕺 NOUVEAU MENU ANIMATIONS\n\nCatalogue d'animations GTA V.\n\nCatégories : salutations, attitudes, repos et activités.\n\nRecherche d'animations.\n\nAjout et suppression des favoris.\n\nSauvegarde locale des favoris.\n\nArrêt immédiat des animations.\n\n⚙️ OPTIMISATIONS ET CONSERVATION\n\nConservation des fonctionnalités administratives existantes.\n\nConservation des permissions serveur.\n\nBibliothèque lib inchangée.\n\nModules du menu réassemblés et synchronisés.\n\nPréparation de la structure pour les prochaines évolutions.",
    "changes": [
      {
        "type": "ajout",
        "text": "Développeur"
      }
    ]
  },
  {
    "version": "1.0.0",
    "date": "23/11/2026",
    "title": "Patch-Note",
    "summary": "🔧 Corrections & optimisations du serveur\n\n✅ Corrections\n\nCorrection du fichier index.html manquant dans reaper_elevator.\n\nCorrection de l'avertissement lié au chargement de l'interface de l'ascenseur.\n\nIdentification du problème de chemin du fichier alta.ymt dans le mapping médical.\n\nCorrection du chemin à appliquer dans fxmanifest.lua.\n\nIdentification des déclarations de fichiers manquants dans certaines ressources.\n\n⚙️ Améliorations techniques\n\nVérification des fichiers fxmanifest.lua.\n\nAmélioration de la configuration des ressources.\n\nIdentification de plusieurs mappings consommant beaucoup de mémoire.\n\nAnalyse des avertissements concernant grand_meridian_map et ViceCore.",
    "changes": [
      {
        "type": "ajout",
        "text": "Développeur"
      }
    ]
  }
];
