
import { replaceArgs } from './i18n'

const dict: LocalizedString = {
  greeting: (args: { terms_link: string, privacy_link: string }) => replaceArgs(`Hai! Nama saya Nexia, chatbot AI yang didukung model GPT, DALL·E, dan Difusi Stabil OpenAI.

<b>Fitur tambahan</b>
🧙‍♀️ Chatbot yang dapat disesuaikan
🎙 Mendukung pesan suara
🌐 Ringkas konten dalam tautan
🎬 Meringkas video Youtube (durasi maksimal 20 menit)
👥 Obrolan grup - tambahkan bot ini ke obrolan grup, lalu ketik /chatgpt untuk memulai.
✍️ /proofreader - menulis ulang kalimat
📔 /kamus - belajar tentang kata/frasa
👨‍🎨 /image - menghasilkan gambar dari teks

Dengan menggunakan chatbot ini, Anda menyetujui <a href="{{terms_link}}">persyaratan layanan</a> dan <a href="{{privacy_link}}">kebijakan privasi</a> kami.`, args),
  currentChatStatusPattern: (args: { role_name: string, mode_name: string }) => replaceArgs(`ℹ️ <i>Anda sekarang ngobrol dengan {{role_name}} ({{mode_name}}) ... </i>`, args),
  settings: (args: {  }) => replaceArgs(`Pengaturan`, args),
}

export default dict
