// services, features, and other libraries
import { makeRpcClient } from "@/lib/rpc";
import { RpcOverdriveHacks } from "./requests";

export class RpcOverdriveHacksClient extends makeRpcClient("RpcOverdriveHacksClient", RpcOverdriveHacks, "/api/rpc/overdrive-hacks") {}
