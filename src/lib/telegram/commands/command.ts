import { Context } from 'grammy';
import { LiteralEnum } from '../../types/literal-enum';
import { ArgumentParsePipelineResults } from '../../parsers/argumets/argument-parser.types';

export const ArgumentType = {
  String: 'string',
  Number: 'number',
  Any: 'any',
  Text: 'text',
  Mention: 'mention',
} as const;

export type ArgumentType = LiteralEnum<typeof ArgumentType>;

export interface TelegramCommandArgument<
  AV extends unknown[] = unknown[],
  D extends unknown = unknown,
> {
  /**
   * Uses for object key
   */
  displayName: string;
  type: ArgumentType;

  required?: boolean;
  allowedValues?: AV;
  default?: D;
}

export interface TelegramExecuteArgument<T = any> {
  value: T;
  position: number;
}

export type TelegramExecuteArguments<K extends string = string> = Record<
  K,
  TelegramExecuteArgument
>;

export type TelegramCommandArguments = Record<string, TelegramCommandArgument>;

export interface TelegramCommand<
  AR extends TelegramCommandArguments = TelegramCommandArguments,
  C extends Context = Context,
> {
  name: string;
  description: string;
  args?: AR;

  execute(ctx: C, args?: any): Promise<unknown> | unknown;

  fallback?(
    ctx: C,
    results: ArgumentParsePipelineResults<keyof AR & string>
  ): Promise<unknown> | unknown;
}
