import { Api, Bot, Context, PollingOptions, RawApi } from 'grammy';
import { TelegramCommand } from '../commands/command';
import { TelegramConfig } from './telegram-client.confit';
import { ArgumentParser } from '../../parsers/argumets/argument-parser';
import {
  ArgumentParsePipelineResults,
  ArgumentParserOutputType,
} from '../../parsers/argumets/argument-parser.types';
import { ObjectKeys } from '@/lib/types/object-keys';
import { BotCommand } from 'grammy/types';

export class TelegramClient<C extends Context = Context, A extends Api = Api<RawApi>> extends Bot<
  C,
  A
> {
  public commands = new Map<string, TelegramCommand>();

  constructor(token: string, config?: TelegramConfig<C>) {
    super(token, config);

    this.initCommands(config?.commands ?? []);
  }

  public async start(options?: PollingOptions) {
    const instanceThis = this
    await super.start({
      ...options,
      async onStart(bot) {
        const commands = instanceThis.generateCommandList()
        await instanceThis.api.setMyCommands(commands)
        options?.onStart?.(bot)
      }
    })
  }

  public generateCommandList() {
    const commands: BotCommand[] = [];
    this.commands.forEach((item) =>
      commands.push({ command: item.name, description: item.description })
    );
    return commands;
  }

  private initCommands(commands: TelegramCommand[]) {
    commands.map((item) => {
      this.commands.set(item.name, item);
      this.command(item.name, (ctx) => {
        const args = ctx.match;
        if (item.args) {
          const parsed = new ArgumentParser(args, item.args).parse();
          if (!parsed.success) {
            return item?.fallback?.(
              ctx,
              parsed.obj as ArgumentParsePipelineResults<ObjectKeys<typeof item.args>>
            );
          }
          return item.execute(
            ctx,
            parsed.obj as ArgumentParserOutputType<ObjectKeys<typeof item.args>>
          );
        }
        return item.execute(ctx);
      });
    });
  }
}
