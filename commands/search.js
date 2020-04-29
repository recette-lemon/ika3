module.exports = {
	name: "Search",
	triggers: ["search", "g"],
	description: "Search using Startpage (Google) or DuckDuckGo. Defaults to Startpage.",
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

let Request = require("request");
let HTMLParse = require("node-html-parser").parse;

function duckduckgo(string, message){
	Request.post("https://duckduckgo.com/lite/", {
		form: {
			q: string,
			kl: "wt-wt"
		}
	}, (err, res, bod) => {
		if(!bod || err)
			return message.reply("Ok, something didn't work.");

		let body = HTMLParse(bod);
		let results = [];
		let links = body.querySelectorAll(".result-link");
		let descriptions = body.querySelectorAll(".result-snippet");

		for (let i = 0; i < links.length; i++) {
			results.push({
				title: links[i].text,
				url: links[i].getAttribute("href"),
				description: descriptions[i].text
			});
		}

		handleResults(results, message);
	});
}

function startpage(string, message){
	Request.post("https://startpage.com/sp/search", {
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
			"Accept-Encoding": "identity" // no gzip thx
		},
		form: {
			query: string,
			cat: "web",
			pg: "",
			abp: 1
		}
	}, (err, res, bod) => {
		let results = [];
		for(let t of HTMLParse(bod).querySelectorAll(".w-gl__result")){
			let a = t.querySelector(".w-gl__result-title");
			results.push({
				title: a.text,
				url: a.getAttribute("href"),
				description: t.querySelector(".w-gl__description").text
			});
		}
		handleResults(results, message);
	});
}

function makeOutput(results, i, embed){
	let result = results[i];
	embed.title = result.title;
	embed.description = result.description;
	embed.footer.text = "#"+(i+1)+" of "+results.length;
	return result.url;
}

function handleResults(results, message){
	if(!results)
		return message.reply("Nothing found.");

	let embed = new Discord.RichEmbed({
		color: Config.embedColour,
		footer: {}
	});

	message.channel.send(makeOutput(results, 0, embed), {embed}).then(mes=>{
		let controls = new Utility.MessageControls(mes, message.author),
			index = 0;

		controls.on("reaction", r => {
			if(r.n === 0 && results[index-1])
				index--;
			else if(r.n === 1 && results[index+1])
				index++;
			else return;

			mes.edit(makeOutput(results, index, embed), {embed});
		});
	});
}

let backends = {duckduckgo, startpage};

function func(message, args){
	let string = args._.join(" ");
	if(!string)
		return message.reply("Need something to search for, buddy.");
	backends[args.backend || "startpage"](string, message);
}
