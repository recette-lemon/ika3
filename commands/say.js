module.exports = {
	name: "Say",
	triggers: ["say"],
	description: "Says things you give it.",
	category: "general",
	arguments: {
		positional: ["string"],
	},
	func: func
};

function func(message, args){
	if(!args._[0])
		return message.reply("Give me something to say.");

	message.channel.send(args._.join(" "));
	message.delete();
}
