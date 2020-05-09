let Fs = require("fs");

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

let checkUserMute = module.exports.checkUserMute = function(guildId, userId){
	let mute = Configs.get(guildId).get("mutes").get(userId);
	if(!mute.start)
		return;
	let member = Bot.guilds.get(guildId).members.get(userId),
		timeSince = ((new Date()).getTime() - mute.start) / 1000;
	if(timeSince >= mute.time){
		unmute(guildId, userId, mute.role);
		Configs.get(guildId).get("mutes").delete(userId);
		return;
	}
	if(!member.roles.has(mute.role))
		member.addRole(mute.role).catch();
	console.log("unmuting", member.user.username, "in", (mute.time - timeSince));
	setTimeout(() => {
		unmute(guildId, userId, mute.role);
		Configs.get(guildId).get("mutes").delete(userId);
	}, (mute.time - timeSince) * 1000);
};

module.exports.checkMutes = function(){
	console.log("Checking mutes.");
	for(let g in Configs){
		for(let u in Configs.get(g).get("mutes")){
			checkUserMute(g, u);
		}
	}
};

function saveConfigProperties(id, obj){
	DB.run("REPLACE INTO config (id, config) VALUES (?, ?)", id, JSON.stringify(obj));
}

class Config{
	get(id){
		if(!this[id]){
			this[id] = new ConfigProperty(this);
		}
		return this[id];
	}
	set(prop, val){
		if(typeof(val) === "object" && !Array.isArray(val))
			val = Object.assign(new ConfigProperty(this), val);
		this[prop] = val;
		this._save();
	}
	exists(prop){
		return this[prop] !== undefined;
	}
	delete(prop){
		delete this[prop];
		this._save();
	}
	_save(){
		saveConfigProperties(this._id, this);
	}
}

class ConfigProperty extends Config{
	constructor(parent){
		super();
		Object.defineProperty(this, "_parent", {
			enumerable: false,
			value: parent
		});
		Object.defineProperty(this, "_id", {
			enumerable: false,
			value: this._parent._id
		});
	}
	_save(){
		this._parent._save();
	}
}

class ConfigsContainer{
	get(id){
		if(!this[id]){
			this[id] = new Config();
			Object.defineProperty(this[id], "_id", {
				enumerable: false,
				value: id
			});
		}
		return this[id];
	}
}

function recurApplyConfigProp(parent){
	for(let key in parent){
		let child = parent[key];
		if(typeof(child) === "object" && !Array.isArray(child) && child){
			parent[key] = Object.assign(new ConfigProperty(parent), child);
			recurApplyConfigProp(child);
		}
	}
}

function initConfig(){
	console.log("Loading up configs.");
	DB.all("SELECT * FROM config").then((results) => {
		for(let result of results){
			Configs[result.id] = new Config(result.id);
			Object.defineProperty(Configs[result.id], "_id", {
				enumerable: false,
				value: result.id
			});
			Object.assign(Configs[result.id], JSON.parse(result.config));
			recurApplyConfigProp(Configs[result.id]);
		}
	});
}

function createBlankDB(){
	console.log("Creating blank DB.");
	let tables = [
		'CREATE TABLE "compass" ("id" TEXT, "x" INTEGER,"y" INTEGER, PRIMARY KEY("id"))',
		'CREATE TABLE "headpats" ("id" TEXT, "pats" INTEGER, "last" INTEGER, PRIMARY KEY("id"))',
		'CREATE TABLE "config" ("id" TEXT NOT NULL UNIQUE, "config" TEXT NOT NULL, PRIMARY KEY("id"))'
	];
	for(var i = 0; i < tables.length; i++){
		tables[i] = DB.run(tables[i]);
	}
}

function initDB(){ 
	console.log("Setting up DB.");
	if(!Fs.existsSync("./ika-db.sqlite"))
		var init = true;
	require("sqlite").open({
		filename: "./ika-db.sqlite",
		driver: require("sqlite3").Database
	}).then((m) => {
		global.DB = m;
		global.Configs = new ConfigsContainer();
		if(init)
			return createBlankDB();
		initConfig();
	});
}

initDB();
