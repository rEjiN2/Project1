const productHelpers = require('../helpers/product-helpers');
var productHelper = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
var userHelper = require('../helpers/user-helpers');
const adminHelper = require('../helpers/admin-helpers');
const multer = require('multer')
var db = require('../config/connection')
const path = require('path')
const { response } = require('../app');
const { Db } = require('mongodb');
const collection = require('../config/collection');
const emailId = "rejin374@gmail.com"
const passwordId = "admin123"




module.exports = {
    adminSignup: (req, res) => {
        res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        let admin1 = req.session.admin
        if (admin1) {
            res.redirect('/admin/loginPage')
        }
        else {
            res.render('admin/adminlogin', { layout: 'loginLayout',admin1:false })
        }
        // res.render('admin/adminlogin', { layout: 'loginLayout'})
    },
    adminLogin: (req, res) => {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        const adminData = { email, password } = req.body;
        if (emailId === email && passwordId === password) {
            req.session.adminloggedIn = true;
            req.session.admin = adminData;
            res.redirect('/admin/loginPage')
        }
        else {
            res.render('admin/adminlogin', { layout: 'loginLayout' })
        }

    },
    loginPage: (req, res) => {
        userHelpers.getAllOrder().then(async(order)=>{
            let orderCount = await adminHelper.getOrderCount()
            let payLaterCount = await adminHelper.getPayLaterCount()
let codCount = await adminHelper.getCodCount()
let totalSale = await adminHelper.getTotalSale()
let payPalCount = await adminHelper.getPayCount()
let razorPayCount =await adminHelper.getRazorCount()
let userCount = await adminHelper.getUserCount()
 let todayEarnings = await adminHelper.getTodayEarnings()
  let todayOrder = await adminHelper.getTodayOrder()
  let productSold = await adminHelper.getProductSold()
  let date = new Date().toJSON().slice(0,10)
  console.log(todayOrder);
            res.render('admin/index', { layout: 'adminLayout',codCount,productSold,date,todayEarnings,razorPayCount,orderCount,payLaterCount,totalSale,payPalCount,userCount,todayOrder})
        })
       
    },
    dashBoard: (req, res) => {
        res.render('admin/index1')
    },
    productlist: (req, res) => {
        productHelpers.getAllProduct().then((product) => {
            res.render('admin/product-list', { layout: 'adminLayout', product })
        })
    },
    addUser: (req, res) => {
        res.render('admin/add-user', { layout: 'adminLayout' })
    },
    addProduct:async(req, res) => {
        let category = await userHelpers.getAllCategory()
        res.render('admin/add-product', { layout: 'adminLayout',category})
    },
    addUsers: (req, res) => {
        console.log("Hai hayyama");
        console.log(req.body);
        userHelpers.addUser(req.body, (result) => {
            res.redirect('/admin/userList');
        });

    },
    addCategoryIn:(req,res)=>{
        console.log(req.body);
        req.body.catImage1 = req.files.catImage1[0].filename
          productHelpers.addCategory(req.body).then((response)=>{
            if(response){
                    console.log('Category Already Iruk');
                    res.redirect('/admin/categoryList')
            }
            else{
                res.redirect('/admin/categoryList')
            }
          })
    },categoryList:(req,res)=>{
        productHelpers.getAllCategory().then((category) => {
            console.log(category);
            res.render('admin/category-list', { layout: 'adminLayout', category })
        })
    },



    addProducts: (req, res) => {
        
        let image = []
        req.files.forEach(function (value, index) {
          image.push(value.filename)
        })
        req.body.image = image
        req.body.stock= parseInt(req.body.stock);
        req.body.price =parseInt(req.body.price)
        productHelpers.addProducts(req.body, (id) => {
           
    res.redirect('/admin/productList');
        })

    },
    userlist: (req, res) => {
        userHelpers.getAllUser().then((user) => {
            res.render('admin/user-list', { layout: 'adminLayout', user })
        })

    },editCategory: async (req,res)=>{
let category = await productHelpers.getCategoryDetails(req.query.id)
res.render('admin/edit-category',{layout: 'adminLayout',category})

    }

    ,editProduct: async (req, res) => {
        let product = await productHelpers.getProductDetails(req.query.id)
        res.render('admin/edit-product', { layout: 'adminLayout', product })
    }

    , productUpdate:async(req, res) => {
        let id = req.query.id
        console.log(id);
        if(req.files.image==null){
            images = await adminHelper.fetchImg(id)
        } 
        else{
            let images = []
            req.files.forEach(function (value, index) {
              images.push(index + value.filename)
            })
        }
        req.body.image = images
        productHelpers.updateProduct(req.query.id, req.body).then(() => {
           
            res.redirect('/admin/productList')
            
        })
    }
    ,
    editCategoryIn:async (req,res)=>{
        let editId = req.params.id
       if(req.files.catImage1==null){
        CatImage1 = await adminHelper.fetchImage1(editId)
}
else{
CatImage1 = req.files.catImage1[0].filename
}
req.body.catImage1= CatImage1
productHelpers.EditCategory(req.params.id,req.body).then(()=>{
res.redirect('/admin/categoryList')
            
        })
    }
    ,
    addCategory:(req,res)=>{
res.render('admin/add-category',{ layout: 'adminLayout' })
    },

    blockUser: (req, res) => {
        let blockUserId = req.query.id
        adminHelper.updateUserStatus(blockUserId)
        res.redirect('/admin/userList')
    },
    UnBlockUser: (req, res) => {
        let unBlockUserId = req.query.id
        adminHelper.setUserStatus(unBlockUserId)
        res.redirect('/admin/userList')
    },
    deleteCategory:(req,res)=>{
        let catId=req.query.id;
        console.log(catId);
        console.log(req.query.category);
        productHelper.deleteCategoryIn(catId).then(()=>{
          res.redirect('/admin/categoryList')
        })
      },
      adminSignout:(req,res)=>{
        req.session.admin=null
        req.session.adminLoggedIn = false
        res.redirect('/admin')
      },
      orderList:(req,res)=>{
        adminHelper.getAlluserOrders().then((orderList)=>{
            console.log(orderList,'rfwfsfs');
            orderList.forEach(orderList => {
                orderList.date = orderList.date.toString().substr(0, 17)
            });
            res.render('admin/order', { layout: 'adminLayout',orderList })
         })
        
      },
      viewProduct:async(req,res)=>{
        let products=await adminHelper.getProductWiseOrders(req.query.id)
        res.render('admin/viewOrder',{layout:'adminLayout',products})
      }
      ,
      setPorductOrderStatus:(req,res,next)=>{
        let status=req.body.status;
        let orderId=req.body.orderId;
        let productId=req.body.productId
        console.log(status,orderId,productId);
        console.log('999999999999999999999999999999999999999999999999999')
        adminHelper.setDeliveryStatus(status,orderId,productId).then((response)=>{
           if(response){
              res.json({status:true})
           }
           else{
              res.json({status:false})
           }
        })
       
      },
      coupon:(req,res)=>{
        adminHelper.getAllCoupons().then((coupon)=>{
            console.log(coupon,"Hida Kutta");
            res.render('admin/coupon',{layout:'adminLayout',coupon})
        })
        

      },
      addCoupon:(req,res)=>{
        res.render('admin/addCoupon',{layout:'adminLayout'})
      },
      postCoupon:(req,res)=>{
        adminHelper.addCoupon(req.body).then(()=>{
            res.redirect('/admin/addCoupons')
        })
      }
      ,banner:(req,res)=>{

adminHelper.getBanner().then((banner)=>{
    res.render('admin/banners',{layout:'adminLayout',banner})
})
       
      }
      ,addBanner:(req,res)=>{
        res.render('admin/addBanner',{layout:'adminLayout'})

      }
      ,postBanner:(req,res)=>{
        console.log(req.body);
        req.body.image = req.files.bImage[0].filename
        adminHelper.addBanner(req.body).then(()=>{
            res.redirect('/admin/banners')
        })
            
        

      },
      salesReport:(req,res)=>{
        res.render('admin/salesReport',{layout:'adminLayout'})
      },

      AdminDailySalesReport:async(req,res)=>{
        day = req.body.day;
        todate = req.body.toDay;
        console.log(day,'fufuufufufu');
        console.log(todate,'jujujujuujjujjujjuuj');
        let dailySales = await adminHelper.getDailySalesReport(day,todate)
        res.render('admin/salesReport',{layout:'adminLayout',dailySales})
      },
      adminMonthlySalesReport:async(req,res)=>{
        let months = req.body.year+"-"+req.body.month
        console.log(months);
        let monthlySales=await adminHelper.getMonthlySalesReport(months);
        console.log(monthlySales)
        res.render('admin/salesReport',{layout:'adminLayout',monthlySales})
      }

}