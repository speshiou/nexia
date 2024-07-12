
import { replaceArgs } from './i18n'

const dict: LocalizedString = {
  greeting: (args: { terms_link: string, privacy_link: string }) => replaceArgs(`嗨！我的名字是 Nexia，一个由 OpenAI 的 GPT、DALL·E 和 Stable Diffusion 模型提供支持的 AI 聊天机器人。

<b>附加功能</b>
🧙‍♀️ 可自定义的聊天机器人
🎙 支持语音消息
🌐 总结链接中的内容
🎬 总结 Youtube 视频（最长 20 分钟）
👥 群聊 - 将此机器人添加到群聊，然后输入 /chatgpt 开始。
✍️ /proofreader - 重写句子
📔 /dictionary - 了解单词/短语
👨‍🎨 /image - 从文本生成图像

使用此聊天机器人，即表示您同意我们的<a href="{{terms_link}}">服务条款</a>和<a href="{{privacy_link}}">隐私政策</a>。`, args),
  currentChatStatusPattern: (args: { role_name: string, mode_name: string }) => replaceArgs(`ℹ️ <i>您现在正在与 {{role_name}} ({{mode_name}}) 聊天... </i>`, args),
  settings: (args: {  }) => replaceArgs(`设置`, args),
}

export default dict
