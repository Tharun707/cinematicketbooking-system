import { useEffect, useState } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_BASE_URL || '/api'
const emptyRegister = {
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
}

const emptyScreening = {
  filmTitle: '',
  startTime: '2026-06-01T18:00',
  cinemaId: '1',
}

function App() {
  const [currentUser, setCurrentUser] = useState(null)

  const [login, setLogin] = useState({
    username: '',
    password: '',
  })

  const [register, setRegister] = useState(emptyRegister)
  const [users, setUsers] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [screenings, setScreenings] = useState([])
  const [editUser, setEditUser] = useState(null)
  const [screening, setScreening] = useState(emptyScreening)

  const [selectedScreeningId, setSelectedScreeningId] = useState('')
  const [reservations, setReservations] = useState([])
  const [selectedSeat, setSelectedSeat] = useState(null)

  const [message, setMessage] = useState('')

  const isAdmin = currentUser?.role === 'Admin'

  useEffect(() => {
    if (currentUser) {
      loadData()
    }
  }, [currentUser?.id])

  useEffect(() => {
    if (screenings.length > 0 && !selectedScreeningId) {
      setSelectedScreeningId(String(screenings[0].id))
    }
  }, [screenings, selectedScreeningId])

  useEffect(() => {
    setSelectedSeat(null)

    if (selectedScreeningId) {
      loadReservations(selectedScreeningId)
    }
  }, [selectedScreeningId])

  async function api(path, options = {}) {
    const response = await fetch(API + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      const error = new Error(data?.error || data?.message || 'Request failed')
      error.status = response.status
      throw error
    }

    return data
  }

  function change(setter) {
    return (event) => {
      const { name, value } = event.target
      setter((old) => ({ ...old, [name]: value }))
    }
  }

  async function loadData() {
    try {
      const [allUsers, allCinemas, allScreenings] = await Promise.all([
        api('/User'),
        api('/Cinemas'),
        api('/Screening'),
      ])

      setUsers(allUsers)
      setCinemas(allCinemas)
      setScreenings(allScreenings)

      const freshUser = allUsers.find((u) => u.id === currentUser.id)
      if (freshUser) {
        setCurrentUser(freshUser)
      }
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function loadReservations(screeningId) {
    if (!screeningId) return

    try {
      const data = await api(`/Reservation/screening/${screeningId}`)
      setReservations(data)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function submitLogin(event) {
    event.preventDefault()

    try {
      const user = await api('/User/login', {
        method: 'POST',
        body: login,
      })

      setCurrentUser(user)
      setMessage('Logged in.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function submitRegister(event) {
    event.preventDefault()

    try {
      const user = await api('/User/register', {
        method: 'POST',
        body: register,
      })

      setRegister(emptyRegister)
      setCurrentUser(user)
      setMessage('Registered and logged in.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  function startEdit(user) {
    setEditUser({
      id: user.id,
      username: user.username || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      email: user.email || '',
      role: user.role || 'User',
      rowVersion: user.rowVersion || '',
    })
  }

  async function saveUser(event) {
    event.preventDefault()

    try {
      await api(`/User/${editUser.id}`, {
        method: 'PUT',
        body: {
          username: editUser.username,
          firstName: editUser.firstName,
          lastName: editUser.lastName,
          phoneNumber: editUser.phoneNumber,
          email: editUser.email,
          role: isAdmin ? editUser.role : currentUser.role,
          rowVersion: editUser.rowVersion,
        },
      })

      setEditUser(null)
      await loadData()
      setMessage('User saved.')
    } catch (error) {
      if (error.status === 409) {
        await loadData()
      }

      setMessage(
        error.status === 409
          ? 'Conflict: user was changed by someone else.'
          : error.message
      )
    }
  }

  async function removeUser(user) {
    if (user.id === currentUser.id) {
      setMessage('You cannot delete yourself.')
      return
    }

    if (!window.confirm(`Delete user ${user.username}?`)) return

    try {
      await api(`/User/${user.id}?rowVersion=${encodeURIComponent(user.rowVersion)}`, {
        method: 'DELETE',
      })

      await loadData()
      setMessage('User deleted.')
    } catch (error) {
      if (error.status === 409) {
        await loadData()
      }

      setMessage(
        error.status === 409
          ? 'Conflict: user was changed by someone else.'
          : error.message
      )
    }
  }

  async function createScreening(event) {
    event.preventDefault()

    try {
      await api('/Screening', {
        method: 'POST',
        body: {
          filmTitle: screening.filmTitle,
          startTime: screening.startTime,
          cinemaId: Number(screening.cinemaId),
        },
      })

      setScreening(emptyScreening)
      await loadData()
      setMessage('Screening created.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function removeScreening(id) {
    if (!window.confirm('Delete this screening?')) return

    try {
      await api(`/Screening/${id}`, {
        method: 'DELETE',
      })

      await loadData()
      setMessage('Screening deleted.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  function findReservation(row, seat) {
    return reservations.find((r) => r.row === row && r.seat === seat)
  }

  function selectSeat(row, seat) {
    const reservation = findReservation(row, seat)

    if (reservation && reservation.userId !== currentUser.id) {
      setMessage('This seat is already taken.')
      return
    }

    setSelectedSeat({ row, seat })

    if (reservation) {
      setMessage(`Selected row ${row}, seat ${seat}. Press Cancel reservation.`)
    } else {
      setMessage(`Selected row ${row}, seat ${seat}. Press Book selected seat.`)
    }
  }

  async function bookSelectedSeat() {
    if (!selectedSeat) {
      setMessage('Select a free seat first.')
      return
    }

    const existingReservation = findReservation(selectedSeat.row, selectedSeat.seat)

    if (existingReservation) {
      setMessage(
        existingReservation.userId === currentUser.id
          ? 'You already reserved this seat.'
          : 'This seat is already taken.'
      )
      return
    }

    try {
      await api('/Reservation', {
        method: 'POST',
        body: {
          screeningId: Number(selectedScreeningId),
          userId: currentUser.id,
          row: selectedSeat.row,
          seat: selectedSeat.seat,
        },
      })

      setSelectedSeat(null)
      await loadReservations(selectedScreeningId)
      setMessage('Seat reserved.')
    } catch (error) {
      setSelectedSeat(null)
      await loadReservations(selectedScreeningId)

      setMessage(
        error.status === 409
          ? 'Conflict: this seat was already reserved by another user.'
          : error.message
      )
    }
  }

  async function cancelSelectedReservation() {
    if (!selectedSeat) {
      setMessage('Select your reserved seat first.')
      return
    }

    const reservation = findReservation(selectedSeat.row, selectedSeat.seat)

    if (!reservation || reservation.userId !== currentUser.id) {
      setMessage('Select one of your own reservations.')
      return
    }

    try {
      await api(`/Reservation/${reservation.id}?userId=${currentUser.id}`, {
        method: 'DELETE',
      })

      setSelectedSeat(null)
      await loadReservations(selectedScreeningId)
      setMessage('Reservation cancelled.')
    } catch (error) {
      setSelectedSeat(null)
      await loadReservations(selectedScreeningId)
      setMessage(error.message)
    }
  }

  if (!currentUser) {
    return (
      <main className="page-shell">
        <h1>Cinema Ticket Booking System</h1>

        {message && <p className="message">{message}</p>}

        <section className="login-grid">
          <form className="panel stack-form" onSubmit={submitLogin}>
            <h2>Login</h2>

            <input
              name="loginUsername"
              value={login.username}
              onChange={(e) =>
                setLogin((old) => ({ ...old, username: e.target.value }))
              }
              placeholder="Username"
              autoComplete="off"
            />

            <input
              name="loginPassword"
              type="password"
              value={login.password}
              onChange={(e) =>
                setLogin((old) => ({ ...old, password: e.target.value }))
              }
              placeholder="Password"
              autoComplete="new-password"
            />

            <button className="primary-button">Login</button>
          </form>

          <form className="panel register-form" onSubmit={submitRegister}>
            <h2 className="full-width">Register user</h2>

            <input
              name="username"
              value={register.username}
              onChange={change(setRegister)}
              placeholder="Username"
              required
            />

            <input
              name="password"
              type="password"
              value={register.password}
              onChange={change(setRegister)}
              placeholder="Password"
              required
            />

            <input
              name="firstName"
              value={register.firstName}
              onChange={change(setRegister)}
              placeholder="First name"
            />

            <input
              name="lastName"
              value={register.lastName}
              onChange={change(setRegister)}
              placeholder="Last name"
            />

            <input
              name="phoneNumber"
              value={register.phoneNumber}
              onChange={change(setRegister)}
              placeholder="Phone number"
            />

            <input
              name="email"
              value={register.email}
              onChange={change(setRegister)}
              placeholder="Email"
            />

            <button className="primary-button full-width">Register</button>
          </form>
        </section>
      </main>
    )
  }

  const visibleUsers = isAdmin
    ? users
    : users.filter((u) => u.id === currentUser.id)

  const selectedScreening = screenings.find(
    (s) => String(s.id) === String(selectedScreeningId)
  )

  const rows = selectedScreening?.cinema?.rows || 0
  const seatsPerRow = selectedScreening?.cinema?.seatsPerRow || 0

  const selectedReservation = selectedSeat
    ? findReservation(selectedSeat.row, selectedSeat.seat)
    : null

  const selectedSeatIsMine = selectedReservation?.userId === currentUser.id
  const selectedSeatIsFree = selectedSeat && !selectedReservation

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <h1>Cinema Ticket Booking System</h1>
          <p>
            Logged in as {currentUser.username} ({currentUser.role})
          </p>
        </div>

        <div className="hero-actions">
          <button className="secondary-button" onClick={loadData}>
            Refresh
          </button>

          <button
            className="secondary-button"
            onClick={() => {
              setCurrentUser(null)
              setEditUser(null)
              setReservations([])
              setSelectedSeat(null)
              setSelectedScreeningId('')
            }}
          >
            Logout
          </button>
        </div>
      </section>

      {message && <p className="message">{message}</p>}

      <section className="content-grid">
        <div className="panel">
          <h2>{isAdmin ? 'Users' : 'My profile'}</h2>

          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Role</th>
                <th>RowVersion</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.role}</td>
                  <td>
                    <code>{user.rowVersion}</code>
                  </td>
                  <td>
                    <button
                      className="primary-button small"
                      onClick={() => startEdit(user)}
                    >
                      Edit
                    </button>

                    {isAdmin && user.id !== currentUser.id && (
                      <button
                        className="danger-button small"
                        onClick={() => removeUser(user)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form className="panel stack-form" onSubmit={saveUser}>
          <h2>Edit user</h2>

          {!editUser ? (
            <p>Select a user to edit.</p>
          ) : (
            <>
              <input
                name="username"
                value={editUser.username}
                onChange={change(setEditUser)}
                placeholder="Username"
                required
              />

              <input
                name="firstName"
                value={editUser.firstName}
                onChange={change(setEditUser)}
                placeholder="First name"
              />

              <input
                name="lastName"
                value={editUser.lastName}
                onChange={change(setEditUser)}
                placeholder="Last name"
              />

              <input
                name="phoneNumber"
                value={editUser.phoneNumber}
                onChange={change(setEditUser)}
                placeholder="Phone number"
              />

              <input
                name="email"
                value={editUser.email}
                onChange={change(setEditUser)}
                placeholder="Email"
              />

              {isAdmin && (
                <select
                  name="role"
                  value={editUser.role}
                  onChange={change(setEditUser)}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              )}

              <button className="primary-button">Save</button>
            </>
          )}
        </form>
      </section>

      <section className="panel wide-panel">
        <h2>Screenings</h2>

        {isAdmin && (
          <form className="screening-form" onSubmit={createScreening}>
            <input
              name="filmTitle"
              value={screening.filmTitle}
              onChange={change(setScreening)}
              placeholder="Film title"
              required
            />

            <input
              name="startTime"
              type="datetime-local"
              value={screening.startTime}
              onChange={change(setScreening)}
              required
            />

            <select
              name="cinemaId"
              value={screening.cinemaId}
              onChange={change(setScreening)}
            >
              {cinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </option>
              ))}
            </select>

            <button className="primary-button">Create</button>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Film</th>
              <th>Start time</th>
              <th>Cinema</th>
              <th>Room size</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>

          <tbody>
            {screenings.map((s) => (
              <tr key={s.id}>
                <td>{s.filmTitle}</td>
                <td>{new Date(s.startTime).toLocaleString()}</td>
                <td>{s.cinema?.name}</td>
                <td>
                  {s.cinema
                    ? `${s.cinema.rows} x ${s.cinema.seatsPerRow}`
                    : '-'}
                </td>

                {isAdmin && (
                  <td>
                    <button
                      className="danger-button small"
                      onClick={() => removeScreening(s.id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel wide-panel">
        <h2>Seat reservations</h2>

        {screenings.length === 0 ? (
          <p>No screenings available. Create a screening first.</p>
        ) : (
          <>
            <div className="reservation-tools">
              <select
                value={selectedScreeningId}
                onChange={(e) => setSelectedScreeningId(e.target.value)}
              >
                {screenings.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.filmTitle} - {new Date(s.startTime).toLocaleString()}
                  </option>
                ))}
              </select>

              <button
                className="secondary-button"
                onClick={() => loadReservations(selectedScreeningId)}
              >
                Refresh seats
              </button>
            </div>

            <p className="seat-help">
              Click a free seat to select it, then press Book selected seat.
              Click Mine to select your reservation, then press Cancel reservation.
            </p>

            <div className="booking-actions">
              <span>
                {selectedSeat
                  ? `Selected: row ${selectedSeat.row}, seat ${selectedSeat.seat}`
                  : 'No seat selected'}
              </span>

              <button
                className="primary-button"
                disabled={!selectedSeatIsFree}
                onClick={bookSelectedSeat}
              >
                Book selected seat
              </button>

              <button
                className="danger-button"
                disabled={!selectedSeatIsMine}
                onClick={cancelSelectedReservation}
              >
                Cancel reservation
              </button>
            </div>

            <div className="seat-grid">
              {Array.from({ length: rows }, (_, rowIndex) => {
                const row = rowIndex + 1

                return (
                  <div className="seat-row" key={row}>
                    <strong>Row {row}</strong>

                    {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                      const seat = seatIndex + 1
                      const reservation = findReservation(row, seat)
                      const mine = reservation?.userId === currentUser.id

                      const isSelected =
                        selectedSeat?.row === row && selectedSeat?.seat === seat

                      const className =
                        (reservation
                          ? mine
                            ? 'seat mine'
                            : 'seat taken'
                          : 'seat free') + (isSelected ? ' selected' : '')

                      return (
                        <button
                          key={seat}
                          className={className}
                          disabled={Boolean(reservation && !mine)}
                          onClick={() => selectSeat(row, seat)}
                        >
                          {mine
                            ? 'Mine'
                            : reservation
                              ? 'Taken'
                              : isSelected
                                ? 'Selected'
                                : seat}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default App