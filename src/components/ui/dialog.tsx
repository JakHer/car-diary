import type { ComponentProps } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogPortal = DialogPrimitive.Portal

export const DialogOverlay = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay
    data-slot="dialog-overlay"
    className={cn(
      'fixed inset-0 z-40 animate-[dialog-overlay-in_160ms_ease-out] bg-[rgba(11,18,14,0.55)] backdrop-blur-[5px]',
      className,
    )}
    {...props}
  />
)

export const DialogContent = ({
  children,
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      data-slot="dialog-content"
      className={cn(
        'fixed top-1/2 left-1/2 z-50 max-h-[calc(100svh-32px)] w-[calc(100%_-_32px)] max-w-[640px] -translate-x-1/2 -translate-y-1/2 animate-[dialog-content-in_180ms_ease-out] overflow-y-auto rounded-large border border-border bg-surface p-7 shadow-[0_24px_70px_rgba(11,18,14,0.24)] outline-none max-[700px]:p-5',
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
)

export const DialogHeader = ({
  className,
  ...props
}: ComponentProps<'div'>) => (
  <div
    data-slot="dialog-header"
    className={cn('grid gap-2 pr-9', className)}
    {...props}
  />
)

export const DialogFooter = ({
  className,
  ...props
}: ComponentProps<'div'>) => (
  <div
    data-slot="dialog-footer"
    className={cn('flex justify-end gap-2.5 max-[500px]:flex-col-reverse', className)}
    {...props}
  />
)

export const DialogTitle = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    data-slot="dialog-title"
    className={cn(
      'm-0 text-xl font-bold tracking-[-0.025em] text-strong',
      className,
    )}
    {...props}
  />
)

export const DialogDescription = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    data-slot="dialog-description"
    className={cn('m-0 text-sm leading-[1.6] text-muted', className)}
    {...props}
  />
)
