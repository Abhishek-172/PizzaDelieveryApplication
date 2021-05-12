require('dotenv').config();
const express = require('express');
const app = express();  //Express will provide all functionality to the app object
const ejs = require('ejs');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const PORT = process.env.PORT || 3500;
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoDBStore = require('connect-mongo')(session);
const passport = require('passport');
const Emitter = require('events');

//DataBase Connection
const url = 'mongodb://localhost:27017/pizza';
mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database Connected...');
}).catch(err => {
    console.log('Connection Failed...');
});


//Session Store

let mongoStore = new MongoDBStore({
    mongooseConnection: connection,
    collection: 'sessions'
})

//Event Emitter

//This emitter we will be using in the app/http/controllers ke andar jo statusController hai 
//Wahan use karna hai and we will be using the same name eventEmitter in statusController
//else, it will not work

const eventEmitter = new Emitter();

//Now we will bind it with our app, the express app
//Us se kya hoga phir apn is eventEmitter ko kahin par bhi use kar payenge aasani se


app.set('eventEmitter', eventEmitter);



//Session Configuration
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))

//Passport Configuration

// step-01 Setting up a passport
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
// step-02 
app.use(passport.session());  //Because Passport uses session, toh wo part bhi initialize kar diya apn ne
// Step-03 //To write a local-strategy code, yahan nai likhenge we will create a seperate conf file for it 



// If user is logged in then he should not be able to visit the login and register page.
//For this to happen,
//lets go to the app/http/middlewares
//And create a new file (new middleware)
// guest.js 



app.use(flash());

//Assets
app.use(express.static('public'));

//For reading JSON data under request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Global Middleware
app.use((req, res, next)=>
{
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
})

//Set Template Engine
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');


require('./routes/web')(app);
app.use((req, res)=>
{
    res.status(404).render('errors/404');  
})

const server = app.listen(PORT, ()=>
{
    console.log("Listening on port", PORT);
})


//SOCKET.io
const io = require('socket.io')(server);
io.on('connection', (socket)=>
{
    // console.log(socket.id);
    //Jo event wahan app.js se emit kiya tha wo yahan par apn recieve karenge
    socket.on('join', (RoomName)=>
    {
//         //Here we have recieved the Roomname - order.<order_id>
//         // console.log(RoomName);
//         //Y wala aur upar wala join alag alag hai
        socket.join(RoomName);
    })
})


//Now here we have catched the event that is emitted from the statusController.js file named orderUpdated 

eventEmitter.on('orderUpdated', (data)=>
{
    //Ab ye jo socket se room create hua tha apna ab us specific room mei apn
    //data send karenge, toh ab y event jo apn ne emit kiya we will listen it in the
    //app.js file
    io.to(`order_${data.id}`).emit('orderUpdated', data);
});

eventEmitter.on('orderPlaced', (data)=>
{
    io.to('adminRoom').emit('orderPlaced', data);
});

//io pe ek function call karre apn named on, and it is listening on 
//connection, ab jaise hi connection ho jata hai we need to give a 
//callback, 
//What we gonna do inside an callback?
//The moment, client is connected, we are currently talking abt a browser,
//If we were building a mobile application than client would be a mobile
// We need to join the client to an "Private Room", now we need to add a room for each and every new order,
//Ab us room ka naam unique hona chahiye, we will give the room name as a "OrderID",
//Toh ab OrderID yahan par kaise milegi?, Its easy we need to go to the Client Side (app.js) file
//and work on the socket.io part the client side