module.exports = {
	name: "Youtube",
	triggers: ["youtube", "yt"],
	description: "Searches for Youtube vids.",
	category: "search",
	arguments: {
		positional: ["terms"],
		flags: {
			backend: {
				invidious: [false, "i"],
				jetmp4: [false, "j"]
			}
		}
	},
	func: func
};

function output(res, posStr){
	let link = {
		video: "https://www.youtube.com/watch?v=",
		channel: "https://www.youtube.com/channel/",
		playlist: "https://www.youtube.com/playlist?list="
	}[res.type] + (res.videoId || res.playlistId || res.authorId);
	return posStr+" "+link+"\n"+res.description.split("\n")[0].replace(/(https?:\/\/\S+)/, "<$1>");
}

let Request = require("request");
let HTMLParse = require("node-html-parser").parse;

function func(message, args){
	let terms = args._.join(" ");
	if(!terms)
		return message.reply("Need something to search for.");
	if(args.invidious){
		return Utility.searchYT(terms, res => {
			if(!res[0])
				return message.reply("Nothing found.");
			Utility.scrollControls(message, res, output);
		});
	}
	let url = `https://jetmp4.com/video/${terms.replace(/\s+/g, "_").replace(/\W+/, "")}.html`;
	Request.get(url, (err, res, bod) => {
		let results = [];
		for(let i of HTMLParse(bod).querySelectorAll(".d img")){
			results.push({
				type: "video",
				videoId: i.getAttribute("data-src").split("/")[4],
				description: ""
			});
		}
		Utility.scrollControls(message, results, output);
	});
}

