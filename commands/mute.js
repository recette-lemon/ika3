module.exports = {
	name: "Mute",
	triggers: ["mute", "dab"],
	description: "Temporary mute with a role. Use config command to manage role, and length is a format like 2h, 10m, etc. Default is 10m.",
	category: "moderation",
	arguments: {
		positional: ["mention", "length"],
		flags: {
			remaining: [false, "r"],
			unmute: [false, "u"]
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
	mutes.delete(user.id);
}

function func(message, args){
	// check permissions
	if(!message.member.permissions.has("MANAGE_ROLES"))
		return message.reply("You don't have manage role perms.");

	// check mute role exists
	if(!Configs.get(message.guild.id).get("muterole"))
		return message.reply("Mute role not set. Use the config command.");

	// set up vars
	let guildConfig = Configs.get(message.guild.id);
	let user = message.mentions.members.first();
	let time = args._[0] ? Utility.clamp(parseTime((args._[0][0] === "<" ? args._[1]:args._[0]) || 600), 604800, 0) : null;
	let role = message.guild.roles.get(guildConfig.get("muterole"));

	// remaining output block
	if(args.remaining){
		let users;
		if(user){
			users = [user.id];
			if(!guildConfig.get("mutes").get(user.id))
				return message.reply("Not muted.");
		} else {
			users = Object.keys(guildConfig.get("mutes"));
		}

		let out = users.map(u => {
			let user = Bot.users.cache.get(u);
			if(!user) return;
			let mute = guildConfig.get("mutes").get(u);
			let r = mute.time - Math.round(((new Date()).getTime() - mute.start) / 1000);
			return user.tag + ": " + Utility.toHHMMSS(r) + " of " + Utility.toHHMMSS(mute.time);
		}).join("\n");

		if(!out)
			return message.reply("Nobody's muted.");

		return message.reply(out);
	}

	// check role and user exist
	if(!(user && role))
		return message.reply("Need a mention and length, in that order, and a valid role id/name set.");

	// check heirarchy
	if(user.highestRole.comparePositionTo(message.member.highestRole) >= 0)
		return message.reply("You arent higher than them in the role list.");

	if(args.unmute){
		unmute(user, role, guildConfig.get("mutes"));
		return message.reply("User unmuted.");
	}

	// save mute in config
	guildConfig.get("mutes").set(user.id, {
		time,
		start: (new Date()).getTime(),
		role: role.id
	});

	// mute and set up timeout
	user.addRole(role).then(() => {
		message.reply("User muted for " + Utility.toHHMMSS(time));
		setTimeout(() => {
			unmute(user, role, guildConfig.get("mutes"));
		}, time * 1000);
	}).catch(() => {
		message.reply("Failed to add role. Probably don't have perms.");
	});
}
