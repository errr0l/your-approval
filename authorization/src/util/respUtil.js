// const { CODE_0, CODE_0_MESSAGE, CODE_50001 } = require("../constants/responseCode");
// const { INTERNAL_SERVER_ERROR } = require("../constants/general");
//
// const respUtil = {
//     error({ code, message, payload }) {
//         return {
//             code: code ? code : CODE_50001,
//             message: message ? message : INTERNAL_SERVER_ERROR,
//             payload: payload ? payload : null
//         }
//     },
//     ok({ message, payload }) {
//         return {
//             code: CODE_0,
//             message: message ? message : CODE_0_MESSAGE,
//             payload: payload ? payload : null
//         }
//     }
// };
//
// module.exports = respUtil;