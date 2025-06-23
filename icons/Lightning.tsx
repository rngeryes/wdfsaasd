import React from 'react'

const Lightning = ({ className }: { className?: string }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M13 2L4 14H12L11 22L20 10H12L13 2Z" 
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default Lightning