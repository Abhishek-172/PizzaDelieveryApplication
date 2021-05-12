const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

function init(passport)
{
    passport.use(new LocalStrategy({ usernameField: 'email'}, async (email, password, done) =>
    {
        //Login
        //Check if email exists
        const user = await User.findOne({ email: email });
        if(!user)
        {
            return done(null, false, { message: 'No user found with this email id' });
        }
        if(password!=user.password)
        {
            return done(null, user, { message: 'Logged in successfully' });
        }
        else
        {
            return done(null, user, { message: 'Invalid Username/Password' });
        }

    }))
    //Ye method kya karti hai na ki agar user login ho jata hai successfully toh hame session ke andar kuch toh store karna hai ,
    //normally ham user ki id ko store kar dete hai session ke andar, so passport basically gives us a chance like what to store
    // after getting logged in
    passport.serializeUser((user, done)=>{
        done(null, user._id)
    });  
    //Toh ab session ke andar kya store ho jayega?
    //user ki id


    //Ye neeche wala function kis liye kyoki jo data apn ne session ke andar store kiya hai usko apn ko get karna hai
    //toh is function mei apn ko pehla argument id recieve ho jayega aur doosra argument done recieve ho jayegaa done function
    passport.deserializeUser((id, done)=> 
    {
        User.findById(id, (err, user)=>
        {
            done(err, user);
        });
    });
    //Ab jab y deserialize ho jayega toh phir passport req object ke andar user object ko attach kardega
}


module.exports = init;
