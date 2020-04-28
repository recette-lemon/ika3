module.exports = {
	name: "Reverse Image Search",
	triggers: ["ris", "rimg"],
	description: "Searches various services for images, or just gives a link to the site. Defaults to Google.",
	category: "search",
	arguments: {
		flags: {
			backend: {
				google: [false, "g"],
				tineye: [false, "tin", "t"],
				whatanime: [false, "wa", "trace", "a"],
				iqdb: [false, "i"],
				saucenao: [false, "sauce", "sn", "s"]
			}
		}
	},
	func
};

let Request = require("request");
let HTMLParse = require("node-html-parser").parse;

function google(message, url){ // trying to actually parse the site is wasted effort
	let embed = new Discord.RichEmbed({
		title: "Google.com",
		color: Config.embedColour,
		url: "https://www.google.com/searchbyimage?&image_url="+url
	});

	message.reply({embed});
}

function tineye(message, url){
	let embed = new Discord.RichEmbed({
		title: "Tineye.com",
		color: Config.embedColour,
		url: "https://tineye.com/search?url=" + encodeURIComponent(url)
	});

	message.reply({embed});
}

function saucenao(message, url){
	Request.get("https://saucenao.com/search.php?url="+encodeURIComponent(url), (err, res, bod) => {
		if(err || !bod)
			return message.reply("Couldn't get results.");

		let results = [];
		for(let t of HTMLParse(bod).querySelectorAll(".result")){
			if(t.getAttribute("id") === "result-hidden-notification")
				break;	
			results.push({
				thumbnail: t.querySelector("img").getAttribute("src"),
				content: t.querySelector(".resulttablecontent").structuredText
			});
		}

		if(results.length === 0)
			return message.reply("Nothing found.");

		let embed = new Discord.RichEmbed({
			color: Config.embedColour,
			fields: [
				{
					name: "SauceNAO",
					value: results[0].content
				}
			],
			thumbnail: {
				url: results[0].thumbnail
			},
			footer: {
				text: "#1 of "+results.length
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

				embed.fields[0].value = results[index].content;
				embed.thumbnail.url = results[index].thumbnail;
				embed.footer.text = "#"+(index+1)+" of "+results.length;
				mes.edit({embed});
			});
		});
	});
}

function iqdb(message, url){
	Request.get("https://iqdb.org/?url="+encodeURIComponent(url), (err, res, bod) => {
		if(err || !bod)
			return message.reply("Couldn't get results.");

		let results = [];
		for(let t of HTMLParse(bod).querySelectorAll("#pages table").slice(1)){
			let td = t.querySelectorAll("td");
			let link = t.querySelector("a").getAttribute("href");
			let thumbnail = t.querySelector("img");
			if(!thumbnail)
				continue;
			thumbnail = "https://iqdb.org"+thumbnail.getAttribute("src");
			results.push({
				link: link.startsWith("http") ? link : "https:"+link,
				thumbnail: thumbnail,
				info: td[2].structuredText,
				similarity: td[3].structuredText,
				service: thumbnail.split("/")[3]
			});
		}

		if(!results[0])
			return message.reply("No results.");

		let embed = new Discord.RichEmbed({
			title: results[0].service,
			url: results[0].link,
			color: Config.embedColour,
			thumbnail: {
				url: results[0].thumbnail
			},
			footer: {
				text: `#1 of ${results.length} `+results[0].info,
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

				embed.title = results[index].service;
				embed.url = results[index].link;
				embed.thumbnail.url = results[index].thumbnail;
				embed.footer.text =  `#${index+1} of ${results.length} `+results[index].info;
				mes.edit({embed});
			});
		});
	});
}

function whatanime(message, url){
	Request.get("https://trace.moe/api/search?url="+url, (err, res, bod) => {
		if(err || !bod)
			return message.reply("Couldn't get results.");
		let json = JSON.parse(bod);
		let docs = json.docs[0];

		if(!docs)
			return message.reply("Couldn't get a hit.");

		let thumbnail = `https://trace.moe/thumbnail.php?anilist_id=${docs.anilist_id}&file=${encodeURIComponent(docs.filename)}&t=${docs.at}&token=${docs.tokenthumb}`;

		let embed = new Discord.RichEmbed({
			title: docs.title_english,
			description: docs.title_romaji,
			color: Config.embedColour,
			thumbnail: {
				url: thumbnail
			},
			footer: {
				text: (docs.similarity * 100).toFixed(2) + "% similarity."
			}
		});

		embed.addField("Duration", Utility.toHHMMSS(docs.from|0).replace(/^00:/, "")+"-"+Utility.toHHMMSS(docs.to|0).replace(/^00:/, ""), true);
		embed.addField("Episode", docs.episode || "?", true);
		embed.addField("Links", `[MAL](https://myanimelist.net/anime/${docs.mal_id}) [Anilist](https://anilist.co/anime/${docs.anilist_id})`, true);

		message.reply({embed});
	});
}

let backends = {google, whatanime, iqdb, saucenao, tineye};

function func(message, args){
	let url = Utility.getImage(message);
	let backend = args.backend || "google";
	
	if(!url)
		return message.reply("No idea what image you want me to search with.");

	backends[backend](message, url);
}
