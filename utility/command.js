function parseArg(arg, a, opts){
	opts[typeof(arg[0])].push(a);
	opts.alias[a] = arg.slice(1);
	opts.default[a] = arg[0];
}

module.exports.parseArguments = function(content){
	let args = content.split(" ");
	if(!args.length)
		return [null,null,null];

	let command = args.shift().slice(Config.trigger.length).toLowerCase();
	let cmd = Commands[command];

	if(!cmd)
		return [null,null,null];

	let opts = {
		boolean: ["help"],
		string: [],
		alias: {"help": "h"},
		default: {}
	};

	let pools = {};

	for(let a in cmd.arguments.flags){
		let arg = cmd.arguments.flags[a];
		if(Array.isArray(arg)){
			parseArg(arg, a, opts);
			continue;
		}
		pools[a] = arg;
		for(let aa in arg){
			parseArg(arg[aa], aa, opts);
		}
	}

	args = require("minimist")(args, opts);

	for(let pool in pools){
		for(let arg in pools[pool]){
			for(let a of [arg].concat(pools[pool][arg].slice(1))){
				if(args[a]){
					args[pool] = a;
					break;
				}
			}
		}
	}

	return [args, cmd, command];
};

function getFlagString(arg, k){
	return [k].concat(arg.slice(1)).sort((a,b)=>{
		return b.length-a.length;
	}).map(a => (a.length === 1 ? ("-"+a) : ("--"+a))).join(" ");
}

module.exports.getHelpEmbed = function(cmd){
	let embed = new Discord.RichEmbed({
		title: cmd.name+" ["+cmd.category+"]",
		description: cmd.description,
		color: Config.embedColour
	});

	embed.addField(Config.trigger+"Triggers", cmd.triggers.sort().join(", "), true);

	if(cmd.arguments.positional)
		embed.addField("Arguments", cmd.arguments.positional.sort().join(" | "), true);
	if(cmd.arguments.flags){
		embed.addField("Flags", Object.keys(cmd.arguments.flags).map(k => {
			let arg = cmd.arguments.flags[k];
			if(Array.isArray(arg))
				return getFlagString(arg, k) + (arg[0] ? (" *["+arg[0]+"]*") : "");
			return k + ":\n" + Object.keys(arg).map(k => {
				return "­　" + getFlagString(arg[k], k);
			}).join("\n");
		}).sort().join("\n"));
	}

	return embed;
};

module.exports.errorEmbed = new Discord.RichEmbed({
	title: "Whoops, got an error...",
	description: "Either you did the inputs wrong, or its just a feature.",
	color: Config.embedColour,
	thumbnail: {
		url: "https://i.imgur.com/GuIhCoQ.png"
	}
});

module.exports.MessageControls = class MessageControls extends require("events"){
	constructor(message, user, emojis=["◀️", "▶️"], timeOut=3000000){
		super();

		async function react(i){
			await message.react(emojis[i]);
			if(i !== emojis.length-1)
				await react(i+1);
		}

		react(0).then(() => {
			let collector = message.createReactionCollector((r, u) => {
				return u.id === user.id && emojis.indexOf(r.emoji.name) !== -1;
			}, {
				time: timeOut
			});

			this.emit("ready");

			collector.on("collect", (r) => {
				r.n = emojis.indexOf(r.emoji.name);
				this.emit(r.emoji.name, r);
				this.emit("reaction", r);
				r.remove(user);
			});

			collector.on('end', () => message.clearReactions());
		});
	}
};

module.exports.imageCommand = function(message, folder){
	let n = Math.floor(Math.random() * Images[folder].length),
		file = Images[folder][n],
		ext = file.split(".").pop(),
		name = folder+"-"+(n+1)+"."+ext;

	let embed = ~["png", "jpg", "jpeg", "gif"].indexOf(ext.toLowerCase()) ? new Discord.RichEmbed({
		color: Config.embedColour,
		image: {url: "attachment://"+name},
		footer: {
			text: "#"+(n+1)+" of "+Images[folder].length
		}
	}) : null;

	message.channel.send({
		embed,
		files: [{
			attachment: "./images/"+folder+"/"+file,
			name
		}],
	});
};
