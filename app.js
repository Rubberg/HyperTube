var https = require('https');
var request = require('request');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var Datetime = require('node-datetime');


// Les middlewares de l'app
var nodemailer = require('nodemailer');
var moment = require('moment');
var busboy = require('connect-busboy');
var fs = require('fs');
const testFolder = '/tmp/video/';
var crypto = require('crypto');
var htmlspecialchars = require('htmlspecialchars');
var mkdirp = require('mkdirp');
const util = require('util');


// const ExtraTorrentAPI = require('extratorrent-api').Website;
// const extraTorrentAPI = new ExtraTorrentAPI();
// const KAT = require('kat-api-pt'); 
// const kat = new KAT();
var PirateBay = require('thepiratebay');
var tnp = require('torrent-name-parser');
const imdb = require('imdb-api');
// imdb.setKey('5c9b875f');

var mongoose = require('mongoose');
var configDB = require('./config/database.js');
let async = require('async');

var passport = require('passport');
var flash = require('connect-flash')

//// require ROUTES ! /////
var index = require('./routes/index');
var users = require('./routes/users');
var root = require('./routes/root');
var home = require('./routes/home');
var inscription = require('./routes/inscription');
var connexion = require('./routes/connexion');
var profile = require('./routes/profile');
var profileList = require('./routes/profileList');
var watch = require('./routes/watch');

//MODEL
var UserModel = require("./models/userModel.js").UserModel;
var CommentModel = require("./models/CommentModel.js").CommentModel;
var WatchedModel = require("./models/WatchedModel.js").WatchedModel;

require('./config/passport.js')(passport);



var app = express();

var userz = [];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
var server = app.listen(8080);
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());



app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next)=>{
  if (req.session && req.session.user){
    UserModel.find({username : req.session.user.username}, (err, result)=>{
      if (err){
        console.log(err)
      }else{
        if (result[0])
        {
          req.user = result[0];
          delete req.user.pwd;
          req.session.user = result[0];
          res.locals.user = result[0];

        } else{

        }
        next();
      }
    })
  } else{
    next();
  }
});

app.use(express.static(path.join(__dirname, 'public')));


mkdirp('/tmp/video', function(err) {
    fs.readdir(testFolder, (err, files) => {
        files.forEach(file => {
            fs.stat('/tmp/video/'+file, (errur, stats)=>{
                if (err){
                    console.log(errur);
                }


                var monthLater = stats.birthtime.setMonth(stats.birthtime.getMonth()+1);

                var later = monthLater;
                var now =  Date.now().valueOf();

                if (now > later){
                  fs.unlink('/tmp/video/' + file, ()=>{

                  });
                }
                //console.log(stat.mtime);

            });
        });

    });
    // path exists unless there was an error
    if (err){

    }

});


let db = mongoose.connect('mongodb://localhost/HyperTube', (err)=> {
  if (err) {throw err}
});
/////// LET THIS ABOVE /////
app.use((req, res, next) => {
  req.db = db;
  next();
});
///// THIS ! ///////

app.get('/auth/facebook',
  passport.authenticate('facebook', {scope: ['email ', 'public_profile']}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    req.session.user = req.user;
    res.redirect('/home');
  });


app.get('/auth/42', passport.authenticate('42'));

    app.get('/auth/42/callback',
  passport.authenticate('42', { failureRedirect: '/login' }),
  function(req, res) {
    req.session.user = req.user;
    res.redirect('/home');
  });


app.use('/', index);
app.use('/users', users);
app.use('/home', home);
app.use('/connexion', connexion);
app.use('/inscription', inscription);
app.use('/profile', profile);
app.use('/profileList', profileList);
app.use('/root', root);
app.use('/watch', watch);

////// ALL TIME :P //////
// catch 404 and forward to error handler

////FACEBOOK AUTHHH




