module.exports = {
	name: "Ika",
	triggers: ["ika"],
	description: "Posts a cute image of Ika.",
	category: "image",
	arguments: {},
	func: func
};

function func(message, args){
	Utility.imageCommand(message, "ika");
}
