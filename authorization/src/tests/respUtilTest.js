const { getBestMIMEType, getQuantify } = require("../util/respUtil");

const bestMIMEType = getBestMIMEType("*/*;q=0.8,application/xml;q=0.9,application/json;q=0.9");
console.log(bestMIMEType);

// const quantify = getQuantify("*/*;q=0.8");
// console.log(quantify);