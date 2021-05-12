const Order = require('../../../models/order');
const moment = require('moment');
function orderController()
{
    return {
        store(req, res)
        {
            // console.log(req.body);
            //Now whatever the data we are recieving in req.body, we will put it inside a DB,
            //So we need to create a model for it and then we will create a schema inside it, accordingly
            //and later we will put our DB from here req.body mei se collection ke andar
            const { phone, address } = req.body;
            if(!phone || !address)
            {
                req.flash('error', 'All fields are required');
                return res.redirect('/cart');
            }
            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address: address
            })
            order.save().then(result=>{
                Order.populate(result, { path: 'customerId' }, (err, placedOrder)=>
                {
                    req.flash('success', 'Order Placed Successfully');
                    delete req.session.cart;
    
                   //Emit Event
                    const eventEmitter = req.app.get('eventEmitter');
                    //Here Below we have emitted the event named orderUpdated and passed some data 
                    eventEmitter.emit('orderPlaced', placedOrder);
    
                    return res.redirect('/customer/orders');
                })
            }).catch(err=>{
                req.flash('error', 'Something went wrong!');
                return res.redirect('/cart');
            })
        },
        async index(req, res)
        {
            //We want,ki logged in user bas is par aa paye toh we need a new middleware in between of this route
            //we will create one ::: middlewares/auth.js

            const orders = await Order.find({ customerId: req.user._id }, null, { sort: { 'createdAt': -1 } });
            // console.log(orders);

            //Sending data to be processed and consumed at the frontend
            //1st argument hai apna orders.ejs file
            //Aur 2nd argument mei apn ne orders variable ke andar saara orders fetch kia hua
            //bhej diya hai 


            //Ho sakta hai apn ne order place kiya aur us page par pohoche and we find out 
            //ki green wala signal 'order placed successfully', shows up there....
            //And we go back and come back to the same page...
            //We do not want that green wala signal to come back
            //So we will set an Header over here

            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

            res.render('customers/orders.ejs', { orders: orders, moment: moment })
            //Yahan par apn ne library bhej di frontend par moment ek key mei daalkr
        },
        async show(req, res)
        {
            // ye jo id hai wo req.params mei aari hai toh wahan se fetch karenge
            //ye jo .id hai na it should be same as .id in route / web.js mei
            //agar _id hota toh wahan par bhi _id hi hota
            const order = await Order.findById(req.params.id); 
            
            //Authorize User 
            //Matlb we want ki wahi user ho jiska order ho aur koi user aakr na dekhe 

            // if(req.user._id === order.customerId)
            //THe above line is a wrong way to compare the id , because both of them are the ObjectId's
            //something like a object and we cannot compare two objects like the above....

            //So How we can compare it?
            //Convert them to a String and then compare it

            if(req.user._id.toString() === order.customerId.toString())
            {
                res.render('customers/singleOrder', { order: order });
            }
            else
            {
                res.redirect('/');
            }
        }
    }
}   

module.exports = orderController;