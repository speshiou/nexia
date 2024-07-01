'use client'

import { useTelegram } from '@/components/webapp/telegram-provider'
import ListGroup from '@/components/widget/ListGroup'
import ListItem from '@/components/widget/ListItem'
import Scaffold from '@/components/widget/scaffold'
import { placeOrder } from '@/lib/actions'
import { packages } from '@/lib/packages'
import { PaymentMethod } from '@/types/types'
import { useEffect, useState } from 'react'

export default function Page() {
  const { initialized, webApp } = useTelegram()
  const [packageIndex, setPackageIndex] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal')
  const [processing, setProcessing] = useState(false)

  async function handleClick() {
    setProcessing(true)
    const result = await placeOrder(
      packageIndex,
      paymentMethod,
      webApp?.initData || '',
    )
    if (result) {
      webApp?.close()
    } else {
      setProcessing(false)
    }
  }

  return (
    <Scaffold
      title="Purchase Tokens"
      mainButtonOptions={{
        processing: processing,
        show: true,
        text: 'Place Order',
        onClick: handleClick,
      }}
    >
      <div>
        <ListGroup title="Packages">
          {packages.map((p, i) => {
            return (
              <ListItem
                key={p.tokens_amount.toLocaleString()}
                title={`+${p.tokens_amount.toLocaleString()}`}
                trailing={`$${p.payment_amount.toLocaleString()}`}
                selectionMode="circle"
                selected={packageIndex == i}
                onClick={(e) => setPackageIndex(i)}
              />
            )
          })}
        </ListGroup>
        <ListGroup title="Payment Methods">
          <ListItem
            title="Credit and Debit Cards"
            selectionMode="circle"
            selected={paymentMethod == 'paypal'}
            onClick={(e) => setPaymentMethod('paypal')}
          />
          {/* <ListItem
            title="Cryptocurrency"
            selectionMode="circle"
            selected={paymentMethod == 'crypto'}
            onClick={(e) => setPaymentMethod('crypto')}
          /> */}
        </ListGroup>
      </div>
    </Scaffold>
  )
}
