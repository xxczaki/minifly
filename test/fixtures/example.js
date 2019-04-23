'use strict';

const isNumber = num => {
	if (num === typeof Number) {
		return true;
	}

	return false;
};

console.log(isNumber(1)); //=> true
