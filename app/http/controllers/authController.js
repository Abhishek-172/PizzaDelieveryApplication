const passport = require('passport');
const User = require('../../models/user');


function authController()
{

    function _getRedirectedUrl(req)
    {
        //Agar user ka role 'admin' hai toh 1 wala condition route nai toh 2 wala

        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders';
    }

    return {
        login(req, res)
        {
            res.render('auth/login');
        },
        postlogin(req, res, next)
        {

            //First we need to validate our data
            const { email, password } = req.body;
            if(!email || !password)
            {
                req.flash('error','All fields are required');
                return res.redirect('/login');  
            }


            //Ye second argument apna done() function hi hai, jo apn ne passport ke conf file me define kia tha
            //return done(null, user, { message: 'Logged in successfully' });, yahan info object hai jispr apn ne message key call kardi
            passport.authenticate('local', (err, user, info)=>
            {   
                if(err)
                {
                    req.flash('error', info.message);
                    return next(err);
                }
                if(!user)
                {
                    req.flash('error', info.message);
                    return res.redirect('/login');
                }
                if(user)
                {
                    req.logIn(user, (err)=>
                    {   
                        if(err)
                        {
                            req.flash('error', info.message);
                            return next(err);
                        }

                        //Here in return we are calling a private function 
                        //named _getRedirectedUrl() and we will pass a req to it.
                        //then in that function we will check whether the req.role 
                        //is 'customer' or 'admin' and we will route it accordingly

                        return res.redirect(_getRedirectedUrl(req));
                    });
                }

                //This passport.authenticate will return a function jise hame call karna hai,
                //This is How passport works! and will pass req, res and next

            })(req, res, next);
        },
        register(req, res)
        {
            res.render('auth/register');
        },
        async postRegister(req, res)
        {
            //Writing a Logic For Handling The Data Coming from Register Page
            
            const { name, email, password } = req.body;
            // console.log(req.body);
            //So now as we are recieving a user data, and currently we do not have a collection according to user
            //Lets create a new model for the user and define a new collection inside it

            //Lets Validate our request
            
            if(!name || !email || !password)
            {
                req.flash('name', name);
                req.flash('email', email);
                req.flash('error', 'All fields are required');
                return res.redirect('/register');    
                //Now we want to show message on the front end field like the 'Entry is Mandantory'
                //So we will send the message in session and will use the library called 
                //app.use(flash());
                //iska syntax mei apn key-value pair bhej re
                //Toh yahan flash mei bheja gaya message front-end par accessible rehta hai
                //wahan frontend par ek object recieve hota hai named "messages", aur uske andar yahan bheji wali key hoti hai
                //Jise access kiya ja sakta hai

                //Now we want to ki yr jab user koi ek aad field khali chod ke form submit kar raha toh in that case,
                // poore form ka data vanish na ho 
                //We want Jo entry use ne dali thi kab se kam page redirect hone ke baad bhi wo sab hona chahiye.
                //In that case
                // We will again use the req.flash for it go above and add it.
                //Now in front end when we recieve this data in messages.name, messages.email toh we need to display the same data value
                //inside the input tag 
                //How it can be done?
                //Using value-attribute
                //Like this value="<%= messages.name %>"
            }
            //Now we need to check one more thing that the email should be unique ,
            //Now to check that we need to check that the email that is being provided by the user jo rahega req.body ke andar,
            //already present inside our Database or not

            //Check email exists?

            User.exists({ email: email }, (err, result)=>
            {
                if(result)
                {
                    req.flash('error', 'Email already Taken');
                    req.flash('name', name);
                    req.flash('email', email);
                    return res.redirect('/register');
                }
            });

            //Hash Password
            //We are using a package called bcrypt
            //Import bcrypt here in this file
            

            //Create a User
            //We are using a model here
            const user = new User({
                name: name,
                email: email,
                // password: password

//Note:
//Remember one thing that, never, never in ur entire life kabhi bhi is tareeke se Database me password aise store mat karna
//First Hash / Encrypt the password then store it in the database
                password: password
            })
            user.save().then((user) => 
            {
                return res.redirect('/');
            }).catch(err => {
                req.flash('error', "Something went wrong!");
                console.log(err);
                return res.redirect('/register');
            })            

        },
        logout(req, res)
        {
            req.logout();
            return res.redirect('/login');
        }
    }
}

module.exports = authController;