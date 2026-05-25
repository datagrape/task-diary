# task-diary

## New APIs

- `POST /api/push/register-device`
- `POST /api/location-request/respond`
- `POST /api/forgot-password/send-otp`
- `POST /api/forgot-password/verify-otp`
- `POST /api/forgot-password/reset`

## Expected Admin Push Payload

```json
{
  "data": {
    "type": "LOCATION_REQUEST",
    "requestId": "request-id",
    "adminId": "admin-id",
    "userId": "user-id"
  },
  "notification": {
    "title": "Location requested",
    "body": "Admin is asking for your location"
  }
}
```

## Env Keys

- `FCM_PROJECT_ID`
- `FCM_CLIENT_EMAIL`
- `FCM_PRIVATE_KEY`
