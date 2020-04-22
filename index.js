global.Discord = require("discord.js");

global.Config = JSON.parse(require("fs").readFileSync("config.json"));
global.Utility = require("./utility");

global.Images = Utility.getImageLists();

global.Commands = Utility.getCommands();

global.Bot = new Discord.Client();
Bot.login(Config.token);

global.guildConfigs = null;
global.DB = null;

Bot.on("ready", () => {
	console.log("ready");
	setInterval(Utility.statusRotate, 10000);
	Utility.statusRotate();
	Utility.initDB();
});

Bot.on("guildMemberAdd", (member) => {
	if(guildConfigs[member.guild.id].mutes[member.id])
		Utility.checkUserMute(guildConfigs[member.guild.id].mutes[member.id], member.guild.id, member.id);
});

Bot.on("message", (message) => {
	if(!message.content.startsWith(Config.trigger) || message.author.bot)
		return;

	let [args, cmd, command] = Utility.parseArguments(message.content);

	if(!cmd)
		return;

	if(args.h || args.help){
		return message.reply({embed: Utility.getHelpEmbed(cmd)});
	}

	if(cmd.category === "owner" && message.author.id != Config.ownerId)
		return;

	if(message.guild && guildConfigs[message.guild.id].disabledcommands && guildConfigs[message.guild.id].disabledcommands.includes(cmd.name.toLowerCase()) && cmd.category !== "owner")
		return;

	try{
		cmd.func(message, args, command);
	} catch(err){
		console.error(command, args, err);
		message.reply({embed: Utility.errorEmbed});
	}
});
