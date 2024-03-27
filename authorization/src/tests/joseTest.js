const jose = require("jose");
// const crypto = require('crypto');

const { generateKeyPair } = jose;
generateKeyPair("RS256").then(res => {
    console.log(res);
});

// .then(res => {
//     const { publicKey, privateKey } = res;
//     console.log(privateKey);
//
//     console.log(publicKey);
// }).catch(error => {
//     console.log(error);
// })