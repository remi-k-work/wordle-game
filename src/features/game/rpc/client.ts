// services, features, and other libraries
import { makeRpcClient } from "@/lib/rpc";
import { RpcGame } from "./requests";

export class RpcGameClient extends makeRpcClient("RpcGameClient", RpcGame, "/api/rpc/game") {}
