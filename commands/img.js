module.exports = {
	name: "Img",
	triggers: ["img"],
	description: "Image search using Startpage (Google) or DuckDuckGo. Defaults to Startpage.",
	category: "search",
	arguments: {
		positional: ["terms"],
		flags: {
			backend: {
				duckduckgo: [false, "ddg", "d"],
				startpage: [false, "sp", "s"]
			}
		}
	},
	func: func
};

let pageBase = "http://duckduckgo.com/?ia=images&iax=images&k5=1&kp=-2&q=";
let jsonBase = "https://duckduckgo.com/i.js?l=us-en&o=json&vqd=VQD&f=,,,&p=-1&v7exp=a&q=";
let Request = require("request");
let HTMLParse = require("node-html-parser").parse;

function duckduckgo(message, string){
	let query = encodeURIComponent(string);
	
	Request.get(pageBase+query, {}, (perr, pres, pbod) => {
		if(perr || !pbod)
			throw("nope");

		let vqd = pbod.match(/&vqd=(.+)&p/)[1];
		let url = jsonBase.replace("VQD", vqd)+query;

		Utility.get(url, (jerr, jres, jbod) => {
			let results = JSON.parse(jbod).results;

			if(!results[0])
				return message.reply("Nothing found.");

			let embed = new Discord.RichEmbed({
				title: results[0].title,
				author: {
					name: results[0].url.split("/")[2],
					url: results[0].url
				},
				image: {
					url: results[0].image
				},
				color: Config.embedColour,
				footer: {
					text: "1 of "+results.length + " | " + results[0].width+"x"+results[0].height
				}
			});

			message.channel.send({embed}).then(mes=>{
				let controls = new Utility.MessageControls(mes, message.author);
				let index = 0;

				controls.on("reaction", r => {
					if(r.n === 0 && results[index-1])
						index--;
					else if(r.n === 1 && results[index+1])
						index++;
					else return;

					embed.author.name = results[index].url.split("/")[2];
					embed.author.url = results[index].url;
					embed.image.url = results[index].image;
					embed.title = results[index].title;
					embed.footer.text = (index+1)+" of "+results.length + " | " + results[index].width+"x"+results[index].height;

					mes.edit({embed});
				});
			});
		});
	});
}

function startpage(message, string){
	Request.post("https://startpage.com/sp/search", {
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
			"Accept-Encoding": "identity" // no gzip thx
		},
		form: {
			"language": "english",
			"lui": "english",
			"query": string,
			"cat": "pics"
		}
	}, (err, res, bod) => {
		if(err || !bod)
			return message.reply("Something went wrong.");
		let results = bod.match(/(?<=data-img-metadata=')(.+)(?=')/g);
		if(!results)
			return message.reply("No results.");
		results = results.map(JSON.parse);

		let embed = new Discord.RichEmbed({
			title: HTMLParse(results[0].title).text,
			author: {
				name: results[0].displayUrl.split("/")[2],
				url: results[0].displayUrl
			},
			image: {
				url: results[0].clickUrl
			},
			color: Config.embedColour,
			footer: {
				text: "1 of "+results.length + " | " + results[0].width+"x"+results[0].height
			}
		});

		message.channel.send({embed}).then(mes=>{
			let controls = new Utility.MessageControls(mes, message.author);
			let index = 0;

			controls.on("reaction", r => {
				if(r.n === 0 && results[index-1])
					index--;
				else if(r.n === 1 && results[index+1])
					index++;
				else return;

				embed.author.name = results[index].displayUrl.split("/")[2];
				embed.author.url = results[index].displayUrl;
				embed.image.url = results[index].clickUrl;
				embed.title = HTMLParse(results[index].title).text;
				embed.footer.text = (index+1)+" of "+results.length + " | " + results[index].width+"x"+results[index].height;

				mes.edit({embed});
			});
		});
	});
}

let backends = {duckduckgo, startpage};

function func(message, args){
	let string = args._.join(" ");
	if(!string)
		return message.reply("Gonna need something to search for.");

	backends[args.backend || "startpage"](message, string);
}
