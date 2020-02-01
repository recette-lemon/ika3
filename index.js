global.Discord = require("discord.js");
global.Minimist = require("minimist");
global.Fs = require("fs");

global.Utility = require("./utility.js");
global.Config = JSON.parse(Fs.readFileSync("config.json"))
global.Commands = Utility.getCommands();

global.Bot = new Discord.Client();
Bot.login(Config.token);

Bot.on("ready", () => {
	console.log("ready");
});

Bot.on("message", message => {
	if(!message.content.startsWith(Config.trigger) || message.author.bot)
		return;

	let args = Minimist(message.content.split(" "));
	let command = args._.splice(0, 1)[0].slice(Config.trigger.length).toLowerCase();

	console.log(command, args);

	let cmd = Commands[command];

	if(cmd){
		if(args.h || args.help){
			return message.reply(Utility.getHelp(cmd));
		}

		try{
			cmd.func(message, args);
		} catch(err){
			console.error(err);

			let embed = new Discord.RichEmbed({
				title: "Whoops.",
				description: "Got an error...",
				color: Config.embedColour,
				thumbnail: {
					url: "https://i.imgur.com/GuIhCoQ.png"
				}
			});

			message.reply({embed});
		}
	}

});
