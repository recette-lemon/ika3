module.exports = {
	name: "Eval",
	triggers: ["eval", "code"],
	description: "Evals code.",
	category: "owner",
	arguments: {
		positional: ["code"],
		flags: {
			"no-output": [false, "n"]
		}
	},
	func: func
};

function func(message, args){
	if(message.author.id !== Config.ownerId)
		return;
	let term = args._.join(" "), out;
	
	try{
		out = eval(term);
	} catch(err){
		out = err.toString();
	}

	if(typeof(out) == "object")
		out = out.constructor.name + "\n" + JSON.stringify(out);

	if(!args["no-output"])
		message.channel.send("```js\n" + out + "```");
}
