# eq-mysql
基于mysql模块进行封装，使更简易的操作mysql数据库
## 安装
```shell
npm install eq-mysql --save
```
## 使用
### 引入eq-mysql
```javascript
const eqMysql = require('eq-mysql');
```
### 配置数据库
##### host: 数据库地址
##### database：数据库名称
##### user： 登录数据库的名称
##### password：登录数据库的密码
##### port：端口号，默认3306

```javascript
eqMysql.config({
    host: 'xxx.xxx.xxx.xxx',
    database: 'xx',
    user: 'xx',
    password: 'xx',
    port: 3306
})
const { table, query } = eqMysql
// or
const newEQMySql = eqMysql.create({
    host: 'xxx.xxx.xxx.xxx',
    database: 'xx',
    user: 'xx',
    password: 'xx',
    port: 3306
})
const { table, query } = newEQMySql
```

### eq-mysql的方法

```javascript
const { table, query } = eqMysql;
// or
const { table, query } = newEQMySql
```

#### table(TableName)
使用table方法定义需要进行操作的数据库表，封装的所有方法是基于table方法的链式操作。
table方法需要接收一个参数，该参数为需要查询的数据库表名。

```javascript
const dataTable = table('TableName');
// 查询所有
const rows = await dataTable.all()
// 查询第一条
const row = await dataTable.one()
```

#### all()
执行查询语句，查询所有符合条件的数据。
- 返回Promise对象


- [Promise对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise "了解Promise对象")
- [await操作符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/await "await的使用")

```javascript
const rows = await table('TableName').all();
```

#### one()
执行查询语句，查询符合条件的第一条数据。
- 返回Promise对象

```javascript
const row = await table('TableName').one();
```

#### select(String | Object | Array)
过滤查询的列名，不执行的时候默认为查询所有列

```javascript
// select id, name from TableName
const rows = await table('TableName').select('id, name').all()
// or
const rows = await table('TableName').select(['id', 'name']).all()
// select id as id2, name as name2 from TableName
const rows = await table('TableName').select({ id: 'id2', name: 'name2'  }).all()
// select id as id2, name from TableName
const rows = await table('TableName').select(['id as id2', 'name']).all()
// select id, name, sex from TableName
const rows = await table('TableName').select('id, name').select(['sex']).all();
```


#### where(String | Object | Array)
按条件查询，where方法可以接收 String, Object, Array

```javascript
// select * from where id=1
const rows = await table('TableName').where(`id = 1`).all()
// or
const rows = await table('TableName').where({ id: 1 }).all()
// select * from TableName where `id` = 1 AND `name` like '%George%'
const rows = await table('TableName').where([
	['id', '=', 1],
	['name', 'like', '%George%']
]).all()
// select * from TableName where id in (1,2,3)
const rows = await table('TableName').where({ id: [1, 2, 3] }).all()
// select * from TableName where id in (1,2,3) and name='Joe'
const rows = await table('TableName').where({ id: [1, 2, 3] }).where({ name: 'Joe' }).all()
```

#### orWhere(String | Object | Array)
OR条件查询，使用方法与where方法相同

```javascript
// select * from TableName where id in (1,2,3) or name='Joe'
const rows = await table('TableName').where({ id: [1, 2, 3] }).orWhere({ name: 'Joe' }).all()
```

#### orderBy(String | Object)
排序，orderBy方法可以接收 String, Object

```javascript
const rows = await table('TableName').orderBy('id desc, name asc').all()
const rows = await table('TableName').orderBy({ id: 'desc', name: 'asc' }).all()
```

#### groupBy(String | Array)
分组，groupBy方法可以接收 String, Array

```javascript
const rows = await table('TableName').groupBy('id,name').all()
const rows = await table('TableName').groupBy(['id', 'name']).all()
```

#### having(String | Object | Array)
having用法与where方法相同，请参考[where](#wherestring--object--array)方法的使用

#### join(type, tableName, on)
关联查询，该方法总共可以接收三个参数
- type：left join、right join、inner join
- tableName: 数据库表名称
- on：关联条件

```javascript
const rows = await table('TableName as t1')
      .select(['t1.id', 't2.id as t_id', 't1.name'])
      .join('left join', 'TableName2 as t2', 't2.TableName_id=t1.id').all()
```

#### count()
使用count方法统计符合条件的行数，返回一个数值
- 返回Promise对象

```javascript
const num = await table('TableName').count()
const num = await table('TableName').where([ ['sex', '>', 18] ]).count()
```

#### limit(pagesize, page)
limit分页,可以接收两个参数
- pagesize：行数
- page：页数（从1开始）

```javascript
// 查询第一行
const rows = await table('TableName').limit(1).all()
// 分页查询 每页10行，第2页
const rows = await table('TableName').limit(10, 2).all()
```

#### insert(Object)
使用insert插入数据，接收参数为Object，该对象的key为列名，value为需要插入的数据
- 返回Promise对象

```javascript
 const result = await table('TableName').insert({
                    name: 'Julie',
    				sex: 0
                })

```

#### delete()
使用delete删除数据，delete方法前必须有where条件，否则不允许删除，如果需要删除所有，可以使用 .where('1=1')
- 返回Promise对象

```javascript
const result = await table('TableName').where({ id: 344 }).delete()
```

#### update(Object)
使用update对数据进行修改，执行update方法前需先有where条件，否则不允许修改，如需修改所有，可以使用 .where('1=1')
- 返回Promise对象

```javascript
const result = await table('TableName').where({ id: 1 }).update({
                    name: 'Joe',
					sex: 1
                })
```

#### sql()
除了增加删除修改方法，其他可以使用sql方法进行打印sql语句

```javascript
// SELECT * FROM TableName  WHERE  `id` = 1 AND `name` like '%a%
const sql = table('TableName').where([
                ['id', '=', 1],
                ['name', 'like', '%Ju%']
            ]).sql()
```

#### query()
- 如果有特殊需求可以使用query使用方法执行sql语句，使用方法与mysql模块的query使用方法相同
- 返回Promise对象
- [mysql 模块文档](https://github.com/mysqljs/mysql "mysql 模块文档")

```javascript
const data = await query('select * from test where ?', { id: 1 })
```

