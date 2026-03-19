'use client'

import { useState } from 'react'

export default function PasswordInput({ 
  name, 
  placeholder, 
  required = false, 
  minLength,
  showText,
  hideText
}: { 
  name: string, 
  placeholder: string, 
  required?: boolean, 
  minLength?: number,
  showText: string,
  hideText: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative w-full">
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16 font-sans"
        name={name}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        {show ? hideText : showText}
      </button>
    </div>
  )
}