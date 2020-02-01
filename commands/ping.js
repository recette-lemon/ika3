module.exports = {
	name: "ping",
	triggers: ["ping"],
	description: "Gives bot ping and uptime.",
	arguments: {
		positional: [],
		args: []
	},
	func: func
};

function func(message){

	let embed = new Discord.RichEmbed({
		thumbnail: {
			url: "https://i.imgur.com/gv4Itmg.png"
		},
		color: Config.embedColour,
	});

	embed.addField("Ping", Bot.ping + "ms");
	embed.addField("Uptime", Utility.toHHMMSS(process.uptime()));

	message.reply({embed});

}