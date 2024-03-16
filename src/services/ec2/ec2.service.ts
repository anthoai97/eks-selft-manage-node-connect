import { EC2Client, RunInstancesCommand } from "@aws-sdk/client-ec2";
import { Service } from "typedi";
import { FAILURE_RESPONSE, SUCCESS_RESPONSE } from "../../common/base-response-content";
import { EC2RequestInput } from "../../types/ec2/ec2.input";
import { EC2RequestResponse } from "../../types/ec2/ec2.type";
import { SecretEksCluster } from "../../types/type";

@Service()
export class EC2Service {
  private client: EC2Client;
  private secretEksCluster: SecretEksCluster;

  constructor(region: string | undefined, secretEksCluster: SecretEksCluster) {
    this.client = new EC2Client({ region: region || "eu-souteast-1" })
    this.secretEksCluster = secretEksCluster;
    console.log("AWS Service region Target ==>", region);
    console.log("Init Service Successful ==>", secretEksCluster);
  }

  async startEC2Service(params: EC2RequestInput) {
    // Only format a-b-c is valid so update params
    params.organizationName = params.organizationName.toLocaleLowerCase().replaceAll(" ", "-");

    const userdata = this.generateUserData(params);
    const command = new RunInstancesCommand({
      InstanceType: params.instanceType,
      ImageId: this.secretEksCluster.worker_ec2_aim,
      MinCount: 1,
      MaxCount: 1,
      SecurityGroupIds: [this.secretEksCluster.security_group_id],
      // Random subsnet drop
      SubnetId: this.secretEksCluster.subnet_ids[Math.floor(Math.random() * this.secretEksCluster.subnet_ids.length)],
      UserData: Buffer.from(userdata).toString("base64"),
      IamInstanceProfile: {
        Arn: this.secretEksCluster.iam_instance_profile,
      },
      BlockDeviceMappings: [
        {
          DeviceName: "/dev/xvda",
          Ebs: {
            VolumeSize: params.volumeSize,
          },
        },
      ],
      TagSpecifications: [
        {
          ResourceType: "instance",
          Tags: [
            {
              Key: `kubernetes.io/cluster/${this.secretEksCluster.cluster_name}`,
              Value: "owned",
            },
            {
              Key: "projectID",
              Value: params.projectID,
            },
            {
              Key: "organizationID",
              Value: params.organizationID,
            },
            {
              Key: "organizationName",
              Value: params.organizationName,
            },
          ],
        },
      ],
    })

    try {
      let output = await this.client.send(command);

      return Object.assign(new EC2RequestResponse(), {
        ...SUCCESS_RESPONSE,
        message: `EC2 Service run successful`,
        data: {
          ...params,
          instanceID: output.Instances ? output.Instances[0].InstanceId : null
        }
      })
    } catch (error) {
      let message = 'Unknown Error'
      if (error instanceof Error) message = error.message
      return Object.assign(new EC2RequestResponse(), {
        ...FAILURE_RESPONSE,
        message: message,
      })
    }
  }

  // WARNING: THIS IS IMPORTANT USER DATA DO NO CHANGE ANY FORMAT ON THIS
  generateUserData = (ec2Params: EC2RequestInput) => `MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="//"

--//
Content-Type: text/x-shellscript; charset="us-ascii"
#!/bin/bash
set -ex
B64_CLUSTER_CA=${this.secretEksCluster.b64_cluster_ca}
API_SERVER_URL=${this.secretEksCluster.api_server_url}
K8S_CLUSTER_DNS_IP=${this.secretEksCluster.k8s_cluster_dns_ip}
/etc/eks/bootstrap.sh ${this.secretEksCluster.cluster_name} --kubelet-extra-args '--register-with-taints=\"projectID=${ec2Params.projectID}:NoSchedule\" --node-labels=projectID=${ec2Params.projectID},organizationName=${ec2Params.organizationName},organizationID=${ec2Params.organizationID},eks.amazonaws.com/nodegroup-image=ami-0c94b5eaf8fe499cb' --b64-cluster-ca $B64_CLUSTER_CA --apiserver-endpoint $API_SERVER_URL --dns-cluster-ip $K8S_CLUSTER_DNS_IP

--//--
`;


}