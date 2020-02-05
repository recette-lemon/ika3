module.exports = {
	name: "Eval",
	triggers: ["eval", "code"],
	description: "Evals code.",
	category: "owner",
	arguments: {
		positional: ["code"],
		args: [
			{short: "n", long: "no-output"},
		]
	},
	func: func
};

function func(message, args){
	let term = args._.join(" ");

	let out = eval(term);

	if(typeof(out) == "object")
		out = out.constructor.name + "\n" + JSON.stringify(out);

	if(!(args.n || args["no-output"]))
		message.channel.send("```js\n" + out + "```");
}
