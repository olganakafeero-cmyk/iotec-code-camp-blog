import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'
import Paywall from './Paywall'

interface PaywallDialogProps {
  blogId: Id<'blogs'>
  amount: number
  onUnlocked: (transactionId: string) => void
  onClose: () => void
}

export default function PaywallDialog({
  blogId,
  amount,
  onUnlocked,
  onClose,
}: PaywallDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return createPortal(
    <div
      className="pwd-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="pwd-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Unlock the full essay"
        tabIndex={-1}
        ref={dialogRef}
      >
        <button
          type="button"
          className="pwd-close"
          aria-label="Close"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <Paywall blogId={blogId} amount={amount} onUnlocked={onUnlocked} />
      </div>
    </div>,
    document.body,
  )
}