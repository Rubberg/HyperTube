var express = require('express');
var router = express.Router();
let bodyParser = require('body-parser');
var torrentStream = require('torrent-stream');
var path = require('path');
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
var pump = require('pump')
var Video = require('../models/movie');
var htmlspecialchars = require('htmlspecialchars');

router.use(bodyParser.urlencoded({ extended: false }));

//MODEL
var UserModel = require("../models/userModel.js").UserModel;
var CommentModel = require("../models/CommentModel.js").CommentModel;
//

function requireLogin (req, res, next) {
    if (!req.user) {
        res.redirect('/');
    } else {
        next();
    }
};


router.get('/', requireLogin, (req, res)=> {
    UserModel.find({username : req.session.user.username}, (err, user)=>{
        if (err){

        }
        res.render('pages/watch', {movie: req.body.movie, title: req.body.title, movieId: req.body.movieId, user: user[0].username, img: user[0].img});
    })
    
});


router.post('/datas', (req, res)=> {
    // req.body.title = htmlspecialchars(req.body.title)
    req.body.movieId = htmlspecialchars(req.body.movieId)
	UserModel.find({username : req.session.user.username}, (err, user)=>{
        if (err){
        }
        else {
            req.body.movie = encodeURIComponent(req.body.movie);
            res.render('pages/watch', {movie: req.body.movie, title: req.body.title, movieId: req.body.movieId, user: user[0].username, img: user[0].img});
        }
    })
});
router.get('/bob', (req, res)=> {
    res.render('pages/video');
    res.end();
});
router.get('/boby', (req, res)=>{
    //Video.mp4Read(res);
    var mLink = 'magnet:?xt=urn:btih:c7382becd8c4e7e5324a5164f54c9c41328fa65a&dn=Vengeance+A+Love+Story+%282017%29+%5BYTS.AG%5D';
    Video.justMp4Stream(mLink, res).then(()=>{

    }).catch((err)=>{

    });
});

router.get('/run/:film', (req, res)=> {
    var mLink = req.params.film;
    var test = Video.getDownInfo(mLink);
    var retStream;

    test.then((info) => {
        var lsize = 0;
        fs.access(`/tmp/video/${info[0].name}`, (err) => {
                if (!err) {

                    fs.stat(`/tmp/video/${info[0].name}`, (errur, stat) => {
                        if (err) {

                        }
                        lsize = stat.size;

                        if (lsize != info[0].size) {


                            fs.access(`/tmp/video/${info[0].name}`, (err) => {
                                if (!err) {

                                    fs.unlink(`/tmp/video/${info[0].name}`, ()=> {

                                        if (info[0].name.endsWith('.mp4')) {

                                            var boby = Video.streamMp4(mLink);
                                            boby.then((stream) => {

                                                var fstream = fs.createReadStream('/tmp/video/' + stream)
                                                    .on('open', () => {

                                                        pump(fstream, res);
                                                    })
                                                    .on('error', (err) => {

                                                        res.end();

                                                    });
                                                fstream.on('end', () => {

                                                });
                                            });
                                            boby.catch((err) => {

                                            });
                                        }
                                        else if (info[0].name.endsWith('.mkv') || info[0].name.endsWith('.avi')) {
                                            retStream = Video.getDownFile(mLink, res);

                                        }
                                        else {
                                            res.end();
                                        }
                                    });
                                    }
                            });
                        }

                        else {

                            if (info[0].name.endsWith('.mp4')) {
                                Video.mp4Read(res, info[0].name);
                            }
                            else if (info[0].name.endsWith('.mkv') || info[0].name.endsWith('.avi')) {
                                video.encodeNStream(res, info[0].name);
                            }
                        }
                    });


                }
                else if (err) {
                    fs.access(`/tmp/video/${info[0].name}`, (err) => {
                        if (info[0].name.endsWith('.mp4')) {
                            var boby = Video.streamMp4(mLink);
                            boby.then((stream) => {

                                var fstream = fs.createReadStream('/tmp/video/' + stream)
                                    .on('open', () => {

                                        pump(fstream, res);
                                    })
                                    .on('error', (err) => {

                                        res.end();

                                    });
                                fstream.on('end', () => {

                                });
                            });
                            boby.catch((err) => {

                            });
                        }
                        else if (info[0].name.endsWith('.mkv') || info[0].name.endsWith('.avi')) {
                            retStream = Video.getDownFile(mLink, res);

                        }
                        else {
                            res.end();
                        }
                    });
                }



        });
    });
    test.catch((str)=>{

    });



});



module.exports = router;