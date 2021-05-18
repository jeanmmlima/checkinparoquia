const express = require('express')
const handlebars = require('express-handlebars')
const bodyParsers = require('body-parser')
const app = express()
const cron = require('node-cron')
const shell = require('shelljs')
const utf8 = require('utf8')
var moment = require('moment')
require('moment/locale/pt-br')


const Handlebars = require('handlebars')

const path = require("path")

const mongoose = require('mongoose')
const db = require("./config/db")


const session = require("express-session")
const flash = require("connect-flash")

const passport = require("passport")
require("./config/auth")(passport)

const admin = require('./routes/admin')
const usuario = require('./routes/usuario')



//2.0 Settings
app.use(session({
    secret: "paroquiademacaiba",
    resave: true,
    saveUninitialized: true

}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use((req,res,next) => {
    //possível guardar variaveis globias
    //res.locals.nome = "Meu nome"
    //flash - sessao temporaria
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    //passport implementa user com dados do usuario autenticado
    res.locals.user = req.user || null
    next()
})

//2.1 Body Parsers
app.use(bodyParsers.urlencoded({extended: true}))
app.use(bodyParsers.json())

//2.2 Handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

//2.3 Mongoose
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI,{useUnifiedTopology: true, useNewUrlParser: true }).then(() => {
    console.log("Conectado ao mongo!")
}).catch((err) => {
    console.log("Erro ao se conectar: "+err)
})

//2.4  files - arquivos estaticos em public
app.use(express.static(path.join(__dirname,"public")))

app.use('/admin',admin)
app.use('/usuario',usuario)

app.get('/', function(req, res) {
    res.render("usuario/login")
})

app.get("/404", (req,res) => {
    res.send('Erro 404!')
})

Handlebars.registerHelper('tipo_usuario', function(admin){
    var tipo = ["Padrão", "Administrador"];
    return tipo[admin];

})


Handlebars.registerHelper('format_data', function(data){
    var fd = moment(data).format('DD/MM/YYYY HH:mm');
    return fd
})

Handlebars.registerHelper('getdata', function(data){
    var fd = moment(data).format('DD/MM/YYYY - dddd');
    return fd
})

Handlebars.registerHelper('gethorario', function(data){
    var fd = moment(data).format('HH:mm');
    return fd
})


Handlebars.registerHelper('getindex', function(index){
    return (index+1)
})

Handlebars.registerHelper('getvagas', function(capacidade, participantes){
    var vagas = capacidade - participantes;
    return vagas
})

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    
    switch (operator) {
        case 'equals':
            return (v1.equals(v2)) ? options.fn(this) : options.inverse(this);
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

/* 
Seconds: 0-59
Minutes: 0-59
Hours: 0-23
Day of Month: 1-31
Months: 0-11 (Jan-Dec)
Day of Week: 0-6 (Sun-Sat)

'01 01 00 * * *'
*/

cron.schedule("01 59 23 * * *", function() {
    console.log("---------------------");
    console.log("Running Cron Job");

    if (shell.exec("mongo --eval 'db.eventos.updateMany({data_horario: {$lt: ISODate()}},{$set: {ativo: 0}});' paroquiademacaiba").code !== 0) {
      shell.exit(1);
    }
    else{
      shell.echo("eventos atualizados!");
    }
    if (shell.exec("mongo --eval 'db.eventos.updateMany({data_horario: {$lt: ISODate()}},{$set: {ativo: 0}});' paroquiademacaiba").code !== 0) {
        shell.exit(1);
      }
      else{
        shell.echo("eventos atualizados!");
      }

   
  });

const PORT = process.env.PORT || 8081
app.listen(PORT,() => {
    console.log("Server is running!")
})