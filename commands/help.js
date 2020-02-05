module.exports = {
	name: "help",
	triggers: ["help"],
	description: "Help message",
	category: "misc",
	arguments: {
		positional: [],
		args: []
	},
	func: func
};

function func(message, args){
	
	let embed = new Discord.RichEmbed({
		footer: {
			text: "You can also get help for each command with -h or --help."
		},
		thumbnail: {
			url: "https://i.imgur.com/gv4Itmg.png"
		},
		color: Config.embedColour,
	});

	embed.addField("Help Page", "[Ika.Eiko.Cc](https://ika.eiko.cc/)");

	message.channel.send({embed});
}
