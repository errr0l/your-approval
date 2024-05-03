// const { createCanvas } = require('canvas');

// const defaultOpts = {
//     width: 150,
//     height: 50,
//     lines: 6
// };

/**
 * 生成验证码
 * @param num 位数
 */
function generateCode(num = 4) {
    const str = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const strLen = str.length;
    let code = "";
    for (let i=0; i<num; i++) {
        const index = Math.floor(Math.random() * strLen);
        code += str.charAt(index);
    }
    return code;
}

/**
 * 生成验证码图片
 * @param opts
 * @param code 验证码
 * @param opts.width 图片宽
 * @param opts.height 图片高
 * @param opts.lines 干扰线数量
 * @return {string}
 */
// function generateCaptcha(code, opts = {}) {
//     opts = Object.assign({}, defaultOpts, opts);
//     const { width, height, lines } = opts;
//     const canvas = createCanvas(width, height);
//     const ctx = canvas.getContext('2d');
//
//     ctx.fillStyle = '#f4f4f4';
//     ctx.fillRect(0, 0, 150, 50); // 背景色
//
//     ctx.fillStyle = '#000';
//     ctx.font = '28px sans-serif';
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillText(code, 75, 25); // 文字
//
//     // 添加干扰线
//     for (let i=0; i<lines; i++) {
//         ctx.beginPath();
//         ctx.moveTo(Math.random() * width, Math.random() * height);
//         ctx.lineTo(Math.random() * width, Math.random() * height);
//         ctx.strokeStyle = '#000';
//         ctx.stroke();
//     }
//
//     return canvas.toDataURL('image/png');
// }
//
// exports.generateCaptcha = generateCaptcha;
exports.generateCode = generateCode;