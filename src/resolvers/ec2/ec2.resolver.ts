
import { Arg, Mutation, Resolver } from "type-graphql";
import { Inject, Service } from "typedi";
import { SERVICE_INJECTION } from "../../common/constants";
import { EC2Service } from "../../services/ec2/ec2.service";
import { EC2RequestInput } from "../../types/ec2/ec2.input";
import { EC2RequestOutput, EC2RequestResponse } from "../../types/ec2/ec2.type";

@Service()
@Resolver(of => EC2RequestOutput)
export class EC2RequestResolver {
  constructor(
    @Inject(SERVICE_INJECTION.ec2) private readonly ec2Service: EC2Service
  ) { }

  @Mutation(() => EC2RequestResponse)
  async requestEC2(@Arg("input") input: EC2RequestInput): Promise<EC2RequestResponse> {
    return this.ec2Service.startEC2Service(input);
  }
}