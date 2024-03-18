const { joinUrl } = require("../util/urlUtil");

const _redirectUrl = 'http://localhost:9528/easyblog/admin/#/oauth2/callback';

const redirectUrl = joinUrl(_redirectUrl, {
   code: '123'
});

console.log(redirectUrl);