const Fs = require("fs");
const Request = require("request");

module.exports.capitalise = function capitalise(str){
	return str[0].toUpperCase() + str.slice(1);
}

module.exports.toHHMMSS = function(t){
    let sec_num = parseInt(t, 10); // don't forget the second param
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    let time    = hours+':'+minutes+':'+seconds;
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
	let file = images[folder][Math.floor(Math.random() * images[folder].length)];

	let embed = new Discord.RichEmbed({
		color: Config.embedColour,
		image: {url: "attachment://"+file}
	});

	message.channel.send({
		embed,
		files: [{
			attachment: "./images/"+folder+"/"+file,
			name: file
		}]
	});
}

module.exports.searchYT = function(terms, callback){ // yt functions can be extended in the future with more params and asking for more things
	var url = "https://invidio.us/api/v1/search?fields=type,title,videoId,author,description&q="+encodeURIComponent(terms);

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