module.exports = {
	name: "Config",
	triggers: ["config"],
	description: "Sets server variables.",
	category: "moderation",
	arguments: {
		positional: ["key", "values to set"],
		flags: {
			keys: [false, "k"],
			view: [false, "v"]
		}
	},
	func: func
};

var keys = [
	"muterole",
	"disabledcommands"
];

function func(message, args){
	if(args.keys)
		return message.reply(keys.join(", "));

	if(!message.member.permissions.has("MANAGE_GUILD"))
		return message.reply("You don't have manage guild perms.");

	let key = args._[0];
	let values = args._.length < 3 ? args._[1] : args._.slice(1);

	key = key.toLowerCase();

	if(keys.indexOf(key) === -1)
		return message.reply("That's not a valid key. Use --keys for a list.");

	if(args.view)
		return message.reply(guildConfigs[message.guild.id][key] || "Not defined.");

	if(key === "disabledcommands" && values && (typeof(values) === "object" ? values.map((v)=>{return v.toLowerCase()}) : values.toLowerCase()).includes("config"))
		return message.reply("Nah, I'm too mommy to let you brick this command. :)");

	if(!values)
		delete guildConfigs[message.guild.id][key];
	else
		guildConfigs[message.guild.id][key] = values;
	
	message.reply("Set.");
}
