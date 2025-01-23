import { executeSlashCommandsWithOptions } from "../../../../../slash-commands.js";
import { getIframeName, getLogPrefix, IframeMessage, registerIframeHandler } from "./index.js";

interface IframeSlash extends IframeMessage {
  request: '[Slash][triggerSlash]' | '[Slash][triggerSlashWithResult]'
  command: string;
}

export function registerIframeSlashHandler() {
  registerIframeHandler(
    '[Slash][triggerSlash]',
    async (event: MessageEvent<IframeSlash>): Promise<void> => {
      const command = event.data.command;

      const result = await executeSlashCommandsWithOptions(command);
      if (result.isError) {
        throw Error(`${getLogPrefix(event)}运行 Slash 命令 '${command}' 时出错: ${result.errorMessage}`);
      }

      console.info(`${getLogPrefix(event)}运行 Slash 命令: ${command}`);
    },
  )

  registerIframeHandler(
    '[Slash][triggerSlashWithResult]',
    async (event: MessageEvent<IframeSlash>): Promise<string | undefined> => {
      const iframe_name = getIframeName(event);
      const command = event.data.command;

      const result = await executeSlashCommandsWithOptions(command);
      if (result.isError) {
        throw Error(`[Slash][TriggerSlashWithResult]${iframe_name} 运行 Slash 命令 '${command}' 时出错: ${result.errorMessage}`);
      }

      console.info(`${getLogPrefix(event)}运行 Slash 命令 '${command}', 结果: ${result.pipe}`);
      return result.pipe;
    },
  )
}
