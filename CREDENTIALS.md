# Login Credentials

## Admin Access

- **Admin URL**: `https://test-reseller.singleinterface.com/admin`
- **Email**: `admin@reseller.com`
- **Password**: `Admin@2025`

## Configuration

These credentials are already configured in `config.js` as defaults. The bot will use these automatically unless you override them via environment variables.

## Environment Variables (Optional Override)

If you need to use different credentials, create a `.env` file:

```env
BASE_URL=https://test-reseller.singleinterface.com/admin
ADMIN_EMAIL=admin@reseller.com
ADMIN_PASSWORD=Admin@2025
HEADLESS=true
```

## Testing

Run the bot with:
```bash
npm test
```

The bot will:
1. Navigate to the admin URL
2. Login with the provided credentials
3. Complete all 4 reseller creation forms
4. Generate random user email: `mohd.kashif+{random}@singleinterface.com`
