var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var i;
const APIRoutes = require('./api/route');

const controller = require('./api/controllers');

const redis = require('redis');
const  client = redis.createClient();


/**
 * Gestion des requêtes HTTP des utilisateurs en leur renvoyant les fichiers du dossier 'public'
 */
app.use('/', express.static(__dirname + '/public'));
app.use(APIRoutes);
/**
 * Liste des utilisateurs connectés
 */
var users = [];

/**
 * Historique des messages
 */
var messages = [];


/**
 * List rooms
 */
let rooms = [{
  'id':1,
  'name':'test',
  'numUsers':0,
  'users':[]
},
  {
    'id':2,
    'name':'test',
    'numUsers':0,
    'users':[]
  }];

/**
 * Liste des utilisateurs en train de saisir un message
 */
var typingUsers = [];

io.on('connection', function (socket) {

  /**
   * Utilisateur connecté à la socket
   */
  var loggedUser;

  /**
   * Emission d'un événement "user-login" pour chaque utilisateur connecté
   */
  //  for (i = 0; i < users.length; i++) {
  //   socket.emit('user-login', users[i]);
  // }

  /**
   * Emission d'un événement "chat-message" pour chaque message de l'historique
   */
  // for (i = 0; i < messages.length; i++) {
  //   if (messages[i].username !== undefined) {
  //     socket.emit('chat-message', messages[i]);
  //   } else {
  //     socket.emit('service-message', messages[i]);
  //   }
  // }

  /**
   * Déconnexion d'un utilisateur
   */
  socket.on('disconnect', function () {
    if (loggedUser !== undefined) {
      // Broadcast d'un 'service-message'
      var serviceMessage = {
        text: 'User "' + loggedUser.username + '" disconnected',
        type: 'logout'
      };
      socket.broadcast.to(loggedUser.room).emit('service-message', serviceMessage);
      // Suppression de la liste des connectés
      var userIndex = users.indexOf(loggedUser);
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
      }
      // Ajout du message à l'historique
      messages.push(serviceMessage);
      // Emission d'un 'user-logout' contenant le user
      io.emit('user-logout', loggedUser);
      // Si jamais il était en train de saisir un texte, on l'enlève de la liste
      var typingUserIndex = typingUsers.indexOf(loggedUser);
      if (typingUserIndex !== -1) {
        typingUsers.splice(typingUserIndex, 1);
      }
    }
  });

  /**
   * Connexion d'un utilisateur via le formulaire :
   */
  socket.on('user-login', function (user, callback) {
    // Vérification que l'utilisateur n'existe pas
    var userIndex = -1;
    for (i = 0; i < users.length; i++) {
      if (users[i].username === user.username) {
        userIndex = i;
      }
    }
    if (user !== undefined && userIndex === -1) { // S'il est bien nouveau
      // Sauvegarde de l'utilisateur et ajout à la liste des connectés
      loggedUser = user;
      users.push(loggedUser);
      rooms.find(x => x.id === user.room).users.push(user.username);
      rooms.find(x => x.id=== user.room).numUsers++;
      // socket.join(user.room)
      // Envoi et sauvegarde des messages de service
      socket.join(user.room)


      var userServiceMessage = {
        text: 'You logged in as "' + loggedUser.username + '" in the chat Number :' +loggedUser.room,
        type: 'login'
      };
      var broadcastedServiceMessage = {
        text: 'User "' + loggedUser.username + '" logged in this chat ',
        type: 'login'
      };
      //emit logged as untel
      socket.emit('service-message', userServiceMessage);
      // socket.nsp.in(user.room).emit('service-message', broadcastedServiceMessage);
      // io.sockets.in(user.room).emit('service-message', userServiceMessage);
      // io.sockets.in(user.room).emit('service-message', broadcastedServiceMessage);
      // socket.nsp.to(user.room).emit('service-message', broadcastedServiceMessage);
      //emit to member of the room that a men will coming
      socket.broadcast.to(user.room).emit('service-message', broadcastedServiceMessage);
      messages.push(broadcastedServiceMessage);
      // controller.postMessage(broadcastedServiceMessage);

      client.lpush(user.room,user.username)

      // var elementToSocket = {
      //   user : loggedUser,
      //   userConnected : client.lrange(user.room,0,-1)
      // };
      client.lrange(user.room,0,-1,function (err,result){
        if (err) {
          /* handle error */
        } else {
          console.log(result);
        }
      });



      // Emission de 'user-login' et appel du callback
      io.sockets.in(user.room).emit('user-login', loggedUser);
      callback(true);
    } else {
      callback(false);
    }
  });

  /**
   * Réception de l'événement 'chat-message' et réémission vers tous les utilisateurs
   * put message dans mongoDB
   */
  socket.on('chat-message', function (message) {
    // On ajoute le username au message et on émet l'événement
    message.username = loggedUser.username;
    message.room = loggedUser.room;
    message.date=new Date(new Date().setHours(new Date().getHours()+2,new Date().getMinutes(),new Date().getSeconds()));
    console.log(new Date().setHours(new Date().getHours()+2,new Date().getMinutes(),new Date().getSeconds()));
    console.log(new Date(new Date().setHours(00,00,00)));
    console.log(new Date(new Date().setHours(23,59,59)));
    console.log(new Date(new Date().setHours(new Date().getHours()-2,new Date().getMinutes(), new Date().getSeconds())))
    console.log(new Date(new Date()))
    console.log(new Date(new Date().setDate(new Date().getDate()-1)))
    io.sockets.in(message.room).emit('chat-message', message);
    // Sauvegarde du message
    messages.push(message);

    //mets un message dans mongodb

    controller.postMessage(message);

    console.log(message);
    if (messages.length > 150) {
      messages.splice(0, 1);
    }
  });

  /**
   * Réception de l'événement 'start-typing'
   * L'utilisateur commence à saisir son message
   */
  socket.on('start-typing', function () {
    // Ajout du user à la liste des utilisateurs en cours de saisie
    if (typingUsers.indexOf(loggedUser) === -1) {
      typingUsers.push(loggedUser);
    }
    io.emit('update-typing', typingUsers);
  });

  /**
   * Réception de l'événement 'stop-typing'
   * L'utilisateur a arrêter de saisir son message
   */
  socket.on('stop-typing', function () {
    var typingUserIndex = typingUsers.indexOf(loggedUser);
    if (typingUserIndex !== -1) {
      typingUsers.splice(typingUserIndex, 1);
    }
    io.emit('update-typing', typingUsers);
  });
});
const mongoose = require('mongoose');
database = 'mongodb://localhost:27019,localhost:27018,localhost:27020/TPchat?replicaSet=rs0';
mongoose.connect(database,(err)=>{
  if(err)
    throw err;
  console.log('conneced to the database')
});
/**
 * Lancement du serveur en écoutant les connexions arrivant sur le port 3000
 */
http.listen(3000, function () {
  console.log('Server is listening on *:3000');
});