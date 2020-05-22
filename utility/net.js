let get = module.exports.get = require("request").get;

module.exports.searchYT = function(terms, callback, fields="type,title,videoId,author,description"){ // yt functions can be extended in the future with more params and asking for more things
	let url = "https://invidio.us/api/v1/search?fields="+fields+"&q="+encodeURIComponent(terms);

	get(url, (err, res, bod) => {
		if(err || !bod)
			throw("nope");

		callback(JSON.parse(bod));
	});
};

module.exports.getYTVideoInfo = function(id, callback, fields="adaptiveFormats,title,description"){
	let url = "https://invidio.us/api/v1/videos/"+id+"?fields=" + fields;

	get(url, (err, res, bod) => {
		if(err || !bod)
			throw("nope");

		callback(JSON.parse(bod));
	});
};

module.exports.getAudioFromAdaptiveFormats = function(af, encoding="opus"){
	for(let f of af){
		if(f.encoding === encoding){
			return f.url;
		}
	}
};

module.exports.expandURL = function(base, url){
	if(url.match("^https?://")) // absolute
		return url;
	let protocol = base.split(":")[0]
	let domain = base.split("/")[2];
	if(url.startsWith("/")) // root
		return protocol+"://"+domain+url;
	if(!base.endsWith("/"))
		base = base+"/";
	return base+url; // relative
}
