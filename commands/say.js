module.exports = {
	name: "Say",
	triggers: ["say", "echo"],
	description: "Says things you give it.",
	category: "general",
	arguments: {
		positional: ["string"],
		flags: {
			"no-delete": [false, "n"]
		}
	},
	func: func
};

function func(message, args){
	if(!args._[0])
		return message.reply("Give me something to say.");

	message.channel.send(args._.join(" "));
	if(!args["no-delete"])
		message.delete();
}
