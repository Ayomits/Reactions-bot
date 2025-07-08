import { BotConfig, Context } from "grammy";
import { TelegramCommand } from "../commands/command";

export interface TelegramConfig<C extends Context = Context> extends BotConfig<C> {
  commands: TelegramCommand[]
}
