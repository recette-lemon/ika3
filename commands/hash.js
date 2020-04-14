module.exports = {
	name: "Hash",
	triggers: ["hash"],
	description: "Hashes text. Default algorithm is sha256 and default output is hex.",
	category: "misc",
	arguments: {
		positional: ["string"],
		flags: {
			algorithm: {
				sha1: [false],
				sha224: [false],
				sha256: [false],
				sha384: [false],
				sha512: [false],
				md5: [false],
			},
			output: {
				hex: [false],
				base64: [false, "b64"],
				ascii: [false],
				utf8: [false],
				binary: [false]
			}
		}
	},
	func
};

var crypto = require("crypto");

function func(message, args){
	let str = args._.join(" ");
	let algorithm = args.algorithm || "sha256";
	let output = args.output || "hex";

	if(!str)
		return message.reply("I need a string to hash.");

	let hash = crypto.createHash(algorithm).update(str).digest().toString(output);

	if(!hash)
		return message.reply("Couldn't get hash for some reason. Probably *your* fault.");

	return message.reply(hash);
}
