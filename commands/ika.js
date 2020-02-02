module.exports = {
	name: "ika",
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
	Utility.imageCommandTemplate(message, "ika");
}
