module.exports = {
	name: "Avatar",
	triggers: ["avatar", "avi", "pfp"],
	description: "Displays user's profile picture.",
	category: "general",
	arguments: {
		positional: ["id/mention/name/tag"],
		flags: {
			server: [false, "s"] 
		}
	},
	func: func
};

function func(message, args){
	let user = Utility.getUser(message, args) || message.author,
		aviurl = args.server ? message.guild.iconURL+"?size=2048" : user.avatarURL || user.defaultAvatarURL;

	let embed = new Discord.RichEmbed({
		color: Config.embedColour,
		image: {
			url: aviurl
		}
	});
	message.channel.send({embed});
}
