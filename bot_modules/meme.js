exports.bind = function(bot) {

  var MemeCache = {
    
    memes: [],
    memeCachedTime: 0,
    cacheTimeout: (60*60*1000), //1 hour
    request: require('request'),

    loadMemes: function(doneFunc,failFunc) {

      var memeObject = this;

      this.request.get({
        url: 'https://api.imgur.com/3/g/memes/',
        headers: {
          'Authorization': 'Client-ID '+ bot.settings.imgur.clientID
        }
      }, function(error,res,body){
        if (!error && res.statusCode == 200) {
            memeObject.memeCachedTime = Date.now();
            var parsed = JSON.parse(body);
            bot.log('Loaded '+parsed.data.length+' Memes');
            doneFunc(parsed.data.sort(function() {
              return .5 - Math.random();
            }));
        }
      });

    },

    getMeme: function(doneFunc,failFunc) {

      var memeObject = this;

      if (memeObject.memes.length == 0 || this.memeCachedTime + this.cacheTimeout < Date.now()) {
        bot.log('Memes are empty or out of date, loading some up.');
        //gotta get the memes.
        memeObject.loadMemes(function(memes){
          memeObject.memes = memes;
          memeObject.getMeme(doneFunc,failFunc);
        });
        return;
      }
      var meme = memeObject.memes.pop();
      bot.log(memeObject.memes.length+' memes left in cache');
      doneFunc(meme);

    }
  };

  bot.on("channelmessage", function(message){
    
    if(message.content === "!meme") {
      MemeCache.getMeme(function(meme){
        bot.sendMessage(message.channel, ""+message.author.username+': Here is your meme: '+meme.link);
      });
    }
    if(message.content === "!smoke") {
      MemeCache.getMeme(function(meme){
        bot.sendMessage(message.channel, ""+message.author.username+': Here is your cancer: '+meme.link);
      });
    }  

  });
}