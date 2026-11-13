# Cinema Ticket Booking System

A local educational cinema booking application built with React, ASP.NET Core, Entity Framework Core, and SQLite. Users can register, log in, view screenings, select seats, and cancel reservations. The application also demonstrates optimistic concurrency for user records and unique seat reservations.

> **Demo status:** run locally with fictional data only. Login checks credentials but does not establish an authenticated server session. Administrative controls are hidden in the UI based on a role field; the API does not enforce those permissions. Passwords are stored in plaintext and returned in user responses. This project requires security work before any public deployment. Publishing its source on GitHub is separate from hosting the running application.

## Implemented features

- Registration and username/password login; logout clears the in-memory UI user.
- Profile editing with a Base64 `rowVersion` token and HTTP 409 conflict handling.
- Admin UI for listing, editing, and deleting users and creating/deleting screenings.
- Cinema and screening lists, including room dimensions.
- Seat grid showing free, taken, selected, and the current user's reserved seats.
- One-seat booking and cancellation, with room bounds and user existence checks.
- Database uniqueness on `(ScreeningId, Row, Seat)` to prevent duplicate bookings.
- SQLite database creation and migrations applied automatically at API startup.
- Swagger UI and optional serving of the built React app from the API.

There are no payments, ticket prices, emailed tickets, QR codes, password reset, persistent login, or live seat updates. Use **Refresh seats** to update availability.

## Technology

| Component | Source configuration |
| --- | --- |
| API | C#, ASP.NET Core, `net10.0` |
| Persistence | EF Core 10.0.8, SQLite |
| API exploration | Swashbuckle 10.1.7 |
| Interface | React 19.2.6, Vite 8.0.12 |
| Checks | ESLint 10; npm lockfile included |

The project also references SQL Server and OpenAPI packages, but its active database provider is SQLite. Exact JavaScript dependency resolutions are in `cinema-client/package-lock.json`.

## Repository layout

```text
CinemaApi/
  Controllers/       HTTP routes
  Data/              EF context, seed data, concurrency handling
  DTOs/              Request models
  Migrations/        Committed SQLite schema history
  Models/            Cinema, Screening, User, Reservation
  Properties/        Local launch profiles
  Program.cs         Startup, migrations, optional admin bootstrap
cinema-client/
  src/               React interface and styles
  public/            Static assets
  .env.example       Optional public API base URL
docs/                API, architecture, verification, publishing notes
```

## Requirements

- .NET 10 SDK to build/run the source.
- Node.js 24 and npm (the local inspection environment used Node 24.15.0).
- A browser; Git if cloning or pushing.
- Internet access for initial NuGet/npm dependency installation.

No separate database server or EF command-line tool is needed. Do not create another `AddReservations` migration: the migration is already committed.

## Run locally

Extract or clone this repository, then open a terminal at its root.

### 1. Start the API

```powershell
cd CinemaApi
dotnet restore
dotnet run --launch-profile http
```

API: `http://localhost:5056`; Swagger: `http://localhost:5056/swagger`.
The first launch creates `cinema.db` in the API working directory. The sanitized repository does not include an existing database or user accounts.

### 2. Start the interface in a second terminal

From the repository root:

```powershell
cd cinema-client
npm ci
npm run dev
```

Open `http://localhost:5173`. The committed Vite configuration proxies `/api` requests to `http://localhost:5056` and requires port 5173. No `.env` file is needed. An optional `VITE_API_BASE_URL` overrides `/api`; Vite variables are public browser configuration, so never put credentials in them.

### 3. Try the booking flow

1. Register a fictional account; registration enters the application immediately.
2. Select a screening in **Seat reservations**.
3. Select a numbered free seat, then click **Book selected seat**.
4. Select a seat marked **Mine**, then click **Cancel reservation**.
5. Use a second browser session and another fictional account to exercise booking conflicts.

