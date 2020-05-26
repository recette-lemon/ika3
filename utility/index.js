let functions = {loadUtility};

function loadUtility(){
	let files = require("fs").readdirSync("./utility");
	for(let file of files){
		if(file == "index.js")
			continue;
		delete require.cache[require.resolve("./"+file)];
		Object.assign(functions, require("./"+file));
	}
	module.exports = functions;
}


loadUtility();
