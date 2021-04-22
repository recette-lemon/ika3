let Minimist = require("minimist");

module.exports.parseMessage = function(message){
	if(!message.content.startsWith(Config.trigger) || message.author.bot)
		return;

	let [args, cmd, command] = parseArguments(message);

	if(!cmd)
		return;

	if(args.h || args.help)
		return message.reply({embed: getHelpEmbed(cmd)});

	if(cmd.category === "owner" && message.author.id != Config.ownerId)
		return;

	if(message.guild && Configs.get(message.guild.id).exists("disabledcommands") && Configs.get(message.guild.id).get("disabledcommands").indexOf(cmd.name) !== -1)
		return;

	try{
		cmd.func(message, args, command);
	} catch(err){
		console.log(args, err);
		message.reply({embed: errorEmbed});
	}
};

function parseArg(arg, a, opts){
	opts[typeof(arg[0])].push(a);
	opts.alias[a] = arg.slice(1);
	opts.default[a] = arg[0];
}

function parseArguments(message){
	let args = message.content.split(" ");
	if(!args.length)
		return [null,null,null];

	args[0] = args[0].slice(Config.trigger.length);

	if(Configs.get(message.author.id).get("aliases").exists(args[0])){
		let userAlias = Configs.get(message.author.id).get("aliases").get(args[0]);
		args = userAlias.concat(args.slice(1));
	} else
	if(message.guild && Configs.get(message.guild.id).get("aliases").exists(args[0])){
		let guildAlias = Configs.get(message.guild.id).get("aliases").get(args[0]);
		args = guildAlias.concat(args.slice(1));
	}

	let command = args.shift().toLowerCase();
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

	args = Minimist(args, opts);

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
}

function getFlagString(arg, k){
	return [k].concat(arg.slice(1)).sort((a,b)=>{
		return b.length-a.length;
	}).map(a => (a.length === 1 ? ("-"+a) : ("--"+a))).sort((a,b)=>a.length-b.length).join(" ");
}

function getHelpEmbed(cmd){
	let embed = new Discord.MessageEmbed({
		title: cmd.name+" ["+cmd.category+"]",
		description: cmd.description,
		color: Config.embedColour
	});

	if(cmd.example)
		embed.addField("Example", "```"+Config.trigger+cmd.triggers[0]+" "+cmd.example+"```")
	embed.addField("Triggers", cmd.triggers.sort().join(", "), true);
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
}

let errorEmbed = new Discord.MessageEmbed({
	title: "Whoops, got an error...",
	description: "Either you did the inputs wrong, or its just a feature.\nTry appending --help for help.",
	color: Config.embedColour,
	thumbnail: {
		url: "https://i.imgur.com/GuIhCoQ.png"
	}
});

let MessageControls = module.exports.MessageControls = class MessageControls extends require("events"){
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
				r.users.remove(user);
			});
			collector.on('end', () => message.clearReactions());
		});
	}
};

module.exports.scrollControls = function(mes, arr, func){
	let index = 0;
	function makeOut(){
		let out = func(arr[index], (index+1)+" of "+arr.length, arr, index);
		return typeof(out) === "string" ? [out] : out;
	}
	mes.channel.send(...makeOut()).then(m => {
		let controls = new MessageControls(m, mes.author);
		controls.on("reaction", r => {
			if(r.n === 0 && arr[index-1])
				index--;
			else if(r.n === 1 && arr[index+1])
				index++;
			else return;
			let out = func(arr[index], (index+1)+" of "+arr.length, arr, index);
			m.edit(...makeOut());
		});
	});
}

module.exports.imageCommandArguments = {
	flags: {
		extension: ["", "ext", "e"],
		extension: ["", "regex", "r"]
	}
};
module.exports.imageCommand = function(message, args, folder){
	let imgs = Images[folder];

	if(args.ext){
		imgs = imgs.filter(i => i.endsWith("."+args.ext));
		if(imgs.length === 0)
			return message.reply("No files with that ext.");
	}
	if(args.regex){
		imgs = imgs.filter(i => i.match(args.regex));
		if(imgs.length === 0)
			return message.reply("No files with that regex.");
	}

	let n = Math.floor(Math.random() * imgs.length),
		file = imgs[n],
		ext = file.split(".").pop(),
		name = folder+"-"+(n+1)+"."+ext;

	let embed = isImageExt(ext) ? new Discord.MessageEmbed({
		color: Config.embedColour,
		image: {url: "attachment://"+name},
		footer: {
			text: "#"+(n+1)+" of "+imgs.length
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

module.exports.getUser = function(message, args){
	if(message.mentions.users.first())
		return message.mentions.users.first();
	let a = args._.join(" ");
	if(isNaN(a)){
		if(a.includes("#"))
			return Bot.users.cache.find((u) => u.tag == a);
		return Bot.users.cache.find((u) => u.username == a);
	}
	return Bot.users.cache.get(args._[0]);
};

let mimes = {
	png:"img",jpg:"img",jpeg:"img",gif:"img",webp:"img",
	mp4:"vid",webm:"vid",avi:"vid",mov:"vid",mov:"vid",mkv:"vid"
};
function getMime(url){
	return mimes[url.split(".").pop().split("?")[0]];
}

function isImageExt(url){
	return getMime(url) === "img";
}

function parseMessageForImages(message, includeVid){
	if(message.attachments.first())
		return [message.attachments.first().url, message.attachments.first()];
	if(message.embeds[0] && message.embeds[0].image)
		return [message.embeds[0].image.url, message.embeds[0].image];
	let args = message.content.split(" ");
	return [args.find(a => {
		let m = getMime(a);
		return a.startsWith("http") && (m === "img" || (includeVid && m === "vid"));
	}), null];
}

module.exports.getImage = function(message, includeVid){
	for(let mes of message.channel.messages.cache.array().reverse()){
		res = parseMessageForImages(mes, includeVid);
		if(res[0])
			return res;
	}
	return [null, null];
};

