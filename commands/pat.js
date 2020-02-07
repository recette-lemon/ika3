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

function func(message){

	let embed = new Discord.RichEmbed({
		thumbnail: {
			url: "https://i.imgur.com/6chbyJ7.png"
		},
		color: Config.embedColour,
	});

	DB.get("SELECT pats FROM headpats WHERE id=?", message.author.id).then(res => {

		let pats = (res.pats || 0) + 1;

		DB.run("REPLACE INTO headpats (id, pats) VALUES (?, ?)", message.author.id, pats).then(() => {
			embed.title = message.author.username+" has given "+pats+" headpats.";
			message.channel.send({embed});
		});
	});
}