// services, features, and other libraries
import { makeRpcClient } from "@/domain/rpc-client";
import { RpcOverdriveHacks } from "./requests";

export class RpcOverdriveHacksClient extends makeRpcClient("RpcOverdriveHacksClient", RpcOverdriveHacks, "/api/rpc/overdrive-hacks") {}
