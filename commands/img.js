module.exports = {
	name: "Img",
	triggers: ["img"],
	description: "Image search using DuckDuckGo.",
	category: "search",
	arguments: {
		positional: ["terms"],
		args: []
	},
	func: func
};

var pageBase = "http://duckduckgo.com/?ia=images&iax=images&k5=1&kp=-2&q=";
var jsonBase = "https://duckduckgo.com/i.js?l=us-en&o=json&vqd=VQD&f=,,,&p=-1&v7exp=a&q=";

function func(message, args){
	let query = encodeURIComponent(args._.join(" "));
	if(!query)
		return message.reply("Gonna need something to search for.");
	
	Utility.get(pageBase+query, (perr, pres, pbod) => {
		if(perr || !pbod)
			throw("nope");

		let vqd = pbod.match(/&vqd=(.+)&p/)[1],
			url = jsonBase.replace("VQD", vqd)+query;

		Utility.get(url, (jerr, jres, jbod) => {

			let results = JSON.parse(jbod).results;
			let index = 0;

			if(!results[0])
				return message.reply("Nothing found.");

			let embed = new Discord.RichEmbed({
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
				let controls = new Utility.MessageControls(mes, message.author),
					index = 0;

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
