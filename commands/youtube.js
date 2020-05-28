module.exports = {
	name: "Youtube",
	triggers: ["youtube", "yt"],
	description: "Searches for Youtube vids.",
	category: "search",
	arguments: {
		positional: ["terms"],
	},
	func: func
};

function output(res, posStr){
	let link = {
		video: "https://www.youtube.com/watch?v=",
		channel: "https://www.youtube.com/channel/",
		playlist: "https://www.youtube.com/playlist?list="
	}[res.type] + (res.videoId || res.playlistId || res.authorId);
	return posStr+" "+link+"\n"+res.description.split("\n")[0];
}

function func(message, args){
	let terms = args._.join(" ");
	if(!terms)
		return message.reply("Need something to search for.");
	Utility.searchYT(terms, res => {
		if(!res[0])
			return message.reply("Nothing found.");
		Utility.ScrollControls(message, res, output);
	});
}

