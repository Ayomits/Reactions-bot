import { omit } from '@/lib/objects/omit';
import {
  TelegramCommandArgument,
  TelegramCommandArguments,
  TelegramExecuteArguments,
} from '../../telegram/commands/command';
import {
  ArgumentParsePipelineResult,
  ArgumentParserOutput,
  ArgumentParserPipeline,
  RawParsedArgument,
} from './argument-parser.types';
import { ObjectKeys } from '@/lib/types/object-keys';
import { Parser } from '../parser.interface';
import { TelegramMarkdownParser } from 'tg-text-formatter';
import { Context } from 'grammy';

export class ArgumentParser<
  EA extends TelegramCommandArguments = TelegramCommandArguments,
  C extends Context = Context,
> implements Parser
{
  private readonly receivedArgs: string;
  private readonly expected: TelegramCommandArguments;
  private readonly separator: string = ' ';

  constructor(receivedArgs: string, expected: TelegramCommandArguments, separator: string = ' ') {
    this.receivedArgs = receivedArgs;
    this.expected = expected;
    this.separator = separator;
  }

  public parse(): ArgumentParserOutput<EA> {
    const splitted = this.receivedArgs.split(this.separator);
    const parsedResults: Record<string, RawParsedArgument> = {};

    let currentIndex = 0;

    Object.entries(this.expected).forEach(([key, expectedArg]) => {
      let rawValue: string;

      if (expectedArg.type === 'text') {
        rawValue = splitted.slice(currentIndex).join(this.separator).trim();
        currentIndex = splitted.length;
      } else {
        rawValue = (splitted[currentIndex] ?? '').trim();
        currentIndex++;
      }

      const { value, isValid, tests } = this.parseArgument(rawValue, expectedArg);
      parsedResults[key] = { position: currentIndex, value, isValid, tests };
    });

    const { validArgs, invalidArgs } = this.separateValidArguments(parsedResults);

    const hasEnoughValidArgs = Object.keys(validArgs).length >= Object.keys(this.expected).length;

    if (!hasEnoughValidArgs) {
      return {
        success: false,
        obj: this.formatErrorResponse(invalidArgs),
      };
    }

    return {
      success: true,
      obj: this.formatSuccessResponse(validArgs),
    };
  }

  private parseArgument(
    rawValue: string,
    expectedArg: TelegramCommandArgument<unknown[], unknown>
  ): Omit<RawParsedArgument, 'position'> {
    const parsedValue = this.parseTypedValue(rawValue, expectedArg);

    const pipelines = this.getValidationPipelines(rawValue, parsedValue, expectedArg);
    const { isValid, results } = this.runPipelinesValidation(pipelines);

    const finalValue = isValid ? parsedValue : expectedArg.default;

    return {
      value: finalValue,
      isValid,
      tests: results,
    };
  }

  private parseTypedValue(
    rawValue: string,
    expectedArg: TelegramCommandArgument<unknown[], unknown>
  ): unknown {
    if (expectedArg.type === 'any') {
      return rawValue ?? expectedArg.default;
    }

    if (expectedArg.type === 'mention') {
      // TODO: regular exp
      if (!rawValue.startsWith("@")) {
        return null;
      }
      return rawValue;
    }

    if (!rawValue && typeof expectedArg.default !== 'undefined') {
      return expectedArg.default;
    }

    switch (expectedArg.type) {
      case 'number':
        const num = Number(rawValue);
        return Number.isNaN(num) ? expectedArg.default : num;
      case 'string':
        return rawValue || expectedArg.default || '';
      default:
        return rawValue;
    }
  }

  private getValidationPipelines(
    rawValue: string,
    parsedValue: unknown,
    expectedArg: TelegramCommandArgument<unknown[], unknown>
  ): ArgumentParserPipeline[] {
    return [
      {
        type: 'is-required',
        condition: !expectedArg.required || !!parsedValue,
        received: rawValue,
      },
      {
        type: 'is-allowed',
        condition:
          !expectedArg.allowedValues?.length ||
          this.isValueAllowed(parsedValue, expectedArg.allowedValues),
        received: rawValue,
      },
      {
        type: 'valid-type',
        condition: (parsedValue !== undefined && parsedValue !== null) || !expectedArg.required,
        received: rawValue,
      },
    ];
  }

  private isValueAllowed(value: unknown, allowedValues: unknown[] = []): boolean {
    return allowedValues.includes(value);
  }

  private runPipelinesValidation(pipelines: ArgumentParserPipeline[]) {
    const results: ArgumentParsePipelineResult[] = [];
    let isValid = true;

    for (const pipe of pipelines) {
      const testPassed = pipe.condition;
      results.push({ type: pipe.type, success: testPassed });

      if (!testPassed) {
        isValid = false;
      }
    }

    return { isValid, results };
  }

  private separateValidArguments(parsed: Record<string, RawParsedArgument>) {
    const validArgs: Record<string, RawParsedArgument> = {};
    const invalidArgs: Record<string, RawParsedArgument> = {};

    Object.entries(parsed).forEach(([key, arg]) => {
      if (arg.isValid) {
        validArgs[key] = arg;
      } else {
        invalidArgs[key] = arg;
      }
    });

    return { validArgs, invalidArgs };
  }

  private formatSuccessResponse(validArgs: Record<string, RawParsedArgument>) {
    return omit(
      Object.fromEntries(
        Object.entries(validArgs).map(([key, arg]) => [
          key,
          { value: arg.value, position: arg.position },
        ])
      ),
      ['isValid', 'tests', 'rawValue']
    ) as unknown as TelegramExecuteArguments<ObjectKeys<typeof this.expected>>;
  }

  private formatErrorResponse(invalidArgs: Record<string, RawParsedArgument>) {
    return Object.fromEntries(
      Object.entries(invalidArgs).map(([key, arg]) => [key, arg.tests])
    ) as unknown as Record<ObjectKeys<EA>, ArgumentParsePipelineResult>;
  }
}
