# CaloFast

Appli web pour compter les calories d'un repas fast-food, sans compte. On choisit l'enseigne, le menu, la taille, l'accompagnement, la boisson, puis sauces et dessert : les calories s'affichent à chaque choix, et le récap donne le total avec les protéines, glucides et lipides.

Enseignes : Burger King, McDonald's, KFC, Quick. Chaque enseigne a son propre thème de couleurs (sans logo ni police officielle : l'appli n'est pas affiliée aux enseignes).

Le site s'installe sur le téléphone comme une appli (PWA) : un bandeau propose l'installation sur Android, et explique la marche à suivre sur iPhone.

## Lancer en local

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # vérifie les calculs et la cohérence des données
npm run build
```

## Données

Un fichier JSON par enseigne dans `src/data/`. Chaque fichier contient :

- `produits` : valeurs **par portion** (kcal, protéines, glucides, lipides, et sucres/sel quand ils sont connus), avec l'URL de la fiche source ;
- `menus` : le plat principal de chaque menu, rangé par catégorie ;
- `tailles` : Normal / Maxi (ou Best Of / Maxi Best Of) ;
- `etapes` : les choix d'accompagnement et de boisson (un produit par taille), puis les sauces et desserts.

| Enseigne | Source | Fiabilité |
|---|---|---|
| Burger King | fiches produits officielles burgerking.fr | officielle |
| McDonald's | fiches produits officielles mcdonalds.fr | officielle (nuggets 6/9 et boissons 50 cl calculés) |
| KFC | base collaborative FatSecret | indicative (badge dans l'appli) |
| Quick | base collaborative FatSecret | indicative (badge dans l'appli) |

Les champs `note` et `calcule` signalent les valeurs déduites ou douteuses. Pour mettre à jour une enseigne, modifier son JSON puis lancer `npm test`.

## Déploiement

Le projet se déploie tel quel sur Vercel : importer le dépôt sur [vercel.com/new](https://vercel.com/new), sans réglage particulier. Chaque push sur `main` remet le site en ligne.
