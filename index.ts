import { generateText, tool, ToolExecutionError } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

type ToolCallResult =
  | {
      toolCallId: string;
      toolName: string;
      args: unknown;
      errored: true;
      errorMessage: string;
    }
  | {
      toolCallId: string;
      toolName: string;
      args: unknown;
      errored: false;
      result: unknown;
    };

async function callWithErroringTool(): Promise<ToolCallResult> {
  try {
    const result = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      tools: {
        alwaysErrors: tool({
          description: "A tool that always throws an error.",
          parameters: z.object({
            input: z.string().describe("Any input string"),
          }),
          execute: async (): Promise<string> => {
            throw new Error("This tool always fails intentionally.");
          },
        }),
      },
      toolChoice: { type: "tool", toolName: "alwaysErrors" },
      prompt: "Use the alwaysErrors tool with any input.",
    });

    // If somehow no error was thrown, look for a successful tool result
    for (const step of result.steps) {
      for (const toolResult of step.toolResults) {
        return {
          toolCallId: toolResult.toolCallId,
          toolName: toolResult.toolName,
          args: toolResult.args,
          errored: false,
          result: toolResult.result,
        };
      }
    }

    throw new Error("No tool result found in response.");
  } catch (err) {
    if (ToolExecutionError.isInstance(err)) {
      return {
        toolCallId: err.toolCallId,
        toolName: err.toolName,
        args: err.toolArgs,
        errored: true,
        errorMessage: err.cause instanceof Error ? err.cause.message : String(err.cause),
      };
    }
    throw err;
  }
}

callWithErroringTool().then((res) => {
  console.log(JSON.stringify(res, null, 2));
});
