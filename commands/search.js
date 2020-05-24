module.exports = {
	name: "Search",
	triggers: ["search", "g"],
	description: "Search using Startpage (Google) or DuckDuckGo. Defaults to Startpage, unless terms start with a `!`, then DDG will be used for its bangs.",
	category: "search",
	arguments: {
		positional: ["terms"],
		flags: {
			plain: [false, "p"],
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

function duckduckgo(string, message, args){
	Request.post("https://duckduckgo.com/lite/", {
		followAllRedirects: true,
		form: {
			q: string,
			kl: "wt-wt"
		}
	}, (err, res, bod) => {
		if(!bod || err)
			return message.reply("Ok, something didn't work.");
		if(res.request.href !== "https://duckduckgo.com/lite/")
			return message.reply(res.request.href);
		let body = HTMLParse(bod);
		let results = [];
		let links = body.querySelectorAll(".result-link");
		let descriptions = body.querySelectorAll(".result-snippet");
		for (let i = 0; i < links.length; i++) {
			try{
				results.push({
					title: links[i].text,
					url: links[i].getAttribute("href"),
					description: descriptions[i].text
				});
			}catch(err){}
		}
		handleResults(results, message, args);
	});
}

function startpage(string, message, args){
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
		if(!bod || err)
			return message.reply("Ok, something didn't work.");
		let body = HTMLParse(bod);
		let results = [];
		for(let t of HTMLParse(bod).querySelectorAll(".w-gl__result")){
			let a = t.querySelector(".w-gl__result-title");
			try{
				results.push({
					title: a.text,
					url: a.getAttribute("href"),
					description: t.querySelector(".w-gl__description").text
				});
			}catch(err){}
		}
		handleResults(results, message, args);
	});
}

function handleResults(results, message, args){
	if(!results)
		return message.reply("Nothing found.");
	let index = 0;
	let embed = args.plain ? undefined : new Discord.RichEmbed({
		color: Config.embedColour,
		footer: {},
		thumbnail: {}
	});
	function makeOutput(){
		let result = results[index];
		if(!embed)
			return result.url;
		embed.title = result.title;
		embed.description = result.description;
		embed.footer.text = "#"+(index+1)+" of "+results.length;
		embed.thumbnail.url = result.thumbnail;
		return result.url;
	}
	message.channel.send(makeOutput(), {embed}).then(mes=>{
		function fetchMetadata(){
			if(!embed || results[index].thumbnail !== undefined)
				return;
			let currentIndex = index; // store what its for so we dont apply if the embed has been srolled
			Request.get(results[index].url, (err, res, bod) => {
				if(err || !bod)
					return;
				let html = HTMLParse(bod);
				let thumbnail = html.querySelector("head [property='og:image']");
				results[currentIndex].thumbnail = null;
				if(!thumbnail)
					return;
				thumbnail = thumbnail.getAttribute("content");
				if(!thumbnail)
					return;
				thumbnail = Utility.expandURL(results[currentIndex].url, thumbnail);
				results[currentIndex].thumbnail = thumbnail;
				if(currentIndex !== index)
					return;
				mes.edit(makeOutput(), {embed});
			});
		}
		let controls = new Utility.MessageControls(mes, message.author);
		fetchMetadata();
		controls.on("reaction", r => {
			if(r.n === 0 && results[index-1])
				index--;
			else if(r.n === 1 && results[index+1])
				index++;
			else return;
			mes.edit(makeOutput(), {embed});
			fetchMetadata();
		});
	});
}

let backends = {duckduckgo, startpage};

function func(message, args){
	let string = args._.join(" ");
	if(!string)
		return message.reply("Need something to search for, buddy.");
	backends[args.backend || (string[0] === "!" ? "duckduckgo" : "startpage")](string, message, args);
}
