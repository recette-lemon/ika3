module.exports = {
	name: "avatar",
	triggers: ["avatar", "avi", "pfp"],
	description: "Displays user's profile picture",
	category: "general",
	arguments: {
		positional: ["mention"],
		args: []
	},
	func: func
};

function func(message, args){
	let aviurl;
	//TODO: ID check only works for ID 1, Clyde. Possibly something to do with the users object referencing users?
	let user = message.mentions.users.first() || Bot.users.get(args._[0]+'') || Bot.users.find(user => user.tag === args._.join(" "));

	if(!args._[0]) user = message.author;
	if(!user) return message.reply("User not found.");
	if(args._[0] == "server"){
	    if(!message.guild) return message.reply("No guild.");
	    aviurl = message.guild.iconURL;
	} else {
	    aviurl = user.avatarURL;
	    if(!aviurl) return message.reply("No avatar.");
	}
	let embed = new Discord.RichEmbed({
		color: Config.embedColour,
		image: {url: aviurl}
	});
	message.channel.send({embed});
}
