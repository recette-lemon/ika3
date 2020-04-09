module.exports = {
	name: "URL Shorten",
	triggers: ["shorten"],
	description: "Shrinks a URL using L.1776.Moe.",
	category: "misc",
	arguments: {
		positional: ["url"],
	},
	func: func
};

var Request = require("request");

function func(message, args){
	let url = args._[0]
	if(!url)
		return message.reply("Need something to shorten.");

	Request.post({url: "https://l.1776.moe/api.php", form: {link: url}}, (err, res, bod) => {
		if(err || !bod)
			throw("nope");

		message.reply(bod);
	});
}
