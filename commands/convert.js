module.exports = {
	name: "Convert",
	triggers: ["convert"],
	description: "Convert units, like 50cm feet",
	category: "moderation",
	arguments: {
		positional: ["value", "output unit"],
		args: [
			{short: "u", long: "units"}
		]
	},
	func: func
};

var units = [
	// length
	{names: ["km", "kilometer", "kilometers"], value: 0.001, type: "length"},
	{names: ["m", "meter", "meters"], value: 1, type: "length"},
	{names: ["dm", "decimeter", "decimeters"], value: 10, type: "length"},
	{names: ["cm", "centimeter", "centimeters"], value: 100, type: "length"},
	{names: ["mm", "millimeter", "millimeters"], value: 1000, type: "length"},
	{names: ["miles", "mile"], value: 0.0006213712, type: "length"},
	{names: ["yards", "yard"], value: 1.093613, type: "length"},
	{names: ["feet", "foot"], value: 3.28084, type: "length"},
	{names: ["inches", "inch"], value: 39.37008, type: "length"},
	{names: ["plancks", "planck"], value: 6.1879273537329E+34, type: "length"},
	// weight
	{names: ["tons", "ton"], value: 0.001102311, type: "weight"},
	{names: ["stones", "stone"], value: 0.157473, type: "weight"},
	{names: ["kg", "kilogram", "kilograms"], value: 1, type: "weight"},
	{names: ["pounds", "pound"], value: 2.204623, type: "weight"},
	{names: ["ounces", "ounce"], value: 35.27396, type: "weight"},
	{names: ["g", "gram", "grams"], value: 1000, type: "weight"},
	{names: ["mg", "milligram", "milligrams"], value: 1000000, type: "weight"},
	// temperature
	{names: ["°c", "c", "celsius"], value: 1, type: "temperature"},
	{names: ["°f", "f", "fahrenheit"], value: 1, type: "temperature"},
	{names: ["°k", "k", "kelvin"], value: 1, type: "temperature"},
	// time
	{names: ["year", "years"], value: 0.01916496, type: "time"},
	{names: ["months", "month"], value: 0.2299795, type: "time"},
	{names: ["weeks", "week"], value: 1, type: "time"},
	{names: ["days", "day"], value: 7, type: "time"},
	{names: ["hours", "hour"], value: 168, type: "time"},
	{names: ["minutes", "minute"], value: 10080, type: "time"},
	{names: ["seconds", "second"], value: 604800, type: "time"},
	// volume
	{names: ["gallons", "gallon"], value: 0.2199692, type: "volume"},
	{names: ["quarts", "quart"], value: 0.8798789, type: "volume"},
	{names: ["l", "liter", "liters"], value: 1, type: "volume"},
	{names: ["pints", "pint"], value: 2.113376, type: "volume"},
	{names: ["dl", "deciliter", "deciliters"], value: 10, type: "volume"},
	{names: ["ml", "milliliter", "milliliters"], value: 1000, type: "volume"},
];

var tempConversionTable = {
	"c": {
		"f": (x => 1.8 * x + 32),
		"k": (x => x + 273.15)
	},
	"f": {
		"c": (x => (x - 32) / 1.8),
		"k": (x => 0.555 * (x - 32) + 273.15)
	},
	"k": {
		"f": (x => 1.8 * (x - 273.15) + 23),
		"c": (x => x - 273.15)
	}
}

function convert(unitIn, unitOut, value){
	if(unitIn.type === "temperature"){
		value = tempConversionTable[unitIn.names[1]][unitOut.names[1]](value);
	}

	let out = (unitOut.value / unitIn.value) * value;
	
	return out;
}

function parseUnit(t){
	t = t.replace("litre", "liter").replace("metre", "meter");
	for(let u of units){
		for(let n of u.names){
			if(n === t)
				return u;
		}
	}
}

function func(message, args){
	if(args.u || args.units)
		return message.reply(units.map((u) => {return u.names[0]}).join(", "));

	args._ = args._.filter((a) => {return a.toLowerCase() !== "to"});

	let l = args._.length > 2,
		val = parseFloat(args._[0]),
		u1 = parseUnit(args._[0+l].match(/[^0-9]+/)[0].toLowerCase()),
		u2 = parseUnit(args._[1+l].match(/[^0-9]+/)[0].toLowerCase());

	if(!(u1 && u2 && !isNaN(val)))
		return message.reply("Nope.");

	if(u1.type !== u2.type)
		return message.reply("Not the same type.");

	message.reply(convert(u1, u2, val).toFixed(5).replace(/\.?0+$/, "")+(u2.names[0].length>2?" ":"")+u2.names[0]);
}