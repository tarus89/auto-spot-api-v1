import Dsr, {
  CreateDsrInput,
  SavedDsrResult,
  DsrModel,
  HasRecordResponseType,
  DeadlineResponseType,
  ResponseType,
  DsrResult,
} from "./types.js";
import bcrypt from "bcrypt";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import DsrService from "./services/dsrservice.js";
import { IDsr } from "./model.js";

@Resolver()
export default class DsrResolver {
  // search DsR model record by code & password
  @Query(() => DsrResult, { nullable: true })
  async search(
    @Arg("code") code: string,
    @Arg("password", { nullable: true }) password?: string
  ): Promise<Dsr | ResponseType> {
    const record = await DsrService.getCacheDsrDataByCode(code);

    if (!record) {
      return {
        status: 404,
        message: "Record not found!",
      };
    }

    if (record && !record.isPasswordless) {
      if (!password) {
        return {
          status: 404,
          message: "Please provide the password",
        };
      }
      const status = await bcrypt.compare(password, record.password);

      if (!status) {
        return {
          status: 404,
          message: "Record not found!",
        };
      }
    }

    return record;
  }

  @Query(() => HasRecordResponseType, { nullable: true })
  async hasRecord(@Arg("code") code: string): Promise<HasRecordResponseType> {
    const cachedRecord = await DsrService.getCacheDsrDataByCode(code);
    const isPasswordless = cachedRecord?.isPasswordless || false

    return {
      hasRecord: cachedRecord ? true : false,
      isPasswordless: isPasswordless,
      record: isPasswordless ? (cachedRecord || null) : null,
    };
  }

  @Query(() => DsrResult)
  async getDsrRecord(
    @Arg("code") code: string,
    @Arg("password", { nullable: true }) password?: string
  ): Promise<typeof DsrResult> {
    
    const record = await DsrService.getCacheDsrDataByCode(code);

    if (record && !record.isPasswordless) {
      if (!password) {
        return {
          status: 404,
          message: "Please provide the password",
        };
      }
      const status = await bcrypt.compare(password, record.password);

      if (!status) {
        return {
          status: 404,
          message: "Record not found!",
        };
      }
    }else if(!record){
      return {
        status: 404,
        message: "Record not found!",
      };
    }
    return record;
  }

  // Save Dsr
  @Mutation(() => SavedDsrResult, { nullable: true })
  async save(
    @Arg("params") params: CreateDsrInput
  ): Promise<Dsr | DeadlineResponseType | null> {
    const modelObj = { ...params }; // Use spread to avoid unnecessary nesting
    let dsrRecord = new DsrModel();

    try {
      if (!params.isPasswordless) {
        console.log("Is Passwordless");
        const stateRes: DeadlineResponseType =
          await DsrService.isWithinDeadlineTime(params.expireOn);
        if (stateRes.state) {
          const passRes = await DsrService.generateRandomPassword();
          console.log("Generating password. State: ", stateRes.state);
          // Create model object with password
          dsrRecord = new DsrModel({
            ...modelObj,
            password: passRes.hashedPass,
          });

          DsrService.notifyPractioners(passRes.password, dsrRecord as Dsr);
          await dsrRecord.save();
          //cache Dsr Record
          await DsrService.cacheDsrDataByCode(dsrRecord);
          console.log("Redis record saved 1");
        } else {
          return stateRes; // Return early if deadline is not met
        }
      } else {
        const stateRes: DeadlineResponseType =
          await DsrService.isWithinDeadlineTime(params.expireOn);
        if (stateRes.state) {
          dsrRecord = new DsrModel(modelObj); // Directly use modelObj for non-passwordless case
          await dsrRecord.save();
          //cache Dsr Record
          await DsrService.cacheDsrDataByCode(dsrRecord);
        } else {
          return stateRes; // Return early if deadline is not met
        }
      }

      return dsrRecord;
    } catch (error) {
      console.log("mutation error ", error);
      return null;
    }
  }

  // resend email alert to practioners
  @Mutation(() => String, { nullable: false })
  async resendEmail(accountId: string): Promise<string> {
    const record = await DsrModel.findOne({ accounId: accountId });
    let resMessage = "Email sent successfully!";
    if (record) {
      const passRes = await DsrService.generateRandomPassword();

      record.password = passRes.hashedPass;
      await record.save();

      DsrService.notifyPractioners(passRes.password, record as Dsr);
    } else {
      resMessage = "Record not found!";
      console.log(resMessage);
    }
    return resMessage;
  }

  // delete DSR Record
  @Mutation(() => String, { nullable: false })
  async deleteDsrRecord(
    @Arg("code", { nullable: false }) code: string
  ): Promise<string> {
    const status = await DsrModel.findOneAndDelete({ code });

    await DsrService.deleteCacheDsrDataByCode(code);

    console.log("Record deleted successfully!");
    return `Record with code ${code} deleted successfully!`;
  }

  // delete DSR Record
  @Mutation(() => String, { nullable: false })
  async invalidateDsrRecordAccess(
    @Arg("code", { nullable: false }) code: string
  ): Promise<string> {
    const record = await DsrModel.findOne({ code });
    if (record) {
      record.expireOn = Date.now();
      await record.save();
    } else {
      return "Record not found!";
    }
    console.log(record);

    await DsrService.deleteCacheDsrDataByCode(code);

    console.log("Record access revoked successfully!");
    return `Record with code ${code} access revoked successfully!`;
  }
}
