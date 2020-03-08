module.exports = {
	name: "Answer",
	triggers: ["answer", "ans"],
	description: "Answers a question.",
	category: "game",
	arguments: {
		positional: ["question"],
		args: []
	},
	func: func
};

function func(message, args){
	let q = args._.join("").toLowerCase().match(/[a-z]/g);
	if(!q)
		return message.reply("Nothing to answer.");
	message.reply(["Yes.", "No."][q.map(c => {return c.charCodeAt(0)}).reduce((a,b) => {return a+b}) % 2]);
}