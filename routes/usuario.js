const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')

const passport = require("passport")
const async = require("async")
const crypto = require('crypto')
const nodemailer = require("nodemailer")
const xoauth2 = require('xoauth2');
const bcrypt = require('bcryptjs')

const pdf = require("html-pdf");
const http = require('http');
const fs = require('fs');

const path = require('path')
var moment = require('moment')



require("../models/Usuario")
const Usuarios = mongoose.model("usuarios")

require("../models/Evento")
const EventoReligioso = mongoose.model("eventos")

require("../models/UsuarioEvento")
const UsuarioEvento = mongoose.model("usuarioeventos")

const {Admin} = require("../helper/Admin");
const {User} = require("../helper/User");

const { userInfo } = require("os")

router.get('/', (req, res) => {
    res.render("usuario/login")
})

router.get('/home', User, (req, res) => {
    EventoReligioso.find({ativo: 1}).sort("data_horario").then((eventos) => {
        res.render("home", {eventos: eventos})        
    }).catch((err) => {
        req.flash("error_msg", "Não conseguiu listar os eventos")
        res.redirect("/")
    })
})

router.post('/checkin/:id', User, (req, res) => {
    
    EventoReligioso.findOne({_id: req.params.id}).then((evento) => {
        if(evento.participantes < evento.capacidade){
            
            var participantes = evento.participantes + 1;
            evento.participantes = participantes;
            evento.save().then(() => {
                
                
                const novoUsuarioEvento = new UsuarioEvento({
                    usuario: req.user,
                    evento: evento,
                    numeracao: participantes
                    
                })
                novoUsuarioEvento.save().then(() => {
                    
                    req.flash("success_msg", "Check-in realizado com sucesso!")
                    res.redirect("/usuario/home")
                }).catch((err) => {
                    req.flash("error_msg", "Erro interno ao cadastrar usuário no evento escolhido")
                    res.redirect("/usuario/home")
                })
            }).catch((err) => {
                req.flash("error_msg", "Erro interno ao salvar número de participantes")
                res.redirect("/usuario/home")
            })

        } else {
            req.flash("error_msg", "Não há mais vagas para o evento escolhido")
            res.redirect("/usuario/home")
        }
    }).catch((err) => {
        req.flash("error_msg", "Não encontrou o evento escolhido")
        res.redirect("/usuario/home")
    })

})

router.get("/ticket/:id", User, (req, res) => {
    Usuarios.findOne({_id: req.params.id}).then((usuario) => {
        UsuarioEvento.find({usuario: usuario}).populate("evento").then((usereventos) => {
            res.render("usuario/tickets", {usereventos: usereventos, usuario: usuario});
        }).catch((err) => {
            req.flash("error_msg", "Erro ao listar eventos")
            res.redirect("/usuario/home")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro procurar usuário")
        res.redirect("/usuario/home")
    })
})

router.get("/ticket/download/:id", User, (req, res) => {
    UsuarioEvento.findOne({_id: req.params.id}).populate("evento").then((userevento) => {
        
        var horario = moment(userevento.evento.data_horario).format('HH:mm');
        var data = moment(userevento.evento.data_horario).format('DD/MM/YYYY - dddd');
        var id = moment(userevento.data_criacao).format('ss HH MM mm SSSSS DD');
        var agora = Date.now();
        agora = moment(agora).format('DD/MM/YYYY - HH:mm');


        var senha = `
        <div style="padding: 140px 0;">
        <div style="text-align: center; border: 3px solid #0099FF">
        <h2>Arquidiocese de Natal</h2>    
        <h2>Paróquia Nossa da Conceição</h2>
        <h2>Macaíba/RN</h2>
        <hr>
        <h1>Senha<h1>
        <h2>Nº: <b>${userevento.numeracao}</b><h2>
        <h2>Evento: <b>${userevento.evento.descricao}</b></h2>
        <h2>Data: <b>${data}</b></h2> <h2>Horário: <b>${horario}<b></h2>
        <h1>Nome: ${req.user.nome} </h1>
        <small>ID: ${id}</small>
        <br>
        <h6 style="text-align: right; margin: 2px 2px 2px 2px;">${agora}</h6>
        <br>
        </div>
        </div>
        `



        var filepdf = "senha"+req.user.id+".pdf";
        pdf.create(senha,{}).toFile(
            "./public/files/"+filepdf, (err, resp) => {
                if(err){
                    console.log("erro: "+err);
                    req.flash("error_msg", "Erro gerar senha")
                    res.redirect("/usuario/home")
                } else {
                    //let filename = "senha"+req.user.id+".pdf";
                    //let nome = "Senha_"+req.user.nome;
                    //let absPath = path.join(__dirname, '/public/files', filename);
                    //let relPath = path.join('/files/', filename);

                    console.log(resp);
                    const file = `${__dirname}/../public/files/${filepdf}`;
                    //res.download(file, "senha.pdf");  
                    res.download(file, "senha.pdf", (err) => {
                        if (err) {
                          console.log(err);
                        }
                        fs.unlink("./public/files/"+filepdf, (err) => {
                          if (err) {
                            console.log(err);
                          }
                          console.log('FILE REMOVED!');
                        });
                      });
                }
            }
        )
        

        
       
       
       

    }).catch((err) =>  {
        console.log(err);
        req.flash("error_msg", "Erro procurar evento")
        res.redirect("/usuario/home")
    })
})


router.post("/login", (req, res, next) => {
    
    passport.authenticate('local', {

        successRedirect: "/usuario/home",
        failureRedirect: "/usuario/",
        passReqToCallback: true,
        failureFlash: true
    })(req, res,next)
 
})

router.get("/logout", (req,res) => {
    req.logout()
    req.flash("sucess_msg", "Deslogado com sucesso")
    res.redirect("/")
})

router.get("/registro", (req, res) => {
    res.render("usuario/registro")
})

router.post("/registro/novo", (req, res) => {

    if(req.body.senha.toString().length < 4){
        req.flash("error_msg", "Senha deve conter mínimo de 4 caracteres")
        res.redirect("/usuario/registro")
    }
    else if(req.body.senha != req.body.senha2){
        req.flash("error_msg", "Senha diferentes")
        res.redirect("/usuario/registro")
    }
    else {

        Usuarios.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Já existe uma conta com esse email no sistema")
                res.redirect("/usuario/registro")
            } else {
                const novoUsuario = new Usuarios({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    admin: 0,
                    contato: req.body.contato
                })
                bcrypt.genSalt(10,(erro,salt) => {
                    bcrypt.hash(novoUsuario.senha,salt,(erro,hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve erro durante salvamento o usuario!")
                            req.redirect("/")
                        } else {
                            novoUsuario.senha = hash
                            novoUsuario.save().then(() => {
                                req.flash("success_msg", "Usuário criado com sucesso!")
                                res.redirect("/")
                            }).catch((erro) => {
                                req.flash("error_msg", "Erro ao criar usuário")
                                res.redirect("/")
                            })
                        }
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro interno ao procurar usuario")
            res.redirect("/")
        })

    }

})

module.exports = router