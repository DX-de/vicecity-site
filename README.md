# ViceCity RP — site du serveur

Site vitrine du serveur FiveM **ViceCity RP** : accueil, règlement, entreprises, streamers, patchnotes, équipe, candidature et boutique.

En ligne : https://dx-de.github.io/vicecity-site/

## Modifier le contenu

| Quoi | Où |
| --- | --- |
| Textes, IP, Discord, équipe, règlement, entreprises, FAQ… | `js/data.js` |
| Patchnotes | `js/patchnotes.js` (mis à jour automatiquement par [Embed Sender](https://dx-de.github.io/embed-sender/)) |
| Couleurs et mise en page | `css/style.css` |
| Structure des pages (menu, pied de page, sections) | `tools/build-pages.js`, puis `node tools/build-pages.js .` |

Le mode staff de la page Patchnotes s'active en ouvrant `patchnotes.html?staff`.
