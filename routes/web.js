const homeController = require('../app/http/controllers/homeController');
const authController = require('../app/http/controllers/authController');
const cartController = require('../app/http/controllers/customers/cartController');
const guest = require('../app/http/middlewares/guest');
const auth  = require('../app/http/middlewares/auth');
const admin = require('../app/http/middlewares/admin');
const orderController = require('../app/http/controllers/customers/orderController');
const adminOrderController = require('../app/http/controllers/admin/orderController');
const statusController = require('../app/http/controllers/admin/statusController');
function initRoutes(app)
{
    //For Showing Index Page
    app.get('/', homeController().index);
    //For showing Login Page
    app.get('/login', guest, authController().login);           //guest is used here
    //For Post a Data that we have filled in login page
    app.post('/login', authController().postlogin);
    //For Showing register Page
    app.get('/register', guest, authController().register);     //guest is used here
    //For Post a Data that we have filled in register page
    app.post('/register', authController().postRegister);
    //For Showing cart Page
    app.get('/cart', cartController().index);
    //For Updating a Cart and handling axios request
    app.post('/update-cart', cartController().update);
    //For Logout
    app.post('/logout', authController().logout);
    


    //Customer Routes
    //For Orders
    app.post('/orders', auth, orderController().store);
    app.get('/customer/orders', auth, orderController().index);
    app.get('/customer/orders/:id', auth, orderController().show);


    //Admin Routes
    app.get('/admin/orders', admin, adminOrderController().index);
    app.post('/admin/order/status', admin, statusController().update);
}
module.exports = initRoutes;