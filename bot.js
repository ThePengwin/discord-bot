var Discord = require("discord.js");
var bot = new Discord.Client();

//load settings
bot.loadSettings = function() {
  var self = this;
  self.log('Loading Settings');
  try {
    bot.settings = require('./config.json');
  } catch (e) {
    self.log('Failed to load settings');
  }
};
bot.saveSettings = function() {
  var fs = require('fs');
  var self = this;
  fs.writeFile('./config.json', JSON.stringify(bot.settings, null, 2), function(err) {
      if(err) {
        self.log(err);
      } else {
        self.log("config.json saved");
      }
  });
};

bot.log = function(message){

  var now = new Date();
  var timestamp = '[ '+now.toLocaleTimeString('en-US', { hour12: false })+' ]';

  console.log(timestamp,message);
};

bot.loadModule = function(module) {
  var self = this;
    try {
      
      self.loadedModules[module] = require('./bot_modules/'+module+'.js');

      self.log('Loaded module '+module);
      return true;
    } catch (e) {
      self.log('Failed to load module '+module);
      self.log(e);
      return false;
    }
}
bot.unloadModule = function(module) {
  var self = this;
    try {
      
      delete self.loadedModules[module];
      self.log('Unloaded module '+module);
      return true;
    } catch (e) {
      self.log('Failed to unload module '+module);
      self.log(e);
      return false;
    }
}
bot.isAdmin = function(user) {
  return this.settings.admins.indexOf( user.id.toString() ) >= 0;
}

bot.extendEvents = function() {

  var self = this;

  self.on("message", function(message) {

    if (!message.channel.server) return;

    var uniqueChannelID = message.channel.server.id+'-'+message.channel.id;

    var adminModule = require('./bot_modules/admin.js');
    for (i in adminModule.onMessage) {
      adminModule.onMessage[i](message,self);
    }

    if (this.settings.channels.indexOf( uniqueChannelID ) < 0) return;

    for (module in self.loadedModules) {  
      for (i in self.loadedModules[module].onMessage) {
        self.loadedModules[module].onMessage[i](message,self);
      }
    }
  });
};


bot.init = function() {

  var self = this;

  self.on("ready",function(){

    self.log('Bot ready to serve');

  });

  self.loadSettings();
  self.extendEvents();
  
  var self = this;

  self.loadedModules = self.loadedModules || {};

  self.log('Loading Modules...');
  for (var i=0; i < self.settings.modules.length; i++) {

    var module = self.settings.modules[i];

    bot.loadModule(module);

  }

  self.log('Starting Discord Bot...');

  self.login(self.settings.auth.email, self.settings.auth.password);

};

process.on("SIGINT", function () {
  console.log('');
  bot.log('SIGINT Recieved');
  bot.saveSettings();
  bot.logout(function(){
    bot.log('Bot Logged out');
    process.exit();
  });
});


bot.init();
