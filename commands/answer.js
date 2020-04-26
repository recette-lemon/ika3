module.exports = {
	name: "Answer",
	triggers: ["answer", "ans"],
	description: "Answers a question.",
	category: "game",
	arguments: {
		positional: ["question"],
	},
	func: func
};

function func(message, args){
	let mes = args._.join(" ");
	let q = mes.match(/\w/g);
	if(!q)
		return message.reply("Nothing to answer.");
	let n = q.map(c => c.charCodeAt(0)).reduce((a,b) => a+b);
	let d = mes.split(/\s+or\s+/);
	let answers = ["Yes.", "No."];
	if (d[1])
		answers = d.map(x => x.toLowerCase().trim()).sort();
	message.reply(answers[n % answers.length]);
}
