module.exports = {
	name: "Avatar",
	triggers: ["avatar", "avi", "pfp"],
	description: "Displays user's profile picture.",
	category: "general",
	arguments: {
		positional: ["mention"],
		args: [
			{short: "s", long: "server"}
		]
	},
	func: func
};

function func(message, args){

	let user = Utility.getUser(message, args) || message.author,
		s = (args.s || args.server),
		aviurl = s ? message.guild.iconURL : user.avatarURL || user.defaultAvatarURL;

	let embed = new Discord.RichEmbed({
		color: Config.embedColour,
		image: {
			url: aviurl
		}
	});
	message.channel.send({embed});
}
