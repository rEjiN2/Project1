const MongoClient = require('mongodb').MongoClient
const state = {
    db: null
}


module.exports.connect = function (done) {
    const url = 'mongodb+srv://rejinA:JvZjf7HqrsVs12IX@cluster0.bhjvnej.mongodb.net/?retryWrites=true&w=majority'
    const dbname = 'Ecommerce'


    MongoClient.connect(url, (err, data) => {
        if (err) return done(err);
        state.db = data.db(dbname)
        done()
    })

}
module.exports.get = function () {
    return state.db;
}