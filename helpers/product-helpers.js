const { response } = require('../app');
var collection = require('../config/collection');
const { PRODUCT_COLLECTION } = require('../config/collection');
var db = require('../config/connection')
var objectId = require('mongodb').ObjectId
module.exports = {
    addProducts: (product, callback) => {
        db.get().collection('product').insertOne(product).then((data) => {
            console.log(data);
            callback(data.insertedId);
        })
    },
    getAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
    },
    getProductDetails: (proId) => {
           
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },getCategoryDetails: (catId)=>{
        return new Promise((resolve,reject) => {
db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id: objectId(catId)}).then((category)=>{
    resolve(category)
})
        })
    }

    ,
    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                $set: {
                    title: proDetails.title,
                    category: proDetails.category,
                    brand: proDetails.brand,
                    price: proDetails.price,
                    gender: proDetails.gender,
                    stock:proDetails.stock,
                    description: proDetails.description
                    // image:proDetails.image[0]
                   
                    

                

                }
            }).then((response) => {
                resolve()
            })
        })
    },addCategory: (categoryIn,callback) => {
        return new Promise(async(resolve,reject)=>{
            let categoryal = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category: {"$regex":categoryIn.category,"$options":"i"}})
            let status =false
       if(categoryal){
        status=true;
        resolve(response)
        console.log('Category Already Exist');
       }else{
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryIn).then((data)  =>  {
            console.log(data);
            resolve(data);
    })
       }
        

})

    },getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },
    EditCategory:(catId,catDetails)=>{
     return new Promise ((resolve,reject)=>{
         db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},{
             $set:{
                 category:catDetails.category,
                 scategory:catDetails.scategory,
                 catImage1:catDetails.catImage1
             }
         }).then(()=>{
             resolve()
         })
     })
    },deleteCategoryIn:(catId)=>{
        return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(catId)}).then(()=>{
    resolve()
            })
        } )
       }
}