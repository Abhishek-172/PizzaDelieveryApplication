const order = require("../../../models/order")

const Order = require('../../../models/order')

function orderController() {
    return {
        index(req, res) {

            //Hame Order Table mei se wahi saare order dedo jo ki completed nai hai, aur han jo bhi list db se fetch karke doge 
            //toh we also need it to be in a sorted order in descending way via createdAt aur we need to populate the entire data of the user,
            //aur y kaise hoga , via populate(), it will take the customerId and will populate everything inside of it,
            //aur apn ko kuch is tarah se data ko populate karna hai ki jo customerId ke andar jo password ho wo naa aaye,
            //aur fir finally usko karna hai run using exec(), ab is execu() ke andar recieve ho jaati hai ek function,
            //which consists of 2 parameters 1. err, 2. results



           order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 }}).populate('customerId', '-password').exec((err, orders) => {
                //If the request is AXIOS request then
                if(req.xhr) {
                   //Then return the JSON data back to the axios request
                   return res.json(orders)
               } else {
                //Ye neeche wali line is liye likh rakha hai kuoki agar koi banda direct browser par
                // /admin/orders likh de toh wo page dikh jaaye

                return res.render('admin/orders')
               }
           })
        }

    }
}

module.exports = orderController;