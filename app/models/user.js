const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true
    },
    password:
    {
        type: Number,
        required: true
    },
    role:
    {
        type: String,
        default: "customer"
    }
},{
    timestamps: true
})

const User = mongoose.model('User', userSchema);

//This is the 'User' is the Model name , remember the model name is always singular and the collection name will be plural
//Users

module.exports = User;