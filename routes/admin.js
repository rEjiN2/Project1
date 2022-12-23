var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path')
const verifyAdmin=(req,res,next)=>{
  if(req.session.adminloggedIn){
   next();
  }
  else{
   res.redirect('/admin');
  }
 }



// Category Multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/cat-images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '- ' + Date.now() + path.extname(file.originalname))
    }
  })
  
  var uploadOne = multer({
    storage: storage
  })
  var multipleUpload = uploadOne.fields([{ name: 'catImage1'}])


  // Product Multer
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/pro-images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '- ' + Date.now() + path.extname(file.originalname))
    }
  })
  
  var uploadPro = multer({
    storage: storage
  })
  

  // Banner Multer
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/ban-images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '- ' + Date.now() + path.extname(file.originalname))
    }
  })
  
  var uploadBan = multer({
    storage: storage
  })
  var multipleBanUpload = uploadBan.fields([{ name: 'bImage'}])

const { adminSignup ,adminLogin,banner,AdminDailySalesReport,adminMonthlySalesReport,addBanner,salesReport ,postBanner, loginPage,coupon,postCoupon,addCoupon, adminSignout,setPorductOrderStatus,orderList,viewProduct ,dashBoard, productlist, addUser, addProduct, addUsers, addProducts, userlist, editProduct,productUpdate,blockUser,UnBlockUser,addCategory,addCategoryIn,categoryList,editCategory ,editCategoryIn,deleteCategory} =require('../controller/admin');

router.get('/',adminSignup);
router.post('/adminlogin',adminLogin);
router.get('/loginPage',verifyAdmin,loginPage);
router.get('/index1',verifyAdmin,dashBoard);
router.get('/index',verifyAdmin,loginPage);
router.get('/product-list',verifyAdmin,productlist);
router.get('/user-list',verifyAdmin,userlist);
router.get('/add-user',verifyAdmin,addUser);
router.get('/add-product',verifyAdmin,addProduct);
router.post('/add-user',addUsers);
router.post('/add-product',uploadPro.array('image') ,addProducts);
router.get('/userList',verifyAdmin,userlist);
router.get('/productList',verifyAdmin,productlist);
router.get('/edit-product/',verifyAdmin,editProduct);
router.post('/edit-product/',uploadPro.array('image'),productUpdate);
router.get('/add-category',verifyAdmin,addCategory);
router.post('/add-category',multipleUpload,addCategoryIn);
router.get('/edit-category/',verifyAdmin,editCategory);
router.post('/edit-category/:id',multipleUpload,editCategoryIn);
router.get('/categoryList',verifyAdmin,categoryList);
router.get('/blockUser',verifyAdmin,blockUser);
router.get('/unBlockUser',verifyAdmin,UnBlockUser);
router.get('/delete-category/',verifyAdmin,deleteCategory);
router.get('/orderListAdmin',verifyAdmin,orderList)
router.get('/adminSignout',adminSignout)
router.get('/viewOrder/',verifyAdmin,viewProduct)
router.post('/orderedProductStatus',setPorductOrderStatus)
router.get('/coupons',verifyAdmin,coupon)
router.get('/addCoupons',verifyAdmin,addCoupon)
router.post('/admin-addCoupon',postCoupon)
router.get('/banners',verifyAdmin,banner)
router.get('/addBanner',verifyAdmin,addBanner)
router.post('/admin-addBanner',multipleBanUpload,postBanner)
router.get('/salesReport',verifyAdmin,salesReport)
router.post('/admin-dailysales',AdminDailySalesReport)
router.post('/admin-monthlySales',adminMonthlySalesReport)
module.exports = router;
