module.exports = {
	name: "Mute",
	triggers: ["mute", "dab"],
	description: "Temporary mute with a role. Use config command to manage role, and length is a format like 2h, 10m, etc.",
	category: "moderation",
	arguments: {
		positional: ["mention", "length"],
		args: []
	},
	func: func
};

function parseTime(str){
	let n = parseFloat(str);
	let lengths = {
		s: 1,
		m: 60,
		h: 3600,
		d: 86400,
		w: 604800
	};

	return n * (lengths[str[str.length-1]] || 1);
}

function unmute(user, role, mutes){
	user.removeRole(role);
	delete mutes[user.id];
}

function func(message, args){
	if(!message.member.permissions.has("MANAGE_ROLES"))
		return message.reply("You don't have manage role perms.");

	if(!guildConfigs[message.guild.id].muterole)
		return message.reply("Mute role not set. Use the config command.");

	let user = message.mentions.members.first(),
		time = parseTime(args._[1]),
		roleP = guildConfigs[message.guild.id].muterole,
		role = message.guild.roles.get(roleP) || message.guild.roles.find((r) => {return r.name.toLowerCase() == roleP.join(" ").toLowerCase()});

	if(!(user && time && role))
		return message.reply("Need a mention and length, in that order, and a valid role id/name.");

	if(user.highestRole.comparePositionTo(message.member.highestRole) >= 0)
		return message.reply("You arent higher than them in the role list.");

	guildConfigs[message.guild.id].mutes[user.id] = {
		time,
		start: (new Date()).getTime(),
		role: role.id
	};

	user.addRole(role).then(() => {
		message.reply("User muted for " + Utility.toHHMMSS(time));
		setTimeout(() => {
			unmute(user, role, guildConfigs[message.guild.id].mutes);
		}, time * 1000);
	}).catch(() => {
		message.reply("Failed to add role. Probably don't have perms.");
	});
}