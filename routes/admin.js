const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')

const passport = require("passport")
const bcrypt = require('bcryptjs')
const getData = require("../helper/getData")

require("../models/Usuario")
const Usuarios = mongoose.model("usuarios")

require("../models/Evento")
const EventoReligioso = mongoose.model("eventos")

require("../models/UsuarioEvento")
const UsuarioEvento = mongoose.model("usuarioeventos")

const {Admin} = require("../helper/Admin");

router.get('/', Admin, (req, res) => {
    res.render("admin/index")
})

router.get("/usuarios", Admin, (req, res) => {
    Usuarios.find().then((usuarios) => {
        res.render("admin/usuarios", {usuarios: usuarios});
    }).catch((err) => {
        req.flash("error_msg", "Houve erro ao listar usuarios!")
        res.redirect("/admin")
    }) 
})

router.get("/usuarios/add", Admin, (req, res) => {
    res.render("admin/addusuario");
})

router.post("/usuarios/novo", (req, res) => {

    if(req.body.senha.toString().length < 4){
        req.flash("error_msg", "Senha deve conter mínimo de 4 caracteres")
        res.redirect("/admin/usuarios/add")
    }
    else if(req.body.senha != req.body.senha2){
        req.flash("error_msg", "Senha diferentes")
        res.redirect("/admin/usuarios/add")
    }
    else {

        Usuarios.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Já existe uma conta com esse email no sistema")
                res.redirect("/admin/usuarios/add")
            } else {
                const novoUsuario = new Usuarios({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    admin: req.body.admin,
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
                                res.redirect("/admin/usuarios")
                            }).catch((erro) => {
                                req.flash("error_msg", "Erro ao criar usuário")
                                res.redirect("/admin/usuarios/ædd")
                            })
                        }
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro interno ao procurar usuario")
            res.redirect("/admin")
        })

    }

})

router.post("/usuarios/deletar/:id", Admin, (req, res) => {
    Usuarios.deleteOne({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Usuário excluído com sucesso!")
        res.redirect("/admin/usuarios")
    }).catch((err) => {
        req.flash("error_msg", "Erro interno ao excluir usuário!")
        res.redirect("/admin/usuarios")
    })
})

router.get("/eventos", Admin, (req, res) => {
    EventoReligioso.find({ativo: 1}).sort("data_horario").then((eventos) => {
        res.render("admin/eventos", {eventos: eventos})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar eventos!")
        res.redirect("/admin/eventos")
    })
})

router.get("/eventos/add", Admin, (req, res) => {
    var horas = [];
    var i;
    for(i = 0; i < 24; i++){
        horas[i] = {valor: i};
    }
    var minutos = [];
    minutos[0] = {valor: 0};
    minutos[1] = {valor: 15};
    minutos[2] = {valor: 30};
    minutos[3] = {valor: 45};

    Usuarios.find().then((usuarios) => {
        res.render("admin/addevento", {usuarios: usuarios, horas: horas, minutos: minutos})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar usuarios!")
        res.redirect("/admin/eventos")
    })
})

router.post("/eventos/novo", Admin, (req, res) => {

    const d = getData(
        req.body.data, 
        req.body.horas, 
        req.body.minutos);

    const novoEvento = new EventoReligioso({
        usuario: req.body.usuario,
        descricao: req.body.descricao,
        capacidade: req.body.capacidade,
        data_horario: d
    })

    novoEvento.save().then(() => {
        req.flash("success_msg", "Evento cadastrado com sucesso!")
        res.redirect("/admin/eventos")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao cadastrar evento")
        res.redirect("/admin/eventos/ædd")
    })

})

router.get("/eventos/participantes/:id", Admin, (req, res) => {
    UsuarioEvento.find({evento: req.params.id})
    .populate("evento")
    .populate("usuario").then((usuariosevento) => {
        const data = usuariosevento[0].evento.data_horario;
        const descricao = usuariosevento[0].evento.descricao;
        res.render("admin/participantes", {usuariosevento: usuariosevento, data: data, descricao: descricao})
    }).catch((err) => {
        req.flash("error_msg", "Erro interno ao listar evento!")
        res.redirect("/admin/eventos")
    })
})

router.post("/eventos/deletar/:id", Admin, (req, res) => {
    EventoReligioso.deleteOne({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Evento excluído com sucesso!")
        res.redirect("/admin/eventos")
    }).catch((err) => {
        req.flash("error_msg", "Erro interno ao excluir evento!")
        res.redirect("/admin/eventos")
    })
})

module.exports = router