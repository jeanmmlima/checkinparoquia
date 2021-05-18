if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://user_prod:blogapp_prod@cluster0-74krl.mongodb.net/test?retryWrites=true&w=majority"}
} else {
    module.exports = {mongoURI: "mongodb://localhost/paroquiademacaiba"}
}