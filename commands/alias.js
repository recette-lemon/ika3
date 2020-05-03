module.exports = {
	name: "Alias",
	triggers: ["alias"],
	description: "Adds and removes user and server aliases. Flags can be escaped with \\",
	category: "misc",
	arguments: {
		positional: ["trigger", "command"],
		flags: {
			server: [false],
			remove: [false]
		}
	},
	func: func
};

function viewAlias(aliases, trigger){
	let command = aliases[trigger];
	if(!command)
		return;
	return "\n"+trigger+" "+command.join(" ");
}

function listAliases(aliases){
	let out = "";
	for(let trigger in aliases){
		out += viewAlias(aliases, trigger);
	}
	return out;
}

function func(message, args){
	let strings = message.content.split(" ").slice(1);
	let command = strings.slice(
		Math.abs(strings.findIndex(a => !a.startsWith("-")))
	).map(a => a.replace("\\-", "-"));
	let trigger = command.shift();
	let id = args.server && message.guild ? message.guild.id : message.author.id;
	let aliasesConfig = Configs.get(id).get("aliases");

	// check permissions for servers
	if(!message.member.permissions.has("MANAGE_GUILD") && args.server)
		return message.reply("You don't have manage guild perms.");

	// remove if remove flag and alias exists
	if(args.remove){
		if(!trigger){
			return message.reply(
				"Need a trigger to remove\n```\n"+Config.trigger+"alias --remove hello```"
			);
		}
		if(aliasesConfig.exists(trigger)){
			aliasesConfig.delete(trigger);
			return message.reply("Removed.");
		} else {
			return message.reply("Doesn't exist.");
		}
	}

	// nothing, so print all aliases
	if(!trigger)
		return message.reply(listAliases(aliasesConfig) || "None set.");

	// check whether trigger makes sense
	if(trigger.match(/[^\w]/))
		return message.reply("Can't use non-word characters in trigger.");

	// if no command, print specific alias
	if(!command.length)
		return message.reply(viewAlias(aliasesConfig, trigger) || "Not set.");

	command[0] = command[0].toLowerCase();

	// check command actually exists in ika
	if(!Commands[command[0]])
		return message.reply(command[0]+" doesn't exist as a command.");

	if(trigger === module.exports.triggers[0])
		return message.reply("Not letting you brick this command.");
	
	aliasesConfig.set(trigger, command);
	message.reply("Set.");
}
