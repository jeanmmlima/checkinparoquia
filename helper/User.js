module.exports = {
    User: function(req,res,next){

        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error_msg", "Acesso restrito a usuários logados!")
        res.redirect("/")

    }
}