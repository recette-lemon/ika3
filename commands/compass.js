module.exports = {
	name: "Compass",
	triggers: ["compass", "comp"],
	description: "Political compass.",
	category: "misc",
	arguments: {
		positional: ["x", "y"],
		args: [
			{
				short: "a", long: "average"
			}
		]
	},
	func: func
};

global.DB;
require("sqlite").open('./ika-db.sqlite').then((m) => {
	DB = m;
});

function clamp(x, ma, mi){
	return Math.min(Math.max(x, mi), ma);
}

function getCompassURL(values){
	return "https://www.politicalcompass.org/charts/crowdchart?" + values.map(v => {
		return encodeURIComponent(v[0])+"="+v[1]+","+v[2];
	}).join("&");
}

function func(message, args){

	let a = message.content.split(" ").slice(1)

	let x = clamp(Math.round(a[0] * 10), 100, -100);
	let y = clamp(Math.round(a[1] * 10), 100, -100);

	if(x && y){
		DB.run("REPLACE INTO compass (id, x, y) VALUES (?, ?, ?)", message.author.id, x, y).then(() => {
			message.reply("Added/updated DB.");
		});
		return;
	}

	let embed = new Discord.RichEmbed({
		image: {},
		color: Config.embedColour
	});

	if(message.mentions.users.first()){
		DB.get("SELECT x, y FROM compass WHERE id=?", message.mentions.users.first().id).then((res) => {
			if(!res)
				return reply("User's not in the DB.");
			embed.title = "X:"+res.x/10+" Y:"+res.y/10;
			embed.image.url = getCompassURL([[message.mentions.users.first().username, res.x/10, res.y/10]]);
			message.channel.send({embed});
		});
		return;
	}

	DB.all("SELECT id, x, y FROM compass").then((res) => {
		let users = res.map((u) => {
			return [(message.guild.members.get(u.id)||{user:{}}).user.username, u.x/10, u.y/10];
		}).filter((u) => {
			return u[0];
		});
		
		if(args.a || args.average){
			let total = users.reduce((a,b) => {return ["", a[1]+b[1], a[2]+b[2]]});
			users = [[message.guild.name, (total[1]/users.length).toFixed(1), (total[2]/users.length).toFixed(1)]];
			embed.title = "X:"+users[0][1]+" Y:"+users[0][2];
		}

		embed.image.url = getCompassURL(users);
		message.channel.send({embed});
	});
}