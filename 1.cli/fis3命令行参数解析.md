# fis3命令行参数解析

[fis3中的源码: bin/fis.js](https://github.com/fex-team/fis3/blob/master/bin/fis.js)

原理:
依据nodejs全局api——[process](https://nodejs.org/dist/latest-v6.x/docs/api/process.html)来获取命令行参数,然后使用第三方模块解析和使用消耗这些参数。

依赖的第三方模块:

1. [minimist](https://github.com/substack/minimist): 解析命令行参数。
2. [liftoff](https://github.com/js-cli/js-liftoff): nodejs构建命令行工具


## 一、process
process是一个全局的对象,里面包含一些环境相关的属性,像`env`, `argv`, `config`等, 这里主要说明一下`argv`这个属性。
`process.argv`返回的是一个运行node程序时所传递命令行参数。

示例:
``` js
// print process.argv  process.js
process.argv.forEach((val, index) => {
  console.log(`${index}: ${val}`);
});
```
```
// Launch process
$ node 1.cli/process.js -x 3 -y 4 -n5 -abc --beep=boop foo bar baz
// output
0: /Users/baidu/.nvm/versions/node/v6.2.0/bin/node
1: /Users/baidu/workplace/git/fis3-source/1.cli/pocess.js
2: -x
3: 3
4: -y
5: 4
6: -n5
7: -abc
8: --beep=boop
9: foo
10: bar
11: baz

```

## 二、minimist
关注于node命令行参数解析, 类似的模块还有[optimist](https://github.com/substack/node-optimist#readme)。 两者功能都类型,而minimist相对更简洁一些。

使用:
``` js
//parseArgu.js
const argv = require('minimist')(process.argv.slice(2));
console.dir(argv);
```

```
$ node parse.js -x 3 -y 4 -n5 -abc --beep=boop foo bar baz
//output
{ _: [ 'foo', 'bar', 'baz' ],
  x: 3,
  y: 4,
  n: 5,
  a: true,
  b: true,
  c: true,
  beep: 'boop' }
```

说明:

`argv._`: 包含所有匿名参数（没有与之关联的名称）, 其值是一个数组

其他参考: [minimist命令行参数解析原理](./minimist命令行参数解析原理.md)


## 三、liffoff
使用liftoff实现自定义命令行工具, 管理命令和配置文件之间的依赖关系,使得可以在任意目录执行命令,并可以正确的使用指定的配置文件。

其大致原理是: 根据提供的配置文件名称, 需要去查找的目录（如果没有提供,默认为执行程序的目录）来查找配置文件。
或者提供指定的配置文件的路径来精确查找。 [简化版实现liftoff](./simpleLiftoff.js)

使用:
```js
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
```

在父级目录执行, 不设置`cwd`选项
```
// launch in parent category
$ node 1.cli/liftoffCli.js
// output
{ cwd: '/Users/baidu/workplace/git/fis3-source',
  require: [],
  configNameSearch: [ 'liftoff-conf.js', 'liftoff-conf.json' ],
  configPath: null,
  configBase: undefined,
  modulePath: undefined,
  modulePackage: {},
  configFiles: {} }
```

在父级目录执行, 设置`cwd`选项
```
// launch in parent category with root option
$ node 1.cli/liftoffCli.js -r 1.cli
// or with file option
$ node 1.cli/liftoffCli.js -f 1.cli/liftoff-conf.js

// output
{ cwd: '/Users/baidu/workplace/git/fis3-source/1.cli',
  require: [],
  configNameSearch: [ 'liftoff-conf.js', 'liftoff-conf.json' ],
  configPath: '/Users/baidu/workplace/git/fis3-source/1.cli/liftoff-conf.js',
  configBase: '/Users/baidu/workplace/git/fis3-source/1.cli',
  modulePath: undefined,
  modulePackage: {},
  configFiles: {} }
```

在当前目录执行
```
// launch in current category
$ node liftoffCli.js
//output
{ cwd: '/Users/baidu/workplace/git/fis3-source/1.cli',
  require: [],
  configNameSearch: [ 'liftoff-conf.js', 'liftoff-conf.json' ],
  configPath: '/Users/baidu/workplace/git/fis3-source/1.cli/liftoff-conf.js',
  configBase: '/Users/baidu/workplace/git/fis3-source/1.cli',
  modulePath: undefined,
  modulePackage: {},
  configFiles: {} }

```