import { Field, InputType } from "type-graphql";

@InputType()
export class EC2RequestInput {
  @Field({ nullable: false })
  projectID: string;

  @Field({ nullable: false })
  organizationName: string;

  @Field({ nullable: false })
  organizationID: string;

  @Field({ nullable: false })
  instanceType: string

  @Field({ nullable: true, defaultValue: 20 })
  volumeSize: number
}
