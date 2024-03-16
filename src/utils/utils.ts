import { SecretEksCluster } from "../types/type";

export function loadEKSSecretFromEnv(): SecretEksCluster {
  const { env } = process;
  const subnet_ids = env.SUBNET_IDS ? env.SUBNET_IDS.split(", ") : []
  return {
    cluster_name: env.CLUSTER_NAME || '',
    b64_cluster_ca: env.B64_CLUSTER_CA || '',
    api_server_url: env.API_SERVER_URL || '',
    k8s_cluster_dns_ip: env.K8S_CLUSTER_DNS_IP || '',
    iam_instance_profile: env.IAM_INSTANCE_PROFILE || '',
    security_group_id: env.SERCURITY_GROUP_ID || '',
    worker_ec2_aim: env.WORKER_EC2_AIM || '',
    subnet_ids: subnet_ids,
  }
} 