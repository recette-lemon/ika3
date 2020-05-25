global.Discord = require("discord.js");

global.Config = JSON.parse(require("fs").readFileSync("config.json"));
global.Utility = require("./utility");

global.Images = Utility.getImageLists();
global.Commands = Utility.getCommands();

global.Bot = new Discord.Client();
Bot.login(Config.token);

Bot.on("ready", () => {
	console.log("Ready.");
	Utility.checkMutes();
	setInterval(Utility.statusRotate, 10000);
	Utility.statusRotate();
});

Bot.on("guildMemberAdd", (member) => {
	if(Configs.get(member.guild.id).get("mutes").get(member.id))
		Utility.checkUserMute(member.guild.id, member.id);
});

Bot.on("message", Utility.parseMessage);

