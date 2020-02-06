module.exports = {
	name: "Map",
	triggers: ["map"],
	description: "Add yourself and view the [DMC map](https://sylvie.moe/map).",
	category: "misc",
	arguments: {
		positional: [],
		args: [
			{
				short: "t", long: "token"
			}
		]
	},
	func: func
};


if(require("fs").existsSync("/var/www/databases/map.db")){
	var mapDB;
	require("sqlite").open('/var/www/databases/map.db').then((m) => {
		mapDB = m;
	});
}

var mapURL = "https://sylvie.moe/map/";

function func(message, args){

	if(mapDB)
	mapDB.get("SELECT * FROM entries WHERE discord_id=?", message.author.id).then((res) => {

		if(!res){
			let key = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
			mapDB.run("INSERT INTO entries(id, discord_id, discord_name, colour, avatar_hash) values(?, ?, ?, ?, ?)",
				key,
				message.author.id,
				message.author.username,
				message.member.colorRole ? message.member.colorRole.color.toString(16) : "000",
				message.author.avatar).then(() => {
					message.author.send(`Use this link to set your position on the map. Don't share it with others.\n${mapURL}update.html?id=${key}`).catch(err => {
						message.reply("I need to be able to DM you to send you a link to add yourself to the map.\nRun `**map -t` when i can DM you.")
					});
				});
		} else {
			mapDB.all("SELECT discord_id FROM entries").then((res) => {
				Promise.all(res.map(async function(m){
					var mem = ika.guilds.get("411345613863649310").members.get(m.discord_id);
					if(!mem)
						return;
					await mapDB.run("UPDATE entries SET discord_name=?, colour=?, avatar_hash=? WHERE discord_id=?",
						mem.user.username,
						mem.displayColor ? mem.displayColor.toString(16) : "ffffff",
						mem.user.avatar,
						mem.id
					);
				})).catch(err => {});
			});
		}
	});

	message.reply(mapURL);
}