var Fs = require("fs");

function capitalise(str){
	return str[0].toUpperCase() + str.slice(1);
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

	return`${capitalise(cmd.name)}:
${cmd.description}
	Triggers: ${cmd.triggers.join(", ")}
	Arguments: ${cmd.arguments.positional.join(", ")} ${args.join("")}`;
}


