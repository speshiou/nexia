'use client'

import React from 'react'
import { PaintBrushIcon } from '@heroicons/react/24/outline'
import { useAccount } from '../account-provider'

export default function Header() {

  const {gems} = useAccount()

  return (
    <header>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <PaintBrushIcon className='w-8 h-8 text-indigo-600' />
        <a href="getgems" className="flex gap-4 text-lg font-semibold leading-6 text-gray-900 dark:text-white">
          💎 <span aria-hidden="true">{gems}</span>
        </a>
      </nav>
    </header>
  )
}
