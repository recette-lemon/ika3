module.exports = {
	name: "say",
	triggers: ["say"],
	description: "Says things you give it",
	category: "general",
	arguments: {
		positional: ["string"],
		args: []
	},
	func: func
};

function func(message, args){
	if(!args._[0]) return message.reply("Fucking give me something to say, you retard.").catch(console.error);
	message.channel.send(args._.join(" ")).catch(console.error);
	message.delete().catch(console.error);
}
