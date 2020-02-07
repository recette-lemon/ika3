var reactions = {
	"loli":{files:["./images/reactions/chris.jpg"]},
	"megumin":"<a:meg1:423078801916952576><a:meg2:423078862621114369>\n<a:meg3:423081562196803586><a:meg4:423081592198529024>\n<a:meg5:423081605351866369><a:meg6:423081642043899904>\n<a:meg7:423081652139589632><a:meg8:423081661450682369>",
	"megu":"<a:meg1:423078801916952576><a:meg2:423078862621114369>\n<a:meg3:423081562196803586><a:meg4:423081592198529024>\n<a:meg5:423081605351866369><a:meg6:423081642043899904>\n<a:meg7:423081652139589632><a:meg8:423081661450682369>",
	"nyanpasu":{files:["./images/reactions/nyanpasu.png"]},
	"sleepy":"<:sleepy1:386772122544111618><:sleepy2:386772159969886211>",
	"goodbot":{files:["./images/reactions/goodbot.gif"]},
	"good":{
		"args":["bot"],
		"out":{files:["./images/reactions/goodbot.gif"]}
	},
	"jojo":"<:jojos:364419907867246595><:bizarreAdventure:364419822488125451>",
	"new":{
		"args":["world", "war"],
		"out":{files:["./images/reactions/scary.jpg"]}
	},
	"smug":{files:["./images/reactions/smugika.jpg"]},
	"nigger":"lynch niggers",
	"speedweed":"<:sw1:411170266987888640><:sw2:411170286507917313><:sw3:411170301741891604>\n<:sw4:411171255132094465><:sw5:411171274786603020><:sw6:411171292708864000>\n<:sw7:411171310756954114><:sw8:411171328071172098><:sw9:411171341060800514>\n",
	"alex":"<:alex1:366754454827040768><:alex2:366755934719967254>\n<:alex3:366754801582604290><:alex4:366754831173419018>",
	"jeff":"<:jeff1:348973024554254336><:jeff2:348973431875829761>\n<:jeff3:348973463530242050><:jeff4:349529260135940097>"
};
module.exports = {
	name: "reaction",
	triggers: [],
	description: "Various one-off commands with little purpose.",
	category: "misc",
	arguments: {
		positional: [],
		args: []
	},
	func: func
};

for(r in reactions){
	module.exports.triggers.push(r);
}
function func(message, args, command){
	if(reactions[command].args){
		for(let i = 0; i < reactions[command].args.length; i++){
			if(args._[i] != reactions[command].args[i]) return;
		}
		return message.channel.send(reactions[command].out);
	} else {
		message.channel.send(reactions[command]);
	}
}
