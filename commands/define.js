module.exports = {
	name: "Define",
	triggers: ["define"],
	description: "Defines a word using Wordnik.com.",
	category: "general",
	arguments: {},
	func: func
};

let HTMLParse = require("node-html-parser").parse;
let Request = require("request");

function func(message, args){
	let term = args._.join(" ");
	if(!term)
		return message.reply("Need a word to define.");
	Request.get("https://www.wordnik.com/words/"+term, (err, res, bod) => {
		if(err || !bod)
			return message.reply("Something went wrong.");
		let definitions = HTMLParse(bod).querySelectorAll("#define li").map(
			d => d.text
		);

		if(!definitions.length)
			return message.reply("Couldn't get a definition.");

		message.channel.send(definitions[0]).then(mes => {
			let controls = new Utility.MessageControls(mes, message.author);
			let index = 0;
			controls.on("reaction", r => {
				if(r.n === 0 && definitions[index-1])
					index--;
				else if(r.n === 1 && definitions[index+1])
					index++;
				else return;
				mes.edit(definitions[index]);
			});
		});
	});
}
