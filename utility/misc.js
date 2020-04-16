let statusIndex = 0;
let Package = JSON.parse(require("fs").readFileSync("package.json"));

let statuses = [
	() => "Ika v"+Package.version,
	() => "https://ika.eiko.cc",
	() => "**help | **invite",
	() => Bot.guilds.size+" servers, "+Bot.users.size+" users, "+Utility.getCommandsNumber()+" commands."
];

module.exports.statusRotate = function statusRotate(){
	Bot.user.setPresence({
        game: {
			name: statuses[statusIndex](),
			type: 0,
        }
    });
    statusIndex = (statusIndex + 1) % statuses.length;
};

module.exports.clamp = function(n, ma, mi){
	return Math.min(Math.max(n, mi), ma);
};
