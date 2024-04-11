import React, { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  theme?: 'primary' | 'text'
  url?: string
}

const Button: React.FC<ButtonProps> = ({ theme = 'primary', ...props }) => {
  const baseClasses = clsx({
    'rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400':
      theme == 'primary',
    'text-sm font-semibold leading-6 text-gray-900 dark:text-white':
      theme == 'text',
  })

  const classes = `${baseClasses} ${props.className}`
  if (props.url) {
    return (
      <a href={props.url} className={classes}>
        {props.children}
      </a>
    )
  } else {
    const baseAttrs = props as ButtonHTMLAttributes<HTMLButtonElement>
    return (
      <button {...baseAttrs} className={classes}>
        {props.children}
      </button>
    )
  }
}

export default Button
