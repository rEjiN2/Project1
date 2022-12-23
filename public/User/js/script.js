

function addToCart(proId){
    $.ajax({
     url:'/addToCart/'+proId,
     method:'get',
     success:(response)=>{
        if(response.status){
            let count =$('#cart-count').html()
            count = parseInt(count)+1
            $("#cart-count").html(count)
        }
     }
    })
 }

 function addToWishList(proId){
    $.ajax({
        url:'/addToWishLisT/'+proId,
        method:'get',
        success:(response)=>{
            let count = $('#wish-count').html()
            count = parseInt(count)+1
            $("#wish-count").html(count)
        }
    })
 }
 