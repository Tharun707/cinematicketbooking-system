# Publish to GitHub

Repository name: `cinematicketbooking-system`. Requested visibility: **public**. Publish the sanitized source folder, not either original ZIP or an extracted publish folder.

Suggested description: `Educational cinema booking app with React, ASP.NET Core, SQLite, seat reservations, and optimistic concurrency.`

## Using Git

Create an empty public repository under your intended GitHub account, without initializing a README, license, or `.gitignore`. Copy its HTTPS repository URL.

From this prepared repository folder:

```powershell
git init -b main
git add .
git status --short
git diff --cached --stat
git commit -m "Prepare cinema booking demo with documentation"
git remote add origin https://github.com/YOUR-USERNAME/cinematicketbooking-system.git
git push -u origin main
```

Replace `YOUR-USERNAME` with the actual owner. Authenticate through Git's credential manager; never put passwords or tokens in the URL. If Git requests an author name/email, configure the identity you want attributed before committing. Review the staged file list before pushing. Do not force-push to an existing repository.

Build artifacts and executables belong in a separately reviewed release package, not source history. Public source publication does not make this demo safe to deploy. See [security limitations](../SECURITY.md).
