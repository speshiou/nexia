import { PayPal } from '@/lib/paypal'

export const dynamic = 'force-dynamic' // defaults to auto

type PostData = {
  event_type: string
  resource: {
    invoice: {
      id: string
      detail: {
        invoice_number: string
      }
    }
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const data: PostData = JSON.parse(rawBody)
  if (data.event_type === 'INVOICING.INVOICE.PAID') {
    const paypal = new PayPal(
      process.env.PAYPAL_CLIENT_ID || '',
      process.env.PAYPAL_CLIENT_SECRET || '',
      process.env.PAYPAL_SANDBOX ? true : false,
    )

    const success = paypal.verifyWebhookSig(
      rawBody,
      request.headers,
      process.env.PAYPAL_WEBHOOK_ID || '',
    )
    if (!success) {
      console.error('Data not from Paypal')
      return new Response('Invalid webhook signature', {
        status: 400,
      })
    }

    const invoice = data.resource.invoice
    const invoiceId = invoice.id
    const invoiceNumber = invoice.detail.invoice_number

    console.log(`webhook=${data.event_type} order=${invoiceId}`)

    // const db = new DbManager()
    // db.finishOrder(invoiceNumber)

    return new Response('OK', {
      status: 200,
    })
  } else {
    return new Response('Event not handled', {
      status: 200,
    })
  }
}
