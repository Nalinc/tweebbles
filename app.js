var express = require('express')
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Twit = require('twit');
var config = require('./config');
var sentiment = require('sentiment');

// make Stream globally visible so we can clean up better
var stream;

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

});

app.get('/sentiment/:phrase',function(req,res){
  res.send({phrase:req.query.phrase})
})

var tweetCount = 0;
var tweetTotalSentiment = 0;
var monitoringPhrase;

io.on('connection',function(client){

    function resetMonitoring() {
        if(stream)
            stream.stop();
        monitoringPhrase = "";
    }

    function beginMonitoring(monitoringPhrase) {
      stream = twitter.stream('statuses/filter', { track: monitoringPhrase })

      stream.on('tweet', function (tweet) {
        if(tweet.lang == 'en'){
            sentiment(tweet.text, function (err, result) {
                tweetCount++;
                tweetTotalSentiment += result.score;
                var obj={
                    'user':tweet.user,
                    'text':tweet.text,
                    'created_at':tweet['created_at'],
                    'url':'http://www.twitter.com/'+tweet.user['screen_name']+'/status/'+tweet['id_str'],
                    'score':result.score,
                    'positive_count':result.positive.length,
                    'negative_count':result.negative.length,
                    'comparative':result.comparative,
                    'type':(parseInt(result.score)>0)?'positive':(((parseInt(result.score)<0)?'negative':'neutral'))
                }
                client.emit('feedsupdate',obj)                                
            });          
        }
      });
      stream.on('error', function (error, code) {
          console.error("Error received from tweet stream: " + code);
          if(code === 420)
            console.error("API limit hit, are you using your own keys?");
          resetMonitoring();
      });
      stream.on('disconnect', function (response) {
          if (stream) { // if we're not in the middle of a reset already
            // Handle a disconnection
            console.error("Stream ended unexpectedly, resetting monitoring.");
            resetMonitoring();
          }
      });
    }

    client.on('monitor',function(phrase){
        console.log('analyzing phrase: ' +phrase);
        resetMonitoring();
        beginMonitoring(phrase);
    });

    client.on('pauseStreaming',function(data){
        resetMonitoring();
    });

    client.on("disconnect",function(){
        console.log("user "+client.name+" left..");
        resetMonitoring();
        client.broadcast.emit("removeUser",client.name);
    });
});




server.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
