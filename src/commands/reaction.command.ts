import { OtakuReactionApi } from '@/lib/api/reactions/reaction.api';
import { OtakuReactionApiKeys } from '@/lib/api/reactions/reaction.types';
import { createArguments } from '@/lib/parsers/argumets/create-arguments';
import {
  TelegramCommand,
  TelegramExecuteArgument,
  TelegramExecuteArguments,
} from '@/lib/telegram/commands/command';
import { ObjectKeys } from '@/lib/types/object-keys';
import { Context } from 'grammy';
import { TelegramMarkdown } from 'tg-text-formatter';

const reactionArguments = createArguments({
  reaction: {
    displayName: 'reaction',
    type: 'string',
    required: true,
    default: OtakuReactionApiKeys.Happy,
    allowedValues: Object.values(OtakuReactionApiKeys),
  },
  msg: {
    displayName: 'message',
    type: 'text',
    required: false,
  },
});

interface ReactionExecuteArguments
  extends TelegramExecuteArguments<ObjectKeys<typeof reactionArguments>> {
  reaction: TelegramExecuteArgument<OtakuReactionApiKeys>;
  msg: TelegramExecuteArgument<string>;
}

export class ReactionCommand implements TelegramCommand<typeof reactionArguments> {
  name = 'reaction';
  args = reactionArguments;

  async execute(ctx: Context, args: ReactionExecuteArguments) {
    const loadingMsg = await ctx.api.sendMessage(ctx.chat!.id, 'Подождите...');
    const { reaction, msg } = args;
    const parsedReaction = await this.tmpReactionParser(reaction.value);
    const author = await ctx.getAuthor();
    if (!parsedReaction) {
      await ctx.api.editMessageText(
        ctx.chat!.id,
        loadingMsg.message_id,
        `Ваша реакция ${reaction.value} была не найдена`,
        { parse_mode: 'MarkdownV2' }
      );
    }
    let resMsg: string = `🌟 *Пользователь:* ${author.user.first_name}\n🎭 ${TelegramMarkdown.bold('Реакция:')} ${reaction.value}`
    if (msg.value) {
      resMsg += `\n ${msg.value && `📝  ${TelegramMarkdown.bold('Сообщение:')} ${msg.value}`}`
    }
    await Promise.all([
      ctx.api.deleteMessage(ctx.chat!.id!, loadingMsg.message_id),
      ctx.replyWithAnimation(parsedReaction!.url, {
        caption: resMsg,
        parse_mode: 'MarkdownV2',
      }),
    ]);
  }

  private async tmpReactionParser(reaction: OtakuReactionApiKeys) {
    const otakuApi = new OtakuReactionApi();
    const res = await otakuApi.getReaction(reaction);
    if (!res.success) {
      return null;
    }
    return res.data;
  }
}
