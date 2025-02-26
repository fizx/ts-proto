import { code, Code, joinCode } from "ts-poet";
import { Context } from "./context";
import { impFile } from "./utils";

export function generateTypeRegistry(ctx: Context): Code {
  const chunks: Code[] = [];

  chunks.push(generateMessageType(ctx));

  if (ctx.options.outputTypeRegistry == "no-tags") {
    chunks.push(code`
      export type UnknownMessage = {};
    `);
  } else {
    chunks.push(code`
      export type UnknownMessage = {$type: string};
    `);
  }

  chunks.push(code`
    export const messageTypeRegistry = new Map<string, MessageType>();
  `);

  chunks.push(code` ${ctx.utils.Builtin.ifUsed} ${ctx.utils.DeepPartial.ifUsed}`);

  return joinCode(chunks, { on: "\n\n" });
}

function generateMessageType(ctx: Context): Code {
  const chunks: Code[] = [];

  chunks.push(code`export interface MessageType<Message extends UnknownMessage = UnknownMessage> {`);

  if (ctx.options.outputTypeRegistry == "no-tags") {
    chunks.push(code`$type: string;`);
  } else {
    chunks.push(code`$type: Message['$type'];`);
  }

  if (ctx.options.outputEncodeMethods) {
    const Writer = impFile(ctx.options, "Writer@protobufjs/minimal");
    const Reader = impFile(ctx.options, "Reader@protobufjs/minimal");

    chunks.push(code`encode(message: Message, writer?: ${Writer}): ${Writer};`);
    chunks.push(code`decode(input: ${Reader} | Uint8Array, length?: number): Message;`);
  }

  if (ctx.options.outputJsonMethods) {
    chunks.push(code`fromJSON(object: any): Message;`);
    chunks.push(code`toJSON(message: Message): unknown;`);
  }

  if (ctx.options.outputPartialMethods) {
    chunks.push(code`fromPartial(object: ${ctx.utils.DeepPartial}<Message>): Message;`);
  }

  chunks.push(code`}`);

  return joinCode(chunks, { on: "\n" });
}
