module.exports = {
	name: "Ping",
	triggers: ["ping", "uptime"],
	description: "Gives bot ping and uptime.",
	category: "general",
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
		footer: {
			text: "Feeling good with " + Object.values(Commands).filter((v, i, s) => {return s.indexOf(v) == i}).length + " commands loaded."
		}
	});

	embed.addField("Ping", Math.round(Bot.ping) + "ms", true);
	embed.addField("Uptime", Utility.toHHMMSS(process.uptime()), true);

	message.channel.send({embed});

}
