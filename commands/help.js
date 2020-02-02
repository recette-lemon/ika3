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
		thumbnail: {
			url: "https://i.imgur.com/gv4Itmg.png"
		},
		color: Config.embedColour,
	});

	embed.addField("Help Page", "[Ika.Sylvie.Moe/Help](https://ika.sylvie.moe/help)");

	message.channel.send({embed});
	for(cmd in Commands) console.log(Commands[cmd]);
}
