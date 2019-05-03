const mongoose = require("mongoose")
const exec = mongoose.Query.prototype.exec

//redis
const redis = require("redis")
const util = require("util")
const redisUrl = "redis://127.0.0.1.6379"
const client = redis.createClient(redisUrl)
client.hget = util.promisify(client.hget)

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true
    this.hashKey = JSON.stringify(options.key || "")
    return this
    // by returning this we are making every query chainable 
}

mongoose.Query.prototype.exec = async function () {
    //function is used over arrow function as () => changes the scope of this and we dont want this
    // we want this to target the Query and not the file
    if (!this.useCache) {
        return exec.apply(this, arguments)
        // by doing this we aree ensuring that nly those queries will be cached which have .cache in them
    }
    const keys = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }))

    const cacheValue = await client.hget(this.hashKey, keys)
    if (cacheValue) {
        const doc = JSON.parse(cacheValue)

        //handling if the cache is array or  string
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc)

    }
    const result = await exec.apply(this, arguments)
    client.hset(this.hashKey, key, JSON.stringify(result))
    return result
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey))
    }
}