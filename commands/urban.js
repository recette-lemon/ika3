module.exports = {
	name: "Urban Dictionary",
	triggers: ["urban", "ud"],
	description: "Gets definitions from UD.",
	category: "search",
	arguments: {
		positional: ["term"],
	},
	func: func
};

let Request = require("request");
let HTMLParse = require("node-html-parser").parse;

function func(message, args){
	let term = args._.join(" ");
	if(!term)
		return reply("Need something to define.");
	let url = "http://www.urbandictionary.com/define.php?term="+encodeURIComponent(term);
	Request.get(url, (err, res, bod) => {
		if(err || !bod)
			return message.reply("Failed.");
		let meanings = HTMLParse(bod).querySelectorAll(".meaning").map(r => r.text);
		if(!meanings.length)
			return message.reply("Nothing found.");
		Utility.scrollControls(message, meanings, (res, posStr) => {
			return `<${url}>\n${res.slice(0, 1500)+(res.length>1500?"...":"")}\n${posStr}`;
		});
	});
}
