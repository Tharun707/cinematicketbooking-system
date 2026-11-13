# Verification

Preparation checks on November 13, 2026:

| Check | Result |
| --- | --- |
| .NET Release build | Passed with .NET SDK 10.0.201. NuGet vulnerability metadata could not be fetched (NU1900); this is not a clean security audit. |
| Fresh SQLite startup | Passed: both committed migrations applied and the API reported listening on localhost:5056. No default user was inserted without bootstrap values. |
| React production build | Passed using Node 24.15.0 and the Task 4 archive's offline dependency tree (Vite reported 8.0.13). |
| Clean npm installation | Not verified: registry installation did not complete in the restricted environment. Frontend checks used the supplied offline dependencies. |
| ESLint | Failed on pre-existing App.jsx effects: two `react-hooks/set-state-in-effect` errors and two `react-hooks/exhaustive-deps` warnings. No rules were disabled to hide them. |
| HTTP smoke checks | Blocked by local socket permissions (WinError 10013); no endpoint test pass is claimed. |
| Browser booking | User supplied screenshots of the original Task 4 executable showing profile, screenings, and seat grid. The newly prepared source was not independently browser-tested. |

There is no automated test suite in the supplied application. The original executable's behavior does not verify the cleaned startup or changed development proxy end to end.

## Manual checks for a local developer

1. Start against a fresh disposable database; verify three rooms, two screenings, and no inherited accounts.
2. Register fictional users in separate browser sessions and log in/out.
3. Select a numbered seat and click **Book selected seat**; verify it changes to **Mine**.
4. Select the same seat in two sessions before either submits. Submit both: one should succeed, the other should receive a conflict. Refresh availability.
5. Select **Mine**, cancel, and verify the seat becomes available.
6. Open the same user edit form in two sessions; save in one, then save the stale form. Expect HTTP 409. Reload and reopen the form before retrying.
7. With a demo admin, create/delete a screening and edit/delete a different fictional user. Verify cascade effects on reservations.
8. Build/copy React assets, restart the API, and check the interface at port 5056. Publish and test the complete Windows folder separately if distributing an executable.

Do not enter real information during these checks. Keep the public deployment blocked until the limitations in SECURITY.md are resolved.
