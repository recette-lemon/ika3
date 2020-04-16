let functions = {loadUtility};

function loadUtility(){
	let files = require("fs").readdirSync("./utility");
	for(let file of files){
		if(file == "index.js")
			continue;

		Object.assign(functions, require("./"+file));
	}

	module.exports = functions;
}


loadUtility();
