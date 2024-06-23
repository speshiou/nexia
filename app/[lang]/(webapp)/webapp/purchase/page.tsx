'use client'

import { useTelegram } from '@/components/webapp/telegram-provider'
import ListGroup from '@/components/widget/list_group'
import ListItem from '@/components/widget/list_item'
import Scaffold from '@/components/widget/scaffold'
import { placeOrder } from '@/lib/actions'
import { packages } from '@/lib/packages'
import { PaymentMethod } from '@/types/types'
import { useEffect, useState } from 'react'

export default function Page() {
  const { initialized, webApp } = useTelegram()
  const [packageIndex, setPackageIndex] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal')

  useEffect(() => {
    if (initialized) {
      webApp?.MainButton?.setParams({
        text: 'Place Order',
      })
      webApp?.MainButton?.enable()
      webApp?.MainButton?.onClick(handleClick)
    }

    return () => {
      webApp?.MainButton?.offClick(handleClick)
      webApp?.MainButton?.hideProgress()
    }
  }, [initialized, packageIndex, paymentMethod])

  async function handleClick() {
    webApp?.MainButton?.disable()
    webApp?.MainButton?.showProgress()
    const result = await placeOrder(
      packageIndex,
      paymentMethod,
      webApp?.initData || '',
    )
    if (result) {
      webApp?.close()
    }
  }

  return (
    <Scaffold title="Purchase Tokens" root={true} showMainButton={true}>
      <div>
        <ListGroup>
          {packages.map((p, i) => {
            return (
              <ListItem
                key={p.tokens_amount.toLocaleString()}
                title={`+${p.tokens_amount.toLocaleString()}`}
                trailing={p.payment_amount.toLocaleString()}
                selectionMode="check"
                selected={packageIndex == i}
                onClick={(e) => setPackageIndex(i)}
              />
            )
          })}
        </ListGroup>
        <ListGroup>
          <ListItem
            title="Credit and Debit Cards"
            selectionMode="check"
            selected={paymentMethod == 'paypal'}
            onClick={(e) => setPaymentMethod('paypal')}
          />
          <ListItem
            title="Cryptocurrency"
            selectionMode="check"
            selected={paymentMethod == 'crypto'}
            onClick={(e) => setPaymentMethod('crypto')}
          />
        </ListGroup>
      </div>
    </Scaffold>
  )
}
