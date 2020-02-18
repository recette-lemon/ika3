module.exports = {
	name: "Math",
	triggers: ["math", "maths"],
	description: "Evaluates mathematical expressions. Supports every function and constant in the JS Math object, aswell as bitwise operations and converting from and to different number bases, 0x12, 0o12, 0b12, and bigints with an 'n' suffix.",
	category: "general",
	arguments: {
		positional: ["expression"],
		args: [
			{short: "n", long: "number-base"},
			{short: "x", long: "hex"},
			{short: "b", long: "bin"},
			{short: "o", long: "oct"}
		]
	},
	func: func
};

var functions = {
	abs: Math.abs,
	acos: Math.acos,
	acosh: Math.acosh,
	asin: Math.asin,
	asinh: Math.asinh,
	atan: Math.atan,
	atan2: Math.atan2,
	atanh: Math.atanh,
	cbrt: Math.cbrt,
	ceil: Math.ceil,
	cos: Math.cos,
	cosh: Math.cosh,
	exp: Math.exp,
	floor: Math.floor,
	log: Math.log,
	max: Math.max,
	min: Math.min,
	pow: Math.pow,
	random: Math.random,
	round: Math.round,
	sin: Math.sin,
	sqrt: Math.sqrt,
	tan: Math.tan,
	tanh: Math.tanh,
	trunc: Math.trunc
};

var constants = {
	pi: 3.141592653589793,
	e: 2.718281828459045,
	ln2: 0.6931471805599453,
	ln10: 2.302585092994046,
	log2e: 1.4426950408889634,
	log10e: 0.4342944819032518
};

function isLetters(str){
	return str.toLowerCase() !== str.toUpperCase();
}

function isNumber(str){
	return typeof(str) === "bigint" || !isNaN(str);
}

function lexer(str){
	let tokens = str.match(/(\*\*)|([a-zA-Z]+)|((?<![0-9])-?(0[xob])?[0-9a-fA-F.]+n?)|([^\s])/g); // seperate tokens

	for (let i = 0; i < tokens.length; i++){ // convert numbers into proper numbers
		if(tokens[i].startsWith("0x")){ // hex
			tokens[i] = parseInt(tokens[i].split("x")[1], 16); // parseFloat doesnt support radix grrrr
		}

		else if(tokens[i].startsWith("0o")){ // octal
			tokens[i] = parseInt(tokens[i].split("o")[1], 8);
		}

		else if(tokens[i].startsWith("0b")){ // binary
			tokens[i] = parseInt(tokens[i].split("b")[1], 2);
		}

		else if(tokens[i].endsWith("n") && isNumber(tokens[i].slice(0, -1))){ // big int
			tokens[i] = BigInt(tokens[i].slice(0, -1));
		}
		
		else if(isNumber(tokens[i])){ // number
			tokens[i] = parseFloat(tokens[i]);
		}

		else if(isLetters(tokens[i]) && tokens[i+1] !== "("){ // constant
			tokens[i] = constants[tokens[i]];
		}
	}

	return tokens;
}

function applyOperation(n1, n2, o){
	switch(o){
		case "+":
			return n1 + n2;
		case "-":
			return n1 - n2;
		case "*":
			return n1 * n2;
		case "/":
			return n1 / n2;

		case "**":
			return n1 ** n2;
		case "%":
			return n1 % n2

		case ">>":
			return n1 >> n2;
		case "<<":
			return n1 << n2;
		case "&":
			return n1 & n2;
		case "^":
			return n1 ^ n2;
		case "|":
			return n1 | n2;

		default:
			throw("unsupported");
	}
}

function applyFunction(f, args){
	return f(...args);
}

function precedence(op){
	switch(op){
		case "^":
			return 4;
		case "|":
			return 5;
		case "&":
			return 6;
		case "<<":
		case ">>":
			return 7;

		case "+":
		case "-":
			return 8;

		case "*":
		case "/":
		case "%":
			return 9;

		case "**":
			return 10;

		default:
			return 0;
	}
}

function shuntyarder(tokens){
	//thank you, edsger dijkstra

	let v_stack = [], // values
		o_stack = []; // operators

	for (var i = 0; i < tokens.length; i++) {
		let token = tokens[i];

		if(token === "("){
			o_stack.push(token);
		} else

		if(isNumber(token)){
			v_stack.push(token);
		} else
		
		if(token === ")"){ // closing brace, apply what we have
			while( o_stack.length && o_stack[o_stack.length-1] !== "(" ){
				let val2 = v_stack.pop(), // setup values
					val1 = v_stack.pop(),
					op   = o_stack.pop();

				v_stack.push(applyOperation(val1, val2, op)); // apply operation
			}

			o_stack.pop(); // pop opening brace 
		
		} else

		if(isLetters(token)){ // token is a function

			let f = functions[token],
				args = [[]],
				brackets = 1;
			i += 2; // skip function and opening bracket

			while(tokens[i]){ // create 2d array of tokens split by ,
				
				if(tokens[i] === ")")
					brackets--;
				else if(tokens[i] === "(")
					brackets++;

				if(brackets == 0)
					break;
				
				if(tokens[i] === ",")
					args.push([]);
				else
					args[args.length-1].push(tokens[i]);

				i++;
			}

			for(var o = 0; o < args.length; o++){ // recursively parse every argument
				args[o] = shuntyarder(args[o]);
			}

			v_stack.push(applyFunction(f, args));

		} else { // token is an operator

			while( o_stack.length && (precedence(o_stack[o_stack.length-1]) >= precedence(token)) ){ // while top of o stack has priority, apply operator on top

				let val2 = v_stack.pop(), // setup values
					val1 = v_stack.pop(),
					op   = o_stack.pop();

				v_stack.push(applyOperation(val1, val2, op));

			}

			o_stack.push(token);
		}
	}

	while(o_stack.length){ // finish off
		let val2 = v_stack.pop(), // setup values
			val1 = v_stack.pop(),
			op   = o_stack.pop();

		v_stack.push(applyOperation(val1, val2, op));
	}

	return v_stack[0];
}


function evalMaths(str){
	let tokens = lexer(str);
	return shuntyarder(tokens);
}

function func(message, args){
	
	let expression = args._.join(" "),
		nbase = args.n || args["number-base"] || (args.x||args.hex?16:0) || (args.o||args.oct?8:0) || (args.b||args.bin?2:0) || 10;

	if(!expression)
		return message.reply("Need something to parse.");

	let result = evalMaths(expression).toString(nbase);

	let embed = new Discord.RichEmbed({
		thumbnail: {
			url: "https://i.imgur.com/WPfOs73.png"
		},
		color: Config.embedColour,
	});

	embed.addField("Input", "```c\n"+expression+"```");
	embed.addField("Output (base " + nbase + ")", result);

	message.channel.send({embed});
}
