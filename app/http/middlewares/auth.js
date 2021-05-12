function auth(req, res, next)
{
    if(req.isAuthenticated())   //Passport ke andar ka Function hai isAuthenticated()
    {
        return next();
    }
    return res.redirect('/login');
}

module.exports = auth;