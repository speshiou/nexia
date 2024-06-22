'use client'

import { useTelegram } from '@/components/webapp/telegram-provider'
import ListGroup from '@/components/widget/list_group'
import ListItem from '@/components/widget/list_item'
import Scaffold from '@/components/widget/scaffold'
import { packages } from '@/lib/packages'
import { useState } from 'react'

export default function Page() {
  const { initialized, webApp } = useTelegram()
  const [packageIndex, setPackageIndex] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'crypto'>(
    'paypal',
  )

  return (
    <Scaffold title="Purchase Tokens" root={true}>
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
