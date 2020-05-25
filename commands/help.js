module.exports = {
	name: "Help",
	triggers: ["help"],
	description: "Help message.",
	category: "bot",
	arguments: {},
	func: func
};

function func(message, args){
	let embed = new Discord.RichEmbed({
		title: "Get help for each command with -h or --help.",
		thumbnail: {
			url: "https://i.imgur.com/gv4Itmg.png"
		},
		color: Config.embedColour,
	});

	embed.addField("Commands", "[Ika.Eiko.cc](https://ika.eiko.cc/)", true);
	embed.addField("Gits", "[Github](https://github.com/recette-lemon/ika3) [Gitlab](https://gitlab.com/recette_lemonweed/ika3)", true);

	message.channel.send({embed});
}
