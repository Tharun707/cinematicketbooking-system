# Cinema Ticket Booking System

This project is a cinema seat booking application. A user can create an account, log in, view movie screenings, choose a seat, and cancel a reservation. An administrator can also manage users and screenings through the interface.

The project uses **React** for the pages you see in the browser, **ASP.NET Core** for the backend, and **SQLite** to store the data. It also shows how to handle two people trying to book the same seat or edit the same user record.

> **Please read:** This is a student project for learning and local demonstrations. Use made-up accounts and passwords. The current backend does not enforce login permissions or admin permissions, and it stores passwords as plain text. Keep the running app on your own computer. See [Security notes](SECURITY.md) before planning any online deployment.

## Contents

- [What the application can do](#what-the-application-can-do)
- [Tools used](#tools-used)
- [How the project works](#how-the-project-works)
- [Project folders](#project-folders)
- [What you need](#what-you-need)
- [Download and run](#download-and-run)
- [Create a demo admin account](#create-a-demo-admin-account)
- [How to use the application](#how-to-use-the-application)
- [Database and sample data](#database-and-sample-data)
- [Run everything from one server](#run-everything-from-one-server)
- [Build and run a Windows exe](#build-and-run-a-windows-exe)
- [Check the project](#check-the-project)
- [Common problems](#common-problems)
- [Current limits and future improvements](#current-limits-and-future-improvements)

## What the application can do

### User features

- **Register:** Create an account with a username and password. The form also accepts name, phone number, and email.
- **Log in and log out:** Enter the app with an existing account and leave it using the Logout button.
- **View and edit a profile:** See your details and update the profile fields provided by the form.
- **View screenings:** See the movie title, start time, cinema name, and room size. A screening means one scheduled showing of a movie.
- **Choose a seat:** Select a screening and view its rows and seats.
- **Book a seat:** Select a free seat and confirm the booking.
- **Cancel a reservation:** Select one of your reserved seats and cancel it.
- **Refresh availability:** Use Refresh seats to get the latest booking information.

### Admin interface

When the interface sees an account with the `Admin` role, it shows controls to:

- View the list of users.
- Edit user details and roles.
- Delete another user.
- Create a movie screening and select its cinema and start time.
- Delete a screening.

These controls are part of the demo interface. The backend does not securely restrict these actions to administrators yet.

### Handling changes from more than one person

The project includes two useful database examples:

1. **Seat booking conflict:** A seat can have only one reservation for a particular screening. If two people try to book the same seat, the database prevents a duplicate reservation. The unsuccessful request receives a conflict response.
2. **User editing conflict:** Each user record has a value called `rowVersion`. When someone saves a profile, this value changes. If another person tries to save an older copy, the API returns HTTP `409 Conflict` so they can reload the latest details.

This second approach is called **optimistic concurrency**. It helps prevent one person's update from silently overwriting another person's work.

## Tools used

| Tool | Purpose in this project |
| --- | --- |
| React 19 | Builds the forms, tables, and seat grid. |
| Vite 8 | Runs the frontend during development and builds its files. |
| C# and ASP.NET Core (.NET 10) | Handle requests from the frontend. |
| Entity Framework Core 10 | Reads and saves database records using C# models. |
| SQLite | Stores the data in a local database file. |
| Swagger UI | Lets you view and try API endpoints in a browser. |
| ESLint | Checks JavaScript and React code for possible problems. |

The backend currently uses SQLite, even though the project also contains a SQL Server package reference. Package versions are listed in `CinemaApi.csproj`, `package.json`, and `package-lock.json`.

## How the project works

```text
Browser with React pages
          |
          | HTTP requests to /api
          v
ASP.NET Core controllers
          |
          | Entity Framework Core
          v
SQLite database: cinema.db
```

For example, when you book a seat:

1. React sends the screening ID, user ID, row number, and seat number to the backend.
2. The backend checks that the screening and user exist.
3. It checks that the seat is inside the room and is not already reserved.
4. It saves the reservation. A database rule also checks that the same seat has not been booked by another request.
5. The frontend reloads the reservations and updates the seat grid.

The selected user is kept in React memory. Refreshing the whole page loses that login state. Login currently checks a username and password but does not create a secure server session.

## Project folders

```text
cinematicketbooking-system/
├── CinemaApi/
│   ├── Controllers/     API endpoints for users, cinemas, screenings, reservations
│   ├── Data/            Database setup, sample data, and version handling
│   ├── DTOs/            Classes describing data sent to the API
│   ├── Migrations/      Steps used to create the database tables
│   ├── Models/          User, Cinema, Screening, and Reservation classes
│   ├── Properties/      Local run settings
│   ├── Program.cs      Starts and configures the backend
│   └── appsettings.json
├── cinema-client/
│   ├── public/          Static frontend files
│   ├── src/
│   │   ├── App.jsx      Main application interface and request handling
│   │   ├── App.css      Application styles
│   │   └── main.jsx     React entry point
│   ├── package.json     Frontend packages and commands
│   └── vite.config.js   Development server and API connection settings
├── docs/                More detailed project notes
├── .gitignore           Files that should stay out of GitHub
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

## What you need

Install these before running the source code:

- **.NET 10 SDK:** Builds and runs the backend.
- **Node.js 24 with npm:** Installs and runs the frontend tools.
- **A web browser:** Opens the application.
- **Git:** Needed if you want to use the clone command below. You can also download the repository as a ZIP.

Internet access is needed to download packages the first time. You do not need to install a separate database server. SQLite uses a file, and the application creates it automatically.

You can check your installed tools in a terminal:

```powershell
dotnet --version
node --version
npm --version
```

The local build checks used .NET SDK 10.0.201 and Node.js 24.15.0.

## Download and run

The examples below use **PowerShell on Windows**. Keep both the backend and frontend terminals open while using the development version.

### Step 1: Get the project

```powershell
git clone https://github.com/Tharun707/cinematicketbooking-system.git
cd cinematicketbooking-system
```

If you downloaded a ZIP instead, extract it and open PowerShell inside the folder containing `CinemaApi`, `cinema-client`, and this README. This folder is called the **repository root** in the instructions below.

### Step 2: Start the backend

From the repository root:

```powershell
cd CinemaApi
dotnet restore
dotnet run --launch-profile http
```

`dotnet restore` downloads the backend packages. `dotnet run` starts the server and applies the included database migrations.

- Backend address: [http://localhost:5056](http://localhost:5056)
- API testing page: [http://localhost:5056/swagger](http://localhost:5056/swagger)

The backend address alone will not show the React interface until the frontend has been built and copied there. For normal development, continue with Step 3.

**Want an admin account?** Follow [Create a demo admin account](#create-a-demo-admin-account) before the first launch or before registering any users. Otherwise, you can register a normal user through the application.

### Step 3: Start the frontend

Open a **second PowerShell terminal** at the repository root:

```powershell
cd cinema-client
npm ci
npm run dev
```

`npm ci` installs the package versions in the lockfile. `npm run dev` starts the frontend development server.

Open [http://localhost:5173](http://localhost:5173).

The Vite settings send `/api` requests to the backend on port 5056. The frontend uses port 5173 and will report an error if that port is already in use. You do not need an `.env` file for these default settings.

For a different API address, the frontend supports `VITE_API_BASE_URL`; see `cinema-client/.env.example`. These settings are visible in the browser, so never store passwords or secret keys in them.

### Step 4: Stop the application

Press **Ctrl+C** in each terminal when you finish. Closing the browser alone does not stop the servers.

## Create a demo admin account

The cleaned repository has **no default username or password** and includes no saved user database.

To create a demo administrator, start with an empty Users table. In PowerShell at the repository root, run:

```powershell
$env:BootstrapAdmin__Username = Read-Host 'Choose a demo admin username'
$demoPassword = Read-Host 'Choose a demo admin password' -AsSecureString
$env:BootstrapAdmin__Password = [System.Net.NetworkCredential]::new('', $demoPassword).Password
cd CinemaApi
dotnet run --launch-profile http
```

The server creates the administrator only when **both values are provided and the Users table is empty**. If you already registered a user, restarting with these values will not add an admin. To repeat the setup, use a fresh disposable database after backing up any data you want to keep.

After stopping the server, remove the temporary settings from that terminal:

```powershell
Remove-Item Env:BootstrapAdmin__Username, Env:BootstrapAdmin__Password
```

Use a password made only for this demo. The application still stores it as plain text.

## How to use the application

### Register and log in

1. Open the frontend address.
2. Fill in the registration form using made-up details.
3. Click **Register**. The app opens your account immediately.
4. Later, use your username and password in the Login form.

### Book a seat

1. Find the **Seat reservations** section.
2. Choose a movie screening from the dropdown.
3. Click a numbered free seat.
4. Check the selected row and seat number.
5. Click **Book selected seat**.

| Seat label | Meaning |
| --- | --- |
| A number, such as `3` | The seat is available. |
| Selected | You selected this seat but have not confirmed the booking. |
| Mine | Your current account reserved this seat. |
| Taken | Another account reserved this seat. |

Booking happens when you press **Book selected seat**, not when you first select the seat. Another user can book it before you confirm. If that happens, refresh the seats and choose another one.

### Cancel a seat

1. Select a seat marked **Mine**.
2. Click **Cancel reservation**.
3. The seat becomes available again after the request succeeds.

### Edit a profile

Click **Edit**, change the details, and click **Save**. If the record changed after you opened the form, the app reports a conflict. Reload the latest data, reopen the form, and try again. The `RowVersion` column shows the version value used for this check.

### Manage screenings as a demo admin

Log in with the administrator you created during initial setup. Enter a film title, choose a date/time and cinema, and click **Create**. Use **Delete** to remove a screening. Deleting a screening also removes its reservations. Deleting a user also removes that user's reservations.

## Database and sample data

The backend creates a local file named `cinema.db`. Its location depends on the folder the server runs from. With the development commands above, it is in `CinemaApi`.

| Table | What it stores |
| --- | --- |
| Users | Account details, password, role, and record version. |
| Cinemas | Cinema name and room dimensions. |
| Screenings | Movie title, start time, and cinema. |
| Reservations | User, screening, row, seat, and creation time. |

The included migrations add these sample rooms:

| Cinema | Rows | Seats in each row | Total seats |
| --- | --- | --- | --- |
| Cinema city | 5 | 8 | 40 |
| Multikino | 6 | 10 | 60 |
| Helios | 4 | 6 | 24 |

They also add **Avengers Endgame** on June 1, 2026 at 18:00 and **Interstellar** on June 1, 2026 at 20:00. These are fixed example dates. The app currently allows reservations for past screenings too.

Keep database files out of GitHub because they can contain passwords and personal details. The `.gitignore` already excludes them. The database migrations are included, so you do not need to create another `AddReservations` migration.

## Run everything from one server

You can build the frontend and let ASP.NET Core serve it. This means you only need the backend server running.

From the repository root:

```powershell
cd cinema-client
npm ci
npm run build
New-Item -ItemType Directory -Force ../CinemaApi/wwwroot | Out-Null
Copy-Item dist/* ../CinemaApi/wwwroot -Recurse -Force
cd ../CinemaApi
dotnet run --launch-profile http
```

Open [http://localhost:5056](http://localhost:5056). Keep the terminal open.

The build creates frontend files in `dist`. Copying them into `wwwroot` lets the backend serve the pages. Repeat the build and copy after frontend changes. If old build files remain, clear only those generated files from `wwwroot` before copying the new build. Both generated folders are excluded from Git.

## Build and run a Windows exe

The GitHub repository contains the source code, so an executable is not included. To create one for 64-bit Windows, first build and copy the frontend using the previous section.

Then, from the repository root:

```powershell
dotnet publish CinemaApi/CinemaApi.csproj -c Release -r win-x64 --self-contained true -o release/windows-x64
cd release/windows-x64
.\CinemaApi.exe --urls http://localhost:5056
```

Open [http://localhost:5056](http://localhost:5056). The exe starts a web server; you use the application in your browser. Keep all the files in the published folder together. This publish command includes the .NET runtime, so the target computer does not need a separate .NET installation for that build.

Run it from a folder where you can create files, because SQLite needs to write its database there. Stop the server with **Ctrl+C**.

## Check the project

From the repository root:

```powershell
dotnet build CinemaApi/CinemaApi.csproj -c Release
cd cinema-client
npm ci
npm run build
npm run lint
```

During repository preparation, the backend build, fresh database startup, and frontend build passed. The frontend build used dependencies supplied in the Task 4 archive because a clean online npm installation could not be completed in that environment.

**Known check results:** ESLint reports two existing errors about state updates inside effects and two warnings about effect dependencies in `App.jsx`. The NuGet vulnerability check could not download its data. Automated HTTP checks were blocked by local network permissions. These checks are not claimed as passing. See [Verification notes](docs/VERIFICATION.md) for details.

There is no automated test suite in the current project. Useful manual checks are:

1. Register, log in, edit a profile, and log out.
2. Book a free seat and cancel it.
3. Use two browser sessions with different accounts to try booking the same seat.
4. Open the same user record in two sessions and check that saving an old version reports a conflict.
5. Use a demo admin to create and delete a screening.

## Common problems

| Problem | What to do |
| --- | --- |
| `.\CinemaApi.exe` is not recognized | Open the folder containing the published exe first. The project root does not contain it. |
| The page cannot load data | Check that the backend is running on port 5056 and the frontend is on port 5173. |
| Port 5173 is already in use | Stop the other app using it, then start the frontend again. |
| Port 5056 does not show the website | Build the frontend and copy its files to `CinemaApi/wwwroot`, or use port 5173 during development. |
| No admin account exists | Admin setup only runs when the Users table is empty and both temporary settings are supplied. |
| A seat booking reports a conflict | Click **Refresh seats** and choose an available seat. |
| A profile save reports a conflict | Reload the data and reopen the Edit form. |
| Package installation fails | Check your internet connection and installed .NET/Node versions. |
| You are logged out after refreshing the page | The current user is stored only in the page's memory. Log in again. |

## Current limits and future improvements

This version focuses on learning user management, database changes, and seat reservations. It does not include payments, ticket prices, email tickets, QR codes, password reset, or automatic live seat updates.

Before turning it into an online service, the main improvements would be:

- Store passwords with a secure password-hashing method.
- Add real login sessions and backend checks for admin actions and reservation ownership.
- Stop returning passwords in API responses.
- Add stronger checks for user input and screening dates.
- Add automated tests for booking conflicts and profile changes.
- Improve form accessibility and the experience on smaller screens.

These are ideas for future work, not completed features.

## More documentation

- [API reference](docs/API.md): Available routes, request fields, and responses.
- [Architecture](docs/ARCHITECTURE.md): How the frontend, backend, and database connect.
- [Security notes](SECURITY.md): Known issues and what needs to change before hosting.
- [Verification notes](docs/VERIFICATION.md): Checks performed and manual test steps.
- [Preparation notes](docs/PREPARATION.md): How the uploaded project was cleaned for GitHub.
- [Contributing](CONTRIBUTING.md): Notes for making changes.

## License and credits

No project license was provided with the source, so a license has not been added. Confirm ownership and contributor permissions before choosing one. The frontend was originally created from a Vite/React starter. No author or contributor names have been added without confirmation.
