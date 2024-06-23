import path from 'path'

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || ''

export class PayPal {
  private access_token: string = ''
  private client_id: string
  private client_secret: string
  private sandbox: boolean

  constructor(
    client_id: string,
    client_secret: string,
    sandbox: boolean = false,
  ) {
    this.client_id = client_id
    this.client_secret = client_secret
    this.sandbox = sandbox
  }

  private getApiUrl(apiPath: string): string {
    return path.join(
      this.sandbox
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api.paypal.com',
      apiPath,
    )
  }

  private async getAccessToken(): Promise<string> {
    if (this.access_token) {
      return this.access_token
    }
    const url = this.getApiUrl('/v1/oauth2/token')
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(`${this.client_id}:${this.client_secret}`).toString(
            'base64',
          ),
      },
      body: `grant_type=client_credentials`,
    })

    const data = await response.json()
    this.access_token = data.access_token
    return this.access_token
  }

  private async makeApiRequest(
    endpoint: string,
    method: string = 'GET',
    data: any = null,
    rawBody: any = null,
    headers: Record<string, string> | null = null,
  ): Promise<any> {
    const url = this.getApiUrl(endpoint)
    const accessToken = await this.getAccessToken()
    const requiredHeaders = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
    const allHeaders = headers
      ? { ...requiredHeaders, ...headers }
      : requiredHeaders

    const options: RequestInit = {
      method,
      headers: allHeaders,
      body:
        method === 'POST' || method === 'PUT'
          ? JSON.stringify(data)
          : undefined,
    }

    const response = await fetch(url, options)
    const responseData = await response.json()

    if (response.ok) {
      return responseData
    } else {
      throw new Error(JSON.stringify(responseData))
    }
  }

  public async verifyWebhookSig(
    requestBody: any,
    requestHeaders: Record<string, string>,
  ): Promise<boolean> {
    const endpoint = '/v1/notifications/verify-webhook-signature'

    const verificationData = {
      transmission_id: requestHeaders['PAYPAL-TRANSMISSION-ID'],
      transmission_time: requestHeaders['PAYPAL-TRANSMISSION-TIME'],
      cert_url: requestHeaders['PAYPAL-CERT-URL'],
      auth_algo: requestHeaders['PAYPAL-AUTH-ALGO'],
      transmission_sig: requestHeaders['PAYPAL-TRANSMISSION-SIG'],
      webhook_id: PAYPAL_WEBHOOK_ID,
    }

    const valuesToEncode = verificationData
    const payload = {
      ...valuesToEncode,
      webhook_event: requestBody,
    }

    const result = await this.makeApiRequest(endpoint, 'POST', payload)
    return result.verification_status === 'SUCCESS'
  }

  public async createInvoice(
    invoiceNumber: string,
    items: InvoiceItem[],
    recipient_email: string | null = null,
  ): Promise<any> {
    const headers = {
      Prefer: 'return=representation',
    }

    const data = {
      detail: {
        invoice_number: invoiceNumber,
        currency_code: 'USD',
      },
      invoicer: {
        website: `Nexia Chatbots`,
      },
      primary_recipient: {
        billing_info: {
          // email_address: recipient_email
        },
      },
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit_amount: {
          currency_code: item.currency_code,
          value: item.price,
        },
      })),
      configuration: {
        allow_tip: false,
        partial_payment: {
          allow_partial_payment: false,
        },
        tax_inclusive: false,
      },
    }

    return this.makeApiRequest(
      '/v2/invoicing/invoices',
      'POST',
      data,
      null,
      headers,
    )
  }

  public async sendInvoice(
    invoice_id: string,
    recipient_email: string | null = null,
  ): Promise<any> {
    const endpoint = `/v2/invoicing/invoices/${invoice_id}/send`

    const data = {
      subject: `Payment due for invoice #${invoice_id}`,
      note: 'Please pay your invoice promptly.',
      send_to_invoicer: true,
      send_to_recipient: false,
    }

    return this.makeApiRequest(endpoint, 'POST', data)
  }

  public async listInvoices(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    const path = `/v2/invoicing/invoices?page=${page}&page_size=${pageSize}`
    return this.makeApiRequest(path)
  }
}

export type InvoiceItem = {
  name: string
  quantity: number
  currency_code: string
  price: number
}
