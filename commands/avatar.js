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
	let user = Utility.getUser(message, args) || message.author;
	let aviurl = (args.server ? message.guild.iconURL : user.avatarURL || user.defaultAvatarURL);
	if(aviurl.includes("a_"))
		aviurl = aviurl.replace(/\png|jpg/, "gif");
	if(!aviurl.includes("?size="))
		aviurl += "?size=2048";
	let embed = new Discord.MessageEmbed({
		color: Config.embedColour,
		image: {
			url: aviurl
		}
	});
	message.channel.send(embed);
}

