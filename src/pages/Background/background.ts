import { summaDebugLog } from '../../lib/utils';

// 监听插件图标点击事件
chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  // 向当前标签页发送消息
  if (tab.id) {
    summaDebugLog('发送 clickedSumma 消息到标签页:', tab.id);
    chrome.tabs.sendMessage(tab.id, {
      action: 'clickedSumma'
    });
  }
});