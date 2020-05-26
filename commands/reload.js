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

function imageLength(){
	return Object.values(Images).map(x=>x.length).reduce((c,n) => c+n);
}

function func(message, args){
	let out = "";
	if(args.commands){
		let lastNCommands = Utility.getCommandsNumber();
		Commands = Utility.getCommands();
		Utility.updateGitHash();
		out += `Reloaded commands (${lastNCommands}) => (${Utility.getCommandsNumber()}) commands.\n`;
	}
	if(args.utility){
		let lastN = Object.keys(Utility).length;
		delete require.cache[require.resolve("../utility")];
		Utility = require("../utility");
		out += `Reloaded utility (${lastN}) => (${Object.keys(Utility).length}) functions.\n`;
	}
	if(args.images){
		let lastImgs = Object.keys(Images).map(k => Images[k].length);
		let lastN = imageLength();
		Images = Utility.getImageLists();
		out += `Reloaded images ${lastN} => ${imageLength()}`;
		let currentImgs = Object.keys(Images).map(k => Images[k].length);
		let imgs = Object.keys(Images).map((k, i) => {
			if(lastImgs[i] === currentImgs[i])
				return;
			return "\t" + k + ": " + lastImgs[i] + " => " + currentImgs[i];
		}).filter(i => !!i);
		if(imgs[0]){
			out += " {\n" + imgs.join(",\n") + "\n}\n";
		}
	}

	message.reply(out || "Nothing reloaded.");
}

