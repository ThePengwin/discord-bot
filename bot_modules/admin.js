exports = exports || {};

exports.onMessage = {

  administrationFunctions: function(message,bot){

    if (!message.isMentioned(bot.user)) {
      return;
    }

    var commandRegex = new RegExp('^<@'+bot.user.id+'> ([a-z]+) ?(.*)$','g');

    var results = commandRegex.exec(message.content);
    var uniqueChannelID = message.channel.server.id+'-'+message.channel.id;

    if (results !== null) {

      var permissionError = 'You aren\'t allowed to do that';

      try {

        switch (results[1]) {

          case 'deactivate':

            if (!bot.isAdmin(message.author)) throw permissionError;

            bot.settings.channels = bot.settings.channels.filter(function(channelID){
              return channelID != uniqueChannelID;
            });

            bot.sendMessage(message.channel,'<@'+message.author.id+'> OK. I\'m not paying attention to this channel');

          break;

          case 'activate':

            if (!bot.isAdmin(message.author)) throw permissionError;

            bot.settings.channels.push(uniqueChannelID);
            bot.sendMessage(message.channel,'<@'+message.author.id+'> OK. I\'ll listen for commands on this channel');

          break;

          case 'modules':

            if (!bot.isAdmin(message.author)) throw permissionError;

            bot.sendMessage(message.channel,'<@'+message.author.id+'> Current Modules are: ' + bot.settings.modules.join(', '));

          break;

          case 'unload':

            if (!bot.isAdmin(message.author)) throw permissionError;

            if (bot.unloadModule(results[2])) {
              
              bot.settings.modules = bot.settings.modules.filter(function(module){
                return module != results[2];
              });
            
              bot.sendMessage(message.channel,'<@'+message.author.id+'> Unloaded '+results[2]);

            } else {

              bot.sendMessage(message.channel,'<@'+message.author.id+'> Failed to unload '+results[2]+' are you sure it is loaded?');

            }

          break;

          case 'load':

            if (!bot.isAdmin(message.author)) throw permissionError;

            if (bot.loadModule(results[2])) {
              bot.settings.modules.push(results[2]);
              bot.sendMessage(message.channel,'<@'+message.author.id+'> Loaded '+results[2]);

            } else {
              bot.sendMessage(message.channel,'<@'+message.author.id+'> Failed to load '+results[2]);

            }

          break;

          case 'help':

            var lines = ['Hi <@'+message.author.id+'> I\'m a bot. Heres a list of what i can do:'];

            for (module in bot.loadedModules) {  
              if (!bot.loadedModules[module].help) continue;
              for (i in bot.loadedModules[module].help) {
                lines.push(bot.loadedModules[module].help);
              }
            }

            bot.sendMessage(message.channel,lines.join('\n'));

          break;

        }
        bot.saveSettings();

      } catch (e) {
        bot.sendMessage(message.channel,'<@'+message.author.id+'> Oops! '+e);
      }

    }

  }
};