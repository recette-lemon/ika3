module.exports = {
	name: "Fortune",
	triggers: ["fortune"],
	description: "Shows your fortune.",
	category: "game",
	arguments: {},
	func: func
};

let answers = [
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

function func(message){

	let answer = answers[Math.floor(Math.random() * answers.length)];

	let embed = new Discord.RichEmbed({
		title: answer[0],
		color: parseInt(answer[1], 16)
	});

	message.reply({embed});
}
