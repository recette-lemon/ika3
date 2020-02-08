module.exports = {
	name: "Search",
	triggers: ["search", "g"],
	description: "Search using Searx.me.",
	category: "general",
	arguments: {
		positional: ["terms"],
		args: []
	},
	func: func
};

var Request = require("request");

function func(message, args){
	let string = args._.join(" ");

	if(!string){
		message.reply("Need something to search for, buddy.");
		return;
	};

	let url = "https://goso.ga/?preferences=eJx1VUGv2zYM_jXzxUixroedfBhWDC1Q4BXLa68CLTE2Z1l0KTl57q8fldiO8toe4sAUye_jJ5IWjLNP0XAwAS8mQdv8Az5i5ZiMYGR_RmmipUM_t2_SpfIQuhk6bDAcvhwrzxZ8fqkcRWg9OjP5uaMQm680HjwNaHpOAy7xtz_-fpow5KwKaTyFYcdthS8RJeNnv4_hRIESmmiFvd8i_7IWYzTvnz5qkouoQ0WjcjGT8MuyEoc5seVx8piwqSKcMCKI7Zvfq9TjiA1HC1JheGR7RH8yissyQiIOmcazgB2U1Zd_PyngyCqFWj88P38-bgT0_XhNnyuxkLBjWUxEjzbdJcGgGBibgewAWoE5kceMcBLEOvIpXUCwdiQalhMYSnp6ZkjGRLYEvh7REaiRAhhzJoecEwg6Rz86zSFOHmKvibJA2bNj7jzWal5qmKaCxPvZqbimw4ACWey3L2UcdVoExFR6bLB6d9cynDC5e8awABQp9rJ32iWZcY5kjbn-6ZG19pDOPynxjt4hDolGjKtON7gtQUuhK70vNJCDBKUNbBd5_hUhPhOWbB3Z9J0DlhkcdW0qfOwsgsEuP0PZZNkq2YVZk2znqFOQZbxnOIEw7zJ7agVkqfN5pPgApS1IZ6xfWVcCd2lSO2tLp1W4BfqcvsATnUoCW3DsQUHzY41ZKd1jMC0jBx3nB31gGuqRRHiLSzwsnDj2PEC4U7rd3S7jSWCEXCeuYeMy6uRp0UkgRK8T9iDQyP9pM5QW1k0hOHHR4E5rzr-O61tZRXk3_M3zFcmiA64XtZF-5bZFR_weYCzJ6KoJUscks02zZGBdpdomuPbllOf1IeC6TCw7rPNjFeHtu3d_vpTdSslDux4619UOrwsz760y2z54G_GtIW7l70tw208LBIcvD22-S1dav10gPExkTCBpyqt4M1Yjpp5d8_np-Fyti1GnqtmOr1v4ENOiXw_PHeVqz_8D-tV37A==&q=" + escape(string)

	Request.get(url, function(err, ress, bod){
		if(!bod || err)
			return message.reply("Ok, something didn't work.");

		let res = (bod.match(/result_header"\>\<a href\="(.+)" rel/g) || []).map(a=>{return a.split('"')[2]});

		if(!res[0])
			return message.reply("Nothing found.");

		message.channel.send("Result 1 of "+res.length+" "+res[0]).then(mes=>{
			let controls = new Utility.MessageControls(mes, message.author),
				index = 0;

			controls.on("reaction", r => {
				if(r.n === 0 && res[index-1])
					index--;
				else if(r.n === 1 && res[index+1])
					index++;
				else return;

				mes.edit("Result "+(index+1)+" of "+res.length+" "+res[index]);
			});
		});
		
	});
}
