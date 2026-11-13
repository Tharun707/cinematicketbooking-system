# API reference

Local base URL: `http://localhost:5056/api`. JSON uses camelCase. Swagger at `/swagger` describes the running API. These endpoints do not require an authenticated session; UI visibility does not protect them.

| Method | Route | Behavior |
| --- | --- | --- |
| GET | `/Cinemas` | List rooms and dimensions. |
| GET | `/Screening` | List screenings including cinema. |
| POST | `/Screening` | Create from `filmTitle`, `startTime`, `cinemaId`; 200. |
| DELETE | `/Screening/{id}` | Delete; 204 or 404. Related reservations cascade. |
| GET | `/User` | List users, including sensitive fields in the current demo. |
| POST | `/User/register` | Register; 200, or 400 for duplicate username/invalid request. |
| POST | `/User/login` | Compare username/password; 200 or 401. Does not issue a token/cookie. |
| PUT | `/User/{id}` | Edit profile/role using `rowVersion`; 200, 400, 404, or 409. |
| DELETE | `/User/{id}?rowVersion=...` | Delete using URL-encoded Base64 version; 204, 400, 404, or 409. Reservations cascade. |
| GET | `/Reservation/screening/{screeningId}` | List seat reservations (`id`, `screeningId`, `userId`, `row`, `seat`). |
| POST | `/Reservation` | Reserve one seat; 200, 400 for invalid user/seat, 404 for missing screening, 409 for conflict. |
| DELETE | `/Reservation/{id}?userId=...` | Cancel; 204, 404, or 403 when supplied ID differs from reservation owner. The ID is client-supplied, not authenticated. |

## Requests

Register (use fictional data and a locally chosen disposable password):

```json
{
  "username": "demo-user",
  "password": "<choose-locally>",
  "firstName": "Demo",
  "lastName": "User",
  "phoneNumber": "",
  "email": ""
}
```

Login requires `username` and `password`. Registration always sets role `User`.

Update requires `username`, `firstName`, `lastName`, `phoneNumber`, `email`, `role`, and the latest `rowVersion` returned by the API. Password is not editable through this endpoint. Treat updates as complete replacement of these fields; omitted optional fields may be reset to defaults. Base64 values must be URL-encoded in DELETE query parameters.

Create a screening:

```json
{"filmTitle":"Demo Film","startTime":"2026-12-01T18:00:00","cinemaId":1}
```

Reserve (replace `userId` with an existing fictional user's ID):

```json
{"screeningId":1,"userId":1,"row":2,"seat":3}
```

Rows and seats are 1-based and bounded by the room dimensions. The unique database index prevents duplicate seat bookings even if two clients read an available seat. The controller maps any `DbUpdateException` during reservation save to 409, so that status can hide other persistence problems. Error shapes vary between validation responses and `{ "error": "..." }` objects. Do not rely on a uniform error schema.
