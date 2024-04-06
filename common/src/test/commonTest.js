const { getIp } = require("../util/common");

function testGettingIp() {
    const ip = getIp();
    console.log(ip);
}

function run(methods) {
    for (const method of methods) {
        method();
    }
}

run([testGettingIp]);