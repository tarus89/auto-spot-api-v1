import mongoose from 'mongoose'

const DsrSchema = new mongoose.Schema({
    code: String,
    password: String,
    accounId: String,
    shareFrom: Number,
    shareTo: Number,
    practionerEmails: Array<String>,
    expireOn: {
        type: Number,
        default: Date.now()
    }
  });

// type for model Dsr
 export class IDsr {
    _id?: Object
    code: string
    password: string
    accounId: string
    shareFrom: number
    shareTo: number
    practionerEmails: Array<String>
    expireOn: number
  }

export const DsrModel = mongoose.model('Dsr3',DsrSchema)