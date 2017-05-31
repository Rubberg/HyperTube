/**
 * Created by Tom on 20/05/2017.
 */
var torrentStream = require('torrent-stream');
var pump = require('pump');
var ffmpeg = require('fluent-ffmpeg');
var ffprobe = require('ffprobe');
var fs = require('fs');

class   Video{


    static  getDownInfo(mLink){
        return new Promise((resolve, reject)=>{

        var engine = torrentStream(mLink);
        var info = [];
        engine.on('ready', () => {
            var nb_files = engine.files.length;

            var compteur = 0;
            var compteurObj = 0;

            engine.files.forEach((file)=> {


                    if ((file.name.endsWith('.avi') || file.name.endsWith('.mkv') || file.name.endsWith('.mp4')) && (file.name != 'sample.avi' && file.name != 'sample.mkv'&& file.name != 'ETRG.mp4'  && file.name != 'Sample.mkv' && file.name != 'Sample.avi' )) {
                        info[compteurObj] = {name: file.name, size: file.length};
                        compteurObj++;
                    }
                    compteur++;

                });

                if (info) {
                    resolve(info);
                }
                else {
                    err = 'ERR : NO FILE INFO in OBJ';
                    reject(err)
                }
        });
        })
    };

    static  runStream(name) {
        return new Promise((resolve, reject)=> {

            var fstream = fs.createReadStream('/tmp/video/' + name)
                .on('open', () => {

                    resolve(fstream);
                })
                .on('error', (err) => {

                    reject(err);
                })
                .on('end', ()=>{

                })


        })
    };


    static  getDownFile(mlink , res){
        return new Promise((resolve, reject)=> {
            var engine = torrentStream(mlink);
                engine.on('ready', () => {
                    var size = 0;
                    let cmp = 0;

                    engine.files.forEach((file) => {
                    if ((file.name.endsWith('.avi') || file.name.endsWith('.mkv')) && (file.name != 'sample.avi' && file.name != 'sample.mkv' && file.name != 'ETRG.mp4' && file.name != 'Sample.mkv' && file.name != 'Sample.avi' )) {
                        var datalength = 0;
                        size += file.length;

                        var stream = file.createReadStream(file);
                        var down = fs.createWriteStream('/tmp/video/' + file.name);
                        var test = true;

                        stream.on('data', (chunck) => {
                            datalength += chunck.length;
                            /*if (test) {
                                let percent = 0.03;
                                let fChunk = size * percent;
                                if (datalength > fChunk && test) {
                                    test = false;
                                    this.runStream(file.name).then((stream)=>{
                                        resolve(stream);
                                    }).catch((err)=>{

                                        reject(`runStream : ${err}`);
                                    });

                                }
                            }*/

                        });
                        stream.on('error', (err)=>{
                           reject(err);
                        });
                        stream.on('end',()=>{

                            engine.destroy();
                        });
                        pump(stream, down);
                        var command = ffmpeg(stream)
                            .outputOption('-movflags frag_keyframe+faststart')
                            .outputOption('-deadline realtime')
                            .audioCodec('libmp3lame')
                            .videoCodec('libx264')
                            .format('mp4')
                            .audioBitrate(128)
                            .videoBitrate(1024)
                            .size('720x?')
                            .on('error', function(err) {

                                reject(err);
                            })
                            .on('end', function() {

                            });
                          //  pump(stream, down);
                            pump(command, res);


                        //down.on('finish', () => {

                        //});

                    }



                });

            });
        });
    }
    static encodeNStream(res, path){
        var fstream = fs.createReadStream('/tmp/video/' + path);
        var command = ffmpeg(fstream)
            .outputOption('-movflags frag_keyframe+faststart')
            .outputOption('-deadline realtime')
            .audioCodec('libmp3lame')
            .videoCodec('libx264')
            .format('mp4')
            .audioBitrate(128)
            .videoBitrate(1024)
            .size('720x?')
            .on('error', function(err) {

                reject(err);
            })
            .on('end', function() {

            });
        //  pump(stream, down);
        pump(command, res);

    }
    static streamMp4(mLink){
        return new Promise((resolve, reject)=>{
            var engine = torrentStream(mLink);
            engine.on('ready', () => {
                var size = 0;

                engine.files.forEach((file) => {
                    if ((file.name.endsWith('.avi') || file.name.endsWith('.mp4')) && (file.name != 'sample.avi' && file.name != 'sample.mkv'&& file.name != 'ETRG.mp4' && file.name != 'Sample.mkv' && file.name != 'Sample.avi' )) {
                        var datalength = 0;
                        size = file.length;

                        var stream = file.createReadStream(file);
                        var down = fs.createWriteStream('/tmp/video/' + file.name);
                        var test = true;
                        stream.on('open',()=>{

                        });
                        stream.on('data', (chunck) => {
                            datalength += chunck.length;
                            if (test) {
                                let percent = 0.06;
                                let fChunk = size * percent;
                                if (datalength > fChunk && test) {
                                    test = false;

                                        resolve(file.name);

                                }
                            }

                        });
                        stream.on('error', (err)=> {
                            reject(err);
                        });
                        pump(stream, down);
                        down.on('finish', ()=>{

                            engine.destroy();
                        });
                    }
                })
            })
        })
    }
    static mp4Read(res, name){
        let f_stream = fs.createReadStream(`/tmp/video/` + name);
        f_stream.on(`open`, ()=>{
            pump(f_stream, res);

        });
        f_stream.on('error', (err)=>{

        });
        f_stream.on('data', (chunk)=>{

        });
        f_stream.on('end', ()=>{

        })
    }
    static justMp4Stream(mLink, res){
        return new Promise((resolve, reject)=>{
            var engine = torrentStream(mLink);
            engine.on('ready', ()=>{

                engine.files.forEach((file)=>{
                    if (file.name.endsWith('.mp4')){

                        var stream = file.createReadStream(file);
                        var dataLength = 0;
                        var initialSize = file.size;
                        stream.on('open', ()=>{

                            pump(stream, res);
                        });
                        stream.on('data', (chunk)=>{
                            dataLength += chunk;
                        });
                        stream.on('err', (err)=>{
                           reject(err);
                        });
                        stream.on('end', ()=>{

                           //engine.destroy();
                           resolve();
                        });

                    }
                })
            })
        })
    }
};


module.exports = Video;