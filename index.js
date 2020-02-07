global.Discord = require("discord.js");
const Minimist = require("minimist");
const Fs = require("fs");

global.Utility = require("./utility.js");
global.Config = JSON.parse(Fs.readFileSync("config.json"))

global.Images = Utility.getImageLists();

global.Commands = Utility.getCommands();

global.Bot = new Discord.Client();
Bot.login(Config.token);

Bot.on("ready", () => {
	console.log("ready");
	setInterval(Utility.statusRotate, 10000);
	Utility.statusRotate();
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
			let embed = new Discord.RichEmbed({
				title: cmd.name,
				description: cmd.description,
				color: Config.embedColour
			});

			embed.addField("Triggers", cmd.triggers.map(t => {return Config.trigger + t}).join(", "), true);

			if(cmd.arguments.positional[0])
				embed.addField("Arguments", cmd.arguments.positional.join(" "), true);
			if(cmd.arguments.args[0])
				embed.addField("Flags", cmd.arguments.args.map(a => {return "-"+a.short+" --"+a.long}).join(", "), true);

			return message.reply({embed});
		}

		if(cmd.category === "owner" && message.author.id != Config.ownerId)
			return;

		try{
			cmd.func(message, args, command);
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
