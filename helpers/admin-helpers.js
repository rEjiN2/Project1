var db = require('../config/connection')
const collection = require('../config/collection');
var objectId = require('mongodb').ObjectId
var moment = require('moment')

module.exports = {
  updateUserStatus: (blockUserId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(blockUserId) },
        {

          $set: { isblocked: true }
        })
    }).then((response) => {

      resolve()
    })
  },
  setUserStatus: async (unBlockUserId) => {
    const response = await new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(unBlockUserId) },
        {
          $set: { isblocked: false }
        });
    });
    resolve();
  },
  getAlluserOrders:()=>{
    return new Promise(async(resolve,reject)=>{
      let orderList=await db.get().collection(collection.ORDER_COLLECTION).find().sort({_id:-1}).toArray()
      
      resolve(orderList)
    })
  },
  getProductWiseOrders:(ordersId)=>{
    return new Promise(async(resolve,reject)=>{
      let orderdItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match:{_id:objectId(ordersId)}
        },
        {
          $unwind:'$products'
        },
        {
          $project:{
            item:'$products.item',
            quantity:'$products.quantity',
            status:'$products.status'
            

          }
        },
        {
           $lookup:{
              from:collection.PRODUCT_COLLECTION,
              localField:'item',
              foreignField:'_id',
              as:'product'
           }
        },
        {
          $project:{
            item:1,
            quantity:1,
            status:1,
           
            product:{
              $arrayElemAt:['$product',0]
            }
          }
        }
      ]).toArray()
      console.log(orderdItems,'aeguyg')
      resolve(orderdItems)
    })
  },
  setDeliveryStatus:(status,orderId,productId)=>{
    return new Promise((resolve,reject)=>{
      if(status == 'Cancelled'){
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId),userId:objectId(userId)},
        {
          $set:{
            status:status,
            "cancelled":true,
            "delivered":false
          }
        })
      }else if(status == 'Delivered'){
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId),"products.item":objectId(productId)},
        {
          $set:{
            "status":status,
            // "cancelled":false,
            // "delivered":true,
            "products.$.status":status,
            "products.$.cancelled":false,
            "products.$.delivered":true
            
          }
        })
      }
      else if(status == 'Shipped'){
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId),"products.item":objectId(productId)},
        {
          $set:{
            "status":status,
            "cancelled":false,
            "delivered":true,
            "products.$.status":status,
            "products.$.cancelled":false,
            "products.$.delivered":true
          }
        })
      }
      else{
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId),userId:objectId(userId)},
        {
          $set:{
            status:status,
            "cancelled":false,
            "delivered":false
          }
        })
      }
      resolve(true)
    })
  },
  getCodCount:()=>{
    return new Promise(async(resolve,reject)=>{
      
      let codCount =await db.get().collection(collection.ORDER_COLLECTION).find({$and:[{"paymentMethod":"COD"},{"status":"Delivered"}]}).count()
      console.log(codCount,"Cod Count AADA MONUSEEEE");
      resolve(codCount)
    })

  },
  getRazorCount:()=>{
    return new Promise(async(resolve,reject)=>{
      let razorCount = await db.get().collection(collection.ORDER_COLLECTION).find({$and:[{"paymentMethod":"RAZORPAY"},{"status":"Delivered"}]}).count()
      console.log(razorCount);
      resolve(razorCount)
    })
  },
  getOrderCount:()=>{
    return new Promise(async(resolve,reject)=>{
      let orderCount = await db.get().collection(collection.ORDER_COLLECTION).find().count()
      resolve(orderCount)
    })
  },
  getPayCount:()=>{
    return new Promise(async(resolve,reject)=>{
    let payCount = await db.get().collection(collection.ORDER_COLLECTION).find({$and:[{"paymentMethod":"PAYPAL"},{"status":"Delivered"}]}).count()
    resolve(payCount)
    })
  },
  getPayLaterCount:()=>{
    return new Promise(async(resolve,reject)=>{
      let payLaterCount = await db.get().collection(collection.ORDER_COLLECTION).find({$and:[{"paymentMethod":"PAYLATER"},{"status":"Delivered"}]}).count()
      resolve(payLaterCount)
    })
  },
  getTotalSale:()=>{
    return new Promise(async(resolve,reject)=>{
      let totalSaleAmount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
        $project:{totalAmount:1}
      },
      {
        $group:{
          _id:null,
          totalAmount: {$sum:'$totalAmount'}
        }
      }
    ]).toArray()
    resolve(totalSaleAmount[0]?.totalAmount)
    console.log(totalSaleAmount[0]?.totalAmount);
    })
  },
  getUserCount:()=>{
    return new Promise(async(resolve,reject)=>{
      let userCount = await db.get().collection(collection.USER_COLLECTION).count()
      resolve(userCount)
    })
  },
  getTodayEarnings:()=>{
    return new Promise(async(resolve,reject)=>{
      let tdate = new Date().toJSON().slice(0,10)
      let todayEarnings = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        
        {
          $match:{date:{$eq: tdate}}
      },
      {
       $project:{
        totalAmount:1
       }
      },
      {
        $group:{
          _id:{date:{$dateToString: { format: "%Y-%m-%d", date: "$date" }}},
          totalAmount:{$sum:"$totalAmount"}

        }
      },
      {
        $sort:{
          _id:-1
        }
      }
      ]).toArray()
      resolve(todayEarnings[0]?.totalAmount)
      // console.log(orderCount);
      console.log(todayEarnings[0]?.totalAmount,"Earning");
    })
  },
  getTodayOrder:()=>{
    return new Promise(async(resolve,reject)=>{
    let tdate = new Date().toJSON().slice(0,10)
      console.log(tdate,"Date");
      let orderCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match:{date:{$eq: tdate}}
        }
      ]).toArray()
      console.log(orderCount.length,"HI MONU");
      resolve(orderCount.length)
      
    })
  },
  getProductSold:()=>{
    return new Promise(async(resolve,reject)=>{
      let tdate = new Date().toJSON().slice(0,10)
      let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match:{date:{$eq: tdate}}
          },{
              $unwind:'$products'
          },{
              $project:{
                  item:'$products.item',
                  quantity:'$products.quantity'
              }
          },
          {
              $lookup:{
                  from:collection.PRODUCT_COLLECTION,
                  localField:'item',
                  foreignField:'_id',
                  as:'product'
              } 
          },{
              $project:{
                  item:1,
                  quantity:1,
                  product:{$arrayElemAt:['$product',0]}
              }
          },
          {
              $group:{
                  _id:null,
                  total:{$sum:{$multiply:['$quantity',{'$toInt':'$product.price'}]}},
                  ptotal :{$sum:'$quantity'}
              }
          }
        
      ]).toArray()
      console.log(total[0]?.ptotal,'From Total Amount');
      resolve(total[0]?.ptotal)
  })
  },
  fetchImage1:(catId)=>{
    return new Promise(async(resolve,reject)=>{
      let details =  await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)},{projection:{catImage1:true}})
      resolve(details.catImage1)
    })
  },
  fetchImg:(proId)=>{
return new Promise(async(resolve,reject)=>{
  let details =  await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)},{projection:{image:true}})
      resolve(details.image)
    })

  },
  addCoupon:(couponDetails)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.COUPON_COLLECTION).insertOne({ name: couponDetails.couponName, code: couponDetails.couponId, maxDiscount: couponDetails.maxdiscount, minAmount: couponDetails.minAmount, expiryDate: couponDetails.expDate,couponPercentage:couponDetails.couponPercentage, status: true }).then((response)=>{
        response.message = 'Coupon Added successfully'
        response.status = false
        resolve(response)
      })
      
    })
  },
  getAllCoupons:(coupon)=>{
    return new Promise(async(resolve,reject)=>{
     let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
     resolve(coupon)
     console.log(coupon,"hiDA ");
    })
  },
  addBanner:(banner)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((data)=>{
        resolve(data)
      })
      
    })
  },
  getBanner:()=>{
    return new Promise(async(resolve,reject)=>{
      banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
      resolve(banner)
    })
  },
  getDailySalesReport:(oDate,cDate)=>{
    return new Promise(async(resolve,reject)=>{
      let dailySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
        $match : {date:{$gte : oDate, $lte:cDate}}
        },
        {
          $project: {
            _id:0,
            totalAmount:1,
            products:1,
            date:1
          },

        },{
          $unwind :'$products'
        },
        
        {
          $group :{
            _id :'$products.productName',
            totalAmount:{$sum:'$products.price'},
            totals:{$sum:'$totalAmount'},
            Quantity:{$sum:'$products.quantity'}
          }
        }
    ]).toArray();
    resolve(dailySales)
    console.log(dailySales,"89898989879887898789878987");
    })

  },
  getMonthlySalesReport:(month)=>{
    return new Promise(async(resolve,reject)=>{
      let monthlyReport=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { month:{$eq:month}} 
        },
        
       {
        $project:{
          _id:0,
          totalAmount:1,
          products:1,
          month:1
        }
       },
       {
        $unwind:'$products'
       },
       
       {
        $group:{
          _id:'$products.productName',
          totalAmount:{$sum:'$totalAmount'},
          Quantity:{$sum:'$products.quantity'}
        }
       }, 
      ]).toArray();
      resolve(monthlyReport)
      console.log(monthlyReport,"huhuhuhuhuhuhuhhuhuuh");
    })
  },
  getDailySalesGraph:()=>{
    return new Promise(async(resolve,reject)=>{
        let sales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $project: { date: 1, totalAmount: 1 }
        },
         
          {
            $group:{
              _id:  ("$date".slice(0,7)),
              totalAmount: { $sum: '$totalAmount' },
              count: { $sum: 1 }
            }
          },
          {
            $sort:{
              _id:1
            }
          },
          {
            $limit:7
          }
        ]).toArray()
        resolve(sales)
       console.log(sales)
    })
  },
  getMonthlySalesGraph:()=>{
    return new Promise(async(resolve,reject)=>{
      let sales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $project: { month: 1, totalAmount: 1 }
      },
       
        {
          $group:{
            _id: "$month",
            totalAmount: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort:{
            _id: 1
          }
        },
        {
          $limit:7
        }
      ]).toArray()
      resolve(sales)
      console.log(sales);
    })
  }
}