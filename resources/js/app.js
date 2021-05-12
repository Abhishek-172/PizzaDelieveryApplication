import axios from 'axios'
import Noty from 'noty'
import { initAdmin } from './admin'
import moment from 'moment';


let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

function updateCart(pizza) {
    axios.post('/update-cart', pizza).then(res => {
        // console.log(res);
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'Item added to cart',
            progressBar: false,
        }).show();
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 1000,
            text: 'Something went wrong',
            progressBar: false,
        }).show();
    })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let pizza = JSON.parse(btn.dataset.pizza)
        console.log("This is my Pizza--->", pizza);
        updateCart(pizza)
    })
})

// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}

initAdmin();


//Now we want that single order ID from SingleOrder Page.
//So we will create a function named updateStatus()
//Ab yahan par hame ye order kahan se milega?
//Kuoki ye order ID toh abhi apne singleOrder.ejs par hai
//Toh us page se apn ko ye data // orderID wala yahan laana hai app.js mei
//What we gonna do?
//<input id="hiddenInput" type="hidden" value="<%= order %>">
//Ab ye apn jo order pass kar re hai it is an object, now inside the value we cannot pass an object,
//so we need to convert an object to an JSON string and then we will pass it.
//<input id="hiddenInput" type="hidden" value="<%= JSON.stringify(order) %>">
//Now lets access this id ="hiddenInput" over here in this file aur phir is id ki value ko apn get karlenge

let statuses = document.querySelectorAll('.status_line');
let hiddenInput = document.querySelector('#hiddenInput');
let order = hiddenInput ? hiddenInput.value : null; 

//Using the ternary operator here, agar hiddenInput hai toh give its value else give null value
// console.log(order);

//Browser ke console par hamko y data mil raha hai...


// {"paymentType":"COD","status":"order_placed","_id":"607458e3fa926436a65b3577",
// "customerId":"60729a1d70dd0f18947b945d","items":{"5eee6671a27a66807cf2bea3":{"item"
// :{"_id":"5eee6671a27a66807cf2bea3","name":"Marinara","image":"pizza.png","price":300,
// "size":"medium"},"qty":3}},"phone":9425895923,"address":"ksp","createdAt":"2021-04-12T14:27:47.174Z",
// "updatedAt":"2021-04-12T14:27:47.174Z","__v":0}

//Now problem is here that this data is in JSON format String
//Now again we need to parse this JSON String into an object

order = JSON.parse(order);
console.log(order); // We will get the order object parsed data
console.log(statuses); // We will get all the list of statuses


//Lets add time as well in our this page
//Matlb is page par apn ne javascript ke madad se ek <small></small> tag bana diya hai
let time = document.createElement('small');

//Change Order Status

function updateStatus(order)
{
    statuses.forEach((status)=>
    {
        status.classList.remove('step-completed');
        status.classList.remove('current');
    })
    let stepCompleted = true;
    statuses.forEach((status)=>
    {
        //Ye local variable k andar apn ko milgya kya?
        //Poora element
        //<li class="status_line text-sm md:text-xl pb-16" data-status="order_placed"><span>Order Placed</span></li>
        
        let dataProp = status.dataset.status;
        
        if(stepCompleted)
        {
            //Agar stepComplete true hai toh add a new class to that specific element named step-completed
            status.classList.add('step-completed');
        }
        //Agar us element ke andar jo data attribute ki value hai if it is same as order object ke status se
        if(dataProp === order.status)
        {
            stepCompleted = false;
            time.innerText = moment(order.updateAt).format('hh:mm A');
            //time ke innerText mei jab order db mei update hua wo insert kardo
            //aur is specific element ke andar time k andar jo tag h append kardo
            status.appendChild(time);
            if(status.nextElementSibling)
            {
                status.nextElementSibling.classList.add('current');
            }
        }
    });
}

updateStatus(order);


//Socket
//Now we need a socket to be used in client end, so we will use the same in the layout.ejs file
//This----->>>> <script src="/socket.io/socket.io"></script>
//It is the same library that we have installed in our project
//Ab wo library apn ne layout.ejs mei use karli hai toh the variable would be accessible here, named io

let socket = io();

//Ye io() ek function hai jise apn ne call kiya hai, now this socket object have all the useful methods.

//Join
if(order)
{
    socket.emit('join', `order_${order._id}`);
}


//Now whatever the orders we have recieved in the admin page
//should not be coming after a hard refresh as we are using socket 
//so it should be real-time , bina refresh kare aajaye
//Steps:
//1. Check whether you are in the admin page or not?
let adminAreaPath = window.location.pathname //Will give us URL

//2. If we are in admin page then emit a event
if(adminAreaPath.includes('admin'))
{
    socket.emit('join', 'adminRoom');
}

socket.on('orderUpdated', (data)=>
{
    const updatedOrder = { ...order };
    updatedOrder.updateAt = moment().format();
    updatedOrder.status = data.status;
    updateStatus(updatedOrder);
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order Updated',
        progressBar: false,
    }).show();
});


//What this above line will do?
//Jab apna singleOrder page load hoga na tab 
//Ye socket server pr ek message bhejega named join aur uske andar ye wala data jayega `order_${order._id}`
//How this data would look like?
//order_12345667892346876324, aur yahi apn naam denge apne room ko the private room
//Toh ab jitne bhi room banenge saare unique banenge