//Le système de navigation via socket
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

  //Les fonctions de triage/fitrage
  function sortList(filmsList, callback){
      for (var m = 0; m < (filmsList.length - 1); m++) {
        for (var n = (filmsList.length - 1); n; n--) {
          if (filmsList[m].title > filmsList[m + 1].title) {
            var temp = filmsList[m]
            filmsList[m] = filmsList[m + 1]
            filmsList[m + 1] = temp
            temp = ''
            m = 0
          }
          if (filmsList[n].title < filmsList[n - 1].title) {
            var temp2 = filmsList[n]
            filmsList[n] = filmsList[n - 1]
            filmsList[n - 1] = temp2
            temp2 = ''
            n = (filmsList.length - 1)
          }
        }
      }
      if (m == (filmsList.length - 1) && (!n)) {
        return (callback(filmsList))
      }
    }

    function sortListByYear(filmsList, callback){
      for (var m = 0; m < (filmsList.length - 1); m++) {
        for (var n = (filmsList.length - 1); n; n--) {
          if (filmsList[m].movieDatas.year > filmsList[m + 1].movieDatas.year) {
            var temp = filmsList[m]
            filmsList[m] = filmsList[m + 1]
            filmsList[m + 1] = temp
            temp = ''
            m = 0
          }
          if (filmsList[n].movieDatas.year < filmsList[n - 1].movieDatas.year) {
            var temp2 = filmsList[n]
            filmsList[n] = filmsList[n - 1]
            filmsList[n - 1] = temp2
            temp2 = ''
            n = (filmsList.length - 1)
          }
        }
      }
      if (m == (filmsList.length - 1) && (!n)) {
        return (callback(filmsList))
      }
    }

    function sortListByRank(filmsList, callback){
      for (var l = 0; l < filmsList.length; l++) {
        if (filmsList[l].movieDatas.rating == 'N/A') {
          filmsList[l].movieDatas.rating = '0'
        }
      }
      for (var m = 0; m < (filmsList.length - 1); m++) {
        for (var n = (filmsList.length - 1); n; n--) {
          if (filmsList[m].movieDatas.rating > filmsList[m + 1].movieDatas.rating) {
            var temp = filmsList[m]
            filmsList[m] = filmsList[m + 1]
            filmsList[m + 1] = temp
            temp = ''
            m = 0
          }
          if (filmsList[n].movieDatas.rating < filmsList[n - 1].movieDatas.rating) {
            var temp2 = filmsList[n]
            filmsList[n] = filmsList[n - 1]
            filmsList[n - 1] = temp2
            temp2 = ''
            n = (filmsList.length - 1)
          }
        }
      }
      if (m == (filmsList.length - 1) && (!n)) {
        for (var m = 0; m < filmsList.length; m++) {
          if (filmsList[m].movieDatas.rating == '0') {
            filmsList[m].movieDatas.rating = 'N/A'
          }
        }
        return (callback(filmsList))
      }
    }

    function sortListByLength(filmsList, callback){
      for (var l = 0; l < filmsList.length; l++) {
        if (filmsList[l].movieDatas.runtime == 'N/A') {
          filmsList[l].movieDatas.runtime = '0'
        }
      }
      for (var m = 0; m < (filmsList.length - 1); m++) {
        if (filmsList[m].movieDatas.runtime == 'N/A') {
          filmsList[m].movieDatas.runtime = '0'
        }
        for (var n = (filmsList.length - 1); n; n--) {
          if (parseInt(filmsList[m].movieDatas.runtime) > parseInt(filmsList[m + 1].movieDatas.runtime)) {
            var temp = filmsList[m]
            filmsList[m] = filmsList[m + 1]
            filmsList[m + 1] = temp
            temp = ''
            m = 0
          }
          if (parseInt(filmsList[n].movieDatas.runtime) < parseInt(filmsList[n - 1].movieDatas.runtime)) {
            var temp2 = filmsList[n]
            filmsList[n] = filmsList[n - 1]
            filmsList[n - 1] = temp2
            temp2 = ''
            n = (filmsList.length - 1)
          }
        }
      }
      if (m == (filmsList.length - 1) && (!n)) {
        for (var m = 0; m < filmsList.length; m++) {
          if (filmsList[m].movieDatas.runtime == '0') {
            filmsList[m].movieDatas.runtime = 'N/A'
          }
        }
        return (callback(filmsList))
      }
    }

    function filterByTitle(filmsList, newList, filter) {
      return new Promise((resolve, reject) => {
        if (!filter) {
          reject("Erreur: pas de filtre titre!")
        }
        if (filter[filter.length - 1] != ":") {
          var length = filmsList.length
          for (var j = 0; j < length; j++) {
            if ((filter == 'AUTRE') && (filmsList[j].title[0].search(alpha) == -1)) {
              newList.push(filmsList[j])
            }
            else if ((filter != 'AUTRE') && ((filmsList[j].title[0] == filter) || (filmsList[j].title[0] == filter.toLowerCase()))) {
              newList.push(filmsList[j])
            }
          }
          if (j == length) {
            resolve(newList)
          }
        }
        else {
          resolve(filmsList)
        }
      })
    }

    function filterByYear(filmsList, newList, filter) {
      return new Promise((resolve, reject) => {
        if (!filter) {
          reject("Erreur: pas de filtre année!")
        }
        if (filter[filter.length - 1] != ":") {
          var length = filmsList.length
          for (var j = 0; j < length; j++) {
            if ((filter == '<1930') && (parseInt(filmsList[j].movieDatas.year) < 1930)) {
              newList.push(filmsList[j])
            }
            else if ((filter != '<1930') && (parseInt(filmsList[j].movieDatas.year) >= parseInt(filter)) && (parseInt(filmsList[j].movieDatas.year) < (parseInt(filter) + 10))) {
              newList.push(filmsList[j])
            }
          }
          if (j == length) {
            resolve(newList)
          }
        }
        else {
          resolve(filmsList)
        }
      })
    }

    function filterByRank(filmsList, newList, filter) {
      return new Promise((resolve, reject) => {
        if (!filter) {
          reject("Erreur: pas de filtre note!")
        }
        if (filter[filter.length - 1] != ":") {
          var length = filmsList.length
          for (var j = 0; j < length; j++) {
            // console.log(parseInt(filter)+" "+parseInt(filmsList[j].movieDatas.rating))
            if ((parseInt(filmsList[j].movieDatas.rating) >= parseInt(filter)) && (parseInt(filmsList[j].movieDatas.rating) < (parseInt(filter) + 1))) {
              newList.push(filmsList[j])
            }
          }
          if (j == length) {
            resolve(newList)
          }
        }
        else {
          resolve(filmsList)
        }
      })
    }

    function isDatGenre(film, newList, genre) {
      return new Promise((resolve, reject) => {
        if (film == '') {
          reject('Erreur isDatGenre: pas de film')
        }
        var genresTab = film.movieDatas.genres.split(',')
        var length = genresTab.length
        for (var i = 0; i < length; i++) {
          if (genresTab[i].trim() == genre) {
            // console.log(genresTab[i].trim()+" "+genre)
            resolve(film)
          }
        }
      })
    }

    function filterByGenre(filmsList, newList, filter) {
      return new Promise((resolve, reject) => {
        if (!filter) {
          reject("Erreur: pas de filtre genre!")
        }
        if (filter[filter.length - 1] != ":") {
          var length = filmsList.length
          for (var j = 0; j < length; j++) {
            isDatGenre(filmsList[j], newList, filter).then((film) => {
              if (film) {
                // console.log(film)
                newList.push(film)
                j++
              }
            })
            .catch((err) => {
              console.log(err)
            })
            // console.log(length+" "+j)
            if (j == (length - 1)) {
              resolve(newList)
            }
          }
        }
        else {
          resolve(filmsList)
        }
      })
    }

    function filterList(filmsList, filters, callback) {
        var alpha = '/[^A-Za-z]/'
        var newList = []

        filterByTitle(filmsList, newList, filters["title"]).then((titleList) => {
          var newList = []
          filterByYear(titleList, newList, filters["year"]).then((yearList) => {
            var newList = []
            filterByRank(yearList, newList, filters["rank"]).then((rankList) => {
              var newList = []
              filterByGenre(rankList, newList, filters["genre"]).then((genreList) => {
                // socket.listToSort = socket.filmsList
                socket.filmsList2 = genreList
                callback(genreList)
              })
              .catch((err) => {
                console.log(err)
              })
            })
            .catch((err) => {
              console.log(err)
            })
          })
          .catch((err) => {
            console.log(err)
          })
        })
        .catch((err) => {
          console.log(err)
        })
    }

  //Mise à jour de la liste des utilisateurs connéctés
  socket.on('newUser', function(data) {
    data.login = htmlspecialchars(data.login)
    for (var i = 0; i < userz.length; i++) {
      if (userz[i].login == data.login) {
        userz.splice(i, 1);
      }
    }
    userz.push(data);
  });

  //L'event de nouveau commentaire sur un film
  socket.on('newComment', (data) => {
    data.username = htmlspecialchars(data.username)
    data.img = htmlspecialchars(data.img)
    data.movie = htmlspecialchars(data.movie)
    data.comment = htmlspecialchars(data.comment)
    async.waterfall([
      function(callback){
        var NewComment = new CommentModel({ username : data.username, img: data.img, movie: data.movie, comment: data.comment});
        NewComment.save(function (err) {
            if (err) return callback(err);
          return callback(null, 'Nouveau commentaire!');
        });
      }
    ]);
  })

  socket.on('getComments', (data) => {
    data.movie = htmlspecialchars(data.movie)
    CommentModel.find({movie: data.movie}, function(err, comments) {
      if (!err){
        io.to(data.id).emit('browseComments', {comments: comments})
      } else {throw err;}
    });
    
  })

  //L'event d'enregistrement sur db de la lecture d'un film
  socket.on('watched', (data) => {
    data.username = htmlspecialchars(data.username)
    data.movieId = htmlspecialchars(data.movieId)
    WatchedModel.find({username : data.username, movieId: data.movieId}, function(err, watched) {
      if (!watched[0]){ 
        async.waterfall([
          function(callback){
            var NewWatched = new WatchedModel({ username : data.username, movieId: data.movieId});
            NewWatched.save(function (err) {
                if (err) return callback(err);
              return callback(null, 'Nouveau film visionné!');
            });
          }
        ]);
      } else if (err){
          //throw err;
      }
    });
  })

  //L'event de vérification d'un précédent visonnage du film
  socket.on('isWatched', (data) => {
    data.username = htmlspecialchars(data.username)
    data.movieId = htmlspecialchars(data.movieId)
    WatchedModel.find({username : data.username, movieId: data.movieId}, function(err, watched) {
      if (watched[0]){ 
        var id = '';
          for (var i = 0; i < userz.length; i++) {
            if (userz[i].login == data.username) {
              id = userz[i].id;
            }
          }
        io.to(id).emit('gotWatched', {msg: "yes", movieId: data.movieId})
      } else if (err){throw err;}
    });
    
  })

  //L'event de pagination infini en scrollant
  socket.on('getMoreFilms', (data) => {
    data.id = htmlspecialchars(data.id)


    var k = 0
    var j = socket.filmsIndex
    if (socket.filmsList2) {
      while ((j < socket.filmsList2.length) && (k < 4)) {
        if (socket.filmsList2[j] && socket.filmsList2[j].movieDatas && (socket.filmsList2[j].movieDatas.poster.slice(0, 4) == "http") && (socket.filmsList2[j].movieDatas.title != socket.filmsList2[j - 1].movieDatas.title)) {
          io.to(data.id).emit('browseFilmsList', {filmsList: socket.filmsList2[j]})
          k++
        }
        j++
      }
    }
    else {
      while ((j < socket.filmsListLength) && (k < 4)) {
        if (socket.filmsList[j] && socket.filmsList[j].movieDatas && (socket.filmsList[j].movieDatas.poster.slice(0, 4) == "http") && (socket.filmsList[j].movieDatas.title != socket.filmsList[j - 1].movieDatas.title)) {
          io.to(data.id).emit('browseFilmsList', {filmsList: socket.filmsList[j]})
          k++
        }
        j++
      }
    }
    socket.filmsIndex = j
  })

  //L'event de gestion du triage/filtrage
  socket.on('getDatSort', (data) => {
    data.id = htmlspecialchars(data.id)
    data.sort = htmlspecialchars(data.sort)
    data.title = htmlspecialchars(data.title)


    if (socket.filmsList2) {
      var listToSort = socket.filmsList2
    }
    else {
      var listToSort = socket.filmsList
    }
    if (listToSort == '') {
        io.to(data.id).emit('browseFilmsList', {filmsList: 'empty'})
    }

    //Fonction affichant les 8 premiers films
    function firstRow(sortedList) {
      if (sortedList == '') {
        io.to(data.id).emit('browseFilmsList', {filmsList: 'empty'})
      }
      else {
        var j = 0
        var k = 0
        var length = sortedList.length
        while ((j < length) && (k < 8)) {
          if (sortedList[j] && sortedList[j].movieDatas && (sortedList[j].movieDatas.poster.slice(0, 4) == "http") && ((j === 0) || (sortedList[j].movieDatas.title != sortedList[j - 1].movieDatas.title))) {
            io.to(data.id).emit('browseFilmsList', {filmsList: sortedList[j]})
            k++
          }
          j++
        }
      }
    }

    if (data.sort == "title-asc") {
      sortList(listToSort, (filmsList) => {
        firstRow(filmsList)
      })
    }
    else if (data.sort == "title-desc") {
      sortList(listToSort, (filmsList) => {
        filmsList.reverse()
        firstRow(filmsList)
      })
    }
    else if (data.sort == "year-asc") {
      sortListByYear(listToSort, (filmsList) => {
        firstRow(filmsList)
      })
    }
    else if (data.sort == "year-desc") {
      sortListByYear(listToSort, (filmsList) => {
        filmsList.reverse()
        firstRow(filmsList)
      })
    }
    else if (data.sort == "rank-asc") {
      sortListByRank(listToSort, (filmsList) => {
        firstRow(filmsList)
      })
    }
    else if (data.sort == "rank-desc") {
      sortListByRank(listToSort, (filmsList) => {
        filmsList.reverse()
        firstRow(filmsList)
      })
    }
    else if (data.sort == "length-asc") {
      sortListByLength(listToSort, (filmsList) => {
        firstRow(filmsList)
      })
    }
    else if (data.sort == "length-desc") {
      sortListByLength(listToSort, (filmsList) => {
        filmsList.reverse()
        firstRow(filmsList)
      })
    }
    else if (data.title) {
      filterList(listToSort, data, (filmsList) => {
        firstRow(filmsList)
      })
    }
  })


  //L'event de départ lançant la création de la liste de films (avec un titre demandé ou non)
  socket.on('getFilmsList', function(data) {
    data.id = htmlspecialchars(data.id)

    // Initialisation des variables
    if (data.title) {
      var title = htmlspecialchars(data.title)
    }
    socket.filmsIndex = 8
    socket.filmsList = []
    socket.filmsListLength = 0
    socket.genres = []
    var list = []


    // Les fonctions
    function firstRow(sortedList) {
      var j = 0
      var k = 0
      var length = sortedList.length
      while ((j < length) && (k < 8)) {
        if (sortedList[j] && sortedList[j].movieDatas && (sortedList[j].movieDatas.poster.slice(0, 4) == "http") && ((j === 0) || (sortedList[j].movieDatas.title != sortedList[j - 1].movieDatas.title))) {
          io.to(data.id).emit('browseFilmsList', {filmsList: sortedList[j]})
          k++
        }
        j++
      }
    }

    function getIMDbDatas(title, film) {
      return new Promise((resolve, reject) => {

        imdb.get(title, {apiKey: '5c9b875f'})
          .then(movieDatas => {
            film.movieDatas = movieDatas
              resolve(film)
          })
          .catch(err => {
            reject("ERR IMDB: "+err.message)
          })
      })
    }

    function inList(list, film) {
      return new Promise((resolve, reject) => {
        if (film.title == '') {
          reject('Erreur inList: pas de titre!')
        }
        if ((list.indexOf(film.title)) == -1) {
          resolve(film)
        }
        else {
          reject("film en doublon: "+film.title)
        }
      })
    }

    function getGenres(genresStr) {
      return new Promise((resolve, reject) => {
        if (genresStr == '') {
          reject('Erreur getGenres: pas de genre')
        }
        var genresTab = genresStr.split(',')
        var length = genresTab.length
        for (var i = 0; i < length; i++) {
          if (socket.genres.indexOf(genresTab[i].trim()) == -1) {
            socket.genres.push(genresTab[i].trim())
          }
          if (i == (length - 1)) {
            resolve('ok')
          }
        }
      })
    }

    
    function getMovieDatas (filmsList, i, list) {
      inList(list, filmsList[i]).then((ret) => {
        if (ret) {
          list.push(ret.title)
          getIMDbDatas(filmsList[i].title, filmsList[i]).then((film) => {
            if (film.movieDatas && (film.movieDatas.poster.slice(0, 4) == "http")) {
              getGenres(film.movieDatas.genres).then((r) => {
                if (r == 'ok') {
                  if (i == filmsList.length) {
                    io.to(data.id).emit('browseGenres', {genres: socket.genres})
                  }
                  if (!socket.filmsListLength) {
                    socket.filmsList[0] = film
                    socket.filmsListLength = 1
                  }
                  else {
                    socket.filmsListLength = socket.filmsListLength + 1  
                    socket.filmsList.push(film)
                  }
                  if (socket.filmsListLength <= 8){
                    io.to(data.id).emit('browseFilmsList', {filmsList: film})
                  }
                }
              })
              .catch(err => {
                // console.log(err)
              })
            }
            i++
            if (i < filmsList.length) {
              getMovieDatas(filmsList, i, list)
            }
            if ((i >= (filmsList.length - 1) && !socket.filmsListLength)) {
              io.to(data.id).emit('noFilmsList', {alert: 'Aucun résultat correspondant!'})
            }
          })
          .catch(err => {
            // console.log(err)
            i++
            if (i < filmsList.length) {
              getMovieDatas(filmsList, i, list)
            }
          })
        }
      })
      .catch((err) => {
        // console.log(err)
        i++
        if (i < filmsList.length) {
          getMovieDatas(filmsList, i, list)
        }
      })
    }


    function getTitles(list, filmsList, i) {
      var filmsListLength = filmsList.length
      return new Promise((resolve, reject) => {
        if (!filmsList[0]) {
          reject("getTitles: liste vide")
        }
        else {
          if (filmsList[i].name) {
            var parsedDatas = tnp(filmsList[i].name)
            filmsList[i].title = parsedDatas.title
          }
          else if (filmsList[i].title) {
            var parsedDatas = tnp(filmsList[i].title)
            filmsList[i].title = parsedDatas.title
          }
          // console.log(i+" "+filmsList[i].title)
          if (filmsList[i].title == '') {
            reject("erreur tnp")
          }
          i++
          if (i < filmsListLength) {            
            resolve(i)
            getTitles(list, filmsList, i).then((length) => {
              if (length == (filmsList.length - 1)) {
                sortList(filmsList, (filmsList) => {
                  var x = 0
                  getMovieDatas(filmsList, x, list)
                })
              }
            })
            .catch(err => {
              // console.log(err)
            })
          }
        }
      })
    }

    // Les promesses qui gèrent la recherche des deux sources
    var getSecondSource = new Promise((resolve, reject) => {
      var filmsList = []
      for (var i = 1; i < 3; i++) {
        if (title) {
          request('https://yts.ag/api/v2/list_movies.json?sort=like_count&query_term='+title+'&page='+i+'&limit=50', (err, response, body) => {
            if (err){
              reject(err); 
            }
            var filmsList2 = JSON.parse(body);
            if (filmsList2.data.movies) {
              for (var j = 0, len = filmsList2.data.movies.length; j < len; j++) {
                filmsList.push(filmsList2.data.movies[j])
              }
            }
          });
        }
        else {
          request('https://yts.ag/api/v2/list_movies.json?sort=like_count&page='+i+'&limit=50', (err, response, body) => {
            if (err){
              reject(err); 
            }
            var filmsList2 = JSON.parse(body);
            if (filmsList2.data.movies) {
              for (var j = 0, len = filmsList2.data.movies.length; j < len; j++) {
                filmsList.push(filmsList2.data.movies[j])
              }
            }
          });
        }
      }
      if (i == 3) {
          resolve(filmsList)
      }
    })

    var getFirstSource = new Promise((resolve, reject) => {
      if (title) {
        PirateBay.search(title, {
          category: 201,
          orderBy: 'leeches',
          sortBy: 'desc'
        })
        .then(filmsList => {
          if (filmsList[0]) {
            resolve(filmsList)
          }
          else {
            var tab = []
            resolve(tab)
          }
        })
        .catch(err => reject(err))
      }
      else {
        PirateBay
        .topTorrents(201)
        .then(filmsList => {
          if (filmsList[0]) {
            resolve(filmsList)
          }
          else {
            var tab = []
            resolve(tab)
          }
        })
        .catch(err => reject(err))
      }
    })

    // Le script principal
    getFirstSource.then((filmsList) => {
      getSecondSource.then((filmsList2) => {
        filmsList = filmsList.concat(filmsList2)

        // console.log("\nLISTE PIRATEBAY + YTS: ")
        for (var a = 0; a < filmsList.length; a++) {
          if (filmsList[a].title) {
            // console.log(a+" "+filmsList[a].title)
            filmsList[a].magnetLink = 'magnet:?xt=urn:btih:'+filmsList[a].torrents[0].hash+'&dn=&tr=http://track.one:1234/announce&tr=udp://track.two:80'
          }
          // else if(filmsList[a].name) {
          //   console.log(a+" "+filmsList[a].name)
          // }
        }
        // console.log("\n")

        var x = 0
        getTitles(list,filmsList, x)
        .catch(err => {
          // console.log(err)
          if (err == 'getTitles: liste vide') {
            io.to(data.id).emit('noFilmsList', {alert: 'Aucun résultat correspondant!'})
          }
        })
      })
      .catch(err => {
        // console.log(err)
      })
    })
    .catch(err => {
      // console.log(err)
    })
  });
});



app.get('*', function(req, res, next) {
  var err = new Error();
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  if(err.status !== 404) {
    return next();
  }
  res.status(404);
  res.render('./pages/error')
});


module.exports = app;
