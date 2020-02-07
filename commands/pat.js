module.exports = {
	name: "Pat",
	triggers: ["pat"],
	description: "Pat someone for those sweet numbers.",
	category: "game",
	arguments: {
		positional: [],
		args: []
	},
	func: func
};

function func(message, args){

	let embed = new Discord.RichEmbed({
		thumbnail: {
			url: "https://i.imgur.com/6chbyJ7.png"
		},
		color: Config.embedColour,
	});

	if(args.l || args.leaderboard){
		delete embed.thumbnail;

		DB.all("SELECT id, pats FROM headpats ORDER BY pats DESC LIMIT 10").then(res => {
			DB.get("SELECT TOTAL(pats), AVG(pats), COUNT(pats) from headpats").then(sum => { // need to reduce to one query if possible

				embed.title = sum["TOTAL(pats)"]+" total pats, "+sum["COUNT(pats)"]+" patters, "+sum["AVG(pats)"].toFixed(1)+" average.";

				for(var i = 0; i < res.length; i += 2){
					let u1 = ((Bot.users.get(res[i].id)||{}).username||"?")+": "+res[i].pats;
					let u2 = ((Bot.users.get(res[i+1].id)||{}).username||"?")+": "+res[i+1].pats;
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
			embed.title = message.author.username+" has given "+pats+" headpats.";
			message.channel.send({embed});
		});
	});
}