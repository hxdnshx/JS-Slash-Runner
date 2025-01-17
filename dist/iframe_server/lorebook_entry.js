export { handleLorebookEntry };
import { debounce } from "../../../../../utils.js";
import { createWorldInfoEntry, deleteWIOriginalDataValue, loadWorldInfo, originalWIDataKeyMap, saveWorldInfo, setWIOriginalDataValue, world_names } from "../../../../../world-info.js";
// TODO: don't repeat this in all files
function getIframeName(event) {
    const window = event.source;
    return window.frameElement?.id;
}
function toLorebookEntry(entry) {
    return {
        uid: entry.uid,
        display_index: entry.displayIndex,
        comment: entry.comment,
        enabled: !entry.disable,
        type: entry.constant ? 'constant' : (entry.vectorized ? 'vectorized' : 'selective'),
        // @ts-ignore
        position: ({
            0: 'before_character_definition',
            1: 'after_character_definition',
            5: 'before_example_messages',
            6: 'after_example_messages',
            2: 'before_author_note',
            3: 'after_author_note',
        }[entry.position])
            ?? (entry.role === 0 ? 'at_depth_as_system' : (entry.role === 1 ? 'at_depth_as_user' : 'at_depth_as_assistant')),
        depth: entry.position === 4 ? entry.depth : null,
        order: entry.order,
        probability: entry.probability,
        key: entry.key,
        logic: ({
            0: 'and_any', 1: 'and_all', 2: 'not_any', 3: 'not_all',
        }[entry.selectiveLogic]),
        filter: entry.keysecondary,
        scan_depth: entry.scanDepth ?? 'same_as_global',
        case_sensitive: entry.caseSensitive ?? 'same_as_global',
        match_whole_words: entry.matchWholeWords ?? 'same_as_global',
        use_group_scoring: entry.useGroupScoring ?? 'same_as_global',
        automation_id: entry.automationId || null,
        exclude_recursion: entry.excludeRecursion,
        prevent_recursion: entry.preventRecursion,
        delay_until_recursion: entry.delayUntilRecursion,
        content: entry.content,
        group: entry.group,
        group_prioritized: entry.groupOverride,
        group_weight: entry.groupWeight,
        sticky: entry.sticky || null,
        cooldown: entry.cooldown || null,
        delay: entry.delay || null,
    };
}
function fromPartialLorebookEntry(entry) {
    const transformers = {
        uid: (value) => ({ uid: value }),
        display_index: (value) => ({ displayIndex: value }),
        comment: (value) => ({ comment: value }),
        enabled: (value) => ({ disable: !value }),
        type: (value) => ({
            constant: value === 'constant',
            vectorized: value === 'vectorized'
        }),
        position: (value) => ({
            position: {
                'before_character_definition': 0,
                'after_character_definition': 1,
                'before_example_messages': 5,
                'after_example_messages': 6,
                'before_author_note': 2,
                'after_author_note': 3,
                'at_depth_as_system': 4,
                'at_depth_as_user': 4,
                'at_depth_as_assistant': 4,
            }[value],
            // @ts-ignore
            role: {
                'at_depth_as_system': 0,
                'at_depth_as_user': 1,
                'at_depth_as_assistant': 2,
            }[value] ?? null
        }),
        depth: (value) => ({ depth: value === null ? 4 : value }),
        order: (value) => ({ order: value }),
        probability: (value) => ({ probability: value }),
        key: (value) => ({ key: value }),
        logic: (value) => ({
            selectiveLogic: {
                'and_any': 0,
                'and_all': 1,
                'not_any': 2,
                'not_all': 3,
            }[value]
        }),
        filter: (value) => ({ keysecondary: value }),
        scan_depth: (value) => ({ scanDepth: value === 'same_as_global' ? null : value }),
        case_sensitive: (value) => ({ caseSensitive: value === 'same_as_global' ? null : value }),
        match_whole_words: (value) => ({ matchWholeWords: value === 'same_as_global' ? null : value }),
        use_group_scoring: (value) => ({ useGroupScoring: value === 'same_as_global' ? null : value }),
        automation_id: (value) => ({ automationId: value === null ? '' : value }),
        exclude_recursion: (value) => ({ excludeRecursion: value }),
        prevent_recursion: (value) => ({ preventRecursion: value }),
        delay_until_recursion: (value) => ({ delayUntilRecursion: value }),
        content: (value) => ({ content: value }),
        group: (value) => ({ group: value }),
        group_prioritized: (value) => ({ groupOverride: value }),
        group_weight: (value) => ({ groupWeight: value }),
        sticky: (value) => ({ sticky: value === null ? 0 : value }),
        cooldown: (value) => ({ cooldown: value === null ? 0 : value }),
        delay: (value) => ({ delay: value === null ? 0 : value }),
    };
    return Object.entries(entry)
        .filter(([_, value]) => value !== undefined)
        .reduce((result, [field, value]) => ({
        ...result,
        // @ts-ignore
        ...transformers[field]?.(value)
    }), {});
}
function assignFieldValuesToWiEntry(data, wi_entry, field_values) {
    Object.entries(field_values)
        .forEach(([field, value]) => {
        wi_entry[field] = value;
        // @ts-ignore
        const original_wi_mapped_key = originalWIDataKeyMap[field];
        if (original_wi_mapped_key) {
            // @ts-ignore
            setWIOriginalDataValue(data, wi_entry.uid, original_wi_mapped_key, value);
        }
    });
}
function reloadEditor(file) {
    const currentIndex = Number($('#world_editor_select').val());
    const selectedIndex = world_names.indexOf(file);
    if (selectedIndex !== -1 && currentIndex === selectedIndex) {
        $('#world_editor_select').val(selectedIndex).trigger('change');
    }
}
const reloadEditorDebounced = debounce(reloadEditor);
const event_handlers = {
    iframe_get_lorebook_entries: async (event) => {
        const iframe_name = getIframeName(event);
        const uid = event.data.uid;
        const lorebook = event.data.lorebook;
        const option = event.data.option;
        // @ts-ignore
        let entries = (Object.values((await loadWorldInfo(lorebook)).entries)).map(toLorebookEntry);
        // QUESTION: 好像没办法从 data 检测世界书是否存在?
        if (option.filter !== 'none') {
            entries = entries.filter(entry => Object.entries(option.filter)
                .every(([field, expected_value]) => {
                // @ts-ignore
                const entry_value = entry[field];
                if (Array.isArray(entry_value)) {
                    return expected_value.every(value => entry_value.includes(value));
                }
                if (typeof entry_value === 'string') {
                    return entry_value.includes(expected_value);
                }
                return entry_value === expected_value;
            }));
        }
        if (option.fields !== 'all') {
            entries = entries.map(entry => Object.fromEntries(Object.entries(entry)
                // @ts-ignore
                .filter(([field]) => option.fields.includes(field))));
        }
        event.source.postMessage({
            request: 'iframe_get_lorebook_entries_callback',
            uid: uid,
            result: entries,
        }, { targetOrigin: "*" });
        console.info(`[Lorebook][getLorebookEntries](${iframe_name}) 获取世界书 '${lorebook}' 中的条目, 选项: ${JSON.stringify(option)}`);
    },
    iframe_set_lorebook_entries: async (event) => {
        const iframe_name = getIframeName(event);
        const lorebook = event.data.lorebook;
        const entries = event.data.entries;
        const data = await loadWorldInfo(lorebook);
        // QUESTION: 好像没办法从 data 检测世界书是否存在?
        const process_entry = async (entry) => {
            // @ts-ignore
            const wi_entry = data.entries[entry.uid];
            if (!wi_entry) {
                console.warn(`[Lorebook][setLorebookEntries](${iframe_name}) 未能在世界书 '${lorebook}' 中找到 uid=${entry.uid} 的条目`);
                return;
            }
            assignFieldValuesToWiEntry(data, wi_entry, fromPartialLorebookEntry(entry));
        };
        await Promise.all(entries.map(process_entry));
        await saveWorldInfo(lorebook, data);
        reloadEditorDebounced(lorebook);
        console.info(`[Lorebook][setLorebookEntries](${iframe_name}) 修改世界书 '${lorebook}' 中以下条目的以下字段: ${JSON.stringify(entries)}`);
    },
    iframe_create_lorebook_entry: async (event) => {
        const iframe_name = getIframeName(event);
        const uid = event.data.uid;
        const lorebook = event.data.lorebook;
        const field_values = event.data.field_values;
        const data = await loadWorldInfo(lorebook);
        // QUESTION: 好像没办法从 data 检测世界书是否存在?
        const wi_entry = createWorldInfoEntry(lorebook, data);
        assignFieldValuesToWiEntry(data, wi_entry, fromPartialLorebookEntry(field_values));
        event.source.postMessage({
            request: 'iframe_create_lorebook_entry_callback',
            uid: uid,
            // @ts-ignore 2339
            result: wi_entry.uid,
        }, { targetOrigin: "*" });
        await saveWorldInfo(lorebook, data);
        reloadEditorDebounced(lorebook);
        console.info(`[Lorebook][createLorebookEntry](${iframe_name}) 在世界书 '${lorebook}' 中新建 uid='${wi_entry.uid}' 条目, 并设置内容: ${JSON.stringify(field_values)}`);
    },
    iframe_delete_lorebook_entry: async (event) => {
        const iframe_name = getIframeName(event);
        const uid = event.data.uid;
        const lorebook = event.data.lorebook;
        const lorebook_uid = event.data.lorebook_uid;
        const data = await loadWorldInfo(lorebook);
        // QUESTION: 好像没办法从 data 检测世界书是否存在?
        let deleted = false;
        // @ts-ignore 18046
        if (data.entries[lorebook_uid]) {
            // @ts-ignore 18046
            delete data.entries[lorebook_uid];
            deleted = true;
        }
        event.source.postMessage({
            request: 'iframe_delete_lorebook_entry_callback',
            uid: uid,
            result: deleted,
        }, { targetOrigin: "*" });
        if (deleted) {
            // @ts-ignore 2345
            deleteWIOriginalDataValue(data, lorebook_uid);
            await saveWorldInfo(lorebook, data);
            reloadEditorDebounced(lorebook);
        }
        console.info(`[Lorebook][deleteLorebookEntry](${iframe_name}) 删除世界书 '${lorebook}' 中的 uid='${lorebook_uid}' 条目${deleted ? '成功' : '失败'}`);
    },
};
async function handleLorebookEntry(event) {
    if (!event.data)
        return;
    try {
        const handler = event_handlers[event.data.request];
        if (handler) {
            handler(event);
        }
    }
    catch (error) {
        console.error(`${error}`);
        throw error;
    }
}
//# sourceMappingURL=lorebook_entry.js.map