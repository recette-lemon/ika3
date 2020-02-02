var Fs = require("fs");

function capitalise(str){
	return str[0].toUpperCase() + str.slice(1);
}

module.exports.toHHMMSS = function(t){
    let sec_num = parseInt(t, 10); // don't forget the second param
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    let time    = hours+':'+minutes+':'+seconds;
    return time;
}

module.exports.getCommands = function(){
	let files = Fs.readdirSync("./commands");
	let commands = {};

	for(file of files){
		let loc = "./commands/"+file;
		delete require.cache[require.resolve(loc)];

		let cmd = require(loc)
		for(t of cmd.triggers){
			commands[t] = cmd;
		}
	}

	return commands;
}

module.exports.getHelp = function(cmd){
	let args = [];
	for(a of cmd.arguments.args){
		args.push("\n		-" + a.short + " --" + a.long)
	}
	return `${capitalise(cmd.name)}: ${cmd.description}
	Triggers: ${cmd.triggers.join(", ")}
	Arguments: ${cmd.arguments.positional.join(", ")} ${args.join("")}`;
}

module.exports.getImageLists = function(){
	let images = {}
		folders = Fs.readdirSync("./images");

	for(let folder of folders){
		let files = Fs.readdirSync("./images/" + folder);
		images[folder] = files;
	}

	return images;
}

module.exports.imageCommand = function(message, folder){
	let file = images[folder][Math.floor(Math.random() * images[folder].length)];

	let embed = new Discord.RichEmbed({
		color: Config.embedColour,
		image: {url: "attachment://" + file}
	});

	message.channel.send({
		embed,
		files: [{
			attachment: "./images/" + folder + "/" + file,
			name: file
		}]
	});
}