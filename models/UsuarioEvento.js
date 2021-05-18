const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UsuarioEvento = new Schema({
    
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    },
    evento: {
        type: Schema.Types.ObjectId,
        ref: "eventos",
        required: true
    },
    ativo:{
        type: Number,
        default: 1
    },
    data_criacao: {
        type: Date,
        default: Date.now()
    },
    numeracao: {
        type: Number,
        default: 0
    }
})

mongoose.model("usuarioeventos", UsuarioEvento)