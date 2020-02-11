module.exports = {
	name: "Config",
	triggers: ["config"],
	description: "Sets server variables.",
	category: "moderation",
	arguments: {
		positional: ["key", "values to set"],
		args: [
			{short: "k", long: "keys"},
			{short: "v", long: "view"}
		]
	},
	func: func
};

var keys = [
	"muterole"
];

function func(message, args){
	if(args.k || args.keys)
		return message.reply(keys.join(", "));

	if(!message.member.permissions.has("MANAGE_GUILD"))
		return message.reply("You don't have manage guild perms.");

	let key = args._[0];
	let values = args._.length < 3 ? args._[1] : args._.slice(1);

	if(!values && !(args.v || args.view))
		return message.reply("Need a key and value(s).");

	key = key.toLowerCase();

	if(keys.indexOf(key) === -1)
		return message.reply("That's not a valid key. Use --keys for a list.");

	if(args.v || args.view)
		return message.reply(guildConfigs[message.guild.id][key] || "Not defined.");

	guildConfigs[message.guild.id][key] = values;
	message.reply("Set.");
}