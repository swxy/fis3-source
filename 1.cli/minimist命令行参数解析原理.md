## 概述
minimist是nodejs的一个轻量级的命令行参数解析器。

minimist支持:

1.短参数解析
2.长参数解析
3.Boolean值
4.参数别名
5.默认参数配置
6.`.`解析

minimist解析主要过程:
```
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];

        if (/^--.+=/.test(arg)) {
            // 解析 --beep=boop 类似参数
            ....
        }
        else if (/^--no-.+/.test(arg)) {
            // 解析没有值的参数为`false`,  例如: --no-without => {without: false}
        }
        else if (/^--.+/.test(arg)) {
            // 解析`--param`这种形式的参数, 例如: --beep boop => {beep:boop}  或者 --beep => {beep: true}
        }
        else if (/^-[^-]+/.test(arg)) {
            // 解析`-x val`这种形式的参数, 例如 -x 3 -y 4 => {x:3, y:4}
        }
        else {
            // 其他情况处理 类似 -a 3 4 5 6 => {_:[4, 5, 6], a:3}
        }
    }

```

## 短参数解析
1.参数key和value均有
```
-x 3 -y 4 // => {x:3, y:4}
```

2.只有参数的key
```
-x  // => {x:true}
```

或者
```
-x3 // => {x:3}
```

或者
```
-abc-d // => {a:true, b:true, c: '-d'}
```

需要注意以数字结尾的这种形式
```
-abc-d2 // => {a:'bc-d2'}
```

## 长参数解析
1.有'='
```
--file=xx.js // => {file:xx.js}
```

2.无'='
```
--file xx.js // => {file:xx.js}
```

3.无值
```
--file -a 3 // => {file:true, a:3}
```

## Boolean值解析
除了上述在解析没有值的短参数和长参数时, 会默认解析为`true`之外,也可以通过下述方式设置

1.强制设置为`false`
```
--no-beep // => {beep:false}
```

2.配置参数只返回布尔值
```
minimist(['-a','23'],{boolean: ['a', 'b', 'c']}) // =>{ _: [ 23 ], a: true, b: false, c: false }
```
针对下述情况特殊
```
minimist(['-a23'],{boolean: ['a', 'b', 'c']})  // => { _: [], a: 23, b: false, c: false }
```

## 参数别名
通过在配置中配置`alias`属性, 来对参数设置别名
```
 minimist(['-b', 'a'],{alias: {'b': 'beep'}})  // => { _: [], b: 'a', beep: 'a' }
```

## 默认参数配置
可以针对一些必要的参数设置默认值, 从而在保证代码可执行的情况下减少参数输入。默认参数在通过`default`选择来设置的。
```
minimist(['-c', 'a'],{default: {'b': 'beep'}}) // => { _: [], c: 'a', b: 'beep' }
```

## `.`解析
最后`minimist`还支持`.`的解析。 像`--a.b.c d` 会被解析成`{a:{b:{c:d}}}`这种对象的形式, 其好处不言而喻。
```
minimist(['--a.b.c', 'c', '--a.b.d', 'd'])  // => { _: [], a: { b: { c: 'c', d: 'd' } } }
```
