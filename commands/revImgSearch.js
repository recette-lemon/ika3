module.exports = {
	name: "Reverse Image Search",
	triggers: ["ris", "rimg", "rev"],
	description: "Searches various services for images, or just gives a link to the site. Defaults to Google. Works on video thumbnails.",
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
				content: t.querySelector(".resulttablecontent").structuredText,
				links: t.querySelectorAll("a").filter(l =>
					!l.getAttribute("href").includes("saucenao.com")
				).map(l => {
					let t = l.text;
					let h = l.getAttribute("href");
					if(t)
						return `[${t}](${h})`;
					return `[${h.split("/")[2].replace(/^www\./, "")}](${h})`
				}).join(" ") || "None."
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
				},
				{
					name: "Links",
					value: results[0].links
				}
			],
			image: {
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
				embed.fields[1].value = results[index].links;
				embed.image.url = results[index].thumbnail;
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
			image: {
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
				embed.image.url = results[index].thumbnail;
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
		if(!json)
			return message.reply("Couldn't get results.");
		let docs = json.docs[0];
		if(!docs)
			return message.reply("Couldn't get a hit.");

		let thumbnail = `https://trace.moe/thumbnail.php?anilist_id=${docs.anilist_id}&file=${encodeURIComponent(docs.filename)}&t=${docs.at}&token=${docs.tokenthumb}`;
		let video = `${`https://media.trace.moe/video/${docs.anilist_id}/${encodeURIComponent(docs.filename)}?t=${docs.at}&token=${docs.tokenthumb}`}`;
		let duration = Utility.toHHMMSS(docs.from|0).replace(/^00:/, "")+" - "+Utility.toHHMMSS(docs.to|0).replace(/^00:/, "");
		let embed = new Discord.RichEmbed({
			title: docs.title_english,
			description: docs.title_romaji,
			color: Config.embedColour,
			image: {
				url: thumbnail
			},
			footer: {
				text: (docs.similarity * 100).toFixed(2) + "% similarity."
			}
		});

		embed.addField("Duration", duration, true);
		embed.addField("Episode", docs.episode || "?", true);
		embed.addField("Links", `[MAL](https://myanimelist.net/anime/${docs.mal_id}) \
		[Anilist](https://anilist.co/anime/${docs.anilist_id}) [Video](${video})`, true);
		message.reply({embed});
	});
}

let backends = {google, whatanime, iqdb, saucenao, tineye};
function func(message, args){
	let [url, att] = Utility.getImage(message, true);
	let backend = args.backend || "google";
	if(!url)
		return message.reply("No idea what image you want me to search with.");
	if(url.match(/^https?:\/\/(cdn|media)\.discord/)){
		url = url.replace("cdn.discordapp.com", "media.discordapp.net").replace(/\?.+$/, "")+"?format=jpeg";
		if(att){
			if(att.width > 300 || att.height > 300){
				let w = 300, h = 300;
				let r = att.width/att.height;
				if(r < 1) w = Math.round(300 * r);
				else      h = Math.round(300 / r);
				url += "&width="+w+"&height="+h;
			}
		}
	}
	backends[backend](message, url);
}

