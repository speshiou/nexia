
import { replaceArgs } from './i18n'

const dict: LocalizedString = {
  greeting: (args: { terms_link: string, privacy_link: string }) => replaceArgs(`안녕! 제 이름은 OpenAI의 GPT, DALL·E 및 Stable Diffusion 모델을 기반으로 하는 AI 챗봇인 Nexia입니다.

<b>추가 기능</b>
🧙‍♀️ 맞춤형 챗봇
🎙 음성 메시지 지원
🌐 링크의 내용을 요약하세요
🎬 유튜브 영상 요약(최대 20분)
👥 그룹 채팅 - 이 봇을 그룹 채팅에 추가한 다음 /chatgpt를 입력하여 시작하세요.
✍️ /proofreader - 문장 다시 쓰기
📔 /dictionary - 단어/문구에 대해 알아보세요
👨‍🎨 /image - 텍스트에서 이미지 생성

이 챗봇을 사용하면 <a href="{{terms_link}}">서비스 약관</a> 및 <a href="{{privacy_link}}">개인정보취급방침</a>에 동의하게 됩니다.`, args),
  settings: (args: {  }) => replaceArgs(`설정`, args),
}

export default dict
