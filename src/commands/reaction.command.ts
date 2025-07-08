import { createArguments } from '@/lib/telegram/commands/argumets/create-arguments';
import {
  TelegramCommand,
  TelegramExecuteArguments,
} from '@/lib/telegram/commands/command';
import { ObjectKeys } from '@/lib/types/object-keys';
import { Context } from 'grammy';

const reactionArguments = createArguments({
  reaction: {
    displayName: 'reaction',
    type: 'string',
    required: true,
    default: 'kiss',
  },
});

export class ReactionCommand implements TelegramCommand<typeof reactionArguments> {
  name = 'reaction';
  args = reactionArguments;

  async execute(
    ctx: Context,
    args: TelegramExecuteArguments<ObjectKeys<typeof reactionArguments>, string>
  ) {
    const loadingMsg = await ctx.api.sendMessage(ctx.chat!.id, 'Подождите...');
    const { reaction } = args;

    try {
      const response = await fetch(`https://api.otakugifs.xyz/gif?reaction=${reaction.value}`).then(
        (res) => res.json()
      );
      await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id);
      await ctx.replyWithAnimation(response.url);
    } catch (err) {
      await ctx.api.editMessageText(
        ctx.chat!.id,
        loadingMsg.message_id,
        `Ваша реакция __${reaction}__ не найдена`,
        { parse_mode: 'MarkdownV2' }
      );
    }
  }
}
