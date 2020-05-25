module.exports = {
	name: "Invite",
	triggers: ["invite"],
	description: "Provides an invite link.",
	category: "bot",
	arguments: {},
	func: func
};

function func(message){

	let embed = new Discord.RichEmbed({
		thumbnail: {
			url: Bot.user.avatarURL
		},
		title: "[Link]",
		url: "https://l.1776.moe/ika",
		description: "Invite me to a guild.",
		color: Config.embedColour
	});

	embed.addField("Host your own instance:", "[Github](https://github.com/recette-lemon/ika3) [Gitlab](https://gitlab.com/recette_lemonweed/ika3)");

	message.channel.send({embed});

}
