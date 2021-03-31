module.exports = {
	name: "Pat",
	triggers: ["pat"],
	description: "Pat someone for those sweet numbers.",
	category: "game",
	arguments: {
		flags: {
			leaderboard: [false, "l"]
		}
	},
	func: func
};

function patsToString(res, i, total){
	return "#"+(i+1)+" "+((Bot.users.cache.get(res[i].id)||{}).username||"?")+": "+res[i].pats+" ("+(res[i].pats/total*100).toFixed(1)+"%)";
}

function func(message, args){

	let embed = new Discord.MessageEmbed({
		thumbnail: {
			url: "https://i.imgur.com/6chbyJ7.png"
		},
		color: Config.embedColour,
	});

	if(args.leaderboard){
		delete embed.thumbnail;

		DB.all("SELECT id, pats FROM headpats ORDER BY pats DESC LIMIT 10").then(res => {
			DB.get("SELECT TOTAL(pats), AVG(pats), COUNT(pats) from headpats").then(sum => {

				embed.title = sum["TOTAL(pats)"]+" total pats, "+sum["COUNT(pats)"]+" patters, "+sum["AVG(pats)"].toFixed(1)+" average.";

				for(let i = 0; i < res.length; i += 2){
					let u1 = res[i] ? patsToString(res, i, sum["TOTAL(pats)"]) : "­";
					let u2 = res[i+1] ? patsToString(res, i+1, sum["TOTAL(pats)"]) : "­";
					embed.addField(u1, u2);
				}

				message.channel.send({embed});
			});
		});

		return;
	}

	DB.get("SELECT pats FROM headpats WHERE id=?", message.author.id).then(res => {

		let pats = res ? res.pats + 1 : 1;

		DB.run("REPLACE INTO headpats (id, pats) VALUES (?, ?)", message.author.id, pats).then(() => {
			embed.title = message.author.username+" has given "+pats+" headpat"+(pats == 1 ? "." : "s.");

			if(message.mentions.users.first())
				embed.description = "Patted "+message.mentions.users.first().username;
			if(message.mentions.users.first() === Bot.user)
				embed.description+= " UwU";

			message.channel.send({embed});
		});
	});
}
