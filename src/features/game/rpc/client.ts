// services, features, and other libraries
import { makeRpcClient } from "@/domain/rpc-client";
import { RpcGame } from "./requests";

export class RpcGameClient extends makeRpcClient("RpcGameClient", RpcGame, "/api/rpc/game") {}
