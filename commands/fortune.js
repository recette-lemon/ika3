module.exports = {
	name: "Fortune",
	triggers: ["fortune"],
	description: "The classic Unix command, and also s4s fortunes.",
	category: "game",
	arguments: {
		positional: ["file"],
		flags: {
			s4s: [false],
			files: [false, "f"],
			offensive: [false, "o"],
			all: [false, "a"],
			"cookie-file": [false, "c", "file"],
			equal: [false, "e"],
			"long-only": [false, "l", "long"]
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

	let embed = new Discord.MessageEmbed({
		title: answer[0],
		color: parseInt(answer[1], 16)
	});

	message.reply({embed});
}

let exec = require("child_process").execFile;

let cookieFiles;
exec("fortune", ["-f"], (err, stdin, stdout) => {
	let r = stdout.split("\n").slice(1, -1);
	cookieFiles = r.slice(0, r.indexOf(r.find(i => !i.startsWith(" ")))).map(i =>
		i.match(/[^ ]+$/).toString()
	);
});

function func(message, args){
	if(args.s4s)
		return s4sFortune(message);

	if(args.files)
		return message.reply(cookieFiles.join(", "));

	let a = [];

	if(args._.length){
		if(cookieFiles.indexOf(args._[0]) === -1)
			return message.reply("Cookie file doesn't exist.");
		a.push(args._[0]);
	}

	let flags = ["o", "a", "c", "e", "l"];
	for(let flag of flags){
		if(args[flag])
			a.push("-"+flag);
	}

	exec("fortune", a, (err, stdout, stderr) => {
		if(err)
			return message.reply("Something went wrong.");
		message.reply(stdout.trim() || stderr.trim());
	});
}
