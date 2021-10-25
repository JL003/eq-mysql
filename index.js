const mysql = require('mysql');

let pool = mysql.createPool({
    host: '',
    user: '',
    password: '',
    database: ''
});

const querySql = function (sql, values) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                resolve(err)
            } else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })
}

/**
 * @function 申明需要操作的表名
 * @param {String} tableName - 表名
 * @return {Object} 返回Table实例化对象，将用于对该表进行下一步操作
 */
function table(tableName) {
    const newTabel = new Table(tableName)
    if (this.pool && this.querySql) {
        newTabel.pool = this.pool
        newTabel.querySql = this.querySql
    }
    return newTabel
}

function clone(obj) {
    let newObj = JSON.parse(JSON.stringify(obj))
    newObj.__prop__ = obj.__prop__
    return newObj
}

function Table(tableName) {
    this.tableName = tableName
}

/**
 * @function 查询表字段
 * @description 在table方法返回的对象下进行链式操作
 * 
 * @param selects String||Object||Array 
 * @param 形参 参数说明
 * @return 返回说明
 *   @retval 返回值说明

 */
Table.prototype.select = function (selects) {
    this.selectStr = this.selectStr || ''
    if (this.selectStr && selects) {
        this.selectStr += ', '
    }
    if (typeof selects === 'string') {
        this.selectStr += selects
    } else if (Array.isArray(selects)) {
        this.selectStr += selects.join(',')
    } else if (selects instanceof Object) {
      for (let key in selects) {
        this.selectStr += `${this.selectStr && ',' || ''} ${key} as ${selects[key]}`
      }
    }
    return this
}

Table.prototype.wheres = ['=', 'LIKE', 'like', 'BETWEEN', 'between', 'NOT BETWEEN', 'not between', '<>', '!=', '>', '<', '>=', '<=']

Table.prototype.where = function(data = '') {
    let whereStr = ''
    if (this.whereStr) {
        whereStr = ' AND '
    }
    if (typeof data === 'string') {
      whereStr += data
    } else if (data.constructor === Object) {
      let whereArr = []
      for (let key in data) {
        if (!data[key]) {
            continue;
        }
        if (Array.isArray(data[key])) {
            whereArr.push(`${mysql.escape(key).replace(/'/g, '`')} IN (${mysql.escape(data[key])})`)
        } else {
            whereArr.push(`${mysql.escape(key).replace(/'/g, '`')}=${mysql.escape(data[key])}`)
        }
      }
      whereStr += whereArr.join(' AND ')
    } else if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (Array.isArray(item) && item.length >= 3) {
          whereStr += `${index && ' AND' || ''} ${mysql.escape(item[0]).replace(/'/g, '`')} ${this.wheres.includes(item[1]) && item[1] || '=' } ${mysql.escape(item[2])}`
        }
      })
    }
    this.whereStr = this.whereStr || ''
    this.whereStr += whereStr && whereStr || ''
    return this
}

Table.prototype.orWhere = function(data = '') {
    let whereStr = ''
    if (this.whereStr) {
        whereStr = ' OR '
    }
    if (typeof data === 'string') {
      whereStr += data
    } else if (data.constructor === Object) {
      let whereArr = []
      for (let key in data) {
        if (!data[key]) {
            continue;
        }
        if (Array.isArray(data[key])) {
            whereArr.push(`${mysql.escape(key).replace(/'/g, '`')} IN (${mysql.escape(data[key])})`)
        } else {
            whereArr.push(`${mysql.escape(key).replace(/'/g, '`')}=${mysql.escape(data[key])}`)
        }
      }
      whereStr += whereArr.join(' AND ')
    } else if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (Array.isArray(item) && item.length >= 3) {
          whereStr += `${index && ' AND' || ''} ${mysql.escape(item[0]).replace(/'/g, '`')} ${this.wheres.includes(item[1]) && item[1] || '=' } ${mysql.escape(item[2])}`
        }
      })
    }
    this.whereStr = this.whereStr || ''
    this.whereStr += whereStr && whereStr || ''
    return this
}

Table.prototype.orderBy = function(order) {
    this.orderStr  = this.orderStr || ''
    if (typeof order === 'string') {
        this.orderStr = order
    } else if (order.constructor === Object) {
        for (let key in order) {
            this.orderStr += `${this.orderStr && ',' || ''}${key} ${order[key]}`
        }
    }
    return this
}

