const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    admin:{
        type: Number,
        default: 0
    },
    senha: {
        type: String,
        required: true
    },
    ativo:{
        type: Number,
        default: 1
    },
    token_senha:{
        type: String,
        default: 0
    },
    contato: {
        type: String,
        default: "90000-0000"
    }
})
mongoose.model("usuarios", Usuario)