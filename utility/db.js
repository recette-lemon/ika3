let Fs = require("fs");

module.exports.getUser = function(message, args){
	if(message.mentions.users.first())
		return message.mentions.users.first();

	let a = args._.join(" ");

	if(isNaN(a)){
		if(a.includes("#")){
			return Bot.users.find((u) => u.tag == a);
		}
		return Bot.users.find((u) => u.username == a);
	}
	return Bot.users.get(args._[0]);
};

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
	};
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

let checkUserMute = module.exports.checkUserMute = function(mute, guildId, userId){
	let member = Bot.guilds.get(guildId).members.get(userId),
		timeSince = ((new Date()).getTime() - mute.start) / 1000;
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
};

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

function createBlankDB(){
	DB.run('CREATE TABLE "compass" ("id" TEXT, "x" INTEGER,"y" INTEGER, PRIMARY KEY("id"))').then(() => {
		DB.run('CREATE TABLE "headpats" ("id" TEXT, "pats" INTEGER, "last" INTEGER, PRIMARY KEY("id"))').then(() => {
			DB.run('CREATE TABLE "config" ("guild" TEXT NOT NULL UNIQUE, "config" TEXT NOT NULL, PRIMARY KEY("guild"))').then(initGuildConfig);
		});
	});
}

module.exports.initDB = function(){ 
	if(!Fs.existsSync("./ika-db.sqlite"))
		var init = true;

	require("sqlite").open("./ika-db.sqlite").then((m) => {
		DB = m;

		if(init){
			return createBlankDB();
		}

		initGuildConfig();
	});
};
