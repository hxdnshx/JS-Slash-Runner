/**
 * 获取前端助手版本号
 */
function getFrontendVersion(): string {
  const version = $(".js-settings", window.parent.document).find('.extension_info.flex-container.spaceBetween > small').text().replace('Ver ', '');
  console.info(`[FrontendVersion][getFrontendVersion] 获取前端助手版本号: ${version}`);
  return version;
}

/**
 * 尝试主动更新前端助手
 */
async function updateFrontendVersion(): Promise<boolean> {
  return detail.make_iframe_promise({
    request: "[FrontendVersion][updateFrontendVersion]",
  });
}
