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
				jetmp4: [false, "j"],
				"youtube-dl": [false, "ytdl", "y"]
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
let exec = require("child_process").execFile;

let backends = {
	invidious: (terms, cb) => {
		Utility.searchYT(terms, results => {
			cb(results);
		});
	},
	jetmp4: (terms, cb) => {
		let url = `https://jetmp4.com/video/${terms.replace(/\s+/g, "_").replace(/\W+/, "")}.html`;
		Request.get(url, (err, res, bod) => {
			if(err || !bod)
				return cb(null, "Problem getting response");
			let results = [];
			for(let i of HTMLParse(bod).querySelectorAll(".d img")){
				results.push({
					type: "video",
					videoId: i.getAttribute("data-src").split("/")[4],
					description: ""
				});
			}
			cb(results);
		});
	},
	ytdl: (terms, cb) => {
		terms = terms.replace(/[^\w\s]/g, "");
		exec("youtube-dl", ["--get-id", "--get-description", "--", "ytsearch5:"+terms], (err, stdout, stderr) => {
			if(err)
				return cb(null, "Got an error from youtube-dl or it's not in $PATH.");
			stdout = stdout.trim();
			let lines = stdout.split("\n");
			if(lines.length == 1)
				return cb([]);
			if(lines.length % 2)
				return cb(null, "Malformed input from youtube-dl");
			let results = [];
			for(let i = 0; i < lines.length; i += 2){
				results.push({
					type: "video",
					videoId: lines[i],
					description: lines[i+1]
				});
			}
			cb(results);
		});
	}
};

function func(message, args){
	let terms = args._.join(" ");
	if(!terms)
		return message.reply("Need something to search for.");
	let backend = backends[(args.invidious && "invidious") || (args.jetmp4 && "jetmp4") || (args.ytdl && "ytdl")];
	if(!backend)
		backend = backends.invidious;
	backend(terms, (results, errorMes) => {
		if(!results)
			return message.reply(errorMes);
		if(!results.length)
			return message.reply("No results.")
		Utility.scrollControls(message, results, output);
	});
}

