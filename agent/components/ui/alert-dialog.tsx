"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  const [isOpen, setIsOpen] = React.useState(open || false)

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={() => handleOpenChange(false)}
      />
      <div className="z-50">{children}</div>
    </div>
  )
}

export function AlertDialogContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(
      "bg-background border rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in-0 zoom-in-95",
      className
    )}>
      {children}
    </div>
  )
}

export function AlertDialogHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  )
}

export function AlertDialogFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex justify-end space-x-2 mt-4", className)}>
      {children}
    </div>
  )
}

export function AlertDialogTitle({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

export function AlertDialogDescription({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
}

export function AlertDialogAction({ 
  children, 
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  className?: string 
}) {
  return (
    <Button 
      className={cn("", className)} 
      {...props}
    >
      {children}
    </Button>
  )
}

export function AlertDialogCancel({ 
  children = "Cancel", 
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  className?: string 
}) {
  return (
    <Button 
      variant="outline" 
      className={cn("", className)}
      {...props}
    >
      {children}
    </Button>
  )
} 