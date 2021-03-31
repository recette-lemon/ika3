module.exports = {
	name: "Img",
	triggers: ["img"],
	description: "Image search using Startpage (Google) or DuckDuckGo. Defaults to Startpage.",
	category: "search",
	arguments: {
		positional: ["terms"],
		flags: {
			"family-filter": [false, "f"],
			backend: {
				duckduckgo: [false, "ddg", "d"],
				startpage: [false, "sp", "s"]
			}
		}
	},
	func: func
};

let pageBase = "http://duckduckgo.com/?ia=images&iax=images&k5=1&q=";
let jsonBase = "https://duckduckgo.com/i.js?l=us-en&o=json&vqd=VQD&f=,,,&p=-1&v7exp=a&q=";
let Request = require("request");
let HTMLParse = require("node-html-parser").parse;

function duckduckgo(message, string, args){
	let query = encodeURIComponent(string);
	let url = pageBase+query+(args.f ? "" : "&kp=-2");
	Request.get(url, {}, (perr, pres, pbod) => {
		if(perr || !pbod)
			throw("nope");

		let vqd = pbod.match(/&vqd=(.+)&p/)[1];
		let url = jsonBase.replace("VQD", vqd)+query;

		if(args.f)
			url = url.replace("p=-1", "p=1");

		Utility.get(url, (jerr, jres, jbod) => {
			let results = JSON.parse(jbod).results;

			if(!results[0])
				return message.reply("Nothing found.");

			let embed = new Discord.MessageEmbed({
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


let j = Request.jar();
j.setCookie(Request.cookie('preferences=disable_family_filterEEE1N1Ndisable_open_in_new_windowEEE0N1Ndisable_video_family_filterEEE1N1Nenable_post_methodEEE1N1Nenable_proxy_safety_suggestEEE1N1Nenable_stay_controlEEE0N1Ngeo_mapEEE0N1Nlang_homepageEEEs/default/en/N1NlanguageEEEenglishN1Nlanguage_uiEEEenglishN1Nnum_of_resultsEEE10N1Nother_iaEEE0N1NsuggestionsEEE0N1Nwikipedia_iaEEE0N1Nwt_unitEEEcelsius'), "https://startpage.com");

function startpage(message, string, args){
	let jar = args.f ? undefined : j; 
	Request.post("https://startpage.com/sp/search", {
		jar: jar,
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

		let embed = new Discord.MessageEmbed({
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

	backends[args.backend || "startpage"](message, string, args);
}
