module.exports = {
	name: "Fortune",
	triggers: ["fortune"],
	description: "The classic Unix command, and also s4s fortunes.",
	category: "game",
	arguments: {
		flags: {
			s4s: [false]
		}
	},
	func: func
};

let s4s = [
	["Reply hazy, try again", "F51C6A"],
	["Excellent Luck", "FD4D32"],
	["Good Luck", "E7890C"],
	["Average Luck", "BAC200"],
	["Bad Luck", "7FEC11"],
	["Good news will come to you by mail", "43FD3B"],
	["（　´_ゝ`）ﾌｰﾝ", "16F174"],
	["ｷﾀ━━━━━━(ﾟ∀ﾟ)━━━━━━ !!!!", "00CBB0"],
	["You will meet a dark handsome stranger", "0893E1"],
	["Better not tell you now", "2A56FB"],
	["Outlook good", "6023F8"],
	["Very Bad Luck", "9D05DA"],
	["Godly Luck", "D302A7"],
	["(YOU ARE BANNED)", "FF0000"]
];

function s4sFortune(message){
	let answer = s4s[Math.floor(Math.random() * s4s.length)];

	let embed = new Discord.RichEmbed({
		title: answer[0],
		color: parseInt(answer[1], 16)
	});

	message.reply({embed});
}

function func(message, args){
	if(args.s4s)
		return s4sFortune(message);

	require("child_process").exec("fortune", (err, res) => {
		if(err)
			return message.reply("Something went wrong.");
		message.reply(res);
	});
}
