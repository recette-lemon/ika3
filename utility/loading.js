let Fs = require("fs");

module.exports.getCommandsNumber = function(){
	return commandNumber || 0;
};

module.exports.getCommands = function(){
	let files = Fs.readdirSync("./commands"),
		commands = {};
	global.commandNumber = files.length;
	for(let file of files){
		let loc = "../commands/"+file;
		delete require.cache[require.resolve(loc)];
		let cmd = require(loc);
		cmd.src = file;
		for(let t of cmd.triggers){
			commands[t] = cmd;
		}
	}
	return commands;
};

module.exports.getImageLists = function(){
	let images = {};
	let folders = Fs.readdirSync("./images");
	for(let folder of folders){
		let files = Fs.readdirSync("./images/"+folder);
		images[folder] = files;
	}
	return images;
};
