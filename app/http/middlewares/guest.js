const passport = require("passport")

function guest(req, res, next)
{
    // This req.isAuthenticated is available because of passport.js
    // And what it is doing, it is checking whether the request is authenticated or not?
    // If not then let the user login
    if(!req.isAuthenticated())
    {
        return next();
    }
    //If yes,then redirect the user to home page
    return res.redirect('/');
}


//Now this guest middleware should be applied to the login routes,
//Aur login route par konse user jaane chahiye , jo authenticated na ho

module.exports = guest;