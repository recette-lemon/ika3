module.exports = {
	name: "Reload",
	triggers: ["reload"],
	description: "Reloads bot modules.",
	category: "owner",
	arguments: {
		flags: {
			commands: [false, "com", "c"],
			utility: [false, "util", "u"],
			images: [false, "img", "i"]
		},
	},
	func: func
};

function imgLength(){
	return Object.values(Images).map(x=>x.length).reduce((c,n) => c+n);
}

function func(message, args){
	let out = "";
	if(args.commands){
		let lastN = Utility.getCommandsNumber();
		Commands = Utility.getCommands();
		out = `Reloaded commands (${lastN}) => (${Utility.getCommandsNumber()}) commands.\n`;
	}
	if(args.utility){
		let lastN = Object.keys(Utility).length;
		Utility = require("../utility");
		out += `Reloaded utility (${lastN}) => (${Object.keys(Utility).length}) functions.\n`;
	}
	if(args.images){
		let lastN = imgLength();
		Images = Utility.getImageLists();
		out += `Reloaded images (${lastN}) => (${imgLength()}) images.\n`;
	}

	message.reply(out || "Nothing reloaded.");
}
