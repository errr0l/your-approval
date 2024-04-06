const jwtUtil = require("../util/tokenGenerator");

const token = jwtUtil.generateToken({ scope: '1 2 3', a: '12312312321312312312321', b: 'sdfsfxxxxxxxxxxxx' });
console.log(token);
console.log(token.length);

// verification fails if null is returned.
const decoded = jwtUtil.verify(token);
console.log(decoded);