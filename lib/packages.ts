const TOKEN_PRICE = 0.01

function price_to_tokens(price: number) {
  return Math.floor((price / TOKEN_PRICE) * 1000)
}

export const packages: TokenPack[] = [
  {
    payment_amount: 1.99,
    tokens_amount: price_to_tokens(2),
  },
  {
    payment_amount: 7.99,
    original_payment_amount: 9.99,
    tokens_amount: price_to_tokens(10),
    caption: '-20%',
  },
  {
    payment_amount: 13.99,
    original_payment_amount: 19.99,
    tokens_amount: price_to_tokens(20),
    caption: '-30%',
  },
  {
    payment_amount: 24.99,
    original_payment_amount: 49.99,
    tokens_amount: price_to_tokens(50),
    caption: '-50%',
  },
]

export type TokenPack = {
  original_payment_amount?: number
  payment_amount: number
  tokens_amount: number
  caption?: string
}
