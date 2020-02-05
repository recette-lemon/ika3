module.exports = {
	name: "Roll",
	triggers: ["roll", "random", "reroll"],
	description: "Rolls a random number.",
	category: "general",
	arguments: {
		positional: ["string"],
		args: []
	},
	func: func
};

let congrats = ['Singles', 'Dubs', 'Trips!', 'Quads!!', 'Quints!!!', 'Holy shit ur a god!!!1!1!'];

function func(message, args){
	let embed = new Discord.RichEmbed({
		color: Config.embedColour,
		footer: {
			text: message.author.tag,
			icon_url: message.author.avatarURL
		}
	});

	let mes = args._.join(" ");
	if(message.attachments.first())
		embed.setImage(message.attachments.first().url);
	if(mes)
		embed.description = mes.slice(0, 250);
	embed.setTitle("Roll it!");

	let roll = Math.floor(Math.random() * 999999999);
	let streak = roll.toString().match(/(.)\1*$/)[0].length;

	embed.addField((streak < 6 ? congrats[streak - 1] : congrats[5]), roll);
	message.channel.send({embed});
}
