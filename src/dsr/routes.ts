import express, { Request,Response } from 'express'
import { DsrModel } from './model.js'
import bcrypt from 'bcrypt'
import sendEmail from '../config/mail.js'
import DsrController from './controller.js'

const dsrRouter = express.Router()



dsrRouter.get('/q', (req,res)=>{
    res.json({'query':req.query})
})

dsrRouter.get('/', (req,res)=>{
    res.json({'type':'test'})
})

dsrRouter.post('/', DsrController.save)

dsrRouter.get('/search/:code/:password', DsrController.search)

dsrRouter.get('/resend-email/:accountId', DsrController.resendEmail)

export default dsrRouter