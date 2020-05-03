module.exports = {
	name: "Config",
	triggers: ["config"],
	description: "Sets settings for servers and users.",
	category: "moderation",
	arguments: {
		positional: ["key", "values to set"],
		flags: {
			user: [false, "u"],
			remove: [false, "r"],
		}
	},
	func: func
};

function assignMuteRole(id, message, args, str){
	let role = message.guild.roles.get(str);
	if(!role){
		str = str.toLowerCase();
		role = message.guild.roles.find(role => {
			return role.name.toLowerCase() === str;
		});
	}
	if(!role)
		return message.reply("Role not found.");
	Configs.get(id).set("muterole", role.id);
	Configs.get(id).get("raw").set(args.setting, str);
	message.reply("Set "+role.name+" as mute role.");
}

function assignDisabledCommands(id, message, args, str){
	let incommands = str.split(",").map(a=>a.trim().toLowerCase());
	let commands = new Set();
	for(let ic of incommands){
		for(let trigger in Commands){
			let command = Commands[trigger];
			if(ic === trigger || ic === command.name.toLowerCase())
				commands.add(command.name);
		}
	}
	if(commands.has(module.exports.name))
		return message.reply("You're not allowed to brick this command.");
	commands = Array.from(commands);
	if(!commands.length)
		return message.reply("No command found.");
	Configs.get(id).set("disabledcommands", commands);
	Configs.get(id).get("raw").set(args.setting, str);
	message.reply("Disabled "+commands.join(", ")+".");
}

let settings = {
	muterole: {
		assign: assignMuteRole,
		server: true,
		user: false,
		flag: [false, "mr"]
	},
	disabledcommands: {
		assign: assignDisabledCommands,
		server: true,
		user: false,
		flag: [false, "dc"]
	}
};

module.exports.arguments.flags.setting = Object.fromEntries(
	Object.entries(settings).map(e => [e[0], e[1].flag])
);

function func(message, args){
	let setting = settings[args.setting];
	if(!setting)
		return message.reply("Key not found. --help for a list.");

	// check that user/server is allowed
	if((!setting.user && args.user))
		return message.reply("This setting isnt settable for users.");
	if((!setting.server && !args.user))
		return message.reply("This setting isnt settable for servers.");

	// check permissions for servers
	if(!message.member.permissions.has("MANAGE_GUILD") && !args.user)
		return message.reply("You don't have manage guild perms.");

	// get user/server id
	let id;
	if(args.user || !message.guild)
		id = message.author.id;
	else
		id = message.guild.id;

	let config = Configs.get(id);

	// remove if it exists and remove flag
	if(args.remove){
		if(config.exists(args.setting)){
			config.delete(args.setting);
			config.get("raw").delete(args.setting);
			return message.reply("Removed.");
		} else {
			return message.reply("Not set.");
		}
	}

	// if nothing is given, reply with current setting.
	let str = args._.join(" ");
	if(!str && !message.content.includes("\n")){
		let out = config.get("raw").exists(args.setting) ? config.get("raw").get(args.setting) : "Nothing set.";
		return message.reply(out);
	}

	setting.assign(id, message, args, str);
}
