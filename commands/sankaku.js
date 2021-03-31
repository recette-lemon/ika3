module.exports = {
	name: "Sankaku",
	triggers: ["sankaku", "sk"],
	description: "Browse pics from [Sankaku Channel](https://chan.sankakucomplex.com/). Has shortcuts for tags like order:popular with `--popular` or `--order popular`.",
	category: "lewd",
	arguments: {},
	func: func
};

var userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36";
var postBase = "https://chan.sankakucomplex.com/post/show/";
var thumbnailBase = "https://cs.sankakucomplex.com/data/preview/";
var advancedMap = {
	popular: "order",
	quality: "order",
	random: "order",
	favcount: "order",
	viewcount: "order",
	e: "rating",
	q: "rating",
	s: "rating"
};

function getThumbnail(channel, cache, h, callback){
	if(cache[h])
		return callback(cache[h]);
	let url = thumbnailBase+h+".jpg";
	channel.send({files: [url]}).then(mes => {
		let pic = mes.attachments.first().url;
		cache[h] = pic;
		callback(pic);
	});
}

function func(message, args){
	let tags = args._;
	delete args._;

	for(let a in args){
		if(advancedMap[a])
			tags.push(advancedMap[a]+":"+a);
		else
			tags.push(a+":"+args[a]);
	}

	if(tags.length > 4)
		return message.reply("Sankaku only lets you use 4 tags without signing in.");

	let url = "https://chan.sankakucomplex.com/?commit=Search&tags="+encodeURIComponent(tags.join(" ")).replace("%20", "+");
	Utility.get(url, {
		headers: {
			"User-Agent": userAgent
		}
	}, (err, res, bod) => {

		let results = bod.match(/(?<=Post\.register\(){.+?}(?=\))/g);
		let thumbnails = bod.match(/(?<=preview\/).{2}\/.{2}\/.{32}/g);
		let popularRanks = bod.match(/popular-rank/g);

		if(!results)
			return message.reply("Nothing found.");

		if(popularRanks){
			results = results.slice(popularRanks.length);
			thumbnails = thumbnails.slice(popularRanks.length);
		}

		results = results.map(r => {
			return JSON.parse(r);
		});

		let hostChannel = Bot.channels.get(Config.fileHostChannelId);
		let thumbnailCache = {};

		getThumbnail(hostChannel, thumbnailCache, thumbnails[0], pic => {

			let embed = new Discord.MessageEmbed({
				title: "[Link]",
				url: postBase+results[0].id,
				image: {
					url: pic
				},
				color: Config.embedColour,
				footer: {
					text: "1 of "+results.length
				}
			});

			message.channel.send({embed}).then(mes => {
				let controls = new Utility.MessageControls(mes, message.author);
				let index = 0;

				controls.on("reaction", r => {
					if(r.n === 0 && results[index-1])
						index--;
					else if(r.n === 1 && results[index+1])
						index++;
					else return;

					getThumbnail(hostChannel, thumbnailCache, thumbnails[index], pic => {
						embed.url = postBase+results[index].id;
						embed.image.url = pic;
						embed.footer.text = (index+1)+" of "+results.length;
						mes.edit({embed});
					});
				});
			});
		});
	});
}
