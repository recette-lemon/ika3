module.exports = {
	name: "Convert",
	triggers: ["convert"],
	description: "Convert units, like `50cm feet`. Currency prices are updated every 24h.",
	category: "misc",
	arguments: {
		positional: ["value", "output unit"],
		args: [
			{short: "l", long: "length"},
			{short: "w", long: "weight"},
			{short: "t", long: "temperature"},
			{short: "k", long: "time"},
			{short: "v", long: "volume"},
			{short: "e", long: "energy"},
			{short: "c", long: "currencies"},
		]
	},
	func: func
};

function updateCurrencies(){
	if((new Date()).getTime() - lastCurrencyUpdate < 86400000) // return if less than 24h
		return;

	units = units.slice(0, currencyStart); // remove currencies

	Utility.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd", (err, res, bod) => {
		let json = JSON.parse(bod.toLowerCase());

		for(c of json){
			units.push({
				names: [c.symbol, c.name.replace(/ /g, "")],
				value: 1/c.current_price,
				type: "currency"
			});
		}
	});

	Utility.get("https://api.exchangerate-api.com/v4/latest/USD", (err, res, bod) => {
		let json = JSON.parse(bod);
		lastCurrencyUpdate = json.time_last_updated * 1000;

		for(let c in json.rates){
			let obj = {names: [c.toLowerCase()], type: "currency"}

			obj.value = json.rates[c];

			if(c === "USD")
				obj.names.push("$");
			else if(c === "EUR")
				obj.names.push("€");
			else if(c === "GBP")
				obj.names.push("£");
			else if(c === "JPY")
				obj.names.push("¥");

			units.push(obj);
		}
	});
}

var lastCurrencyUpdate;

var units = [
	// length
	{names: ["km", "kilometer", "kilometers"], value: 0.001, type: "length"},
	{names: ["m", "meter", "meters"], value: 1, type: "length"},
	{names: ["dm", "decimeter", "decimeters"], value: 10, type: "length"},
	{names: ["cm", "centimeter", "centimeters"], value: 100, type: "length"},
	{names: ["mm", "millimeter", "millimeters"], value: 1000, type: "length"},
	{names: ["miles", "mile"], value: 0.0006213712, type: "length"},
	{names: ["yards", "yard"], value: 1.093613, type: "length"},
	{names: ["feet", "foot", "ft"], value: 3.28084, type: "length"},
	{names: ["inches", "inch"], value: 39.37008, type: "length"},
	{names: ["plancks", "planck"], value: 6.1879273537329E+34, type: "length"},
	{names: ["metricfeet", "mfoot", "metricfoot", "mfeet"], value: 0.3, type: "length"},
	{names: ["nauticalmiles", "nmile", "nauticalmile", "nmiles"], value: 0.0005399565, type: "length"},
	// weight
	{names: ["tons", "ton"], value: 0.001102311, type: "weight"},
	{names: ["stones", "stone"], value: 0.157473, type: "weight"},
	{names: ["kg", "kilogram", "kilograms"], value: 1, type: "weight"},
	{names: ["pounds", "pound", "lbs", "lb"], value: 2.204623, type: "weight"},
	{names: ["ounces", "ounce"], value: 35.27396, type: "weight"},
	{names: ["g", "gram", "grams"], value: 1000, type: "weight"},
	{names: ["mg", "milligram", "milligrams"], value: 1000000, type: "weight"},
	// temperature
	{names: ["°c", "c", "celsius"], value: 1, type: "temperature"},
	{names: ["°f", "f", "fahrenheit"], value: 1, type: "temperature"},
	{names: ["°k", "k", "kelvin"], value: 1, type: "temperature"},
	// time
	{names: ["years", "year"], value: 0.01916496, type: "time"},
	{names: ["months", "month"], value: 0.2299795, type: "time"},
	{names: ["weeks", "week"], value: 1, type: "time"},
	{names: ["days", "day"], value: 7, type: "time"},
	{names: ["hours", "hour"], value: 168, type: "time"},
	{names: ["minutes", "minute"], value: 10080, type: "time"},
	{names: ["seconds", "second"], value: 604800, type: "time"},
	{names: ["ms", "milliseconds", "millisecond"], value: 604800000, type: "time"},
	// volume
	{names: ["gallons", "gallon"], value: 0.2199692, type: "volume"},
	{names: ["quarts", "quart"], value: 0.8798789, type: "volume"},
	{names: ["l", "liter", "liters"], value: 1, type: "volume"},
	{names: ["pints", "pint"], value: 2.113376, type: "volume"},
	{names: ["dl", "deciliter", "deciliters"], value: 10, type: "volume"},
	{names: ["ml", "milliliter", "milliliters"], value: 1000, type: "volume"},
	// energy
	{names: ["kj", "kilojoule", "kilojoules"], value: 1, type: "energy"},
	{names: ["j", "joule", "joules"], value: 1000, type: "energy"},
	{names: ["ev", "electronvolt", "electronvolts"], value: 6.241509e+21, type: "energy"},
	{names: ["kcal", "calorie", "calories"], value: 0.2390057, type: "energy"},
	{names: ["btu", "britishthermalunit", "britishthermalunits"], value: 0.9478171, type: "energy"},
	{names: ["wh", "watthour", "watthours"], value: 0.2777778, type: "energy"},
];

var currencyStart = units.length;

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

function listUnits(type){
	return units.filter((u) => {return u.type === type}).map((u) => {return u.names[0]}).join(", ");
}

updateCurrencies();

function func(message, args){
	if(args.l || args.length)
		return message.reply(listUnits("length"));
	else if(args.w || args.weight)
		return message.reply(listUnits("weight"));
	else if(args.t || args.temperature)
		return message.reply(listUnits("temperature"));
	else if(args.k || args.time)
		return message.reply(listUnits("time"));
	else if(args.v || args.volume)
		return message.reply(listUnits("volume"));
	else if(args.e || args.energy)
		return message.reply(listUnits("energy"));
	else if(args.c || args.currencies)
		return message.reply(listUnits("currency"));
	
	updateCurrencies();

	args._ = args._.filter((a) => {return a.toLowerCase() !== "to"});

	let l = args._.length > 2,
		val = parseFloat(args._[0]) || 1,
		u1 = parseUnit(args._[0+l].match(/[^0-9]+/)[0].toLowerCase()),
		u2 = parseUnit(args._[1+l].match(/[^0-9]+/)[0].toLowerCase());

	if(!(u1 && u2))
		return message.reply("Nope.");

	if(u1.type !== u2.type)
		return message.reply("Not the same type.");

	message.reply(convert(u1, u2, val).toFixed(5).replace(/\.?0+$/, "")+(u2.names[0].length>2?" ":"")+u2.names[0]);
}