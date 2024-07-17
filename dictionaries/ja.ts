
import { replaceArgs } from './i18n'

const dict: LocalizedString = {
  greeting: (args: { terms_link: string, privacy_link: string }) => replaceArgs(`こんにちは！私の名前はNexiaです。OpenAIのGPT、DALL·E、および安定拡散モデルを搭載したAIチャットボットです。

<b>追加機能</b>
🧙‍♀️ カスタマイズ可能なチャットボット
🎙 音声メッセージのサポート
🌐 リンク内のコンテンツを要約
🎬 Youtube動画を要約（最大20分）
👥 グループチャット - このボットをグループチャットに追加し、/chatgptと入力して開始します。
✍️ /proofreader - 文章を書き直す
📔 /dictionary - 単語/フレーズについて学ぶ
👨‍🎨 /image - テキストから画像を生成する

このチャットボットを使用すると、<a href="{{terms_link}}">利用規約</a>および<a href="{{privacy_link}}">プライバシーポリシー</a>に同意したことになります。`, args),
  simpleGreeting: `こんにちは！本日はどのようなご用件でしょうか？`,
  currentChatStatusPattern: (args: { role_name: string, mode_name: string }) => replaceArgs(`ℹ️ <i>現在、{{role_name}} ({{mode_name}}) とチャットしています...</i>`, args),
  settings: `設定`,
}

export default dict
