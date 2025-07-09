import { LiteralEnum } from '@/lib/types/literal-enum';
import {
  TelegramCommandArguments,
  TelegramExecuteArguments,
} from '../../telegram/commands/command';
import { ObjectKeys } from '@/lib/types/object-keys';
import { KeyPrimitive } from '@/lib/types/key-primitive';

export interface RawParsedArgument<T extends any = any> {
  value: T;
  position: number;
  isValid: boolean;
  tests: ArgumentParsePipelineResult[];
}

export type ArgumentParserOutputType<
  K extends KeyPrimitive = KeyPrimitive,
  S extends boolean = true,
> = S extends true
  ? TelegramExecuteArguments
  : S extends false
    ? ArgumentParsePipelineResults<K>
    : ArgumentParsePipelineResults<K>;

export interface ArgumentParserOutput<
  EA extends TelegramCommandArguments = TelegramCommandArguments,
  S extends boolean = boolean,
> {
  success: S;
  obj: TelegramExecuteArguments | Record<ObjectKeys<EA>, ArgumentParsePipelineResult>;
}

export const PipelineType = {
  Required: 'is-required',
  IsAllowed: 'is-allowed',
  Type: 'valid-type',
} as const;

export type PipelineType = LiteralEnum<typeof PipelineType>;

export interface ArgumentParserPipeline {
  type: PipelineType;
  condition: boolean;
  allowFalse?: boolean;
  received: any;
}

export interface ArgumentParsePipelineResult {
  type: PipelineType;
  success: boolean;
}

export type ArgumentParsePipelineResults<K extends KeyPrimitive = string> = Record<
  K,
  ArgumentParsePipelineResult
>;
