var express = require('express');
var router = express.Router();

var request = require('request');

router.post('/', function (req, res, next) {
    var lastFMURL = "";
    if (req.body.type === "title" )
        lastFMURL = 'http://ws.audioscrobbler.com/2.0/?method=track.search&track='+req.body.keyword+'&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&limit=20&format=json';
    else if (req.body.type === "artist" )
        lastFMURL = 'http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist='+req.body.keyword+'&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&limit=20&format=json';
    else if (req.body.type === "tag" )
        lastFMURL = 'http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag='+req.body.keyword+'&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&limit=20&format=json';
    else if (req.body.type === "country" )
        lastFMURL = 'http://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country='+req.body.keyword+'&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&limit=20&format=json';

    request(lastFMURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var songDetails = JSON.parse(body)
          var topTracks = songDetails.toptracks 
          
          if (!topTracks)
            topTracks = songDetails.tracks ? songDetails.tracks : songDetails.results.trackmatches;

          res.render('searchList', { type: req.body.type, keyword: req.body.keyword, trackList: topTracks.track });
          next();          
        }
    })
    
});

module.exports = router;
