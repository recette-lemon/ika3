module.exports = {
	name: "Youtube DL",
	triggers: ["ytdl"],
	description: "Posts links to audio and video downloads for YT links.",
	category: "music",
	arguments: {
		positional: ["youtube url"],
	},
	func: func
};

function func(message, args){
	let term = args._.join(" ");

	if(!term)
		return message.reply("I need something to get.");

	let id = term.split("/").pop().split("?v=").pop().split("&")[0];

	Utility.getYTVideoInfo(id, (res) => {

		let audio = Utility.getAudioFromAdaptiveFormats(res.adaptiveFormats),
			video = Utility.getAudioFromAdaptiveFormats(res.formatStreams, "h264");

		let embed = new Discord.MessageEmbed({
			title: res.title,
			url: "https://www.youtube.com/watch?v=" + id,
			thumbnail: {
				url: res.videoThumbnails[0].url
			},
			color: Config.embedColour,
		});

		embed.addField("Downloadable links:", "[Audio]("+audio+")", true);
		embed.addField("­", "[Video]("+video+")", true);

		message.reply({embed});
	}, "adaptiveFormats,title,videoThumbnails,formatStreams");
}
