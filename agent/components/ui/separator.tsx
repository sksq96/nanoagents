"use client"

import React from "react"

interface SeparatorProps {
  className?: string
  orientation?: "horizontal" | "vertical"
}

export function Separator({ 
  className = "", 
  orientation = "horizontal" 
}: SeparatorProps) {
  return (
    <div 
      className={`
        ${orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"}
        bg-border shrink-0 ${className}
      `}
      role="separator"
    />
  )
} 