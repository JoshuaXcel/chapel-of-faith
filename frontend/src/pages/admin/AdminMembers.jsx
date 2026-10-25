import { useState } from 'react'
import Icon from '../../components/Icon.jsx'
import Loading from '../../components/Loading.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import useFetch from '../../useFetch.js'
import { del } from '../../api.js'
import { shortDate } from '../../format.js'

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
                  <th>Phone</th>
                  <th className="hide-m">Email</th>
                  <th className="hide-m">Department</th>
                  <th className="hide-m">Level</th>
                  <th className="hide-m">Registered</th>
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
                    </td>
                    <td className="nowrap">
                      {/* tel: links open the phone's dialler when tapped */}
                      <a href={`tel:${member.phone}`}>{member.phone}</a>
                    </td>
                    {/* "—" when an optional field was left empty */}
                    <td className="hide-m">{member.email || '—'}</td>
                    <td className="hide-m">{member.department || '—'}</td>
                    <td className="hide-m">{member.level || '—'}</td>
                    <td className="hide-m nowrap">{shortDate(member.created_at)}</td>
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
