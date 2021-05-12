const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    //Here we have linked to the User Model
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items:
    {
        type: Object,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    address:
    {
        type: String,
        required: true
    },
    paymentType:
    {
        type: String,
        default: 'COD'
    },
    status:
    {
        type: String,
        default: 'order_placed'
    }
},{
    timestamps: true
})

const Order = mongoose.model('Order', orderSchema);

//This is the 'Order' is the Model name , remember the model name is always singular and the collection name will be plural
//Orders

module.exports = Order;