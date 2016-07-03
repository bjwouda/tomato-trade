export default function(){
	this.transition(
	  this.childOf('.game-title'),
	  this.use('toUp', { duration: 1000 })
	);
}

