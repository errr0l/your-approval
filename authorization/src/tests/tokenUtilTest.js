const { generateToken } = require("../util/tokenUtil");

const payload = { a: 'b' };
const t1 = generateToken(payload);
const t2 = generateToken(payload);
console.log('t1');
console.log(t1);
console.log('t2');
console.log(t2);