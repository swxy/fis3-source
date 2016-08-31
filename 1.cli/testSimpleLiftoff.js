/**
 * 测试简化版的liftoff（./simpleLiftoff.js）
 * @type {LiftOffTest}
 */

const LiftOffTest = require('./simpleLiftoff');
const argv = require('minimist')(process.argv.slice(2));
const testLiftoff = new LiftOffTest({
    name: 'testLiftoff',
    configName: 'liftoff-conf',
    extensions: {
        '.js': null,
        '.json': null
    }
});

testLiftoff.launch({
    cwd: argv.r || argv.root,
    configPath: argv.f || argv.file
}, function (env) {
    console.log(env);
});