// services, features, and other libraries
import { makeRpcClient } from "@/domain/helpers";
import { RpcOverdriveHacks } from "./requests";

// constants
import { RPC_OVERDRIVE_HACKS_PATH } from "@/domain/constants";

export class RpcOverdriveHacksClient extends makeRpcClient("RpcOverdriveHacksClient", RpcOverdriveHacks, RPC_OVERDRIVE_HACKS_PATH) {}
