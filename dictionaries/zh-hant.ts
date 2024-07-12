
import { replaceArgs } from './i18n'

const dict: LocalizedString = {
  greeting: (args: { terms_link: string, privacy_link: string }) => replaceArgs(`你好！我的名字是 Nexia，一個由 OpenAI 的 GPT、DALL·E 和 Stable Diffusion 模型提供支援的 AI 聊天機器人。

<b>附加功能</b>
🧙‍​​♀️ 可自訂的聊天機器人
🎙 支援語音留言
🌐 總結連結中的內容
🎬 總結 Youtube 影片（最長 20 分鐘）
👥 群組聊天 - 將此機器人加入群組聊天中，然後輸入 /chatgpt 開始。
✍️ /proofreader - 重寫句子
📔 /dictionary - 了解單字/片語
👨‍🎨 /image - 從文字產生圖像

使用此聊天機器人即表示您同意我們的<a href="{{terms_link}}">服務條款</a>和<a href="{{privacy_link}}">隱私權政策</a>。`, args),
  currentChatStatusPattern: (args: { role_name: string, mode_name: string }) => replaceArgs(`ℹ️ <i>您現在正在與 {{role_name}} ({{mode_name}}) 聊天...</i>`, args),
  settings: (args: {  }) => replaceArgs(`設定`, args),
}

export default dict
