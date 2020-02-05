module.exports = {
	name: "invite",
	triggers: ["invite"],
	description: "Provides an invite link.",
	category: "misc",
	arguments: {
		positional: [],
		args: []
	},
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

	message.channel.send({embed});

}
