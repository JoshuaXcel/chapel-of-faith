import { useState } from 'react'
import Icon from '../../components/Icon.jsx'
import Loading from '../../components/Loading.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import useFetch from '../../useFetch.js'
import { del } from '../../api.js'
import { shortDate } from '../../format.js'
import { birthdayText, memberTypeLabel } from '../../membership.js'

// Admin "Members" page (/admin/members): everyone who filled in the membership
// form on the website (pages/Membership.jsx), newest first.
// It is read-only: admins can look at registrations and delete one (for
// example a duplicate or a test), but not edit them.
// Data: GET /members (admin login needed, because phone numbers are private).

function AdminMembers() {
  const { data: members, loading, error, reload } = useFetch('/members')
  const [notice, setNotice] = useState('')
  const [deleteError, setDeleteError] = useState('')

  async function handleDelete(member) {
    // window.confirm shows the browser's "OK / Cancel" box; stop if they cancel
    if (!window.confirm(`Delete ${member.full_name}'s registration? This cannot be undone.`)) {
      return
    }
    try {
      await del(`/members/${member.id}`)
      setDeleteError('')
      setNotice('Registration deleted.')
      reload() // fetch the list again so the row disappears
    } catch (err) {
      setNotice('')
      setDeleteError(err.message)
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Members</h1>
          <p className="sub">
            People who registered with the membership form on the website, newest first.
            {members && ` ${members.length} in total.`}
          </p>
        </div>
      </div>

      {notice && <p className="notice">{notice}</p>}

      <div className="panel">
        {loading && <Loading />}
        <ErrorMessage message={error || deleteError} />
        {members && members.length === 0 && (
          <p className="panel-empty">No registrations yet.</p>
        )}
        {members && members.length > 0 && (
          // table-scroll lets a wide table scroll sideways on a small screen
          <div className="table-scroll">
            <table className="tbl tbl-tight">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th className="hide-m">Birthday</th>
                  <th className="hide-m">Department / course</th>
                  <th className="hide-m">Level</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <span className="strong">{member.full_name}</span>
                      {/* a small tag when they asked to join the WhatsApp groups */}
                      {member.joined_whatsapp_consent && (
                        <span className="wa-tag">WhatsApp groups</span>
                      )}
                      {/* when they registered, in small grey text under the name */}
                      <span className="cell-sub hide-m">Registered {shortDate(member.created_at)}</span>
                    </td>
                    <td className="nowrap">
                      {/* tel: links open the phone's dialler when tapped */}
                      <a href={`tel:${member.phone}`}>{member.phone}</a>
                      {/* the email (if they gave one) sits under the phone number,
                          so the table stays narrow enough for a laptop screen */}
                      {member.email && <span className="cell-sub hide-m">{member.email}</span>}
                    </td>
                    {/* "graduate" -> "Graduate" */}
                    <td className="nowrap">{memberTypeLabel(member.member_type)}</td>
                    {/* "12 March", or "12 March 2004" if they gave the year */}
                    <td className="hide-m nowrap">
                      {birthdayText(member.birth_day, member.birth_month, member.birth_year)}
                    </td>
                    {/* "—" when an optional field was left empty */}
                    <td className="hide-m">{member.department || '—'}</td>
                    {/* only undergraduates have a level */}
                    <td className="hide-m">
                      {member.member_type === 'undergraduate' && member.level ? member.level : '—'}
                    </td>
                    <td className="actions">
                      <button
                        className="iconbtn danger"
                        type="button"
                        onClick={() => handleDelete(member)}
                        aria-label={`Delete ${member.full_name}`}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminMembers
