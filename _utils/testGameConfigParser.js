let _ = require('lodash');

function sanityCheck(rawConfigString) {
	let cleanLines = rawConfigString.split("\n")
		.filter( (x) => {return /^(game|b\d+|s\d+|retailPrice)/.test(x);} )
		.map(    (x) => {return x.replace(/#.*$/, "").replace(/\s+/g, "");} )
	;

	let gameLinePresent = cleanLines 
		.filter( (x) => { return /^game/.test(x); } )
	;
	if (gameLinePresent.length !== 1) {throw "Please check how to create a game config, game line not found"; }

	let checkNumbers = cleanLines.map( (x) => { return x.split(",").length - 1; } );
	let sameCommas   = checkNumbers.every( (x) => { return x == checkNumbers[0]; } );
	if (! sameCommas) {throw "The game config has not the same amount of colums in every row, plase cound <,> in the config again"; }

	let uniqueUsers = cleanLines 
		.filter( (x) => { return /^(b|s)\d+\b/.test(x); } )
		.map( (x) => { return x.split(",")[0]; } )
	;
	if (_.uniq(uniqueUsers).length !== uniqueUsers.length) { throw "Every user must be unique in the config, two times b1 causes errors"; }

	console.log(uniqueUsers);

	return cleanLines;
}

function getNumberOfPlayers() {
	let nrOfBuyers  = cleanLines.filter((x)=>{return /^s\d+/.test(x); }).length;
	let nrOfSellers = cleanLines.filter((x)=>{return /^b\d+/.test(x); }).length;
	return {nrOfBuyers, nrOfSellers};
}


function getGameLine(cleanLines) {
	return cleanLines.filter((x)=>{return /^game/.test(x);})[0];
}


function getNumberOfRounds() {
	let gameLine = getGameLine(cleanLines);
	let gameSegments = gameLine.split(",");
	console.log(gameLine);
	let total = gameSegments.length - 1;
	let weeks = gameSegments.filter((x)=>{return x.startsWith("w"); }).length;
	let days = gameSegments.filter((x)=>{return x.startsWith("d"); }).length;
	return {total, weeks, days};
}

function getValueForUserAndRound(user, round, postFix = '') {
	if (!user) { throw "user must exist"; }
	if (round <= 0) { throw "round must be greate 1"; }

	let userLine = cleanLines.filter( (x) => { return x.startsWith(`${user}${postFix}`); } )[0];
	return userLine.split(",")[round];
}

function getRetailpriceForRound(round) {
	console.log(cleanLines);
	let retailPrice = cleanLines.filter( (x) => { return x.startsWith("retailPrice"); } )[0];
	return retailPrice.split(",")[round];
}

let rawConfigString = `
# fooo asbdflk asdfö lkjas, , , , , , 
# fooo asbdflk asdfö lkjas, , , , , , 
# fooo asbdflk asdfö lkjas, , , , , , 
game        , w1  , w2   , d1  , w3  , d2  ,   w4,    d3,   d4  # 4 weeks, 10 trades
retailPrice  , 1.0 , 1.0  , 1.0 ,  1.0, 1.0 , 1.0 , 1.0  x,  1.0  # 4 weeks, 10 trades
b1          , 1000, 12000, 1000, 1000, 1000, 1000, 12000, 1000
b1_extPrice , 9999, 12000, 1000, 1000, 1000, 1000, 12000, 1000
b1_extTomato, 1, 12000, 1000, 1000, 1000, 1000, 12000, 1000
s1          , 1000, 12000, 1000, 1000, 1000, 1000, 12000, 1000
s1_extPrice , 9999, 12000, 1000, 1000, 1000, 1000, 12000, 1000
s1_extTomato, 1, 12000, 1000, 1000, 1000, 1000, 12000, 1000
`;


let cleanLines = sanityCheck(rawConfigString);
let cleanLinesSplit = cleanLines.map( (x)=>{return x.split(",");} );
console.log(cleanLinesSplit);
console.log("Nr of rounds: " + getNumberOfRounds());
console.log("Nr of players: ");
console.log(getNumberOfPlayers());
console.log(getValueForUserAndRound('b1', 1));
console.log(getValueForUserAndRound('b1', 2));
console.log(getValueForUserAndRound('b1', 1, '_extPrice'));
console.log(getValueForUserAndRound('b1', 1, '_extTomato'));
console.log(getRetailpriceForRound(2));
console.log(getRetailpriceForRound(2));



// console.log(sameCommas);
// console.log(checkNumbers);








