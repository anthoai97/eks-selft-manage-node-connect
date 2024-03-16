import { Field, ObjectType } from "type-graphql";
import { ResponseContent } from "../type";

@ObjectType()
export class EC2RequestOutput {
  @Field()
  projectID: string;

  @Field()
  organizationName: string;

  @Field()
  organizationID: string;

  @Field()
  instanceType: string

  @Field({ nullable: true, defaultValue: 20 })
  volumeSize: number

  @Field({ nullable: true})
  instanceID: string
}

@ObjectType()
export class EC2RequestResponse extends ResponseContent(EC2RequestOutput) {
}
