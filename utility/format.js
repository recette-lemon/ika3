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
};

module.exports.getDateSince = function(end){
	let distance = new Date((new Date()).getTime() - end);
	let y = distance.getUTCFullYear() - 1970;
	let m = distance.getUTCMonth();
	let d = distance.getUTCDate() - 1;
	return (y?y+" Year"+(y===1?"":"s")+", ":"")+(m?m+" Month"+(m===1?"":"s")+", ":"")+d+" Day"+(d===1?"":"s");
};
