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

function output(res, index, length){
	let link = {
		video: "https://www.youtube.com/watch?v=",
		channel: "https://www.youtube.com/channel/",
		playlist: "https://www.youtube.com/playlist?list="
	}[res.type] + (res.videoId || res.playlistId || res.authorId);

	return "Result "+(index+1)+" of "+length+" "+link;
}

function func(message, args){
	let terms = args._.join(" ");
	if(!terms)
		return message.reply("Need something to search for.");

	Utility.searchYT(terms, (res) => {
		if(!res[0])
			return message.reply("Nothing found.");

		message.channel.send(output(res[0], 0, res.length)).then(mes=>{
			let controls = new Utility.MessageControls(mes, message.author),
				index = 0;

			controls.on("reaction", r => {
				if(r.n === 0 && res[index-1])
					index--;
				else if(r.n === 1 && res[index+1])
					index++;
				else return;

				mes.edit(output(res[index], index, res.length));
			});
		});
	});
}
