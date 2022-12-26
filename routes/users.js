var express = require('express');
const { loginpage,shop,signup,signin,wishList,setOrderedProductStatus,returnProduct,removeWish,goToWishList,signIn,postStockDecrease,loggedin,fSubmit,dCategory,postCouponApply,form,resendOTP,addAddress,userEdit,orderCancel,editOrderAddress,editAddress,postConfirmOtp,UserProfile,confirmOtp,checkOtp,logOut,pdetails,otpLogin,goToCart,cart,ChangeProductQuantity,checkoutuser,placeOrder,orderSuccess,ViewOrder,ViewOrderedProduct,cancelProduct,profileEdit,verifyPayment} = require('../controller/users');
var router = express.Router();
const verifyLogin=(req,res,next)=>{
    if(req.session.userLoggedIn){
     next();
    }
    else{
     res.redirect('/login');
    }
   }







/* GET home page. */
router.get('/', loginpage);
router.get('/shop',verifyLogin,shop)
router.get('/index',loginpage);
router.get('/login',signup);
router.get('/signup',signin)
router.post('/signup',signIn)
// router.get('/otpLogin',otpLogin)
router.post('/login',loggedin)
router.get('/logout',logOut)
router.get('/productdetails/',verifyLogin,pdetails)
router.get('/addToCart/:id',goToCart)
router.get('/addToWishLisT/:id',goToWishList)
router.get('/goCart',verifyLogin,cart)
router.post('/changeProductQuantity',ChangeProductQuantity);
router.get('/checkout/',checkoutuser);
router.post('/placeOrder',placeOrder);
router.get('/ordersuccess',verifyLogin,orderSuccess);
router.get('/viewOrders',verifyLogin,ViewOrder);
router.get('/viewOrderProducts',ViewOrderedProduct);
router.post('/deleteProduct',cancelProduct);
router.post('/verifyPayment',verifyPayment)
// router.post('/otpLogin',confirmOtp)
// router.get('/confirmOtp',checkOtp)
// router.post('/confirmOtpIn',postConfirmOtp)
router.get('/userProfile',verifyLogin,UserProfile);
router.post('/addAddress/:id',addAddress);
router.get('/editAddress/',verifyLogin,editOrderAddress)
router.post('/addressEditOrder/',editAddress)
router.get('/edit-user/',userEdit)
router.post('/profileEdit/:id',profileEdit)
router.get('/userCancelOrder',orderCancel)
// router.get('/resendOtp',resendOTP)
router.get('/form',form)
router.post('/submitIm',fSubmit)
router.post('/applyCoupon',postCouponApply)
router.get('/thisCategoryList/',dCategory)
router.post('/order-stock',postStockDecrease)
router.get('/wishList',wishList)
router.get('/removeWish/',removeWish)
router.post('/returnProduct',returnProduct)
router.post('/userOrderedProductsStatus',setOrderedProductStatus)










module.exports = router;
