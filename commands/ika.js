module.exports = {
	name: "Ika",
	triggers: ["ika"],
	description: "Posts a cute image of Ika.",
	category: "image",
	arguments: Utility.imageCommandArguments,
	func: func
};

function func(message, args){
	Utility.imageCommand(message, args, "ika");
}
