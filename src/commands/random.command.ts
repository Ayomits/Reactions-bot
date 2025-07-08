import { ArgumentParsePipelineResults } from '@/lib/telegram/commands/argumets/argument-parser.types';
import { createArguments } from '@/lib/telegram/commands/argumets/create-arguments';
import { TelegramCommand, TelegramExecuteArguments } from '@/lib/telegram/commands/command';
import { ObjectKeys } from '@/lib/types/object-keys';
import { Context } from 'grammy';

const randomCommandArgs = createArguments({
  min: {
    displayName: 'min',
    type: 'number',
    required: false,
    default: 0,
  },
  max: {
    displayName: 'max',
    type: 'number',
    required: false,
    default: 10,
  },
});

export class RandomCommand implements TelegramCommand<typeof randomCommandArgs> {
  name = 'random';
  args = randomCommandArgs;

  execute(
    ctx: Context,
    args: TelegramExecuteArguments<ObjectKeys<typeof randomCommandArgs>, number>
  ) {
    const randomValue =
      Math.floor(Math.random() * (args.max.value - args.min.value + 1)) + args.min.value;
    return ctx.reply(`Случайное число: ${randomValue}`);
  }

  fallback(
    ctx: Context,
    results: ArgumentParsePipelineResults<ObjectKeys<typeof randomCommandArgs>>
  ) {
    return ctx.reply(JSON.stringify(results));
  }
}
