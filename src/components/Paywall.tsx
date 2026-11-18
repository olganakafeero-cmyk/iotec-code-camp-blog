import { useState } from 'react'
import {
  AtSign,
  Check,
  ChevronDown,
  Lock,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { restoreAccess, unlockPost } from '../lib/access'
import './paywall.css'

const PRICE = 'UGX 9,500'

type Tab = 'new' | 'restore'
type Network = 'MTN MoMo' | 'Airtel Money'

interface PaywallProps {
  postId: number
  onUnlocked: () => void
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const cleanPhone = (value: string) => value.replace(/\D/g, '').replace(/^0/, '')
const isPhone = (value: string) => /^7\d{8}$/.test(cleanPhone(value))

export default function Paywall({ postId, onUnlocked }: PaywallProps) {
  const [tab, setTab] = useState<Tab>('new')
  const [network, setNetwork] = useState<Network>('MTN MoMo')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [message, setMessage] = useState('')

  const canPay = isEmail(email) && isPhone(phone) && !waiting

  const switchTab = (next: Tab) => {
    setTab(next)
    setMessage('')
  }

  const pay = () => {
    if (!canPay) return
    setMessage('')
    setWaiting(true)
    // DEMO ONLY: replace this timer with a real payment request to your
    // backend (for example a Convex action calling a payment provider).
    window.setTimeout(() => {
      unlockPost(postId, email)
      setWaiting(false)
      onUnlocked()
    }, 2000)
  }

  const restore = () => {
    if (!isEmail(email)) {
      setMessage('Enter the email you used when you unlocked.')
      return
    }
    if (restoreAccess(email).length === 0) {
      setMessage('No access found for that email on this device.')
      return
    }
    onUnlocked()
  }

  return (
    <div className="pay-card">
      <div className="pay-lock">
        <Lock size={18} />
      </div>

      <h2 className="pay-title">Support Independent Writing &amp; Unlock Full Blog</h2>

      <div className="pay-price">
        <span>ONE-TIME READER CONTRIBUTION</span>
        <strong>{PRICE}</strong>
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
              placeholder="0771234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <p className="pay-hint">
            Direct authorization; standard network tariffs apply.
          </p>

          <button
            type="button"
            className="pay-btn"
            disabled={!canPay}
            onClick={pay}
          >
            <Lock size={14} />
            {waiting
              ? 'Waiting for approval on your phone…'
              : 'Pay via Mobile Money & Read Now'}
          </button>

          <div className="pay-prompt">
            <Sparkles size={15} />
            <p>
              <strong>Instant Handset Prompt:</strong> After clicking, a secure
              USSD pop-up will appear immediately on your device. Enter your
              secret Mobile Money PIN to approve the transaction.
            </p>
          </div>

          <p className="pay-demo">
            Demo mode: no money is taken and nothing is sent anywhere.
          </p>
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
          <p className="pay-hint">
            Enter the email you used when you first unlocked.
          </p>

          <button type="button" className="pay-btn" onClick={restore}>
            <Check size={14} /> Restore my access
          </button>
          {message && <p className="pay-error">{message}</p>}
        </div>
      )}
    </div>
  )
}