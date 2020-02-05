module.exports = {
	name: "Answer",
	triggers: ["answer", "ans"],
	description: "Answers a question.",
	category: "general",
	arguments: {
		positional: ["question"],
		args: []
	},
	func: func
};

function func(message){
	message.reply(["Yes.", "No."][parseInt(message.id[message.id.length-1])%2]);
}