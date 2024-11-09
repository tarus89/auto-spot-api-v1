import { Request, Response } from "express";
import { IDsr, DsrModel } from "./model.js";
import bcrypt from "bcrypt";
import MailService, { sender, MailConfig, ISendEmail } from "../config/mail.js";

export default class DsrController {
  static search = async (req: Request, res: Response) => {
    const record = await DsrModel.findOne({ code: req.params.code });

    // const allRecords = DsrModel.find({})


    if (record) {
      const status = await bcrypt.compare(req.params.password, record.password);

      if (!status) {
        return res.status(404).json({});
      }
    }
    res.json(record);
  };

  static notifyPractioners(password: string, dsrRecord: IDsr) {
    let emails = dsrRecord.practionerEmails[0];
    emails = emails.replace(/[{'}]/g, ""); // Remove curly braces and single quotes
    const emailArray = emails.split(","); // Split by comma
    const accountId = dsrRecord.accounId || "No Account";

    for (var email of emailArray) {
      //request.headers.host
      let link = "http://localhost:8080/dsr/view/" + accountId;
    
      (new MailService()).sendEmail({
        recipientEmail:email,
        subject: "Patient DAR - " + accountId,
        message: "Hello\nUse the password below to authenticate the link: " +
          link +
          "\n\nPassword: " +
          password
      });
    }
  }

  static async generateRandomPassword() {
    const randomPass = Math.random().toString(36).slice(-8);
    let encryptedPass = await bcrypt.hash(randomPass, 10);
    console.log("Generated Password: ", randomPass);
    //return both encrypted password and the raw password

    return { password: randomPass, hashedPass: encryptedPass };
  }

  static save = async (req, res) => {
    const passRes = await DsrController.generateRandomPassword();
    const dsrRecord = new DsrModel({
      ...req.body,
      password: passRes.hashedPass,
    });
    await dsrRecord.save();
    console.log("========== Saved record ==============");
    console.log(dsrRecord);
    DsrController.notifyPractioners(passRes.password, dsrRecord as IDsr);
    console.log("Encryped Password: ", passRes.hashedPass);
    console.log("Plain Password: ", passRes.password);
    res.json({ type: dsrRecord });
  };

  static resendEmail = async (req: Request, res: Response) => {
    const accountId = req.params.accountId;
    const record = await DsrModel.findOne({ accounId: accountId });
    let resMessage = "Email sent successfully!"
    if(record){
        const passRes = await DsrController.generateRandomPassword();

        record.password = passRes.hashedPass
        await record.save()
        
        DsrController.notifyPractioners(passRes.password, record as IDsr);
    }else{
        resMessage = "Record not found!"
        console.log(resMessage)
    }
   
    res.json({ res: resMessage });
  };
}

// class MailService {
//   hash: string;

//   constructor() {
//     this.hash = "fgbgfgf";
//   }

//   async send(receiver, message) {}

//   send2 = async () => {};
// }
// new MailService().send("wrfd", "wfrg");
