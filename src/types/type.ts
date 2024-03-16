import { ClassType, Field, ObjectType } from "type-graphql";

export function ResponseContent<T>(data: ClassType<T>) {

    @ObjectType({ isAbstract: true })
    abstract class ResponseContent {
        @Field()
        code: string;

        @Field()
        status: string;

        @Field({ nullable: true })
        message: string;

        @Field(type => data, { nullable: true })
        data: T
    }

    return ResponseContent;
}

export class SecretEksCluster {
    cluster_name: string
    b64_cluster_ca: string
    api_server_url: string
    k8s_cluster_dns_ip: string
    iam_instance_profile: string
    security_group_id: string
    subnet_ids: string[]
    worker_ec2_aim: string
}