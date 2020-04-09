module.exports = {
	name: "Mute",
	triggers: ["mute", "dab"],
	description: "Temporary mute with a role. Use config command to manage role, and length is a format like 2h, 10m, etc. Default is 10m.",
	category: "moderation",
	arguments: {
		positional: ["mention", "length"],
		flags: {
			remaining: [false, "r"]
		}
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
	user.removeRole(role).catch();
	delete mutes[user.id];
}

function func(message, args){
	if(!message.member.permissions.has("MANAGE_ROLES"))
		return message.reply("You don't have manage role perms.");

	if(!guildConfigs[message.guild.id].muterole)
		return message.reply("Mute role not set. Use the config command.");

	let user = message.mentions.members.first(),
		time = args._[0] ? Utility.clamp(parseTime((args._[0][0] === "<" ? args._[1]:args._[0]) || 600), 604800, 0) : null,
		roleP = guildConfigs[message.guild.id].muterole,
		role = message.guild.roles.get(roleP) || message.guild.roles.find((r) => {return r.name.toLowerCase() === (Array.isArray(roleP)?roleP.join(" "):roleP).toLowerCase()});

	if(args.remaining){
		let users;
		if(user){
			users = [user.id];
			if(!guildConfigs[message.guild.id].mutes[user.id])
				return message.reply("Not muted.");
		} else {
			users = Object.keys(guildConfigs[message.guild.id].mutes);
		}

		let out = users.map(u => {
			let user = Bot.users.get(u);
			if(!user) return;
			let mute = guildConfigs[message.guild.id].mutes[u];
			let r = mute.time - Math.round(((new Date()).getTime() - mute.start) / 1000);
			return user.tag + ": " + Utility.toHHMMSS(r) + " of " + Utility.toHHMMSS(mute.time);
		}).join("\n");

		if(!out)
			return message.reply("Nobody's muted.");

		return message.reply(out);
	}

	if(!(user && time && role))
		return message.reply("Need a mention and length, in that order, and a valid role id/name set.");

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