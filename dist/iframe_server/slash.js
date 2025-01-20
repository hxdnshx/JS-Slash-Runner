import { executeSlashCommandsWithOptions } from "../../../../../slash-commands.js";
import { getIframeName, registerIframeHandler } from "./index.js";
export function registerIframeSlashHandler() {
    registerIframeHandler('iframe_trigger_slash', async (event) => {
        const iframe_name = getIframeName(event);
        const command = event.data.command;
        const result = await executeSlashCommandsWithOptions(command);
        if (result.isError) {
            throw Error(`[Slash][TriggerSlash]${iframe_name} 运行 Slash 命令 '${command}' 时出错: ${result.errorMessage}`);
        }
        console.info(`[Slash][TriggerSlash](${iframe_name}) 运行 Slash 命令: ${command}`);
    });
    registerIframeHandler('iframe_trigger_slash_with_result', async (event) => {
        const iframe_name = getIframeName(event);
        const command = event.data.command;
        const result = await executeSlashCommandsWithOptions(command);
        if (result.isError) {
            throw Error(`[Slash][TriggerSlashWithResult]${iframe_name} 运行 Slash 命令 '${command}' 时出错: ${result.errorMessage}`);
        }
        console.info(`[Slash][TriggerSlashWithResult](${iframe_name}) 运行 Slash 命令 '${command}', 结果: ${result.pipe}`);
        return result.pipe;
    });
}
//# sourceMappingURL=slash.js.map