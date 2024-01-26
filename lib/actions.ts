'use server'

import { _authTelegram } from "./auth"

export async function authTelegram(initData: string) {
    const authData = _authTelegram(initData)
  return {
    'status': 'OK'
  }
}