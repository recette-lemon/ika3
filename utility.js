const Fs = require("fs");
const Request = require("request");
const Package = JSON.parse(Fs.readFileSync("package.json"));

var statusIndex = 0;

var statuses = [
	()=>{return "Ika v"+Package.version},
	()=>{return "https://eiko.cc"},
	()=>{return "**help | **invite"},
	()=>{return Bot.guilds.array().length+" servers, "+Bot.users.array().length+" users."}
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
	let sec_num = parseInt(t, 10);
	let hours = Math.floor(sec_num / 3600);
	let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	let seconds = sec_num - (hours * 3600) - (minutes * 60);

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
	let files = Fs.readdirSync("./commands");
	let commands = {};

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
	let n = Math.floor(Math.random() * Images[folder].length);
	let file = Images[folder][n];
	let ext = file.split(".").pop();
	let name = folder+"-"+(n+1)+"."+ext;

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

	Request.get(url, (err, res, bod) => {
		if(err || !bod)
			throw("nope");

		callback(JSON.parse(bod));
	});
}

module.exports.getYTVideoInfo = function(id, callback, fields="adaptiveFormats,title,description"){
	var url = "https://invidio.us/api/v1/videos/"+id+"?fields=" + fields;

	Request.get(url, (err, res, bod) => {
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