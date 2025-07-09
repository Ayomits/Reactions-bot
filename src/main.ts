import { TelegramClient } from './lib/telegram/client/telegram-client';
import { ConfigService } from './lib/config/config.service';
import { RandomCommand } from './commands/random.command';
import { PingCommand } from './commands/ping.command';
import { ReactionCommand } from './commands/reaction.command';
import { ReactionsCommand } from './commands/reactions.command';

async function bootstrap() {
  const config = new ConfigService();

  const bot = new TelegramClient(config.get('TG_TOKEN'), {
    commands: [
      new RandomCommand(),
      new PingCommand(),
      new ReactionCommand(),
      new ReactionsCommand(),
    ],
  });

  await bot.start({
    onStart: () => console.log('Bot started'),
  });
}

bootstrap();
