const Fs = require("fs");
const Package = JSON.parse(Fs.readFileSync("package.json"));
const Request = require("request");
const Minimist = require("minimist");

var statusIndex = 0;
var commandNumber;

var statuses = [
	() => "Ika v"+Package.version,
	() => "https://ika.eiko.cc",
	() => "**help | **invite",
	() => Bot.guilds.size+" servers, "+Bot.users.size+" users, "+commandNumber+" commands."
];

module.exports.statusRotate = function statusRotate(){
	Bot.user.setPresence({
        game: {
			name: statuses[statusIndex](),
			type: 0,
        }
    });
    statusIndex = (statusIndex + 1) % statuses.length;
}

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

module.exports.toHHMMSS = function(t){
	let sec_num = parseInt(t, 10),
		hours = Math.floor(sec_num / 3600),
		minutes = Math.floor((sec_num - (hours * 3600)) / 60),
		seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours < 10)
		hours = "0"+hours;
	if (minutes < 10)
		minutes = "0"+minutes;
	if (seconds < 10)
		seconds = "0"+seconds;
	let time = hours+':'+minutes+':'+seconds;
	return time;
}

module.exports.getDateSince = function(end){
	let distance = new Date((new Date()).getTime() - end);
	let y = distance.getUTCFullYear() - 1970;
	let m = distance.getUTCMonth();
	let d = distance.getUTCDate() - 1;
	return (y?y+" Years, ":"")+(m?m+" Months, ":"")+d+" Days";
}

module.exports.getCommands = function(){
	let files = Fs.readdirSync("./commands"),
		commands = {};

	commandNumber = files.length;

	for(file of files){
		let loc = "./commands/"+file;
		delete require.cache[require.resolve(loc)];

		let cmd = require(loc);
		for(t of cmd.triggers){
			commands[t] = cmd;
		}
	}

	return commands;
}

module.exports.getCommandsNumber = function(){
	return commandNumber
}

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
}

module.exports.errorEmbed = new Discord.RichEmbed({
	title: "Whoops, got an error...",
	description: "Either you did the inputs wrong, or its just a feature.",
	color: Config.embedColour,
	thumbnail: {
		url: "https://i.imgur.com/GuIhCoQ.png"
	}
});

module.exports.getImageLists = function(){
	let images = {}
		folders = Fs.readdirSync("./images");

	for(let folder of folders){
		let files = Fs.readdirSync("./images/"+folder);
		images[folder] = files;
	}

	return images;
}

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
}

module.exports.searchYT = function(terms, callback, fields="type,title,videoId,author,description"){ // yt functions can be extended in the future with more params and asking for more things
	var url = "https://invidio.us/api/v1/search?fields="+fields+"&q="+encodeURIComponent(terms);

	get(url, (err, res, bod) => {
		if(err || !bod)
			throw("nope");

		callback(JSON.parse(bod));
	});
}

module.exports.getYTVideoInfo = function(id, callback, fields="adaptiveFormats,title,description"){
	var url = "https://invidio.us/api/v1/videos/"+id+"?fields=" + fields;

	get(url, (err, res, bod) => {
		if(err || !bod)
			throw("nope");

		callback(JSON.parse(bod));
	});
}

module.exports.getAudioFromAdaptiveFormats = function(af, encoding="opus"){
	for(let f of af){
		if(f.encoding === encoding){
			return f.url;
		}
	}
}

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

			collector.on('end', collected => message.clearReactions());
		});
	}
}

var get = module.exports.get = Request.get;

module.exports.getUser = function(message, args){
	if(message.mentions.users.first())
		return message.mentions.users.first();

	let a = args._.join(" ");

	if(isNaN(a)){
		if(a.includes("#")){
			return Bot.users.find((u) => {return u.tag == a});
		}
		return Bot.users.find((u) => {return u.username == a});
	}
	return Bot.users.get(args._[0]);
}

function saveGuildProperties(id, obj){
	DB.run("REPLACE INTO config (guild, config) VALUES (?, ?)", id, JSON.stringify(obj));
}

function guildConfigProxyListener(gobj, id){
	return {
		set: function(obj, prop, value){
			obj[prop] = value;
			saveGuildProperties(id, gobj);
		},
		deleteProperty: function(obj, prop){
			delete obj[prop];
			saveGuildProperties(id, gobj);
			return true;
		}
	}
}

function unmute(guild, user, role){
	guild = Bot.guilds.get(guild);
	if(!guild)
		return;
	user = guild.members.get(user);
	if(!user)
		return;
	role = guild.roles.get(role);
	if(!role)
		return;
	user.removeRole(role);
}

function guildConfigProxy(gobj, id){
	gobj.mutes = new Proxy(gobj.mutes||{}, guildConfigProxyListener(gobj, id));
	return new Proxy(gobj, guildConfigProxyListener(gobj, id));
}

var checkUserMute = module.exports.checkUserMute = function(mute, guildId, userId){
	let member = Bot.guilds.get(guildId).members.get(userId),
		timeSince = ((new Date).getTime() - mute.start) / 1000;
	if(timeSince >= mute.time){
		unmute(guildId, userId, mute.role);
		delete guildConfigs[guildId].mutes[userId];
		return;
	}

	if(!member.roles.has(mute.role))
		member.addRole(mute.role).catch();

	setTimeout(() => {
		unmute(guildId, userId, mute.role);
		delete guildConfigs[guildId].mutes[userId];
	}, (mute.time - timeSince) * 1000);
}

function initGuildConfig(){
	guildConfigs = new Proxy({}, {
		get: function(obj, prop){
			if(!obj[prop])
				obj[prop] = guildConfigProxy({}, prop);
			return obj[prop];
		}
	});

	DB.all("SELECT * FROM config").then((res) => {
		for(let r of res){
			let g = guildConfigs[r.guild] = guildConfigProxy(JSON.parse(r.config), r.guild);
			for(let u of Object.keys(g.mutes)){
				checkUserMute(g.mutes[u], r.guild, u);
			}
		}
	});
}

module.exports.initDB = function(){ 
	if(!Fs.existsSync("./ika-db.sqlite"))
		var init = true;

	require("sqlite").open("./ika-db.sqlite").then((m) => {
		DB = m;

		if(init){
			return DB.run('CREATE TABLE "compass" ("id" TEXT, "x" INTEGER,"y" INTEGER, PRIMARY KEY("id"))').then(() => {
				DB.run('CREATE TABLE "headpats" ("id" TEXT, "pats" INTEGER, "last" INTEGER, PRIMARY KEY("id"))').then(() => {
					DB.run('CREATE TABLE "config" ("guild" TEXT NOT NULL UNIQUE, "config" TEXT NOT NULL, PRIMARY KEY("guild"))').then(initGuildConfig);
				});
			});
		}

		initGuildConfig();
	});
}

module.exports.clamp = function(n, ma, mi){
	return Math.min(Math.max(n, mi), ma);
}
