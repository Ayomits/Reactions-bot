import { Api, Bot, Context, RawApi } from 'grammy';
import { TelegramCommand } from '../commands/command';
import { TelegramConfig } from './telegram-client.confit';
import { ArgumentParser } from '../commands/argumets/argument-parser';
import {
  ArgumentParsePipelineResults,
  ArgumentParserOutputType,
} from '../commands/argumets/argument-parser.types';
import { ObjectKeys } from '@/lib/types/object-keys';

export class TelegramClient<C extends Context = Context, A extends Api = Api<RawApi>> extends Bot<
  C,
  A
> {
  public commands: Map<string, TelegramCommand> = new Map();

  constructor(token: string, config?: TelegramConfig<C>) {
    super(token, config);
    this.initCommands(config?.commands ?? []);
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
