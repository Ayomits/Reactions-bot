import { TelegramCommandArguments } from "../command";

export function createArguments<ARG extends TelegramCommandArguments = TelegramCommandArguments>(args: ARG) {
  return args
}
