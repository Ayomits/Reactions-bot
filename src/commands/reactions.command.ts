import { OtakuReactionApiKeys } from '@/lib/api/reactions/reaction.types';
import { TextMessageBuilder } from '@/lib/telegram/builders/message.builder';
import { TelegramCommand } from '@/lib/telegram/commands/command';
import { Context } from 'grammy';
import { TelegramMarkdown } from 'tg-text-formatter';

export class ReactionsCommand implements TelegramCommand {
  name = 'reactions';
  description = 'Send all available reactions';

  private existedMsg: string = ``;

  execute(ctx: Context) {
    return ctx.reply(this.generateMsg(), { parse_mode: 'MarkdownV2' });
  }

  private getCachedMsg() {
    return this.existedMsg;
  }

  private generateMsg() {
    const cached = this.getCachedMsg();
    const msg = new TextMessageBuilder(`Все доступные реакции:`).setParagraph().setParagraph();
    if (cached) {
      return cached;
    }
    for (const reaction of Object.values(OtakuReactionApiKeys)) {
      msg.setSpan(`${TelegramMarkdown.monospace(reaction)}\n`).setParagraph();
    }
    this.existedMsg = msg.toPlain()
    return msg.toPlain();
  }
}
