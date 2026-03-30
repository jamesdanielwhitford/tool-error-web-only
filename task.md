# Task

I'm building a small TypeScript utility using the Vercel AI SDK.

I need a function that calls an AI model with a tool attached. The tool should always throw an error when the model tries to use it. The function should force the model to use the tool, then detect whether the tool errored and return the result — including the error message if there was one.

You have web search available. Use it to look up how the Vercel AI SDK handles tool errors before writing any code.
