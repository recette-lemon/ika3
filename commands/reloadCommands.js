module.exports = {
	name: "Reload Commands",
	triggers: ["reload"],
	description: "Reloads commands folder.",
	category: "owner",
	arguments: {},
	func: func
};

function func(message){
	let lastN = Utility.getCommandsNumber();
	Commands = Utility.getCommands();
	message.reply(`Reloaded (${lastN}) => (${Utility.getCommandsNumber()}) commands.`);
}
