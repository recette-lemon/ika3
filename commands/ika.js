module.exports = {
	name: "Ika",
	triggers: ["ika"],
	description: "Posts a cute image of Ika.",
	category: "image",
	arguments: {
		positional: [],
		args: []
	},
	func: func
};

function func(message, args){
	Utility.imageCommand(message, "ika");
}
