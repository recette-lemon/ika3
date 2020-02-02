module.exports = {
	name: "roll",
	triggers: ["roll", "random", "reroll"],
	description: "Rolls a random number.",
	category: "general",
	arguments: {
		positional: ["string"],
		args: []
	},
	func: func
};

function func(message, args){

	let embed = new Discord.RichEmbed({
		color: Config.embedColour,
		footer: {
		    text: message.author.tag,
		    icon_url: message.author.avatarURL
		}
	});
	let mes = args._.join(" ").split("`").join("").split("\n")[0];
	if(mes.length > 250) mes = mes.slice(0, 250) + '...';
	if(message.attachments.first()) embed.setImage(message.attachments.first().url);
	if(message.content.toLowerCase().split(" ")[0] == (Config.trigger + "reroll")){
	    embed.setTitle("Reroll it!");
	    if(mes) embed.addField("Rerolling for", mes);
	} else {
	    embed.setTitle("Roll it!");
	    if(mes) embed.addField("Rolling for", mes);
	}

	let roll = (Math.floor(Math.random() * 999999999) + 1);
	let streak = roll.toString().match(/(.)\1*$/)[0].length;
	let congrats = ['Singles', 'Dubs', 'Trips!', 'Quads!!', 'Quints!!!', 'Holy shit ur a god!!!1!1!']
	embed.addField((streak < 6 ? congrats[streak - 1] : congrats[5]), roll);
	message.channel.send({embed});
}
