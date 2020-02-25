module.exports = {
	name: "Search",
	triggers: ["search", "g"],
	description: "Search using Searx.me.",
	category: "search",
	arguments: {
		positional: ["terms"],
		args: []
	},
	func: func
};

const Request = require("request");
const baseURL = "https://duckduckgo.com/?q=";

function func(message, args){
	let string = args._.join(" ");

	if(!string)
		return message.reply("Need something to search for, buddy.");

	let url = baseURL + encodeURIComponent(string);

	Request.get(url, (err, res, bod) => {
		if(!bod || err)
			return message.reply("Ok, something didn't work.");

		let d = "https://duckduckgo.com" + bod.match(/\/d\.js.+(?='\);DDH)/)[0];

		Request.get(d, (err, res, bod) => {

			let results = JSON.parse(bod.match(/(?<=nrn\('d',).+\).+(?=\);DDG\.deep\.bing)/)[0]);

			if(!results)
				return message.reply("Nothing found.");

			message.channel.send("Result 1 of "+results.length+" "+results[0].u).then(mes=>{
				let controls = new Utility.MessageControls(mes, message.author),
					index = 0;

				controls.on("reaction", r => {
					if(r.n === 0 && results[index-1])
						index--;
					else if(r.n === 1 && results[index+1])
						index++;
					else return;

					mes.edit("Result "+(index+1)+" of "+results.length+" "+results[index].u);
				});
			});
		});
	});
}
