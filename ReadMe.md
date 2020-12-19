# Application web de gestion des heures d'enseignement

## Commandes

télécharger le projet : ```git clone https://gitlab.com/antoine.richard68/gestion-heure-enseignement```


installer les dépendances : ```npm install```


lancer l'application : ```npm start```


ouvrir l'application : http://localhost:3000


## Contexte

Cette application à été réalisé dans le cadre de mon projet de fin d'étude de mon DUT Informatique en 2020. 

## Objectif

L'application web de gestion des heures d’enseignement a pour but de permettre, de faire un bilan des heures faites par chaque enseignant afin de voir si ce dernier respecte le nombre d’heures obligatoires et supplémentaires selon son statut. Dans le but d’effectuer ce bilan, l’utilisateur de l’application pourra créer la décomposition de la formation qu’il souhaite, puis pour chaque matière il pourra définir son type de saisie des heures entre hebdomadaire et global. Puis remplir les heures de chaque formation dans un tableau qui se doit d’être simple d’utilisation et ergonomique.

## Outils utilisés

Cette application web est construite avec **Express.js**, un framework **Nodejs**. 

Base de données :  **MongoDB** géré avec le module **Mongoose** de Nodejs. Ajout du plug-in **mongoose-data-tree** pour pouvoir gérer facilement la structure de données en arbre.

Moteur de template **Ejs** et framework CSS **Bulma**.

## Exemples de vues

Menu principal :

![menu-principal](/imgs_readme/image-20201219162645274.png?raw=true)

Affichage de la hiérarchie d'une formation :

![hierarchie-formation](/imgs_readme/image-20201219163505797.png?raw=true)

Saisie des heures pour une année dans une formation :

![saisie-heure](/imgs_readme/image-20201219163658835.png?raw=true)

Affichage d'un bilan d'une année :

![affichage-bilan](/imgs_readme/image-20201219163915398.png?raw=true)
