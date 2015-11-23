var express = require('express')
var app = express();
var Twit = require('twit');
var config = require('./config');


app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/src/'));

app.get('/', function(request, response) {
  response.render('index.html')
})

var twitter = new Twit(config.twitter);

var TWEET_COUNT = 15;
var MAX_WIDTH = 305;
var OEMBED_URL = 'statuses/oembed';
var USER_TIMELINE_URL = 'statuses/user_timeline';


app.get('/timeline/:user', function(req, res) {
  
  var oEmbedTweets = [], tweets = [], allTweets="",

  params = {
    screen_name: req.params.user, // the user id passed in as part of the route
    count: TWEET_COUNT // how many tweets to return
  };

  // the max_id is passed in via a query string param
  if(req.query.max_id) {
    params.max_id = req.query.max_id;
  }

  // request data 
  twitter.get(USER_TIMELINE_URL, params, function (err, data, resp) {

    tweets = data;

    var i = 0, len = tweets.length;
    for(i; i < len; i++) {
      allTweets+=tweets[i].text+" ";
//      getOEmbed(tweets[i]);
    }
    var exp = /(\b(https?|ftp|file|www)[:\/\/]*[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    
    res.send(wordFrequency(allTweets.replace(exp,"")))

  });

  /*
   * return array of objects containing frequency analysis of all tokens
   */
  function wordFrequency(txt){
    var wordArray = txt.split(/[ .?!,*'"]/);
    var newArray = [], wordObj;
    wordArray.forEach(function (word) {
      if(word){
         wordObj = newArray.filter(function (w){
           return w.name == word;
         });
         if (wordObj.length) {
           wordObj[0].count += 1;
         } else {
           newArray.push({name: word, word: word, count:1});
         }
      }
    });
    return newArray;
  }
  /**
   * requests the oEmbed html
   */
  function getOEmbed (tweet) {

    // oEmbed request params
    var params = {
      "id": tweet.id_str,
      "maxwidth": MAX_WIDTH,
      "hide_thread": true,
      "omit_script": true
    };

    // request data 
    twitter.get(OEMBED_URL, params, function (err, data, resp) {
      tweet.oEmbed = data;
      oEmbedTweets.push(tweet);

      // do we have oEmbed HTML for all Tweets?
      if (oEmbedTweets.length == tweets.length) {
        res.setHeader('Content-Type', 'application/json');
        res.send(oEmbedTweets);
      }
    });
  }
});

/*app.get('',function(){

})
*/

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
