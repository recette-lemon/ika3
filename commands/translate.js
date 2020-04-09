module.exports = {
	name: "Translate",
	triggers: ["translate", "trans"],
	description: "Translates with Google Translate.",
	category: "general",
	arguments: {
		positional: ["term"],
		flags: {
			from: ["auto", "f"],
			to: ["english", "t"]
		}
	},
	func: func
};

var baseUrl = "https://translate.google.com/m";
var codes = {"abkhaz":"ab","afar":"aa","afrikaans":"af","akan":"ak","albanian":"sq","amharic":"am","arabic":"ar","aragonese":"an","armenian":"hy","assamese":"as","avaric":"av","avestan":"ae","aymara":"ay","azerbaijani":"az","bambara":"bm","bashkir":"ba","basque":"eu","belarusian":"be","bengali":"bn","bihari":"bh","bislama":"bi","bosnian":"bs","breton":"br","bulgarian":"bg","burmese":"my","catalan; valencian":"ca","chamorro":"ch","chechen":"ce","chichewa; chewa; nyanja":"ny","chinese":"zh","chuvash":"cv","cornish":"kw","corsican":"co","cree":"cr","croatian":"hr","czech":"cs","danish":"da","divehi; dhivehi; maldivian;":"dv","dutch":"nl","english":"en","esperanto":"eo","estonian":"et","ewe":"ee","faroese":"fo","fijian":"fj","finnish":"fi","french":"fr","fula; fulah; pulaar; pular":"ff","galician":"gl","georgian":"ka","german":"de","guaraní":"gn","gujarati":"gu","haitian; haitian creole":"ht","hausa":"ha","hebrew (modern)":"he","herero":"hz","hindi":"hi","hiri motu":"ho","hungarian":"hu","interlingua":"ia","indonesian":"id","interlingue":"ie","irish":"ga","igbo":"ig","inupiaq":"ik","ido":"io","icelandic":"is","italian":"it","inuktitut":"iu","japanese":"ja","javanese":"jv","kannada":"kn","kanuri":"kr","kashmiri":"ks","kazakh":"kk","khmer":"km","kinyarwanda":"rw","komi":"kv","kongo":"kg","korean":"ko","kurdish":"ku","latin":"la","luganda":"lg","lingala":"ln","lao":"lo","lithuanian":"lt","luba-katanga":"lu","latvian":"lv","manx":"gv","macedonian":"mk","malagasy":"mg","malay":"ms","malayalam":"ml","maltese":"mt","māori":"mi","marathi (marāṭhī)":"mr","marshallese":"mh","mongolian":"mn","nauru":"na","norwegian bokmål":"nb","north ndebele":"nd","nepali":"ne","ndonga":"ng","norwegian nynorsk":"nn","norwegian":"no","nuosu":"ii","south ndebele":"nr","occitan":"oc","oromo":"om","oriya":"or","pāli":"pi","persian":"fa","polish":"pl","portuguese":"pt","quechua":"qu","romansh":"rm","kirundi":"rn","russian":"ru","sanskrit (saṁskṛta)":"sa","sardinian":"sc","sindhi":"sd","northern sami":"se","samoan":"sm","sango":"sg","serbian":"sr","scottish gaelic; gaelic":"gd","shona":"sn","slovak":"sk","slovene":"sl","somali":"so","southern sotho":"st","spanish; castilian":"es","sundanese":"su","swahili":"sw","swati":"ss","swedish":"sv","tamil":"ta","telugu":"te","tajik":"tg","thai":"th","tigrinya":"ti","turkmen":"tk","tagalog":"tl","tswana":"tn","tonga (tonga islands)":"to","turkish":"tr","tsonga":"ts","tatar":"tt","twi":"tw","tahitian":"ty","ukrainian":"uk","urdu":"ur","uzbek":"uz","venda":"ve","vietnamese":"vi","volapük":"vo","walloon":"wa","welsh":"cy","wolof":"wo","western frisian":"fy","xhosa":"xh","yiddish":"yi","yoruba":"yo"};

function func(message, args){
	let text = args._.join(" "),
		from = codes[args.from] || args.from,
		to = codes[args.to] || args.to;

	let url = baseUrl+"?sl="+encodeURIComponent(from)+"&hl="+encodeURIComponent(to)+"&q="+encodeURIComponent(text);

	Utility.get(url, (err, res, bod) => {

		let out = bod.match(/class="t0"\>(.+)\<\/div\>\<form/)[1];

		let embed = new Discord.RichEmbed({
			author: {
				icon_url: "https://upload.wikimedia.org/wikipedia/commons/d/db/Google_Translate_Icon.png",
				name: "Translate"
			},
			fields: [
				{
					name: "From "+from+" to "+to,
					value: out
				}
			],
			color: Config.embedColour
		});

		message.channel.send({embed});
	});
}
