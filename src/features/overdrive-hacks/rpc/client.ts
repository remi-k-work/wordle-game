// services, features, and other libraries
import { makeRpcClient } from "@/domain/rpc-client";
import { RpcOverdriveHacks } from "./requests";

// constants
import { RPC_OVERDRIVE_HACKS_PATH } from "./requests";

export class RpcOverdriveHacksClient extends makeRpcClient("RpcOverdriveHacksClient", RpcOverdriveHacks, RPC_OVERDRIVE_HACKS_PATH) {}
