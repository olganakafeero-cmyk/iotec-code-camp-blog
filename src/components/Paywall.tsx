import { useEffect, useRef, useState } from 'react'
import { useAction, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import {
  AtSign,
  Check,
  ChevronDown,
  Lock,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import './paywall.css'

type Tab = 'new' | 'restore'
type Network = 'MTN MoMo' | 'Airtel Money'

interface PaywallProps {
  blogId: Id<'blogs'>
  amount: number
  onUnlocked: (transactionId: string) => void
}

const POLL_MS = 3000
const POLL_LIMIT = 40 // about two minutes

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const messageFrom = (error: unknown) =>
  error instanceof ConvexError && typeof error.data === 'string'
    ? error.data
    : 'Something went wrong. Please try again.'

export default function Paywall({ blogId, amount, onUnlocked }: PaywallProps) {
  const initiateCollection = useAction(api.iotecPay.iotecPayActions.initiateCollection)
  const checkCollectionStatus = useAction(api.iotecPay.iotecPayActions.checkCollectionStatus)
  const restoreAccess = useAction(api.iotecPay.iotecPayActions.restoreAccess)
  const currency = useQuery(api.blogs.paymentCurrency)

  const [tab, setTab] = useState<Tab>('new')
  const [network, setNetwork] = useState<Network>('MTN MoMo')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const canPay =
    isEmail(email) && phone.replace(/\D/g, '').length === 10 && !busy && Boolean(currency)

  const switchTab = (next: Tab) => {
    setTab(next)
    setError('')
    setProgress('')
  }

  const waitForPayment = async (transactionId: Id<'transactions'>, first: string) => {
    let current = first
    for (let attempt = 0; attempt < POLL_LIMIT; attempt++) {
      if (current === 'completed') {
        onUnlocked(transactionId)
        return
      }
      if (current === 'failed') {
        setError('The payment was not approved. Please try again.')
        return
      }
      setProgress('Waiting for approval on your phone…')
      await sleep(POLL_MS)
      if (!mounted.current) return
      const result = await checkCollectionStatus({ transactionId })
      current = result.status
      if (current === 'failed' && result.message) {
        setError(result.message)
        return
      }
    }
    setError(
      'We have not received a confirmation yet. If you approved the prompt, wait a minute and use "Returning Reader" with your email.',
    )
  }

  const pay = async () => {
    if (!canPay) return
    setError('')
    setBusy(true)
    setProgress('Sending the payment request to your phone…')
    try {
      const result = await initiateCollection({ blogId, phoneNumber: phone, email })
      await waitForPayment(result.transactionId, result.status)
    } catch (caught) {
      if (mounted.current) setError(messageFrom(caught))
    } finally {
      if (mounted.current) {
        setBusy(false)
        setProgress('')
      }
    }
  }

  const restore = async () => {
    if (!isEmail(email)) {
      setError('Enter the email you used when you paid.')
      return
    }
    setError('')
    setBusy(true)
    setProgress('Checking your payment…')
    try {
      const transactionId = await restoreAccess({ blogId, email })
      if (!mounted.current) return
      if (transactionId) onUnlocked(transactionId)
      else setError('No completed payment was found for that email on this blog.')
    } catch (caught) {
      if (mounted.current) setError(messageFrom(caught))
    } finally {
      if (mounted.current) {
        setBusy(false)
        setProgress('')
      }
    }
  }

  return (
    <div className="pay-card">
      <div className="pay-lock">
        <Lock size={18} />
      </div>

      <h2 className="pay-title">Support Independent Writing &amp; Unlock Full Blog</h2>

      <div className="pay-price">
        <span>ONE-TIME READER CONTRIBUTION</span>
        <strong>
          {currency ?? ''} {amount.toLocaleString()}
        </strong>
      </div>

      <div className="pay-tabs">
        <button
          type="button"
          className={tab === 'new' ? 'active' : ''}
          onClick={() => switchTab('new')}
        >
          New Access (Mobile Money)
        </button>
        <button
          type="button"
          className={tab === 'restore' ? 'active' : ''}
          onClick={() => switchTab('restore')}
        >
          Returning Reader (Restore)
        </button>
      </div>

      {currency === null && (
        <p className="pay-error">Payments are not available right now.</p>
      )}

      {tab === 'new' && (
        <div className="pay-form">
          <p className="pay-section-label">SELECT MOBILE MONEY NETWORK</p>
          <div className="pay-networks">
            <button
              type="button"
              className={network === 'MTN MoMo' ? 'active' : ''}
              onClick={() => setNetwork('MTN MoMo')}
            >
              <span className="pay-dot mtn"></span>
              MTN MoMo
            </button>
            <button
              type="button"
              className={network === 'Airtel Money' ? 'active' : ''}
              onClick={() => setNetwork('Airtel Money')}
            >
              <span className="pay-dot airtel"></span>
              Airtel Money
            </button>
          </div>

          <label className="pay-field-label" htmlFor="pay-email">
            Your Email Address
          </label>
          <div className="pay-input">
            <AtSign size={15} />
            <input
              id="pay-email"
              type="email"
              placeholder="reader@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="pay-hint">
            Used to securely associate and restore your lifetime reading pass.
          </p>

          <label className="pay-field-label" htmlFor="pay-phone">
            Mobile Money Phone Number
          </label>
          <div className="pay-input">
            <div className="pay-cc">
              <select aria-label="Country code" defaultValue="+256">
                <option value="+256">+256 (UG)</option>
              </select>
              <ChevronDown size={13} />
            </div>
            <Smartphone size={15} />
            <input
              id="pay-phone"
              type="tel"
              placeholder={currency === 'ITX' ? '0111777770' : '0771234567'}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <p className="pay-hint">
            {currency === 'ITX'
              ? 'Test mode: use a test number from 0111777770 to 0111777779.'
              : 'Direct authorization; standard network tariffs apply.'}
          </p>

          <button type="button" className="pay-btn" disabled={!canPay} onClick={pay}>
            <Lock size={14} />
            {busy ? 'Processing…' : 'Pay via Mobile Money & Read Now'}
          </button>

          <div className="pay-prompt">
            <Sparkles size={15} />
            <p>
              <strong>Instant Handset Prompt:</strong> After clicking, a secure
              USSD pop-up will appear immediately on your device. Enter your
              secret Mobile Money PIN to approve the transaction.
            </p>
          </div>
        </div>
      )}

      {tab === 'restore' && (
        <div className="pay-form">
          <label className="pay-field-label" htmlFor="pay-restore-email">
            Your Email Address
          </label>
          <div className="pay-input">
            <AtSign size={15} />
            <input
              id="pay-restore-email"
              type="email"
              placeholder="reader@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="pay-hint">Enter the email you used when you paid for this blog.</p>

          <button type="button" className="pay-btn" disabled={busy} onClick={restore}>
            <Check size={14} /> {busy ? 'Checking…' : 'Restore my access'}
          </button>
        </div>
      )}

      {progress && <p className="pay-status">{progress}</p>}
      {error && <p className="pay-error">{error}</p>}
    </div>
  )
}