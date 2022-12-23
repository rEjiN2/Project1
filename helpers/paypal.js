const paypal = require('paypal-rest-sdk')

paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AShW6idZCxYiPWqdoKOlED2Mvx6q0AWJ-0-BHWw9cKXBN1zsvbcFVEAMQADMtF85ibtlmOsgqDczn-8n',
    'client_secret': 'EBClmThCIDPDmojiPNoD3G1IBSBEJ_FckL_LCmd2kU4npdt98fm6p7PsDeEIt9LcyfjhdZ2OASR-WJ3I'
  });





  module.exports={

      createOrder : ( payment ) => {
        console.log("createOrder");
        return new Promise( ( resolve , reject ) => {
            paypal.payment.create( payment , function( err , payment ) {
              
             if ( err ) {
                 reject(err); 
             }
            else {
                resolve(payment); 
            }
            }); 
        });
    }		
  }