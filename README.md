# Chat Server with Redis and MongoDB

Made by Burillon William and Ballaz Corentin

## Connexion et sauvegarde user via Redis

Pour ce projet nous utilisons l’API Redis pour la connexion à la base de données dans laquelle nous sauvegardons les informations des utilisateurs.

Pour lancer le service, assurez-vous d’avoir installé Redis. Ouvrez ensuite une console (plutôt Ubuntu sur Windows), placez-vous dans le répertoire de travail et lancez la commande redis-serveur. Le logo de Redis doit apparaitre.

Fonctionnement du programme :

On supprime dans un premier temps toutes les données dans Redis avec client.FLUSHALL(). Ensuite, à chaque connexion, on sauvegarde le nom d’utilisateur : la clé est ‘Room’ + numéro du salon et la valeur est une liste contenant le nom de tous les utilisateurs connectés dans ce salon. Le nom d’utilisateur est unique, quelque soit le salon dans lequel l’utilisateur tente de se connecter.
Quand un utilisateur se déconnecte, il est automatiquement supprimé de la base de données.

## Ajout des messages dans Database Mongo

Nous utilisons l’API Mongoose pour Node.JS pour la connexion à la base de données Mongo.

On crée un Schema Mongoose afin d’ajouter les messages dans la base de données associée, puis on modifie le code de manière à ce que les messages envoyés aux personnes du salon soient
stockés en base. On stocke le pseudo de la personne qui envoie le message, le contenu du message
ainsi que la salle où il était.

## Utilisation du ReplicatSet pour permettre la tolérance aux pannes

L’instanciation du replicaset nécessite une implémentation particulière au niveau de la hiérarchisation avec MongoDB. 

En effet, cette fonctionnalité nécessite la création de 3 serveurs MongoDB : Le primary et deux secondary. Créez un répertoire « data » dans le répertoire de travail. Assurez-vous que mongo est bien installé, ouvrez trois consoles différentes, placez vous dans le répertoire de travail et effectuez les commandes suivantes dans vos différentes consoles :

mongod --replSet rs0 --port 27018 --dbpath ./data/R0S1

mongod --replSet rs0 --port 27019 --dbpath ./data/R0S2

mongod --replSet rs0 --port 27020 --dbpath ./data/R0S3

On lance alors un client mongo sur le port 27018 : ouvrez une nouvelle console et effectuez la
commande mongo --port 27018. On va instancier le replicatset avec la commande rs.initiate()
dans cette même console. Puis on ajoute les deux autres serveurs au replicatset avec
rs.add(‘localhost :27019’) et rs.add(‘localhost :27020’), toujours dans la même console.

Il ne nous reste qu’à initialiser un serveur permettant de faire l’arbitre entre les différents serveurs,
qui aura le rôle d’élire le primary. Rouvrez une dernière console et effectuez :

mongod --replSet rs0 --port 3000 --dbpath ./data/arb

Enfin, il suffit d’exécuter la commande rs.addArb(‘localhost :3000’) dans le client mongo. Dès cet
instant, l’arbitre élit le primary et les deux secondary.

## Pouvoir afficher une conversation précédente entre plusieurs utilisateurs

Pour cette partie, nous avons decider de créer une API Rest et d’effectuer des requêtes http via
PostMan.

Dans la phase de reflexion, nous nous sommes rendu compte, au vu de l’application de chat, que des
utilisateurs pouvaient communiquer entre eux si et seulement s’ils étaient dans le même salon. De ce
fait, nous avons conçut une API permettant de faire une requête en BDD (où sont stockés les messages)
depuis un certain moment. Exemple de requête : Avoir toutes les messages du salon 1 depuis 5 min,
depuis le debut…

Pour cela nous allons créer un repertoire de cette facon :

Api
|-------Controllers
| |_ _ _ _ _message-controler.js
|
|---------------------Models
| |_ _ _ _message.js
|
|------------------------------Routes
|_ _ _ _ index.js

Au niveau de l’url utlisé pour recuperer ces données, nous avons decider d’utiliser une requêtes http
GET comme ceci : "/messageFrom/:room&:dateFrom&:typeDate" .

Libre à vous d'essayer différentes requêtes! 
