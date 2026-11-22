# Quiz Emoji Films 🎬

Fabrique automatique de vidéos TikTok, Reels et Shorts : **« Devine le film avec des emojis »**.

- Format vertical **1080×1920**, MP4 avec le son, prêt à poster.
- **10 films par vidéo**, environ **1 min 10**.
- Une **image de couverture** est fabriquée avec chaque vidéo.
- Une liste de films = un fichier dans le dossier `packs/`. Il n'y a pas de code à toucher.

---

Idées pour les prochaines saisons : voir [IDEES-SAISONS.md](IDEES-SAISONS.md).

## 1. Installer (une seule fois sur le MacBook)

1. Installe **Node.js** : va sur <https://nodejs.org>, télécharge la version « LTS » et installe-la comme une application normale.
2. Récupère le projet : sur la page GitHub du projet, clique sur le bouton vert **Code**, puis sur **Download ZIP**. Ensuite, dézippe le dossier, par exemple dans « Documents ».
3. Ouvre l'application **Terminal** : appuie sur Cmd + Espace, puis tape « Terminal ».
4. Tape `cd ` (avec un espace à la fin), glisse le dossier du projet dans la fenêtre du Terminal, puis appuie sur Entrée.
5. Tape cette commande et appuie sur Entrée :

```bash
npm install
```

Ça prend une ou deux minutes.

## 2. Fabriquer les vidéos

Toujours dans le Terminal, depuis le dossier du projet :

```bash
npm run videos
```

Les vidéos et leurs couvertures arrivent dans le dossier **`out/`**. Par exemple :

- `disney-pixar.mp4` : la vidéo ;
- `disney-pixar-couverture.png` : l'image de couverture.

La première fois, l'outil télécharge tout seul un petit navigateur, c'est normal. Compte environ 3 à 5 minutes par vidéo sur un MacBook Air.

### Autres commandes utiles

| Je veux… | Commande |
|---|---|
| une seule vidéo | `npm run videos -- disney-pixar` |
| une vidéo plus fluide (60 images/s) | `npm run videos -- --fps 60` |
| seulement les couvertures (rapide) | `npm run couvertures` |
| vérifier mes listes de films | `npm run verifier` |
| regarder une vidéo sans l'exporter | `npm run apercu` |

## 3. Créer ou modifier une liste de films

Ouvre un fichier du dossier `packs/` avec TextEdit, ou mieux avec un éditeur comme VS Code :

```json
{
  "pack": "Disney & Pixar",
  "theme": "orange",
  "thinkSeconds": 4,
  "films": [
    { "emojis": ["🦁", "👑", "🌅"], "title": "Le Roi Lion", "year": 1994, "difficulty": 1 },
    { "emojis": ["🎈", "🏠", "👴"], "title": "Là-haut", "year": 2009, "difficulty": 2 }
  ]
}
```

- **pack** : le nom affiché dans l'intro et sur la couverture.
- **theme** : la couleur de départ. Au choix : `bleu`, `orange`, `violet`, `rose`, `turquoise`, `rouge`. La couleur change ensuite à chaque film.
- **thinkSeconds** : le temps de réflexion par film. 4 secondes donnent une vidéo d'environ 1 min 10.
- **films** : de 1 à 4 emojis, le titre, l'année (facultatif) et la difficulté (1 = facile, 2 = moyen, 3 = expert). Mets les films du plus facile au plus dur.

**Plus de 10 films dans un fichier ?** L'outil fait plusieurs vidéos tout seul (`…-partie-1`, `…-partie-2`…), et chaque fin de vidéo annonce la partie suivante.

**Nouveau thème ?** Copie un fichier, renomme-le (par exemple `films-noel.json`, sans espace ni accent), puis change son contenu.

Après chaque modification, lance `npm run verifier` : la commande te dit si un emoji n'existe pas ou si une virgule manque.

## 4. Les affiches de films

À la réponse, l'affiche du film s'affiche en grand. Pour les récupérer :

```bash
npm run affiches
```

- Les images vont dans `public/affiches/` (ex. `le-roi-lion.jpg`). Une affiche déjà là n'est jamais remplacée.
- **Affiches nettes et en français** : crée un compte gratuit sur themoviedb.org, demande une clé API (Paramètres → API), colle-la dans un fichier `tmdb.txt` à la racine du projet. Sans clé, les affiches viennent de Wikipédia (plus petites).
- Une affiche introuvable ? Dépose l'image toi-même avec le nom indiqué.
- Pas d'affiche pour un film = la réponse s'affiche en texte, comme avant.
- Les affiches ne sont pas envoyées sur GitHub.

## 5. Droits d'auteur

- **Affiches** : elles appartiennent aux studios. TikTok peut couper le son ou retirer une vidéo sur réclamation ; la courte durée n'est pas une protection légale en France.
- **Emojis** : les emojis 3D « Fluent » de Microsoft (licence MIT), et Twemoji (CC BY 4.0) quand un emoji n'existe pas en 3D. Le crédit est affiché en petit sur l'écran de fin.
- **Polices** : Lilita One et Fredoka, licence libre (OFL).
- **Bruitages et musique** : fabriqués par ce projet (`npm run sons`), donc 100 % originaux. Tu peux aussi les remplacer par tes propres fichiers dans `public/sfx/` et `public/musique/`.
- **Remotion** (l'outil qui fabrique les vidéos) : gratuit pour un particulier ou une petite équipe.
