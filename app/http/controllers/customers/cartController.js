function cartController()
{
    return {
        index(req, res)
        {
            res.render('customers/cart');
        },
        update(req, res)
        {
            // console.log(req.session.cart);
            //If No cart is there, then please create one and attach it to req.session
            if(!req.session.cart)
            {
                //This is our Basic structure
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice: 0
                }
            }

            let cart = req.session.cart;
            // console.log(req.body._id);
            //Check if the item does not exist in the cart
            if(!cart.items[req.body._id])
            {
                cart.items[req.body._id] = {
                    item: req.body,
                    qty: 1
                }
                cart.totalQty = cart.totalQty + 1;
                cart.totalPrice = cart.totalPrice + req.body.price;
            }
            else
            {
                cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
                cart.totalQty = cart.totalQty + 1;
                cart.totalPrice = cart.totalPrice + req.body.price;
            }

            return res.json({ totalQty: req.session.cart.totalQty });
        }
    }
}

module.exports = cartController;