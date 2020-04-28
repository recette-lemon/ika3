let statusIndex = 0;
let Package = JSON.parse(require("fs").readFileSync("package.json"));
let gitHash;

let statuses = [
	() => "Ika v"+Package.version+gitHash,
	() => "https://ika.eiko.cc",
	() => "**help | **invite",
	() => Bot.guilds.size+" servers, "+Bot.users.size+" users, "+Utility.getCommandsNumber()+" commands."
];

let updateGitHash = module.exports.updateGitHash = function(){
	gitHash = "#"+require("child_process").execSync("git rev-parse origin/master").toString().slice(0, 7);
};
updateGitHash();

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
