import { TelegramClient } from './lib/telegram/client/telegram-client';
import { ConfigService } from './lib/config/config.service';
import { RandomCommand } from './commands/random.command';
import { PingCommand } from './commands/ping.command';
import { ReactionCommand } from './commands/reaction.command';

async function bootstrap() {
  const config = new ConfigService();
  const bot = new TelegramClient(config.get('TG_TOKEN'), {
    commands: [new RandomCommand(), new PingCommand(), new ReactionCommand()],
  });

  bot.start().then(() => {
    console.log(bot.commands);
  });
}

bootstrap();
