import { getModelForClass, prop } from "@typegoose/typegoose";
import { ArrayMinSize, IsNumber, Min } from "class-validator";
import { createUnionType, Field, InputType, ObjectType } from "type-graphql";

@ObjectType("Dsr")
export default class Dsr {
  @Field(() => String)
  _id?: string;

  @Field(() => String) //GraphQL types declaration
  @prop({ required: true }) // Mongo types declaration
  code: string;

  @Field(() => String, { nullable: true })
  @prop({ required: false, nullable: true })
  password?: string;

  @Field(() => String)
  @prop({ required: true })
  accounId: string;

  @Field(() => Number)
  @prop({ required: true })
  shareFrom: number;

  @Field(() => Number)
  @prop({ required: true })
  shareTo: number;

  @Field(() => [String])
  @prop({ required: true })
  practionerEmails: string[];

  @Field(() => Number)
  @prop({ default: Date.now() })
  expireOn: number;

  @Field(() => Boolean, { defaultValue: false })
  @prop({ default: false })
  isPasswordless?: boolean;
}

@InputType("CreateDsr")
export class CreateDsrInput {
  @Field(() => String) //GraphQL types declaration
  code: string;

  @Field(() => String)
  accounId: string;

  @Field(() => Number)
  shareFrom: number;

  @IsNumber()
  @Min(4)
  @Field(() => Number)
  shareTo: number;

  @ArrayMinSize(1)
  @Field(() => [String])
  practionerEmails: string[];

  @Field(() => Number, { nullable: false })
  expireOn: number;

  @Field(() => Boolean)
  isPasswordless: boolean;
}

@ObjectType("ResponseType")
export class ResponseType {
  @Field(() => String)
  status?: number;
  @Field(() => String, { nullable: true })
  message?: string;
}

@ObjectType("DeadlineResponseType")
export class DeadlineResponseType {
  @Field(() => Boolean, { nullable: true })
  state?: boolean;
  @Field(() => String, { nullable: true })
  message?: string;
}

@ObjectType("HasRecordResponseType")
export class HasRecordResponseType {
  @Field(() => Boolean)
  isPasswordless: boolean;
  @Field(() => Boolean)
  hasRecord: boolean;
  @Field(() => Dsr, { nullable: true })
  record?: Dsr | null;
}

// Mongo type Declaration
export const DsrModel = getModelForClass(Dsr);

export const DsrResult = createUnionType({
  name: "DsrResult",
  types: () => [Dsr, ResponseType],
  resolveType: (result) => {
    const ourType = JSON.stringify(result).includes("_id") ? Dsr : ResponseType;
    console.log("ourType ", ourType);
    return ourType;
  },
});

export const SavedDsrResult = createUnionType({
  name: "SavedDsrResult",
  types: () => [Dsr, DeadlineResponseType],
  resolveType: (result) => {
    const ourType = JSON.stringify(result).includes("_id")
      ? Dsr
      : DeadlineResponseType;
    console.log("ourType ", ourType);
    return ourType;
  },
});
