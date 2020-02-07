module.exports = {
	name: "reaction",
	description: "Various one-off commands with little purpose.",
	category: "misc",
	arguments: {
		positional: [],
		args: []
	},
	func: func
};

var reactions = {
	// [message, image]
};

module.exports.triggers = Object.keys(reactions).map(r => {return r.split(" ")[0]});

function func(message, args, command){
	let reaction = reactions[command];

	if(!reaction)
		return;

	message.channel.send(reaction[0], reaction[1] ? {
		files: [ "./images/reactions/"+reaction[1]]
	} : 0);
}
