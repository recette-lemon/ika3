module.exports = {
	name: "Img",
	triggers: ["img"],
	description: "Image search using Searx.Me.",
	category: "image",
	arguments: {
		positional: ["terms"],
		args: []
	},
	func: func
};

var request = require("request"),
	base = "https://goso.ga/?preferences=eJx1VUGv2zYM_jXzxUixroedfBhWDC1Q4BXLa68CLTE2Z1l0KTl57q8fldiO8toe4sAUye_jJ5IWjLNP0XAwAS8mQdv8Az5i5ZiMYGR_RmmipUM_t2_SpfIQuhk6bDAcvhwrzxZ8fqkcRWg9OjP5uaMQm680HjwNaHpOAy7xtz_-fpow5KwKaTyFYcdthS8RJeNnv4_hRIESmmiFvd8i_7IWYzTvnz5qkouoQ0WjcjGT8MuyEoc5seVx8piwqSKcMCKI7Zvfq9TjiA1HC1JheGR7RH8yissyQiIOmcazgB2U1Zd_PyngyCqFWj88P38-bgT0_XhNnyuxkLBjWUxEjzbdJcGgGBibgewAWoE5kceMcBLEOvIpXUCwdiQalhMYSnp6ZkjGRLYEvh7REaiRAhhzJoecEwg6Rz86zSFOHmKvibJA2bNj7jzWal5qmKaCxPvZqbimw4ACWey3L2UcdVoExFR6bLB6d9cynDC5e8awABQp9rJ32iWZcY5kjbn-6ZG19pDOPynxjt4hDolGjKtON7gtQUuhK70vNJCDBKUNbBd5_hUhPhOWbB3Z9J0DlhkcdW0qfOwsgsEuP0PZZNkq2YVZk2znqFOQZbxnOIEw7zJ7agVkqfN5pPgApS1IZ6xfWVcCd2lSO2tLp1W4BfqcvsATnUoCW3DsQUHzY41ZKd1jMC0jBx3nB31gGuqRRHiLSzwsnDj2PEC4U7rd3S7jSWCEXCeuYeMy6uRp0UkgRK8T9iDQyP9pM5QW1k0hOHHR4E5rzr-O61tZRXk3_M3zFcmiA64XtZF-5bZFR_weYCzJ6KoJUscks02zZGBdpdomuPbllOf1IeC6TCw7rPNjFeHtu3d_vpTdSslDux4619UOrwsz760y2z54G_GtIW7l70tw208LBIcvD22-S1dav10gPExkTCBpyqt4M1Yjpp5d8_np-Fyti1GnqtmOr1v4ENOiXw_PHeVqz_8D-tV37A==&category_images=on&q="

function func(message, args){
	let query = args._.join(" ");
	if(!query)
		return message.reply("Gonna need something to search for.");
	let url = base + query;
	
	request.get(url, function(err, res, bod){
		if(err || !bod)
			throw("nope");

		let results = bod.match(/<a href=".+\n.+class="img-thumbnail">\n<\/a>/g),
			imgs = [];

		for(let result of results){
			result = result.split('"');

			let url = result[1],
				title = result[11];

			if(url.startsWith("//"))
				url = "https:" + url;

			imgs.push([url, title]);
		}

		if(!imgs[0])
			return message.reply("Nothing found.");

		let index = 0,

			embed = new Discord.RichEmbed({
			title: imgs[0][1],
			image: {
				url: imgs[0][0]
			},
			color: Config.embedColour,
			footer: {
				text: "1 of " + imgs.length
			}
		});

		message.channel.send({embed}).then(mes=>{
			let controls = new Utility.MessageControls(mes, message.author),
				index = 0;

			controls.on("reaction", r => {
				if(r.n === 0 && imgs[index-1])
					index--;
				else if(r.n === 1 && imgs[index+1])
					index++;
				else return;


				embed.image.url = imgs[index][0];
				embed.title = imgs[index][1];
				embed.footer.text = (index+1) + " of " + imgs.length;

				mes.edit({embed});
			});
		});

	});
}
