const { client } = require("../config/redisHelper");

// client.set("sessionid", "123", async (err, result) => {
//     if (err) {
//         return console.log(err);
//     }
//     console.log(result);
//     const sessionid = await client.get("sessionid");
// });

(async () => {
    const resp = await client.get("sessionid");
    console.log(resp);

    // const r = await client.exists(["ca8d1ca05a168f", "b"]);
    // console.log(r);
})();

