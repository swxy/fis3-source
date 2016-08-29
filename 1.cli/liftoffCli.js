const Liftoff = require('liftoff');
const argv = require('minimist')(process.argv.slice(2));
const testLiftoff = new Liftoff({
    name: 'testLiftoff',
    processTitle: 'testLiftoff',
    moduleName: 'testLiftoff',
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