var Discord = require("discord.js");
var Minimist = require("minimist");
var Fs = require("fs");

var Utility = require("./utility.js");
var Config = JSON.parse(Fs.readFileSync("config.json"))
var commands = Utility.getCommands();

var Bot = new Discord.Client();
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

	let cmd = commands[command];

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
				thumbnail: {
					url: "https://i.imgur.com/GuIhCoQ.png"
				}
			});

			message.reply({embed});
		}
	}

});