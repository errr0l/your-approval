const nodemailer = require("nodemailer");

function createTransporter(opts) {
    return nodemailer.createTransport({
        host: opts.host,
        port: opts.port,
        secure: opts.secure,
        auth: { user: opts.username, pass: opts.password }
    });
}

module.exports = {
    createTransporter
};