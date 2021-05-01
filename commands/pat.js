module.exports = {
	name: "Pat",
	triggers: ["pat"],
	description: "Pat someone for those sweet numbers.",
	category: "game",
	arguments: {
		flags: {
			leaderboard: [false, "l"],
			give: ["", "g"]
		},
		positional: ["mentions"]
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
	if(message.mentions.members.first()){
		if(args.give){
			let amount = Math.floor(Math.abs(args.give));
			if(typeof(amount) !== "number" || isNaN(amount))
				return message.reply("That's not a number, buddy");
			DB.get("SELECT pats FROM headpats WHERE id=?", message.author.id).then(res => {
				let pats = res.pats || 0;
				let people = message.mentions.members.array().splice(0, 10);
				if(pats < (amount * people.length))
					return message.reply(`Short on funds, buddy. You have ${pats} pat${pats == 1 ? '' : 's'} but require ${amount * people.length}`);
				let giveTransaction = DB.run("REPLACE INTO headpats (id, pats) VALUES (?, ?)", message.author.id, pats - (amount * people.length));
				let transactions = [giveTransaction];
				function finish(newBalances){
					Promise.all(transactions).then(() => {
						let newBalancesStr = newBalances.map((bal, i) => `${people[i].displayName}: ${bal - amount} => ${bal}`).join("\n");
						return message.reply(
							`Gave ${amount}${people.length > 1 ? " ("+amount*people.length+")" : ''} pat${amount == 1 && people.length == 1 ? '' : 's'} to ${people.length} ${people.length == 1 ? "person" : "people"}\n${newBalancesStr}`
						);
					});
				}
				let promises = [];
				for(let person of people)
					promises.push(DB.get("SELECT pats FROM headpats WHERE id=?", person.id));
				Promise.all(promises).then(res => {
					let newBalances = [];
					for(let i = 0; i < res.length; i++){
						let newb = (res[i] || {pats: 0}).pats + amount;
						newBalances.push(newb);
						let recieveTransaction = DB.run("REPLACE INTO headpats (id, pats) VALUES (?, ?)", people[i].id, newb);
						transactions.push(recieveTransaction);
					}
					Promise.all(transactions).then(() => finish(newBalances));
				});
			});
			return;
		} else if(args.leaderboard){
			let people = message.mentions.members.array().splice(0, 10);
			let promises = [];
			for(let person of people)
				promises.push(DB.get("SELECT pats FROM headpats WHERE id=?", person.id));
			Promise.all(promises).then(res => {
				let strs = [];
				for(let i = 0; i < res.length; i++)
					strs.push(`${people[i].user.username}: ${(res[i] || {pats: "0"}).pats}`);
				message.reply(strs.join("\n"));
			});
			return;
		}
	}
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
