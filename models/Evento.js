const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Evento = new Schema({
    data_horario: {
        type: Date,
        required: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    },
    descricao: {
        type: String,
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
    capacidade: {
        type: Number,
        default: 110
    },
    participantes: {
        type: Number,
        default: 0
    }
})

mongoose.model("eventos", Evento)