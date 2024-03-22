const Decryptor = require("../util/WXBizDataCrypt");

const encryptedData = "r0ri3i7+dnEv/wB41fAYDBa764HJWXa8JYjh07fHG7VIOeKdkmYI+Rof4O5/PgzHxT+L1NZGxzTm7zTk1hYmajNaO0D2BPEp9Z8/y5V5gJ2beC2d8MYk0QQElRmA/OWUZTDjQK+E+RG4bURJZiTRNsVejgid6eYrPAgJrC8L0RrsDuNrcKxg16S0b+SdPghFpB7EjsX3dJhbT8IdaaOB6CuBQ27l7s+xLg07uSYmGVl/JeUFdkFD/cdvyaBMQJwNDmKzuO2p0orYaP6NLgCONJ+O9sep1IonBtTQXRFKkoX44cb1nCgl2g5ZBeqQ6UzbfP3qrstLhgj8b0qf8EmdnnV2iXV1cgehzThcCBMwkt44jAgiPximlcyodqnl0E3zi/ZSicb8yxTdzj7yOfN1zQ==";
const iv = "+EOPHKD9mA/xykL6onnqcg==";
const signature = "acdbb25fbe6829bcbdfccdbab89f4c159650c8e7";

var appId = 'wx4f4bc4dec97d474b';
var sessionKey = 'tiihtNczf5v6AKRyjwEUhQ==';
const decryptor = new Decryptor();

decryptor.decryptData();