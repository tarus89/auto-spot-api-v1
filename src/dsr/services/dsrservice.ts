import bcrypt from "bcrypt";
import { sendMail } from "../../config/mail.js";
import Dsr, { DeadlineResponseType } from "../types.js";
import RedisService from "./redisservice.js";

export default class DsrService {
  // generates a random password and returns both hashed and the raw passwords
  static async generateRandomPassword(): Promise<{
    password: string;
    hashedPass: string;
  }> {
    const randomPass = Math.random().toString(36).slice(-8);
    let encryptedPass = await bcrypt.hash(randomPass, 10);

    //return both encrypted password and the raw password
    return { password: randomPass, hashedPass: encryptedPass };
  }

  //sends alert to practioners with the generated password and website link
  static async notifyPractioners(
    password: string,
    dsrRecord: Dsr
  ): Promise<void> {
    let emails = dsrRecord.practionerEmails[0];
    emails = emails.replace(/[{'}]/g, ""); // Remove curly braces and single quotes
    const emailArray = emails.split(","); // Split by comma
    const accountId = dsrRecord.accounId || "No Account";

    for (var email of emailArray) {
      //request.headers.host
      let link = "http://localhost:8080/dsr/view/" + accountId;

      sendMail({
        recipientEmail: email,
        subject: "Patient DAR - " + accountId,
        message:
          "Hello\nUse the password below to authenticate the link: " +
          link +
          "\n\nPassword: " +
          password,
      });
    }
  }

  //check if time is greater than 40 mins from now
  static async isWithinDeadlineTime(
    expireOn: number,
    lapseTimeInMinutes = 40
  ): Promise<DeadlineResponseType> {
    const currentTime = Date.now(); // Current time in milliseconds
    const lapseTimeInMillis = lapseTimeInMinutes * 60 * 1000; // lapseTime minutes in milliseconds
    const deadline = currentTime + lapseTimeInMillis;
    let state = currentTime > expireOn ? false : true;

    let message = "Expire on is already past!";
    if (state) {
      state = expireOn > deadline ? false : true;
      if (state == false) {
        message = "Expiry time exceeds the maximum allowed time! in 40 mins";
      }
    }

    return {
      state: state,
      message: message,
    };
  }

  // cache record  into redis
  static async cacheDsrDataByCode(dsrRecord: Dsr): Promise<void> {
    try {
      const cachePeriodInSeconds = Math.floor(
        (dsrRecord.expireOn - Date.now()) / 1000
      );

      await RedisService.client.set(dsrRecord.code, JSON.stringify(dsrRecord), {
        EX: cachePeriodInSeconds, // set the record expiry time in seconds
      });
      return;
    } catch (error) {
      console.log("cacheDsrDataByCode error ", error);
    }
  }

  // cache record  into redis
  static async deleteCacheDsrDataByCode(dsrCode: string): Promise<void> {
    try {
      const result = await RedisService.client.del(dsrCode);
      const resMess =
        result === 1
          ? `Item with code ${dsrCode} deleted`
          : `No item found with code ${dsrCode}`;
      console.log(resMess);
    } catch (error) {
      console.error("Error deleting record: ", error);
    }
  }

  // fetch cahced reccord from redis
  static async getCacheDsrDataByCode(dsrCode: string): Promise<Dsr | null> {
    const cachedRecordString = await RedisService.client.get(dsrCode);
    const cachedRecord = cachedRecordString
      ? JSON.parse(cachedRecordString)
      : null;
    console.log("Redis cached record: => ", cachedRecord);

    return cachedRecord;
  }
}
