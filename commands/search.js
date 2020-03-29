module.exports = {
	name: "Search",
	triggers: ["search", "g", "ddg"],
	description: "Search using DuckDuckGo.",
	category: "search",
	arguments: {
		positional: ["terms"],
		args: []
	},
	func: func
};

const Request = require("request");
const URL = "https://duckduckgo.com/lite/";

function func(message, args){
	let string = args._.join(" ");

	if(!string)
		return message.reply("Need something to search for, buddy.");

	Request.post(URL, {
		form: {
			q: encodeURIComponent(string).replace(/%20/g, "+"),
			kl: "wt-wt"
		}
	}, (err, ress, bod) => {

		if(!bod || err)
			return message.reply("Ok, something didn't work.");

		let res = bod.match(/(?<=(href=["']))(.+)(?=(["'] class=["']result))/g);

		if(!res)
			return message.reply("Nothing found.");

		message.channel.send("Result 1 of "+res.length+" "+res[0]).then(mes=>{
			let controls = new Utility.MessageControls(mes, message.author),
				index = 0;

			controls.on("reaction", r => {
				if(r.n === 0 && res[index-1])
					index--;
				else if(r.n === 1 && res[index+1])
					index++;
				else return;

				mes.edit("Result "+(index+1)+" of "+res.length+" "+res[index]);
			});
		});
	});
}