# Renaturapage

je veux que ça soit adapter au design de l'image , ensuite :Tu es un ingénieur logiciel senior spécialisé en plateformes scientifiques, API océanographiques, traitement de données environnementales, bases de données et interfaces de recherche.

OBJECTIF GÉNÉRAL
Fais évoluer mon site existant Renatur Océan (https://renaturocean.space/) en une plateforme de recherche, de surveillance et d'archivage océanographique centrée sur Pointe-Noire, en République du Congo, et sur les zones maritimes voisines. Ne reconstruis pas le site depuis zéro. Analyse d'abord le code existant, les composants, le backend, la base de données et les API déjà configurées. Préserve le design, la navigation et les fonctionnalités existantes et intègre les nouvelles fonctionnalités de manière cohérente.

1. CONNECTER RÉELLEMENT LES API SCIENTIFIQUES
Vérifie et configure les connexions nécessaires aux sources officielles suivantes :
- Copernicus Marine Service : https://data.marine.copernicus.eu/
- Copernicus Data Space Ecosystem : https://dataspace.copernicus.eu/
- NOAA : https://www.ncei.noaa.gov/
- Programme Argo : https://argo.ucsd.edu/
- Autres catalogues scientifiques reconnus pertinents pour l'océan Atlantique et le golfe de Guinée.

Consulte les documentations officielles, identifie les jeux de données adaptés à chaque variable et à chaque période, puis implémente les requêtes réelles. Vérifie les méthodes d'authentification, les limites d'utilisation, les formats et les conditions d'accès. Ne te contente pas d'ajouter des boutons ou de simuler une connexion.

Utilise une architecture backend sécurisée pour les appels qui nécessitent des identifiants. Si le projet utilise Supabase, réutilise son architecture existante et ses fonctions Edge lorsque c'est pertinent. Ne place jamais de clés secrètes dans le frontend.

2. CRÉER UN CATALOGUE HISTORIQUE DE 1950 À AUJOURD'HUI
Crée une section intitulée « Archives océanographiques » permettant de rechercher des données depuis 1950 jusqu'à la dernière période effectivement disponible.

Propose les catégories suivantes :
- Température de surface de la mer.
- Température océanique en profondeur.
- Salinité.
- Courants marins.
- Hauteur des vagues.
- Niveau de la mer.
- Chlorophylle-a et paramètres biogéochimiques.
- Acidification et pH, uniquement lorsque des données adaptées sont disponibles.
- Observations satellitaires.
- Profils et mesures des flotteurs Argo.
- Données côtières et environnementales.
- Publications et rapports scientifiques.
- Données de pollution marine uniquement lorsque des sources et mesures pertinentes existent.

Chaque catégorie doit indiquer les périodes disponibles, la zone géographique couverte, les unités, la fréquence des observations, le type de produit et la source.

IMPORTANT : 1950 est la date de départ souhaitée pour la recherche, et non une promesse que toutes les variables seront disponibles depuis cette date. Pour chaque catégorie, affiche la véritable première année disponible. Certaines observations satellitaires et certains programmes de mesure n'ont commencé que beaucoup plus tard. Lorsque les archives commencent après 1950, indique-le clairement. Ne génère aucune donnée fictive pour combler les périodes manquantes.

3. METTRE EN PLACE DES FILTRES AVANCÉS
Crée une interface de recherche simple et professionnelle avec :
- Un filtre par catégorie de données.
- Une sélection de date de début et de fin, de 1950 à la période la plus récente disponible.
- Un filtre géographique : Pointe-Noire, côte de la République du Congo, golfe de Guinée ou zone personnalisée.
- Un filtre par source scientifique.
- Un filtre par type de données : observation directe, satellite, réanalyse, modèle ou prévision.
- Un filtre par profondeur lorsque cette information existe.
- Un filtre par résolution spatiale, période et qualité des données.
- Un champ de recherche par mot-clé.

Les filtres doivent fonctionner réellement et se combiner entre eux. Lorsque l'utilisateur modifie les critères, mets à jour les résultats à partir des données effectivement disponibles dans le catalogue ou la base de données. Affiche le nombre de résultats, les périodes couvertes et les critères actifs. Ajoute un bouton « Réinitialiser les filtres ».

4. CRÉER UNE INTERFACE D'EXPLORATION DES DONNÉES
Présente les résultats sous forme de tableaux et de cartes scientifiques lisibles. Chaque résultat doit comporter :
- Le nom du jeu de données.
- La catégorie.
- La période couverte.
- La zone géographique.
- La source.
- Le type de données.
- La date de dernière mise à jour.
- Les unités et la résolution lorsqu'elles sont disponibles.
- Un bouton « Consulter ».
- Un bouton « Télécharger » lorsque le format et les droits d'accès le permettent.

Permets d'ouvrir une fiche détaillée avec les métadonnées, la description scientifique, les limites d'interprétation et un graphique historique lorsque des séries de valeurs sont disponibles.

5. CRÉER UNE BIBLIOTHÈQUE DE DOCUMENTS PDF
Ajoute une section « Bibliothèque scientifique » consacrée aux articles, rapports, études, publications, bulletins et documents relatifs aux océans, en donnant la priorité à Pointe-Noire, au Congo, à l'Afrique centrale, au golfe de Guinée et à l'Atlantique.

La bibliothèque doit permettre :
- De consulter la liste des documents.
- De rechercher par titre, auteur, mot-clé et année.
- De filtrer par thème, pays, source et type de publication.
- De visualiser la couverture, le titre, les auteurs, l'année, le résumé, la langue et la source.
- D'ouvrir le document PDF dans le navigateur.
- De télécharger le PDF lorsque les droits et les conditions de la source le permettent.
- D'accéder à la page officielle de la publication.
- De consulter les métadonnées et, si disponible, le DOI.

Explore les API et catalogues documentaires pertinents, notamment OpenAlex (https://openalex.org/), Crossref (https://www.crossref.org/), HAL (https://hal.science/) et les dépôts institutionnels accessibles. Recherche également les publications d'organismes océanographiques et de recherche reconnus.

Ne suppose pas que chaque résultat bibliographique fournit un PDF en accès libre. Vérifie la disponibilité du texte intégral et les droits de réutilisation. Si seul le résumé ou le lien de l'éditeur est accessible, affiche ce lien plutôt que de fabriquer un PDF ou de contourner un paywall.

6. GESTION DES PDF ET DES DOCUMENTS
Permets aux administrateurs ou contributeurs autorisés d'ajouter des documents PDF avec :
- Téléversement sécurisé du fichier.
- Titre, auteur, année, résumé et mots-clés.
- Catégorie et zone géographique.
- Langue, source, URL officielle et DOI facultatif.
- Mention des droits de téléchargement et de réutilisation.
- Date d'ajout et statut de validation.

Si Supabase Storage est déjà utilisé, intègre les fichiers à l'espace de stockage existant et configure les règles d'accès appropriées. Vérifie le type et la taille des fichiers, sécurise les opérations de téléversement et empêche les utilisateurs non autorisés de modifier le catalogue.

Les utilisateurs publics doivent pouvoir télécharger les documents autorisés sans créer de compte si cela correspond au fonctionnement actuel du site.

7. DONNÉES HISTORIQUES ET COMPARAISONS
Crée une fonctionnalité permettant de comparer différentes périodes, par exemple 1950-1979, 1980-1999, 2000-2010, 2011-2020 et 2021 à la dernière année disponible. Ces périodes doivent rester personnalisables et ne doivent pas remplacer les dates exactes des données.

Ajoute des graphiques d'évolution temporelle, des comparaisons entre périodes et, lorsque les données le permettent, des indicateurs d'anomalie par rapport à une référence climatique documentée.

Pour chaque graphique, affiche la source, la période, les unités, la méthode de calcul et les données manquantes. Ne compare pas directement des produits incompatibles sans harmonisation scientifique.

8. GÉRER LES IMPORTATIONS ET LA MISE À JOUR
Mets en place un processus d'importation et de synchronisation des métadonnées et des données :
- Mise à jour planifiée adaptée à chaque source.
- Pagination et gestion des limites d'API.
- Cache des résultats.
- Détection des doublons.
- Journal des synchronisations et des erreurs.
- Gestion des reprises après échec.
- Horodatage de la dernière synchronisation réussie.

Évite de télécharger toute une archive depuis 1950 dans le navigateur. Utilise des requêtes ciblées, une pagination, des traitements backend et des extractions par période ou par zone pour limiter les coûts et les volumes.

9. EXPÉRIENCE UTILISATEUR
Conserve l'identité visuelle de Renatur Océan et rends cette section accessible aux chercheurs, étudiants, enseignants, décideurs et grand public. Prévois une interface scientifique détaillée et une présentation pédagogique simplifiée en français. Les chargements, erreurs, filtres sans résultats et téléchargements doivent disposer de messages clairs.

10. EXIGENCES DE QUALITÉ ET DE LIVRAISON
- Inspecte l'application existante avant de modifier le code.
- Réutilise les composants, tables et intégrations déjà disponibles.
- Ne supprime aucune fonctionnalité existante.
- Ne crée pas de fausses données scientifiques ni de faux documents.
- N'affiche pas une source comme connectée sans test réussi.
- Distingue clairement les données historiques, observations récentes, réanalyses et prévisions.
- Respecte les licences, conditions d'utilisation, citations et droits des documents.
- Vérifie la sécurité, les performances, la pagination et les filtres.
- Teste les connexions API, les requêtes historiques, les filtres combinés et les téléchargements PDF.
- Fournis un bilan final indiquant les fonctionnalités réellement opérationnelles, les sources effectivement connectées, les plages temporelles disponibles et les éventuelles clés ou autorisations restant à configurer.

Commence par auditer le projet et mettre en œuvre les fonctionnalités de bout en bout. Ne te limite pas à une maquette frontend : connecte les données, le backend et les téléchargements réellement possibles.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://renaturapage.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a29c7734-fd80-4790-99ca-37880f78b251).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