Seed data contains three rooms: Cinema city (5 × 8), Multikino (6 × 10), and Helios (4 × 6). Two screenings are seeded for June 1, 2026: Avengers Endgame at 18:00 and Interstellar at 20:00. These are fixed sample dates; the code does not reject bookings for past screenings.

### Optional demo administrator

There is no shared default password in this package. Before the **first API launch**, set credentials you choose in that terminal:

```powershell
$env:BootstrapAdmin__Username = Read-Host 'Choose a demo admin username'
$demoPassword = Read-Host 'Choose a demo admin password' -AsSecureString
$env:BootstrapAdmin__Password = [System.Net.NetworkCredential]::new('', $demoPassword).Password
cd CinemaApi
dotnet run --launch-profile http
```

Bootstrap runs only when the Users table is empty and both values are set. If an account already exists, these variables do not add an admin. Use a fresh disposable database if you need to repeat the initial bootstrap; preserve any data you need first. Remove the environment values when finished:

```powershell
Remove-Item Env:BootstrapAdmin__Username, Env:BootstrapAdmin__Password
```

This credential configuration does not make the demo's login or role handling secure.

## Serve the built interface from the API

From the repository root, in PowerShell:

```powershell
cd cinema-client
npm ci
npm run build
New-Item -ItemType Directory -Force ../CinemaApi/wwwroot | Out-Null
Copy-Item dist/* ../CinemaApi/wwwroot -Recurse -Force
cd ../CinemaApi
dotnet run --launch-profile http
```

Open `http://localhost:5056`. Rebuild and copy after interface changes. When build filenames change, clear only old generated assets in `wwwroot` before copying, so stale files are not retained. Generated `dist` and `wwwroot` content is ignored by Git.

## Build a Windows executable

First build and copy the interface as above. From the repository root:

```powershell
dotnet publish CinemaApi/CinemaApi.csproj -c Release -r win-x64 --self-contained true -o release/windows-x64
cd release/windows-x64
.\CinemaApi.exe --urls http://localhost:5056
```

Open `http://localhost:5056` and keep the terminal open. Distribute the whole publish folder together. This is a browser application hosted by the executable, not a standalone desktop window. Run in a writable local folder because SQLite creates files there. The clean source ZIP excludes executables and generated publish folders; build them from the source rather than reusing the original archive's binaries.

## Checks and documentation

```powershell
dotnet build CinemaApi/CinemaApi.csproj -c Release
cd cinema-client
npm ci
npm run build
npm run lint
```

- [API reference](docs/API.md)
- [Architecture and data model](docs/ARCHITECTURE.md)
- [Security limitations](SECURITY.md)
- [Validation and manual checks](docs/VERIFICATION.md)
- [GitHub publishing](docs/PUBLISHING.md)
- [Packaging changes](docs/PREPARATION.md)

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `CinemaApi.exe` is not recognized | Change into the publish folder and run `.\CinemaApi.exe`; source folders do not contain a published exe. |
| Frontend API calls fail | Start the API on 5056 and use Vite on 5173. Check any API base URL override. |
| API root does not show the interface | Build React and copy `dist` contents into `CinemaApi/wwwroot` before running/publishing. |
| Admin does not appear | Bootstrap only occurs on an empty Users table; there are no bundled accounts. |
| HTTP 409 editing a user | Reload the latest user and reopen the edit form before resubmitting. |
| HTTP 409 booking a seat | Refresh seats and select another seat. |
| Restore/install fails | Verify access to NuGet/npm and installed SDK/Node versions. |

## Future work

Priorities include password hashing, authenticated sessions, server-side authorization, safe response DTOs, stronger validation, automated integration tests, and accessibility improvements. These are proposed work, not existing features.

## License and attribution

No project license was supplied in the uploads, and no license is assigned here. Confirm ownership and contributors' permissions before selecting a license or distributing third-party assets. The interface originates from a Vite/React scaffold. Repository preparation does not claim authorship of the application.
