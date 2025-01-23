export const iframe_client_variables = `
function isJsonObject(value) {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}
function isJsonArray(value) {
    return Array.isArray(value);
}
;
/**
 * 获取变量表
 *
 * @param option 可选选项
 *   - \`type?:'chat'|'global'\`: 对聊天变量表 (\`'chat'\`) 或全局变量表 (\`'global'\`) 进行操作, 默认为 \`'chat'\`
 *
 * @returns 变量表
 *
 * @example
 * // 获取所有聊天变量并弹窗输出结果
 * const variables = await getVariables();
 * alert(variables);
 *
 * @example
 * // 获取所有全局变量
 * const variables = await getVariables({type: 'global'});
 * // 前端助手内置了 lodash 库, 你能用它做很多事, 比如查询某个变量是否存在
 * if (_.has(variables, "神乐光.好感度")) {
 *   ...
 * }
 */
async function getVariables(option = {}) {
    option = {
        type: option.type ?? 'chat',
    };
    return detail.make_iframe_promise({
        request: "[Variables][getVariables]",
        option: option,
    });
}
/**
 * 完全替换变量表为 \`variables\`
 *
 * 之所以提供这么直接的函数, 是因为前端助手内置了 lodash 库:
 *   \`insertOrAssignVariables\` 等函数其实就是先 \`getVariables\` 获取变量表, 用 lodash 库处理, 再 \`replaceVariables\` 替换变量表.
 *
 * @param variables 要用于替换的变量表
 * @param option 可选选项
 *   - \`type?:'chat'|'global'\`: 对聊天变量表 (\`'chat'\`) 或全局变量表 (\`'global'\`) 进行操作, 默认为 \`'chat'\`
 *
 * @example
 * // 执行前的聊天变量: \`{爱城华恋: {好感度: 5}}\`
 * await replaceVariables({神乐光: {好感度: 5, 认知度: 0}});
 * // 执行后的聊天变量: \`{神乐光: {好感度: 5, 认知度: 0}}\`
 *
 * @example
 * // 删除 \`{神乐光: {好感度: 5}}\` 变量
 * let variables = await getVariables();
 * _.unset(variables, "神乐光.好感度");
 * await replaceVariables(variables);
 */
async function replaceVariables(variables, option = {}) {
    option = {
        type: option.type ?? 'chat',
    };
    return detail.make_iframe_promise({
        request: "[Variables][replaceVariables]",
        option: option,
        variables: variables,
    });
}
/**
 * 用 \`updater\` 函数更新变量表
 *
 * @param updater 用于更新变量表的函数. 它应该接收变量表作为参数, 并返回更新后的变量表.
 * @param option 可选选项
 *   - \`type?:'chat'|'global'\`: 对聊天变量表 (\`'chat'\`) 或全局变量表 (\`'global'\`) 进行操作, 默认为 \`'chat'\`
 *
 * @returns 更新后的变量表
 *
 * @example
 * // 删除 \`{神乐光: {好感度: 5}}\` 变量
 * await updateVariablesWith(variables => {_.unset(variables, "神乐光.好感度"); return variables;});
 *
 * @example
 * // 更新 "爱城华恋.好感度" 为原来的 2 倍, 如果该变量不存在则设置为 0
 * await updateVariablesWith(variables => _.update(variables, "爱城华恋.好感度", value => value ? value * 2 : 0));
 */
async function updateVariablesWith(updater, option = {}) {
    option = {
        type: option.type ?? 'chat',
    };
    let variables = await getVariables(option);
    variables = updater(variables);
    await replaceVariables(variables, option);
    console.info(\`[Chat Message][updateVariablesWith](\${getIframeName()}) 用函数对\${option.type === 'chat' ? \`聊天\` : \`全局\`}变量表进行更新, 结果: \${JSON.stringify(variables)}, 使用的函数:\\n\\n \${JSON.stringify(detail.format_function_to_string(updater))}\`);
    return variables;
}
/**
 * 插入或修改变量值, 取决于变量是否存在.
 *
 * @param variables 要更新的变量
 *   - 如果变量不存在, 则新增该变量
 *   - 如果变量已经存在, 则修改该变量的值
 * @param option 可选选项
 *   - \`type?:'chat'|'global'\`: 聊天变量或全局变量, 默认为聊天变量 'chat'
 *
 * @example
 * // 执行前变量: \`{爱城华恋: {好感度: 5}}\`
 * await insertOrAssignVariables({爱城华恋: {好感度: 10}, 神乐光: {好感度: 5, 认知度: 0}});
 * // 执行后变量: \`{爱城华恋: {好感度: 10}, 神乐光: {好感度: 5, 认知度: 0}}\`
 */
async function insertOrAssignVariables(variables, option = {}) {
    await updateVariablesWith(old_variables => _.merge(old_variables, variables), option);
}
/**
 * 插入新变量, 如果变量已经存在则什么也不做
 *
 * @param variables 要插入的变量
 *   - 如果变量不存在, 则新增该变量
 *   - 如果变量已经存在, 则什么也不做
 * @param option 可选选项
 *   - \`type?:'chat'|'global'\`: 聊天变量或全局变量, 默认为聊天变量 'chat'
 *
 * @example
 * // 执行前变量: \`{爱城华恋: {好感度: 5}}\`
 * await insertVariables({爱城华恋: {好感度: 10}, 神乐光: {好感度: 5, 认知度: 0}});
 * // 执行后变量: \`{爱城华恋: {好感度: 5}, 神乐光: {好感度: 5, 认知度: 0}}\`
 */
async function insertVariables(variables, option = {}) {
    await updateVariablesWith(old_variables => _.defaultsDeep(old_variables, variables), option);
}
/**
 * 删除变量, 如果变量不存在则什么也不做
 *
 * @param variable_path 要删除的变量路径
 *   - 如果变量不存在, 则什么也不做
 *   - 如果变量已经存在, 则删除该变量
 * @param option 可选选项
 *   - \`type?:'chat'|'global'\`: 聊天变量或全局变量, 默认为聊天变量 'chat'
 *
 * @returns 是否成功删除变量
 *
 * @example
 * // 执行前变量: \`{爱城华恋: {好感度: 5}}\`
 * await deleteVariable("爱城华恋.好感度");
 * // 执行后变量: \`{爱城华恋: {}}\`
 */
async function deleteVariable(variable_path, option = {}) {
    let result = false;
    await updateVariablesWith(old_variables => { result = _.unset(old_variables, variable_path); return old_variables; }, option);
    return result;
}
async function setVariables(message_id, new_or_updated_variables) {
    let actual_message_id;
    let actual_variables;
    if (new_or_updated_variables) {
        actual_message_id = message_id;
        actual_variables = new_or_updated_variables;
    }
    else {
        actual_message_id = getCurrentMessageId();
        actual_variables = message_id;
    }
    if (typeof actual_message_id !== 'number' || typeof actual_variables !== 'object') {
        console.error("[Variables][setVariables] 调用出错, 请检查你的参数类型是否正确");
        return;
    }
    return detail.make_iframe_promise({
        request: "[Variables][setVariables]",
        message_id: actual_message_id,
        variables: actual_variables,
    });
}
`;
//# sourceMappingURL=variables.js.map