module.exports = {
	name: "Urban Dictionary",
	triggers: ["urban", "ud"],
	description: "Gets a definition from UD.",
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
		let def = bod.match(/property="fb:app_id"><meta content\=\"(.+)" name="Descri/);
		message.reply(def ? HTMLParse(def[1]).text : "Not found");
	});
}
