module.exports = {
	name: "Purge",
	triggers: ["purge"],
	description: "Purges up to 500 messages.",
	category: "moderation",
	arguments: {
		positional: ["number"],
	},
	func: func
};

function loop(channel, numbers, i){
	if(numbers[i]){
		return channel.bulkDelete(numbers[i]).then((mes) => {
			setTimeout(() => {
				loop(channel, numbers, i+1);
			}, 2000);
		}).catch(() => {
			channel.send("Ran into a problem. Probably messages older than 2 weeks.");
		});
	}
	channel.send("Done.").then((mes) => {
		setTimeout(() => {
			mes.delete();
		}, 5000);
	});
}

function func(message, args){
	if(!message.channel.memberPermissions(message.member).has("MANAGE_MESSAGES"))
		return message.reply("You don't have manage message perms.");

	let n = Math.min(parseInt(args._[0]), 500);
	if(!n)
		return message.reply("Need a number.");

	let numbers = new Array(Math.floor(n/100)).fill(100).concat(n%100);

	message.delete().then(() => {
		loop(message.channel, numbers, 0);
	});
}
