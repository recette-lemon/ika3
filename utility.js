const Fs = require("fs");
const Package = JSON.parse(Fs.readFileSync("package.json"));
const Https = require("https");
const Http = require("http");

var statusIndex = 0;
var commandNumber;

var statuses = [
	()=>{return "Ika v"+Package.version},
	()=>{return "https://ika.eiko.cc"},
	()=>{return "**help | **invite"},
	()=>{return Bot.guilds.size+" servers, "+Bot.users.size+" users, "+commandNumber+" commands."}
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

module.exports.getCommands = function(){
	let files = Fs.readdirSync("./commands"),
		commands = {};

	commandNumber = files.length;

	for(file of files){
		let loc = "./commands/"+file;
		delete require.cache[require.resolve(loc)];

		let cmd = require(loc)
		for(t of cmd.triggers){
			commands[t] = cmd;
		}
	}

	return commands;
}

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

var get = module.exports.get = function(url, obj={
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
		}
	}, callback){
	if(!callback){
		callback = obj;
		obj = {}
	}

	let http = url.startsWith("https://") ? Https : Http;
	http.get(url, obj, (res) => {
		res.setEncoding('utf8');
		let bod = "";

		res.on("data", (chunk) => {
			bod += chunk;
		});

		res.on("end", () => {
			callback(null, res, bod);
		});

		res.on("error", (err) => {
			callback(err, null, null);
		});
	});
}

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
				let timeSince = ((new Date).getTime() - g.mutes[u].start) / 1000;
				if(timeSince >= g.mutes[u].time){
					unmute(r.guild, u, g.mutes[u].role);
					delete g.mutes[u];
					continue
				}
				setTimeout(() => {
					unmute(r.guild, u, g.mutes[u].role);
					delete g.mutes[u];
				}, (g.mutes[u].time - timeSince) * 1000);
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