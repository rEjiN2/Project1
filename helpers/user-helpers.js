const collection = require('../config/collection');
var db = require('../config/connection');
// const OTP = require('../config/OTP')
require('dotenv').config();
const bcrypt = require('bcrypt');
const { response } = require('express');
const client = require('twilio')(process.env.accoountSID,process.env.authToken)
var objectId = require('mongodb').ObjectId
var moment = require('moment')
const Razorpay = require('razorpay');


var instance = new Razorpay({
    key_id: 'rzp_test_ryUqb1WgOYS97A',
    key_secret: '9R9OcFRhXHqT5KelgpnNCQhb',
  });


module.exports = {
    addUser: (user, callback) => {
        db.get().collection('user').insertOne(user).then((data) => {
            callback(data);
        })
    },
    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },
    doSignup: function (userData) {
        return new Promise(async function (resolve, reject) {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(function (data) {
                console.log(data);
                resolve(data.insertedId);
                resolve({ status: false })

            })

        })

    }, doLogin: function (userData) {
        return new Promise(async function (resolve, reject) {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user;
                        response.status = true
                        resolve(response)
                    }
                    else {
                        console.log("login failed");
                        resolve({ status: false })
                    }
                })
            }
            else {
                console.log("Login Failed");
                resolve({ status: false })
            }
        })
    },addToWish:async(proId,userId)=>{
        let details=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)},{projection:{title:1,category:1,price:1}});
        let proObj={
            item:objectId(proId),
            quantity:1,
            productName:details.title,
            category:details.category,
            price:details.price
        }
        return new Promise(async(resolve,reject)=>{
            let userWish = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
            if(userWish){
                let wishObj = {
                    user:objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then((response)=>{
                    resolve();
                    console.log("HI HIYAMA HAIYAMA");

                })
                
            }
            else{
                let wishObj = {
                    user:objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then((response)=>{
                    resolve();
                    console.log("HI HIYAMA HAIYAMA");

                })
            }
        })
    },
   
     addToCart :async(proId,userId)=>{
        let details=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)},{projection:{title:1,stock:1,category:1,price:1}});
        console.log(details,"sussssssssssssssssssssssss")
        let proObj={
            item:objectId(proId),
            quantity:1,
            price:details.price,
            productName:details.title,
            category:details.category
            
        }
        return new Promise(async(resolve,reject)=>{
            let userCart =await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(userCart){
                let proExist = userCart.products.findIndex(product=>product.item==proId)
                console.log(proExist);
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId),'products.item': objectId(proId)},
                    {
                       $inc:{'products.$.quantity':1} 
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                {
                    
                        $push:{
                            products:proObj
                        }

                    
                }).then((response)=>{
                    resolve();
                })
            }
            }
            else {
                let cartObj = {
                    user:objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve();

                })
            }


        })
     },
     
           getWishProducts:(wishId)=>{
            console.log(wishId,'dfsddddddddddddddddddddddddddddddddddddddd');
return new Promise(async(resolve,reject)=>{
    let wishItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
        {
        $match : {
            user : (objectId(wishId))
        }
        },
        {
            $unwind:'$products'
        },
        {
            $project: {
                item:'$products.item',
                quantity:'$products.quantity',
                name:'$products.productName',
                category:'$products.category',
                price:'$products.price'
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
                name:1,
                category:1,
                price:1,
                product:{$arrayElemAt:['$product',0]}
            }
        }
]).toArray()
resolve(wishItems)
console.log(wishItems,"sssssssssssssssssssssssssssssssssssssssssss");
})
           },
     getCartProducts : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{
                        user:(objectId(userId))
                    }
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
                }
              
            ]).toArray()
            resolve(cartItems)
        })
     },
     getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count= 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count = cart.products.length;
            }
                resolve(count)
        })
     },
     changeProductQuantityIn:(details)=>{
       details.count=parseInt(details.count)
       details.quantity = parseInt(details.quantity)
        return new Promise((resolve,reject)=>{
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.product)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
            }
            else{
            db.get().collection(collection.CART_COLLECTION)
                    .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)}, 
                    {
                       $inc:{'products.$.quantity':details.count} 
                    }
                    ).then((response)=>{
                        resolve({status:true})
                    })
                }
        })
     },
     getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{
                        user:(objectId(userId))
                    }
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
                        total:{$sum:{$multiply:['$quantity',{'$toInt':'$product.price'}]}}
                    }
                }
              
            ]).toArray()
            console.log(total[0]?.total,'From Total Amount');
            resolve(total[0]?.total)
        })
     },
     placeOrderIn:(order,products,totalPrice)=>{
         return new Promise(async(resolve,reject)=>{
    let status=order.paymentMethod=='COD'|| 'PAYLATER' ? 'placed':'pending'
    products.forEach(products => {
        products.status=status;
       });
let orderObj = {
    deliveryDetails:{
        name:order.name,
        mobile:order.number,
        adress:order.add1,
        pincode:order.pincode
        
    },
    userId:objectId(order.userId),
    paymentMethod : order.paymentMethod,
    products : products,
    
    totalAmount : totalPrice, 
    status:status,

    date: new Date().toJSON().slice(0,10)
   


}
if(order.coupon){
 
    await db.get().collection(collection.COUPON_COLLECTION).updateOne({name:order.coupon},
      {
        $push:{
          Users:objectId(order.userId)
        }
      })
   
   }
db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
    db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
    resolve(response.insertedId)
})

})
        
     },
     
     getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            console.log(cart,"fRom getCartProductList");
            resolve(cart.products)
        })
     },
     getAllOrder:(userId) =>{
           return new Promise(async(resolve,reject)=>{
            let order = await db.get().collection(collection.ORDER_COLLECTION).find({userId: objectId(userId)}).sort({_id:-1}).toArray()
            console.log(order);
            resolve(order)
           })
     },
     deleteProductIn:(details)=>{
        
       return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({_id:objectId(details.order)},
                {
                    $pull:{products:{item:objectId(details.product)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
       })
           },

           getOrderProducts:(orderId)=>{
            return new Promise(async(resolve,reject)=>{
                
                let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:{
                            
                            _id:(objectId(orderId))
                        }
                    },{
                        $unwind:'$products'
                        
                    },{
                        $project:{
                            item:'$products.item',
                            quantity:'$products.quantity',
                            status:'$products.status',
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
                            status:1,
                            product:{$arrayElemAt:['$product',0]}
                        }
                    }
                  
                ]).toArray()
                   console.log(orderItems,"RaRararrraaa");
                resolve(orderItems)
            })
           },
           generateRazorpay:(orderId,total,products)=>{
            console.log(total,"huiiii");
                    return new Promise((resolve,reject)=>{
                        var options = {
  amount: total*100,  // amount in the smallest currency unit
  currency: "INR",
  receipt: ""+orderId
};
instance.orders.create(options, function(err, order) {
  console.log("New order",order);
  resolve({razorPaySuccess:true,order,products})
});
                    })
           },
           verifyPaymentIn:(details)=>{
            return new Promise((resolve,reject)=>{
                const crypto = require('crypto');
                let hmac = crypto.createHmac('sha256','9R9OcFRhXHqT5KelgpnNCQhb')
                hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
                hmac = hmac.digest('hex')
                if(hmac == details['payment[razorpay_signature]']){
                    resolve()
                }
                else {
                    reject()
                }
            })
           },
           changePaymentStatus:(orderId)=>{
                return new Promise((resolve,reject)=>{
                    db.get().collection(collection.ORDER_COLLECTION)
                    .updateOne({_id:objectId(orderId)},
                    {
                        $set:{
                            status:'placed'
                        }
                    }
                    ).then(()=>{
                        resolve()
                    })
                })
           }
           ,
           doOTP:(userData)=>{
            let response={}
             return new Promise(async(resolve,reject)=>{
              let user=await db.get().collection(collection.USER_COLLECTION).findOne({number:userData.Mnumber})
              console.log(user);
              if(user){
      
                response.status=true
                response.mob=userData.Mnumber;
                response.user=user
                console.log("11111111111111")
                client.verify.services(process.env.ServiceID)
                .verifications
                .create({ to: `+91${userData.Mnumber}`, channel: 'sms' })
                .then((data)=>{
                  
                 
                });
                resolve(response)
              }
              else{
                response.status=false;
                resolve(response)
              }
             })
      
          },
          
      
          doOtpConfirm:(confirmotp,userData)=>{
             return new Promise((resolve,reject)=>{
              
              console.log(userData)
              client.verify.services(process.env.ServiceID)
              .verificationChecks
              .create({
                to:`+91${userData.number}`,
                code:confirmotp.code
              })
    .then((data)=>{
        if(data.status=='approved'){

                  resolve({status:true})
                }else{
                  resolve({status:false})
                }
              })
             })
          },
          updateUser: (userId, userDetails) => {
            console.log(userId,userDetails);
            return new Promise((resolve, reject) => {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                    $set: {
                        address:userDetails.address
                            }
                }).then((response) => {
                    resolve()
                })
            })
        },
        getOrderDetails:(orderId)=>{
            return new Promise((resolve,reject) => {
                db.get().collection(collection.ORDER_COLLECTION).findOne({_id: objectId(orderId)}).then((order)=>{
                    resolve(order)
                })
                        })
        }
        ,
        changeDeliveryaddress:(orderId,addressDetails)=>{
            return new Promise ((resolve,reject)=>{
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{
                    // [{"$set":{
                    //     "deliveryDetails":{
                    //       "$mergeObjects":[
                    //         "$deliveryDetaails",
                    //         { adress : addressDetails.address}
                    //      ]
                    //     }
                    //  }}]
                    $set:{
                        'deliveryDetails.adress':addressDetails.add1
                    }
                }).then(()=>{
                    resolve()
                })
            })
            },
            changeUserProfile:(userId,userDetails)=>{
                return new Promise ((resolve,reject)=>{
                    db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
                        $set:{
                            name:userDetails.name,
                            lname:userDetails.lname,
                            email:userDetails.email,
                            number:userDetails.number
                            
                        }
                    }).then(()=>{
                        console.log('success');
                        resolve()
                    })
                })

            },
            getUserDetails:(userId)=>{
                return new Promise((resolve,reject)=>{
                    db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((user)=>{
                        resolve(user)
                    })
                })
            },
            cancelOrders:(orderId)=>{
                console.log(orderId);
                return new Promise(async(resolve,reject)=>{
                    await db.get().collection(collection.ORDER_COLLECTION).deleteOne({_id:objectId(orderId)}).then(()=>{
                        resolve()
                    })
                })

            },
            applyCoupon:(details, userId, date,totalAmount)=>{
                console.log(details,"RaRARARARARA");
                return new Promise(async(resolve,reject)=>{
                  let response={};
                  
                  let coupon=await db.get().collection(collection.COUPON_COLLECTION).findOne({name:details.coupon});
                  if(coupon){
            
                    const expDate=new Date(coupon.expiryDate)
                   
                    response.couponData = coupon;
                    console.log(coupon,"Chukaprasad");
                   
            
                    let user=await db.get().collection(collection.COUPON_COLLECTION).findOne({name:details.coupon,Users:objectId(userId)})
                     
                    if(user){
                      
                      response.used="Coupon Already Applied"
                      resolve(response)
                      console.log("Already Applied");
                     
            
                    }else{
            
                      if(date <= expDate){
            
                          response.dateValid=true;
                          resolve(response);
            
                          let total=totalAmount;
                          console.log('date ok');
            
                          if(total >= coupon.minAmount){
                            
                            response.verifyMinAmount=true;
                            resolve(response)
                            console.log('min ok');
                            console.log(total,"Local");
            
                            if(total <= coupon.maxDiscount){
            
                              response.verifyMaxAmount=true;
                              resolve(response)
                              console.log('max ok');
                            }
                            else{
                              response.maxAmountMsg="Your Maximum Purchase should be"+ coupon.maxDiscount;
                              response.maxAmount=true;
                              resolve(response)
                              console.log('max not ok');
                            }
                          }
                          else{
                            
                            response.minAmountMsg="Your Minimum purchase should be"+coupon.minAmount;
                            response.minAmount=true;
                            resolve(response)
                          }   
            
                      }else{
                        response.invalidDateMsg = 'Coupon Expired'
                        response.invalidDate = true
                        response.Coupenused = false
            
                        resolve(response)
                        console.log('invalid date');
                      }
                    }
                    
                  }else{
                    response.invalidCoupon=true;
                    response.invalidCouponMsg="Invalid Coupon";
                    resolve(response)
                  }
            
                  if(response.dateValid && response.verifyMaxAmount && response.verifyMinAmount)
                  {
                    response.verify=true;
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                    {
                      $set:{
                        coupon:objectId(coupon._id)
                      }  
                    })
                    resolve(response)
                  }
                })
              },
              
              couponVerify:(userId)=>{
                return new Promise(async(resolve,reject)=>{
            console.log(userId,"99999999999999999999999999");
                  let userCart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
                  
                 
                  if(userCart.coupon){
                      
                    let couponData=await db.get().collection(collection.COUPON_COLLECTION).findOne({_id:objectId(userCart.coupon)});
                   console.log(couponData,"8888888888888888");
                    resolve(couponData)
                  }
                  resolve(userCart);
                  console.log(userCart,"HUHUHUHHUHUHUHUHHHUHUHUHUHUHUHUHUH");
                
            
                })
            
              },
              getAllCategory:()=>{
                return new Promise(async(resolve,reject)=>{
               let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
                    resolve(category)
                    console.log(category,"6666666666666666666666666");
                })
              },
              getCategoryWiseProduct:(catId)=>{
                return new Promise(async(resolve,reject)=>{
                  let category =  await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)})
                 // resolve(category)
                  console.log(category,"fffffffffffffffffffffffffffffff");
                  console.log(category.category);
                     let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({category:category.category}).toArray()
                    
                     resolve(product)

                     console.log(product,"5555555555555555555555555555");


                })

              },
              getBanner:()=>{
                return new Promise(async(resolve,reject)=>{
                    let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
                    resolve(banner)
                })
              },
              decreaseStock:(products)=>{
                return new Promise((resolve,reject)=>{
        
                  if(products!=null){
                    console.log(products,'remove stock helper')
                    let Products = JSON.parse(products)
                    let limit = Products.length
                    console.log(Products.length,'product array length')
                    console.log(Products,'fiankdadksfjaoksjd');
                    
                  
                    for(i=0;i<limit;i++){
        
                        let proID = Products[i].item
                        let proQuantity = Products[i].quantity
                
                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : objectId(proID)},{$inc:{stock:-proQuantity}})
                    }
        
                    resolve()
                  }
        
                  else{
                    reject()
                  }
        
                  
        
                })
            },
            removeWishProduct:(wishId)=>{
                return new Promise(async(resolve,reject)=>{
                   await db.get().collection(collection.WISHLIST_COLLECTION).deleteOne({_id:objectId(wishId)}).then(()=>{
                    resolve()
                   })
                    
                })
                
                
            },
            returnOrderProduct:(orderDetails,user)=>{
                return new Promise(async(resolve,reject)=>{
                    await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderDetails.orderId),"products.item":objectId(orderDetails.productId)},
                    {
                        $set:{
                            "status":orderDetails.status
                        }
                    }).then(async()=>{
                        let value2 = parseInt(orderDetails.productPrice);
                        let quantity = parseInt(orderDetails.productQuantity);
                        let amount = parseInt(value2*quantity);
                        let wallet = parseInt(user.wallet);
                        amount = amount+wallet;
                        let data = await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(user._id)},{
                            $set:{
                                wallet : amount
                            }
                        })
                    })
                    resolve({status:true})
                })
            },
            setEachProductStatus:(status,orderId,productId)=>{
                return new Promise((resolve,reject)=>{
                 db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId),"products.item":objectId(productId)},
                 {
                   $set:{
                     "products.$.status":status,
                     
                   }
                 })
                 resolve(true)
                })
           }
            
        
}