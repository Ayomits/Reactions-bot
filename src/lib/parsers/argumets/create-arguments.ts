import { TelegramCommandArguments } from '../../telegram/commands/command';

export function createArguments<ARG extends TelegramCommandArguments = TelegramCommandArguments>(
  args: ARG
) {
  return args;
}
