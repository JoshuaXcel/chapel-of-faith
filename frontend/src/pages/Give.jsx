import { useState } from 'react'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import PageHeader from '../components/PageHeader.jsx'
import ComingSoon from '../components/ComingSoon.jsx'

// The kinds of giving, with the sentence shown under the tabs
const kinds = [
  { name: 'Tithe', text: 'Your tithe, the first fruit of your increase.' },
  { name: 'Offering', text: 'Thanksgiving and freewill offerings.' },
  { name: 'Gifts', text: 'Special gifts for the work of the Chapel.' },
  { name: 'Building', text: 'For the Chapel’s building projects.' },
]

const amounts = ['₦1,000', '₦5,000', '₦10,000', 'Custom']

function Give() {
  // Which tab and amount are selected (only changes the look for now)
  const [kind, setKind] = useState('Tithe')
  const [amount, setAmount] = useState('₦5,000')

  const selectedKind = kinds.find((item) => item.name === kind)

  return (
    <>
      <PageHeader
        crumb="Give"
        eyebrow="Giving"
        title={
          <>
            Give <em className="accent">cheerfully</em>
          </>
        }
        lead="“Every man according as he purposeth in his heart, so let him give… for God loveth a cheerful giver.” 2 Corinthians 9:7"
      />

      <section className="sec two-col-section">
        <div className="wrap two-col">
          <div className="card card-pad big-pad">
            <h3>Give online</h3>
            <div className="gtabs mt24" role="tablist">
              {kinds.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  role="tab"
                  aria-selected={kind === item.name}
                  className={kind === item.name ? 'on' : ''}
                  onClick={() => setKind(item.name)}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <p className="small muted mt16">{selectedKind.text}</p>

            <div className="field mt24">
              <span className="field-label">Amount</span>
              <div className="amounts">
                {amounts.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={amount === item ? 'amt on' : 'amt'}
                    onClick={() => setAmount(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <Button size="lg" block className="mt32" disabled>
              <Icon name="heart" /> Give {amount === 'Custom' ? '' : amount}
            </Button>
            <div className="mt16">
              <ComingSoon>Online giving opens soon. You can also give at any service.</ComingSoon>
            </div>
          </div>

          <div className="stack g20">
            <div className="bankcard">
              <div className="flex between">
                <span className="eyebrow light plain">Prefer a bank transfer?</span>
                <Icon name="bank" />
              </div>
              {/* Fill in the real bank details when the Chapel provides them */}
              <dl className="kv mt24">
                <dt>Account name</dt>
                <dd>Chapel of Faith, FUTA</dd>
                <dt>Bank</dt>
                <dd className="to-add">To be added</dd>
                <dt>Account no.</dt>
                <dd className="to-add">To be added</dd>
              </dl>
            </div>
            <div className="card card-pad flat-card">
              <h4>Other ways to give</h4>
              <div className="stack g16 mt20">
                <div className="flex g16">
                  <span className="icon-tile">
                    <Icon name="cross" />
                  </span>
                  <div>
                    <b className="semi">At any service</b>
                    <div className="small muted">Give in person during Sunday worship.</div>
                  </div>
                </div>
                <div className="flex g16">
                  <span className="icon-tile">
                    <Icon name="gift" />
                  </span>
                  <div>
                    <b className="semi">Gifts and projects</b>
                    <div className="small muted">Speak with the Chaplaincy about special gifts.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Give
