import { useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface FormDialogProps {
  children: ReactNode
  closeLabel: string
  description: string
  isBusy: boolean
  open: boolean
  title: string
  onOpenChange: (open: boolean) => void
}

export const FormDialog = ({
  children,
  closeLabel,
  description,
  isBusy,
  open,
  title,
  onOpenChange,
}: FormDialogProps) => {
  const returnFocusRef = useRef<HTMLElement | null>(null)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen || !isBusy) onOpenChange(nextOpen)
      }}
    >
      <DialogContent
          onOpenAutoFocus={() => {
            returnFocusRef.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null
          }}
          onCloseAutoFocus={(event) => {
            if (!returnFocusRef.current) return

            event.preventDefault()
            returnFocusRef.current.focus()
          }}
          onEscapeKeyDown={(event) => {
            if (isBusy) event.preventDefault()
          }}
          onPointerDownOutside={(event) => {
            if (isBusy) event.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {title}
            </DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogClose asChild>
            <Button
              className="absolute top-5 right-5 rounded-full"
              size="icon-sm"
              variant="ghost"
              aria-label={closeLabel}
              disabled={isBusy}
            >
              <X aria-hidden="true" className="size-4" strokeWidth={2} />
            </Button>
          </DialogClose>

          <div className="mt-6">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
