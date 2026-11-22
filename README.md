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
| télécharger les images des réponses | `npm run images` |
| chercher un emoji par mot-clé | `npm run emoji -- search potion` |
| vérifier que des emojis existent en 3D | `npm run emoji -- check "🐗🧪🐫"` |
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

**Bien choisir les emojis.** Chaque emoji doit avoir un sens évident une fois la réponse connue :
- un objet culte, une scène culte, un personnage, ou un jeu de mots sur le titre ;
- pas d'emoji « bouche-trou » (🏰, 👑 ou ⚔️ seuls) ;
- pas de rond de couleur, qui ressemble à une boule en 3D.

Les 110 indices actuels ont tous été testés « à l'aveugle » : des joueurs qui ne connaissaient pas la réponse ont dû la trouver.

## 4. Les images des réponses (affiches, photos, logos…)

À chaque réponse, une image s'affiche en grand : l'affiche du film, la photo du joueur, le logo du club, etc. Pour les récupérer :

```bash
npm run images
```

- Les images vont dans `public/affiches/` pour les films (ex. `le-roi-lion.jpg`), ou dans le dossier choisi par le pack (voir plus bas). Une image déjà là n'est jamais remplacée.
- **Affiches de films nettes et en français** : crée un compte gratuit sur themoviedb.org, demande une clé API (Paramètres → API) et colle-la dans un fichier `tmdb.txt` à la racine du projet. Sans clé, les images viennent de Wikipédia.
- **Crédits** : quand une photo est sous licence libre (Wikimedia Commons), son auteur est noté tout seul dans `credits.json`. Il s'affiche en petit à côté de l'image dans la vidéo.
- **Image introuvable ou mauvaise ?** Dépose toi-même l'image avec le nom indiqué. Tu peux aussi écrire dans la question `"image": "https://…"` (l'adresse d'une image trouvée sur internet).
- Une question sans image : la réponse s'affiche en texte, comme avant.
- Les images ne sont pas envoyées sur GitHub.

### Faire une autre saison (personnages, joueurs, pays…)

Ajoute ces lignes en haut du fichier du pack :

```json
{
  "pack": "Footballeurs",
  "devine": "le joueur",
  "pluriel": "joueurs",
  "recherche": "footballeur",
  "dossierImages": "images/footballeurs",
  "bareme": ["T'as jamais vu un match 🙈", "Supporter du dimanche ⚽", "Expert du ballon rond 🏆"],
  "questions": [
    { "emojis": ["🐐", "🇦🇷", "🔟"], "title": "Lionel Messi" }
  ]
}
```

- **devine** : ce qui s'affiche après « DEVINE » (« le joueur », « la ville », « l'expression »…).
- **pluriel** : le mot pour l'intro (« 10 joueurs »).
- **recherche** : un mot ajouté à la recherche d'images (« footballeur », « club de football », « pays »…).
- **dossierImages** : où ranger les images de cette saison.
- **bareme** : les 3 phrases de l'écran de fin.

## 5. Droits d'auteur

- **Affiches, logos, photos de personnes** : les affiches et logos appartiennent à leurs propriétaires, et les personnes ont un droit à l'image. TikTok peut couper le son ou retirer une vidéo après une réclamation. Que l'image reste peu de temps à l'écran ne protège pas en France. Les photos libres (Wikimedia Commons) sont créditées automatiquement.
- **Emojis** : les emojis 3D « Fluent » de Microsoft (licence MIT), et Twemoji (CC BY 4.0) quand un emoji n'existe pas en 3D. Le crédit est affiché en petit sur l'écran de fin.
- **Polices** : Lilita One et Fredoka, licence libre (OFL).
- **Bruitages et musique** : fabriqués par ce projet (`npm run sons`), donc 100 % originaux. Tu peux aussi les remplacer par tes propres fichiers dans `public/sfx/` et `public/musique/`.
- **Remotion** (l'outil qui fabrique les vidéos) : gratuit pour un particulier ou une petite équipe.
