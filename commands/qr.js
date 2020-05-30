module.exports = {
	name: "QR",
	triggers: ["qr"],
	description: "Generates a QR code.",
	category: "misc",
	arguments: {},
	func: func
};

let Request = require("request");

function func(message, args){
	let text = args._.join(" ").replace(/\n/g, "");
	if(!text)
		return message.reply("Nothing to encode.");
	if(text.length > 280)
		return message.reply("Too long.");
	Request.get("https://qrenco.de/" + text, {
		headers: {
			"User-Agent": "curl"
		}
	},(err, res, bod) => {
		if(err || !bod)
			return message.reply("Something went wrong.");
		message.reply("```"+bod+"```");
	});
}

