const http = require('http')
const eqMysql = require('../index')
// eqMysql.config({
//     host: 'xxx.xxx.xxx.xxx',
//     user: 'xx',
//     password: 'xx',
//     database: 'xx'
// })
// const { table, query } = eqMysql

const newMySql = eqMysql.create({
        host: 'xxx.xxx.xxx.xxx',
        user: 'xx',
        password: 'xx',
        database: 'xx'
    })
const { table, query } = newMySql
http.createServer(async (req, res) => {
    res.setHeader('Content-Type','text/plain; charset=utf-8')
    const fn = {
        async '/'() {
            let data = await table('test').all()
            res.end(JSON.stringify(data))
        },
        async '/one'() {
            let data = await table('test').one()
            res.end(JSON.stringify(data))
        },
        async '/limit'() {
            // 前两行
            const data = await table('test').limit(2).all()
            res.end(JSON.stringify(data))
        },
        async '/limit3'() {
            // 按两行进行分页，查询第三页
            const data = await table('test').limit(2, 3).all()
            res.end(JSON.stringify(data))
        },
        async '/select'() {
            // SELECT id, name
            const data = await table('test').select('id, name').all()
            res.end(JSON.stringify(data))
        },
        async '/select1'() {
            // SELECT id, name
            const data = await table('test').select(['id', 'name']).all()
            res.end(JSON.stringify(data))
        },
        async '/select2'() {
            // SELECT id as id11, name as name22
            const data = await table('test').select({'id': 'id11', 'name': 'name22'}).all()
            res.end(JSON.stringify(data))
        },
        async '/select3'() {
            // SELECT id as id33, name
            const data = await table('test').select(['id as id33', 'name']).all()
            res.end(JSON.stringify(data))
        },
        async '/select4'() {
            // SELECT id, name, super
            const data = await table('test').select('id, name').select(['super']).all();
            res.end(JSON.stringify(data))
        },
        async '/orderBy'() {
            // ORDER BY id desc, name asc
            const data = await table('test').orderBy('id desc, name asc').all()
            res.end(JSON.stringify(data))
        },
        async '/orderBy1'() {
            // ORDER BY id desc, name asc
            const data = await table('test').orderBy({id: 'desc', name: 'asc'}).all()
            res.end(JSON.stringify(data))
        },
        async '/groupBy'() {
            // GROUP BY id
            const data = await table('test').groupBy('id').all()
            res.end(JSON.stringify(data))
        },
        async '/groupBy1'() {
            // GROUP BY id
            const data = await table('test').groupBy(['id']).all()
            res.end(JSON.stringify(data))
        },
        async '/having'() {
            const data = await table('test').groupBy(['id']).having({
                super: 'aa'
            }).all()
            res.end(JSON.stringify(data))
        },
        async '/join'() {
            // left join `user` ON user.id=test.super
            const data = await table('test as t1')
                                .select(['t1.id', 'user.id as user_id', 't1.name', 't1.super'])
                                .join('left join', 'user', 'user.id=t1.super').all()
            res.end(JSON.stringify(data))
        },
        async '/count'() {
            // 总行数
            const data = await table('test').count()
            res.end(JSON.stringify(data))
        },
        async '/count1'() {
            // 条件行数
            const data = await table('test').where({ super: 'aa' }).count()
            res.end(JSON.stringify(data))
        },
        async '/insert'() {
            // 插入
            const data = await table('test').insert({
                id: Math.ceil(Math.random() * 1000),
                name: 'insert'
            })
            // data {"fieldCount":0,"affectedRows":1,"insertId":0,"serverStatus":2,"warningCount":0,"message":"","protocol41":true,"changedRows":0}
            res.end(JSON.stringify(data))
        },
        async '/delete'() {
            // 修改 必须加where条件， 如果有需要删除所有可以使用where('1=1')
            const data = await table('test').where({id: 344}).delete()
            // data {"fieldCount":0,"affectedRows":1,"insertId":0,"serverStatus":34,"warningCount":6,"message":"","protocol41":true,"changedRows":0}
            res.end(JSON.stringify(data))
        },
        async '/update'() {
            // 修改 必须加where条件， 如果有需要修改所有可以使用where('1=1')
            const data = await table('test').where({id: 'ff'}).update({
                id: 'ff',
                name: Math.ceil(Math.random() * 1000)
            })
            // data {"fieldCount":0,"affectedRows":1,"insertId":0,"serverStatus":34,"warningCount":0,"message":"(Rows matched: 1  Changed: 1  Warnings: 0","protocol41":true,"changedRows":1}
            res.end(JSON.stringify(data))
        },
        async '/where'() {
            // const data = await table('test').where(`id = 'aa'`).all()
            // const data = await table('test').where({
            //     id: 'aa'
            // }).all()
            const data = await table('test').where({id: ['aa', 'bb']}).where({id: 'aa'}).all()
            res.end(JSON.stringify(data))
        },
        async '/orWhere'() {
            const data = await table('test').where({id: ['aa', 'bb']}).where({id: 'aa'}).orWhere({id: 'cc'}).all()
            res.end(JSON.stringify(data))
        },
        async '/query'() {
            // 遇到特殊需求可以直接使用语句进行查询
            // 基于npm mysql 模块进行封装，可以参考mysql getConnection的使用方法
            const data = await query('select * from test where ?', { id: 'ff' })
            res.end(JSON.stringify(data))
        }
    }
    if (Reflect.has(fn, req.url)) {
        fn[req.url]()
    } else {
        res.statusCode = 404
        res.end()
    }
}).listen(8033, () => {
    console.log('http://localhost:8033')
})