// const { patternsForAuthorize } = require("../controller/pattern/openPattern");
//
// const paramChecker = require("../middleware/paramChecker");
//
// const checker = paramChecker(patternsForAuthorize);
//
// try {
//     checker({
//         request: {
//             query: { response_type: "" },
//             body: {},
//         }
//     }, function () {
//         console.log(1);
//     });
// } catch (error) {
//     console.log(error);
//     console.log(error.message);
// }