Table.prototype.groupBy = function(group) {
    if (Array.isArray(group)) {
        group = group.join(',')
    }
    this.groupStr = group || ''
    return this
}

Table.prototype.having = function(data = '') {
    let havingStr = ''
    if (typeof data === 'string') {
        havingStr = data
    } else if (data.constructor === Object) {
      let havingArr = []
      for (let key in data) {
        if (!data[key]) {
            continue;
        }
        if (Array.isArray(data[key])) {
            havingArr.push(`${mysql.escape(key).replace(/'/g, '`')} IN (${mysql.escape(data[key])})`)
        } else {
            havingArr.push(`${mysql.escape(key).replace(/'/g, '`')}=${mysql.escape(data[key])}`)
        }
      }
      havingStr = havingArr.join(' AND ')
    } else if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (Array.isArray(item) && item.length >= 3) {
            havingStr += `${index && ' AND' || ''} ${mysql.escape(item[0]).replace(/'/g, '`')} ${this.wheres.includes(item[1]) && item[1] || '=' } ${mysql.escape(item[2])}`
        }
      })
    }
    this.havingStr = havingStr && havingStr || ''
    return this
}

// await table('test').all()
Table.prototype.all = async function() {
    this.query = this.querySql || querySql
    const res = await this.query(this.sql())
    return new Promise((resolve) => {
      resolve(res || null)
    })
}

// await table('test').one()
Table.prototype.one = async function() {
    this.limit(1)
    this.query = this.querySql || querySql
    const res = await this.query(this.sql())
    return new Promise((resolve) => {
        resolve(res[0] || null)
    })
}

Table.prototype.insert = async function(data) {
    data = data || {}
    const sql = `INSERT INTO ${this.tableName} SET ?`
    this.query = this.querySql || querySql
    const res = await this.query(sql, data)
    return new Promise((resolve) => {
        resolve(res || null)
    })
}

Table.prototype.update = async function(data) {
    data = data || {}
    const sql = `UPDATE ${this.tableName} SET ?
    ${'WHERE ' + (this.whereStr || '1=2')}`
    this.query = this.querySql || querySql
    const res = await this.query(sql, data)
    return new Promise((resolve) => {
        resolve(res || null)
    })
}

Table.prototype.delete = async function() {
    const sql = `DELETE FROM ${this.tableName}
    ${'WHERE ' + (this.whereStr || '1=2')}`
    this.query = this.querySql || querySql
    const res = await this.query(sql)
    return new Promise((resolve) => {
        resolve(res || null)
    })
}

Table.prototype.limit = function(pagesize, page = 1) {
    if (pagesize < 1) {
        pagesize = 1
    }
    this.limitStr = ` Limit ${pagesize * (page - 1)},${pagesize}`
    return this
}

Table.prototype.count = async function() {
    this.selectStr = 'COUNT(1)'
    const res = await this.all()
    return new Promise((resolve) => {
      resolve(res[0] && res[0]['COUNT(1)'] || 0)
    })
  }

Table.prototype.join = function(type, tableName, on) {
    this.joinStr = this.joinStr && this.joinStr + ' ' || ''
    if (!!type && !!tableName && !!on) {
        this.joinStr += `${type} ${tableName} ON ${on}`
    } else if (!!type && !tableName && !on) {
        this.joinStr += type
    }
    return this
}

Table.prototype.sql = function() {
    let sql = `SELECT ${this.selectStr || '*'} FROM ${this.tableName} ${this.joinStr || ''} ${this.whereStr && 'WHERE ' + this.whereStr || ''} ${this.orderStr && 'ORDER BY ' + this.orderStr || ''} ${this.groupStr && 'GROUP BY ' + this.groupStr || ''} ${this.havingStr && 'HAVING ' + this.havingStr || ''} ${this.limitStr || ''}`
    return sql
}

function config(conf) {
    pool = mysql.createPool(conf)
}

function create(conf) {
    const pool = mysql.createPool(conf)
    const querySql = function (sql, values) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    resolve(err)
                } else {
                    connection.query(sql, values, (err, rows) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(rows)
                        }
                        connection.release()
                    })
                }
            })
        })
    }
    let newMySql = {
        querySql: querySql,
        query: querySql,
        config,
        mysql,
        pool
    }
    newMySql.table = table.bind(newMySql)
    return newMySql
}

module.exports = {
    querySql,
    query: querySql,
    table,
    config,
    mysql,
    pool,
    create
}