module.exports = {
	name: "Stats",
	triggers: ["stats", "ping", "uptime"],
	description: "Gives bot stats.",
	category: "bot",
	arguments: {},
	func: func
};

function func(message){
	let embed = new Discord.RichEmbed({
		thumbnail: {
			url: "https://i.imgur.com/gv4Itmg.png"
		},
		color: Config.embedColour,
	});
	embed.addField("Version", Utility.getVersion());
	embed.addField("Uptime", Utility.toHHMMSS(process.uptime()), true);
	embed.addField("Ping", Math.round(Bot.ping) + "ms", true);
	embed.addField("Commands", Utility.getCommandsNumber(), true);
	embed.addField("Images", Object.values(Images).map(i => i.length).reduce((a,b) => a+b), true);
	embed.addField("Servers", Bot.guilds.size, true);
	embed.addField("Users", Bot.users.size, true);
	message.channel.send({embed});
}
