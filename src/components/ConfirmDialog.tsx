import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Trash2 } from 'lucide-react'
import { joinClassNames, secondaryButtonStyles } from '../styles'
import { Loader } from './Loader'

interface ConfirmDialogProps {
  confirmLabel?: string
  description: string
  isConfirming?: boolean
  open: boolean
  title: string
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export const ConfirmDialog = ({
  confirmLabel = 'Delete',
  description,
  isConfirming = false,
  open,
  title,
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) => (
  <AlertDialog.Root
    open={open}
    onOpenChange={(nextOpen) => {
      if (!isConfirming) onOpenChange(nextOpen)
    }}
  >
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 z-40 animate-[dialog-overlay-in_160ms_ease-out] bg-[rgba(11,18,14,0.58)] backdrop-blur-[4px]" />
      <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%_-_32px)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 animate-[dialog-content-in_180ms_ease-out] rounded-large border border-border bg-surface p-6 shadow-[0_24px_70px_rgba(11,18,14,0.24)] outline-none max-[700px]:p-5">
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fbeaea] text-[#a62b2b]">
            <Trash2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <AlertDialog.Title className="m-0 text-xl font-bold tracking-[-0.025em] text-strong">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 mb-0 text-sm leading-[1.6] text-muted">
              {description}
            </AlertDialog.Description>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5 max-[500px]:flex-col-reverse">
          <AlertDialog.Cancel asChild>
            <button
              className={joinClassNames(
                secondaryButtonStyles,
                'min-w-[105px] max-[500px]:w-full',
              )}
              type="button"
              disabled={isConfirming}
            >
              Cancel
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button
              className="min-h-[46px] min-w-[105px] cursor-pointer rounded-[10px] border-0 bg-[#a62b2b] px-[18px] text-sm font-[750] text-white transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-[#872222] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#efb4b4] disabled:cursor-wait disabled:opacity-65 disabled:hover:translate-y-0 max-[500px]:w-full"
              type="button"
              disabled={isConfirming}
              onClick={(event) => {
                event.preventDefault()
                onConfirm()
              }}
            >
              {isConfirming ? (
                <Loader label="Deleting..." size="small" />
              ) : (
                confirmLabel
              )}
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
)
