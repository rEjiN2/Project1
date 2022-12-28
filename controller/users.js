const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const paypalHelpers =require('../helpers/paypal')
const collection = require('../config/collection');
const adminHelper = require('../helpers/admin-helpers');
var db = require('../config/connection');
var objectId = require('mongodb').ObjectId
const { Db } = require('mongodb');
const { response } = require('../app');
const verifyLogin=(req,res,next)=>{
 if(req.session.userLoggedIn){
  next();
 }
 else{
  res.redirect('/login');
 }
}



module.exports = {
  loginpage: async(req, res) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    let user = req.session.user
    console.log(user)
    cartCount=null
    let banner = await userHelpers.getBanner()
   let category = await userHelpers.getAllCategory()
    if(req.session.user){
      
      console.log(category);
     cartCount =await userHelpers.getCartCount(req.session.user._id)
     productHelpers.getAllProduct().then((product)=>{
      res.render('index', {user,cartCount,product,category,banner})
     })
    }
    console.log(category);
      productHelpers.getAllProduct().then((product)=>{
      res.render('index', {user,cartCount,product,category,banner})
     })
  },
  
  shop: async(req, res) => {
    try{
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    let user = req.session.user;
    if(req.session.user){
      cartCount =await userHelpers.getCartCount(req.session.user._id)
    productHelpers.getAllProduct().then((product) => {
      res.render('shop', { product, user, cartCount })
      })
     }
     else{
      productHelpers.getAllProduct().then((product) => {
      res.render('shop',{product})
    })
     }
    } catch(err){
      console.log(err.message);
      return res.status(500).json({message:"Something went wrong"})
    }
     
  },
  signup: (req, res) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.user) {
      res.redirect('/')
    } else {
      res.render('users/login', { "loginErr": req.session.userloginErr, "blocked": req.session.blocked });
      req.session.blocked = false
      req.session.userloginErr = false
    }
  },
  signin: (req, res) => {
    res.render('users/signup');
  },
  signIn: (req, res) => {
    userHelpers.doSignup(req.body).then(function (response) {
      console.log(response);
      req.session.user=response;
      req.session.userLoggedIn=true;
      res.redirect('/login')
    })

  },
  loggedin: (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        if (response.user.isblocked) {
          console.log('User Blocked');
          req.session.blocked = "User Blocked";
          res.redirect('/login')
        }
        else {

          req.session.user = response.user
          req.session.userLoggedIn = true;
          res.redirect('/');
        }
      }
      else {
        req.session.userloginErr = true
        res.redirect('/login')
      }
    })

  },
  pdetails: async (req, res) => {
    try{
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    let user = req.session.user
    let product = await productHelpers.getProductDetails(req.query.id)
    res.render('users/productdetails', { product,user })
  } catch{
    console.log(err.message);
      return res.status(500).json({message:"Something went wrong"})
  }
  }
  ,
  logOut: (req, res) => {
    req.session.user=null
    req.session.userLoggedIn = false
    res.redirect('/')
   },goToWishList:(req,res)=>{
    let user= req.session.user
    if(user){
      userHelpers.addToWish(req.params.id,req.session.user._id).then(()=>{
        res.json({status:true})
      })
    }
    else{
      res.redirect('/login')
    }

   },

  
  goToCart:(req,res)=>{
    try{
    let user = req.session.user
    if(user){
      console.log(req.params.id,"api call");
    userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
     // res.redirect('/shop')
        res.json({status:true})
    })
  }
  else{
    res.redirect('/login');
  }
}
catch{
  console.log(err.message);
      return res.status(500).json({message:"Something went wrong"})
}
  },
  cart:async(req,res)=>{
    try{
    let user = req.session.user._id
    if(user){
      let userw = await userHelpers.getUserDetails(req.session.user._id)
      let products =await userHelpers.getCartProducts(req.session.user._id)
      console.log(products)
      let total = await userHelpers.getTotalAmount(req.session.user._id)
    res.render('users/cart',{user,products,total,userw})
  } else{
    res.redirect('/login')
  }
} catch{
  console.log(err.message);
    return res.status(500).json({message:"Something went wrong"})
}

  },
  ChangeProductQuantity:(req,res,next)=>{
    console.log(req.body);
    try{
    userHelpers.changeProductQuantityIn(req.body).then(async(response)=>{
     response.total= await userHelpers.getTotalAmount(req.body.user);
      res.json(response)
    })
  }catch{
    console.log(err.message);
        return res.status(500).json({message:"Something went wrong"})
  }
  },
  checkoutuser:async(req,res)=>{
    try{
      let user = await userHelpers.getUserDetails(req.session.user._id)
    //let lastAmount = await userHelpers.getLastAmount(req.session.user._id)
    let products =await userHelpers.getCartProducts(req.session.user._id)
    let total = await userHelpers.getTotalAmount(req.session.user._id)
    res.render('users/checkout',{user,total,products})
  } catch{
    console.log(err.message);
        return res.status(500).json({message:"Something went wrong"})
  }
  },
  placeOrder:async(req,res)=>{
    try{
      let user = req.session.user
    let products = await userHelpers.getCartProductList(req.body.userId)
    let totalPrice =await userHelpers.getTotalAmount(req.body.userId) 
    console.log(req.body.userId,"Shakalakakakakakakaka");
    console.log(user._id,"HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
    console.log(totalPrice,"333333333333333333333333333333333333333"); 
     
    let verifyCoupon=await userHelpers.couponVerify(user._id);
    
    console.log(verifyCoupon.name,'123333333333333333');
    console.log(req.body.coupon,"3255555555555555555555")

    if(verifyCoupon.name == req.body.coupon){
      let percentage = verifyCoupon.couponPercentage;

        let discountAmount=(totalPrice * parseInt(verifyCoupon.couponPercentage))/100;
        
        let amount=totalPrice-discountAmount;

        amount = parseInt(amount)
        console.log(discountAmount,"thi is dicsount++++++++++++++++++++++++")
            console.log(amount,"this is original--------------- ")
            console.log(req.body,"55555555555555555555555");
   await userHelpers.placeOrderIn(req.body,products,amount,discountAmount,percentage).then((orderId)=>{
     
      if(req.body['paymentMethod']==='COD') { 
      res.json({codSuccess:true,products}) 
    }else if(req.body['paymentMethod']==='PAYLATER'){
            res.json({payLaterSuccess:true})
    } else if(req.body['paymentMethod']==='PAYPAL'){
            console.log('habeebiii');
      // create payment object for paypal
      var payment = {
        "intent": "authorize",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://localhost:3000/ordersuccess",
          "cancel_url": "http://localhost:3000/payment-failed"
        },
        "transactions": [{
          "amount": {
            "total": amount,
            "currency": "USD"
          },
          "description": " a book on mean stack "
        }]
      }
      //Paypal Helper
      paypalHelpers.createOrder(payment)
      .then(( transaction )=>{
        

        let id = transaction.id;
        let links = transaction.links;
        let counter = links.length; 
        
        while( counter-- ) {
            if ( links[counter].method == 'REDIRECT') {
              transaction.pay =true
               // redirect to paypal where user approves the transaction 
              transaction.linkto = links[counter].href
              transaction.orderId = orderId
              transaction.paypalSuccess = true
              transaction.products = products
        
              userHelpers.changePaymentStatus(orderId).then(() => {
                console.log(transaction,'hello')
                res.json(transaction)
              })
               
                
            }
        }
      })
      .catch((err)=>{
        console.log(err);
      })
    }
    else{
      // let discountAmount=(totalPrice * parseInt(verifyCoupon.couponPercentage))/100;
        
      // let amount=totalPrice-discountAmount;
              console.log(orderId,amount,"KUUuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuiiiiiiiiiiii");
              
      userHelpers.generateRazorpay(orderId,amount,products).then((response)=>{
        console.log(response);
        // 
            res.json(response)
      })
    }
    })
  
  }
  else{
    await userHelpers.placeOrderIn(req.body,products,totalPrice).then((orderId)=>{
     
      if(req.body['paymentMethod']==='COD') { 
        console.log(products,"dhjyggsjdbjk");
        res.json({codSuccess:true,products}) 
    }else if(req.body['paymentMethod']==='PAYLATER'){
            res.json({payLaterSuccess:true})
    } else if(req.body['paymentMethod']==='PAYPAL'){
            console.log('habeebiii');
      // create payment object for paypal
      var payment = {
        "intent": "authorize",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://localhost:3000/ordersuccess",
          "cancel_url": "http://localhost:3000/payment-failed"
        },
        "transactions": [{
          "amount": {
            "total": totalPrice,
            "currency": "USD"
          },
          "description": " a book on mean stack "
        }]
      }
      //Paypal Helper
      paypalHelpers.createOrder(payment)
      .then(( transaction )=>{
        

        let id = transaction.id;
        let links = transaction.links;
        let counter = links.length; 
        
        while( counter-- ) {
            if ( links[counter].method == 'REDIRECT') {
              transaction.pay =true
               // redirect to paypal where user approves the transaction 
              transaction.linkto = links[counter].href
              transaction.orderId = orderId
              transaction.paypalSuccess = true
              transaction.products = products
        
              userHelpers.changePaymentStatus(orderId).then(() => {
                console.log(transaction,'hello')
                res.json(transaction)
              })
               
                
            }
        }
      })
      .catch((err)=>{
        console.log(err);
      })
    }
    else{
      userHelpers.generateRazorpay(orderId,totalPrice,products).then((response)=>{
            res.json(response)
      })
    }
    })
  }
//  console.log(order.status,'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg');
 } catch{
    console.log(err.message);
     res.status(500).res.render('/404')
  }
  },
  orderSuccess:async(req,res)=>{

    let user = req.session.user
      res.render('users/ordersuccess',{user})
    
    
  },
  ViewOrder:async(req,res)=>{
    try{
    let user = req.session.user
   let order = await userHelpers.getAllOrder(req.session.user._id)
   order.forEach(order => {
    order.date = order.date.toString().substr(0, 17)
});
// let status =await userHelpers.getOrderStatus()
    res.render('users/orderList',{order,user:req.session.user})
    }
    catch{
      
      return res.status(500).json({message:"Something went wrong"})
    }
  },
  ViewOrderedProduct:async(req,res)=>{
    try{
    let user = req.session.user
    let products =await userHelpers.getOrderProducts(req.query.id)
    res.render('users/viewOrderProducts',{products,user})
    } catch{
      console.log(err.message);
      return res.status(500).json({message:"Something went wrong"})
    }
  },
  cancelProduct:(req,res,next)=>{
    try{

    
    console.log(req.body);
    userHelpers.deleteProductIn(req.body).then(async(response)=>{
       res.json(response)
     })
    }
    catch{
      console.log(err.message);
      return res.status(500).json({message:"Something went wrong"})
    }
    },
    verifyPayment:(req,res)=>{
      try{
      console.log(req.body);
      userHelpers.verifyPaymentIn(req.body).then(()=>{
        userHelpers.changePaymentStatus(req.body['order[receipt]',req.session.user._id]).then(()=>{
        
          userHelpers.decreaseStock(req.body.products).then(()=>{
            res.json({stockDecrease:true})
          })
        })
      }).catch((err)=>{
        console.log(err);
        res.json({status:false,errMsg:'Payment Failed'})
      })
    }
    catch{
      console.log(err.message);
      return res.status(500).json({message:"Something went wrong"})
    }
     },
    // otpLogin:(req,res)=>{
    //   res.render('users/otpLogin')
    // },
    // let :signupData=0,
    // confirmOtp:(req,res)=>{
    //   try{
    //   userHelpers.doOTP(req.body).then((response)=>{
    //     if(response.status){
    //       signupData=response.user;
    //       mobNumber=response.mob;
    //       console.log(signupData);
    //       // console.log(mobNumber);
    //       res.redirect('/confirmOtp')
    //     }
    //     else{
    //       res.redirect('/otpLogin')
    //     }
    //   })
    // }catch{
    //   console.log(error.message);
    //   return res.status(500).json({message:"Something went wrong"})
    // }
    // },
    // checkOtp:(req,res)=>{
    //   res.render('users/confirmOtp',)
    
    // },
    // postConfirmOtp:(req,res)=>{
    //   try{
    
    //   userHelpers.doOtpConfirm(req.body,signupData).then((response)=>{
    //     if(response.status){
          
    //       req.session.loggedIn=true;
          
    //       req.session.user = signupData;
    //       res.redirect('/')
    //     }
    //     else{
    //       res.redirect('/confirmOtp')
    //     }
    //   })
    // }catch{
    //   console.log(err.message);
    //   return res.status(500).json({message:"Something went wrong"})
    // }
    // },
    
    
    UserProfile:async(req,res)=>{
      try{
      let user = await userHelpers.getUserDetails(req.session.user._id)
      let order = await userHelpers.getAllOrder(req.session.user._id)
      order.forEach(order => {
        order.date = order.date.toString().substr(0, 17)
    });
      res.render('users/profile',{user,order})
    } catch{
      console.log(error.message);
      return res.status(500).json({message:"Something went wrong"})
    }
    },
    addAddress:async(req,res)=>{
      try{
      userHelpers.updateUser(req.params.id, req.body).then(() => {
        let id = req.params.id
        res.redirect('/userProfile')
    })
  } catch{
    console.log(error.message);
      return res.status(500).json({message:"Something went wrong"})
  }
    },
    editOrderAddress:async(req,res)=>{
      try{
      let user = await userHelpers.getUserDetails(req.session.user._id)
      console.log(req.query.id);
       let order = await userHelpers.getOrderDetails(req.query.id)
      console.log(order);
      res.render('users/editOrder',{user,order})
      }catch{
        console.log(error.message);
      return res.status(500).json({message:"Something went wrong"})
      }
    }
    ,
    editAddress:(req,res,next)=>{
      console.log(req.query.id);
      console.log(req.body);
      try{
      userHelpers. changeDeliveryaddress(req.query.id,req.body).then(()=>{
        res.redirect('/userProfile')
    })
  } catch{
    console.log(error.message);
      return res.status(500).json({message:"Something went wrong"})
  }
    },
    userEdit:async(req,res)=>{
      console.log(req.query.id)
      try{
      let user = await userHelpers.getUserDetails(req.query.id)
      console.log(user,'88888888888888888888888888888');
      res.render('users/editProfile',{user})
      }catch{
        console.log(error.message);
      return res.status(500).json({message:"Something went wrong"})
      }
    },
    profileEdit:(req,res,next)=>{
      try{
      userHelpers.changeUserProfile(req.params.id,req.body).then(()=>{
        res.redirect('/userProfile')
      })
    } catch{
      console.log(error.message);
      return res.status(500).json({message:"Something went wrong"})
    }
    },
    orderCancel:(req,res)=>{
      userHelpers.cancelOrders(req.query.id).then(()=>{
                  res.redirect('/viewOrders')
      })
    },
    form:(req,res)=>{
      res.render('users/Form')
    },
    fSubmit:(req,res)=>{
      console.log(req.body,"Ith form AADA");
      res.redirect('/')
    },
    postCouponApply:async(req,res)=>{
      let user=req.session.user._id;
      const date=new Date();
      let totalAmount= await userHelpers.getTotalAmount(user)
      let Total=totalAmount;
      console.log(Total,"Chukam");
  
      if(req.body.coupon == ''){
          res.json({noCoupon:true,Total})
      }
      else
      { 
          let couponres=await userHelpers.applyCoupon(req.body,user,date,totalAmount)
          if (couponres.verify) {
  
          let discountAmount=(totalAmount * parseInt(couponres.couponData.couponPercentage))/100;
          let amount = totalAmount - discountAmount
          couponres.discountAmount = Math.round(discountAmount)
          couponres.amount = Math.round(amount);
          couponres.percentage=Math.round(couponres.couponData.couponPercentage);
          console.log(couponres,"HIMONUTTA");
          res.json(couponres)
  
      }else{
          
          couponres.Total=totalAmount;

          res.json(couponres)
  
      }
      
      }
     
      
   }
   ,
   dCategory:(req,res)=>{
    let catId = req.query.id
    console.log(catId);
    
    userHelpers.getCategoryWiseProduct(catId).then(async(product)=>{
      let category =  await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)})
       console.log(category.category,'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg');
      console.log(product,'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn');
      res.render('users/categoryWiseProduct',{product,category})
    })
     
   },
   postStockDecrease:(req,res)=>{
    console.log(req.body.products,'pass from ajax check')
    userHelpers.decreaseStock(req.body.products).then(()=>{
      res.json({stockDecrease:true})
    })
    .catch(()=>{
      console('Connection timeout')
    })
  },
  wishList:async(req,res)=>{
    let user = req.session.user
     let cartCount =await userHelpers.getCartCount(req.session.user._id)
    let products =await userHelpers.getWishProducts(req.session.user._id)
    console.log(products,"DUNKIRIKKKKKKKKKKKKKKKKK");
    res.render('users/wishList',{products,user,cartCount})
  },
  removeWish:(req,res)=>{
    console.log(req.query.id,"Dumbalakka dumbalakka dumbalu dumbaleeee");
    userHelpers.removeWishProduct(req.query.id).then(()=>{
      res.redirect('/wishList')
    })
    
  },
  returnProduct:async(req,res)=>{
    let user = req.session.user;
    // let description = 'Order Returned'
    // await userHelpers.setWalletHistory(user,req.body,description);
    await userHelpers.returnOrderProduct(req.body,user).then((response)=>{
      res.json(response)
    })
  },
  setOrderedProductStatus:(req,res)=>{
    let status=req.body.status;
    let orderId=req.body.orderId;
    let productId=req.body.productId;
    userHelpers.setEachProductStatus(status,orderId,productId).then((response)=>{
        if(response){
            res.json({status:true})
        }else{
            res.json({status:false})
        }
    })
    console.log(status)
 }
  
  }





