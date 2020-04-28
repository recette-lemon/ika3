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

Bot.on("message", Utility.parseMessage);
