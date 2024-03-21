const endpoints = {
    publish_events: process.env.NEXT_PUBLIC_PUBLISH_EVENTS_ENDPOINT ?? "",
    deploy_events: process.env.NEXT_PUBLIC_DEPLOY_EVENTS_ENDPOINT ?? "",
    claim_events: process.env.NEXT_PUBLIC_CLAIM_EVENTS_ENDPOINT ?? "",
    subscribe_ledger_expiration: process.env.NEXT_PUBLIC_SUBSCRIBE_LEDGER_EXPIRATION_ENDPOINT ?? "",
    read_ttl: process.env.NEXT_PUBLIC_READ_LEDGER_TTL_ENDPOINT ?? "",
    bump_contract_instance: process.env.NEXT_PUBLIC_BUMP_CONTRACT_INSTANCE_ENDPOINT ?? "",
    postgresql_endpoint: process.env.NEXT_PUBLIC_POSTGRESQL_ENDPOINT ?? "",
    rpc_endpoint: process.env.NEXT_PUBLIC_STELLAR_RPC_ENDPOINT ?? "",
}

export default endpoints;
    