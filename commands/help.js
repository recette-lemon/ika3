module.exports = {
	name: "help",
	triggers: ["help"],
	description: "Help message",
	category: "misc",
	arguments: {
		positional: ["section"],
		args: []
	},
	func: func
};

function func(message, args){
	let section = args._[0];
	let embed = new Discord.RichEmbed({
		thumbnail: {
			url: "https://i.imgur.com/gv4Itmg.png"
		},
		color: Config.embedColour,
		title: "Help for " + Bot.user.tag,
		description: "Run `" + Config.trigger + "help <section>` to get each category of commands",
	});
	switch(section){
		case "general":
		for(cmd in Commands){
			if(Commands[cmd].category == "general") embed.addField(cmd, Commands[cmd].description);
		}
		break;
		case "lewd":
		for(cmd in Commands){
			if(Commands[cmd].category == "lewd") embed.addField(cmd, Commands[cmd].description);
		}
		break;
		case "meme":
		for(cmd in Commands){
			if(Commands[cmd].category == "meme") embed.addField(cmd, Commands[cmd].description);
		}
		break;
		case "music":
		for(cmd in Commands){
			if(Commands[cmd].category == "music") embed.addField(cmd, Commands[cmd].description);
		}
		break;
		case "image":
		for(cmd in Commands){
			if(Commands[cmd].category == "image") embed.addField(cmd, Commands[cmd].description);
		}
		break;
		case "misc":
		for(cmd in Commands){
			if(Commands[cmd].category == "misc") embed.addField(cmd, Commands[cmd].description);
		}
		break;
		default:
		case undefined:
		embed.addField('General', "Just general commands.");
		embed.addField('Lewd', 'Hot, sexy, anime people.');
		embed.addField('Meme', "Meme and joke commands.");
		embed.addField('Music', "Music bot commands.")
		embed.addField('Image', "Image manipulation commands.");
		embed.addField('Misc', "Miscellaneous commands.");
		break;
	}
	message.channel.send({embed});
	for(cmd in Commands) console.log(Commands[cmd]);
}
