import { escapeHtml } from "../utils";

interface ApiResponse {
    ok: boolean;
    description: string;
    result: any;
}

export type InlineKeyboardMarkup = {
    inline_keyboard: InlineKeyboardButton[][]
}

export type InlineKeyboardButton = {
    text: string
    web_app?: WebAppInfo
}

export type WebAppInfo = {
    url: string
}

interface MenuButton {
    /* Define the structure for the menu button */
}

interface Media {
    type: string;
    media: string;
    caption?: string;
    parse_mode?: string;
}


class TelegramApi {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async request(api: string, formData: FormData): Promise<any> {
        const requestUrl: string = 'https://api.telegram.org/bot' + this.token + '/' + api;

        const options: RequestInit = {
            method: 'POST',
            body: formData,
        };

        const response = await fetch(requestUrl, options);
        if (!response.ok) {
            console.log(await response.text())
            throw new Error('Telegram API Error: ' + response.statusText);
        }
        const result = await response.json()
        if (!result.ok) {
            console.log(await response.text())
            throw new Error('Telegram API Error: ' + result.description);
        }
        return result.result;
    }

    async sendMessage(chatId: number, message: string, replyMarkup?: InlineKeyboardMarkup): Promise<any> {
        const formData = new FormData();
        formData.append('chat_id', chatId.toString())
        formData.append('text', message)

        if (replyMarkup) {
            formData.append('reply_markup', JSON.stringify(replyMarkup))
        }

        return this.request('sendMessage', formData);
    }

    async sendMediaGroup(chatId: number, photos: string[], caption: string): Promise<any> {
        const mediaArray: Media[] = [];

        const formData = new FormData();
        formData.append('chat_id', chatId.toString())

        photos.forEach((photo, index) => {
            if (URL.canParse(photo)) {
                const media: Media = {
                    type: 'photo',
                    media: photo,
                }
                mediaArray.push(media);
            } else {
                const base64Image = photo
                const filename = `photo${index}.png`
                const media: Media = {
                    type: 'photo',
                    media: `attach://${filename}`
                }
    
                if (index === 0) {
                    media.caption = `<code>${escapeHtml(caption)}</code>`;
                    media.parse_mode = 'HTML';
                }
    
                mediaArray.push(media);
    
                const binaryData = Buffer.from(base64Image, 'base64')
    
                const blob = new Blob([binaryData], { type: "image/png" })
                formData.append(filename, blob, filename)
            }
        })

        formData.append('media', JSON.stringify(mediaArray))

        const result = await this.request("sendMediaGroup", formData)
    }

    async sendAnimation(chatId: number, gif: string, caption: string): Promise<any> {
        const formData = new FormData();
        formData.append('chat_id', chatId.toString())
        formData.append('caption', `<code>${escapeHtml(caption)}</code>`)
        formData.append('parse_mode', 'HTML')

        const binaryData = Buffer.from(gif, 'base64')
        const blob = new Blob([binaryData], { type: "image/gif" })
        formData.append("animation", blob, `${new Date().getMilliseconds()}.gif`)

        const result = await this.request("sendAnimation", formData)
    }

    async setChatMenuButton(chatId: string, menuButton: MenuButton): Promise<any> {
        const formData = new FormData();
        formData.append('chat_id', chatId.toString())
        formData.append('menu_button', JSON.stringify(menuButton))

        return this.request('setChatMenuButton', formData);
    }

    async answerWebAppQuery(queryId: string, resultData: any): Promise<any> {
        const formData = new FormData();
        formData.append('web_app_query_id', queryId)
        formData.append('result', JSON.stringify(resultData))

        return this.request('answerWebAppQuery', formData);
    }
}

export default TelegramApi