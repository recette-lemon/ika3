module.exports = {
	name: "Role",
	triggers: ["role"],
	description: "Toggles roles. Self assignable roles are set by placing them between `**start**` and `**end**` roles.",
	category: "moderation",
	arguments: {
		positional: ["role"],
		flags: {
			list: [false, "ls", "l"]
		}
	},
	func: func
};

function findRoleByName(name, guild){
	return guild.roles.find(role => {
		return role.name.toLowerCase() === name.toLowerCase();
	});
}

function func(message, args){
	let startRole = findRoleByName("**start**", message.guild);
	let endRole = findRoleByName("**end**", message.guild);
	let roleName = args._.join(" ");

	if(!(startRole && endRole))
		return message.reply("`**start**` and `**end**` roles not set.");

	if(args.list)
		return message.reply(message.guild.roles.filter(role => {
			return startRole.position > role.position && endRole.position < role.position;
		}).map(r=>r.name).sort((a,b)=>a.toLowerCase()>b.toLowerCase()?1:-1).join(", ") || "No roles.");

	if(!roleName)
		return message.reply("No role to add/remove.");

	let role = findRoleByName(roleName, message.guild);

	if(!role)
		return message.reply("Role not found.");

	if(!(startRole.position > role.position && endRole.position < role.position))
		return message.reply("Role is not self assignable.");

	let has = message.member.roles.has(role.id);
	(has ? message.member.roles.remove(role) : message.member.roles.add(role)).then(() => {
		message.reply(has ? "Removed." : "Added.");
	}).catch(() => {
		message.reply("Couldn't change roles. Might lack permissions.");
	});
}
