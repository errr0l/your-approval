function run(methods) {
    for (const method of methods) {
        method();
    }
}

exports.run = run;