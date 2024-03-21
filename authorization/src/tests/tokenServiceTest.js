const tokenService = require("../service/tokenService");

// const token = {
//     accessToken: "at_1",
//     refreshToken: "rt_1",
//     clientId: 1,
//     userId: 1,
//     scope: "openid profile email phone"
// };
//
// tokenService.save(token).then(result => {
//     console.log(result);
// });

// tokenService.getTokenById(1).then(res => {
//     console.log(res)
// });

tokenService.delTokensByUserId(1).then(res => {
    console.log(res);
});