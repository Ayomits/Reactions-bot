import {
  TelegramCommand,
  TelegramCommandArguments,
  TelegramExecuteArguments,
} from '@/lib/telegram/commands/command';
import { Context } from 'grammy';

export class PingCommand implements TelegramCommand {
  name: string = 'ping';

  execute(ctx: Context) {
    const now = Date.now();
    const msgCreatedAt = (ctx.message?.date ?? 0) * 1_000;
    const latency = Math.max(now - msgCreatedAt, 0);
    return ctx.reply(`Понг ${latency}ms`);
  }
}
