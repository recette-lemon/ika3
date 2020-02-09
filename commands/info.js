module.exports = {
	name: "Info",
	triggers: ["info"],
	description: "User or server info.",
	category: "general",
	arguments: {
		positional: ["id/mention/name/tag"],
		args: [
			{short: "s", long: "server"}
		]
	},
	func: func
};

function func(message, args){

	let user = Utility.getUser(message, args) || message.author,
		s = (args.s || args.server),
		member = message.guild ? message.guild.members.get(user.id) : {};
	
	let embed = new Discord.RichEmbed({
		author: {
			name: s ? message.guild.name : user.tag
		},
		color: s ? Config.embedColour : member.displayColor || Config.embedColour,
		thumbnail: {
			url: s ? message.guild.iconURL : user.avatarURL || user.defaultAvatarURL
		},
		footer: {
			text: s ? message.guild.id : user.id
		},
		fields: [
			{name: "Created at", value: (s ? message.guild.createdAt : user.createdAt).toString().split("+")[0]}
		]
	});

	if(!s && member.id){
		embed.addField("Joined at", member.joinedAt.toString().split("+")[0]);
	} else if(member.id) {
		embed.addField("Users", message.guild.memberCount, true);
		embed.addField("Roles", message.guild.roles.array().length, true);
		embed.addField("Channels", message.guild.channels.array().length, true);
		embed.addField("Owner", message.guild.owner.user.tag, true);
		embed.addField("Region", message.guild.region, true);
	}

	message.channel.send({embed});
}
