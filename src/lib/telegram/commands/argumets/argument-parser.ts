import { omit } from '@/lib/objects/omit';
import {
  TelegramCommandArgument,
  TelegramCommandArguments,
  TelegramExecuteArguments,
} from '../command';
import {
  ArgumentParsePipelineResult,
  ArgumentParserOutput,
  ArgumentParserPipeline,
  RawParsedArgument,
} from './argument-parser.types';
import { ObjectKeys } from '@/lib/types/object-keys';

export class ArgumentParser {
  constructor(
    private readonly receivedArgs: string,
    private readonly expected: TelegramCommandArguments,
    private readonly separator: string = ' '
  ) {}

  public parse<EA extends TelegramCommandArguments>(): ArgumentParserOutput<EA> {
    const splitted = this.receivedArgs.split(this.separator);
    const parsedResults: Record<string, RawParsedArgument> = {};

    Object.entries(this.expected).forEach(([key, expectedArg], index) => {
      const rawValue = splitted[index] ?? '';
      const { value, isValid, tests } = this.parseArgument(rawValue, expectedArg, index);

      parsedResults[key] = {
        position: index + 1,
        value,
        isValid,
        tests,
      };
    });

    const { validArgs, invalidArgs } = this.separateValidArguments(parsedResults);

    const requiredArgsCount = Object.values(this.expected).filter((arg) => arg.required).length;
    const hasEnoughValidArgs = Object.keys(validArgs).length >= requiredArgsCount;

    if (!hasEnoughValidArgs) {
      return {
        success: false,
        obj: this.formatErrorResponse(invalidArgs) as unknown as Record<ObjectKeys<EA>, ArgumentParsePipelineResult>,
      };
    }

    return {
      success: true,
      obj: this.formatSuccessResponse(validArgs),
    };
  }

  private parseArgument(
    rawValue: string,
    expected: TelegramCommandArgument,
    position: number
  ): Omit<RawParsedArgument, 'position'> {
    const parsedValue = this.parseTypedValue(rawValue, expected);

    const pipelines = this.getValidationPipelines(rawValue, expected, parsedValue);
    const { isValid, results } = this.runPipelinesValidation(pipelines);

    const finalValue = isValid ? parsedValue : expected.default;

    return {
      value: finalValue,
      isValid,
      tests: results,
    };
  }

  private parseTypedValue(rawValue: string, expected: TelegramCommandArgument): unknown {
    if (!rawValue && typeof expected.default !== 'undefined') {
      return expected.default;
    }

    switch (expected.type) {
      case 'number':
        const num = Number(rawValue);
        return Number.isNaN(num) ? expected.default : num;
      case 'string':
        return rawValue || expected.default || '';
      default:
        return rawValue;
    }
  }

  private getValidationPipelines(
    rawValue: string,
    expected: TelegramCommandArgument,
    parsedValue: unknown
  ): ArgumentParserPipeline[] {
    return [
      {
        type: 'is-required',
        condition: !expected.required || !!parsedValue,
        received: rawValue,
      },
      {
        type: 'is-allowed',
        condition:
          !expected.allowedValues?.length ||
          this.isValueAllowed(parsedValue, expected.allowedValues),
        received: rawValue,
      },
      {
        type: 'valid-type',
        condition: parsedValue !== undefined && parsedValue !== null,
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
    ) as unknown as Record<ObjectKeys<typeof this.expected>, ArgumentParsePipelineResult[]>;
  }
}
