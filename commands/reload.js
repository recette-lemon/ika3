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
		let lastImgs = Object.keys(Images).map(k => Images[k].length);
		Images = Utility.getImageLists();
		let currentImgs = Object.keys(Images).map(k => Images[k].length);
		out += "Reloaded images {\n" + Object.keys(Images).map((k, i) => {
			return "\t" + k + ": " + lastImgs[i] + " => " + currentImgs[i];
		}).join(",\n") + "\n}\n";
	}

	message.reply(out || "Nothing reloaded.");
}
