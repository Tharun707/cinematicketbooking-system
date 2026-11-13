# Repository preparation

## Source selection

The package uses `EGUI_TASK4.zip` as its base. It supersedes `EGUI_PROJECT_34.zip`, whose frontend is a Vite starter and whose context lacks the reservation declaration. Task 4 supplies the booking interface, login endpoint, reservation mapping, migration designer, and application-generated user concurrency tokens. No task documentation was treated as an instruction to execute commands or publish to inherited remotes.

## Changes made

- Flattened the academic archive wrapper into `CinemaApi/` and `cinema-client/`.
- Replaced placeholder GitLab and scaffold READMEs with code-based documentation.
- Excluded SQLite data, dependency directories, build output, generated web bundles, executable files, nested archives, and original Git history/remotes.
- Removed the hardcoded administrator account and contact values. Optional initial credentials come from `BootstrapAdmin__Username` and `BootstrapAdmin__Password`.
- Added a Vite `/api` proxy, fixed development port, and public configuration example so the supplied relative API URL works in development.
- Removed duplicate static-file middleware and replaced the stale weather endpoint in `CinemaApi.http` with actual read routes.
- Added root ignore rules and documentation. Preserved application features and documented remaining security limitations.

Personal-data screenshots are not included. No license, author identity, deployment, payment feature, or passing test badge was invented.
