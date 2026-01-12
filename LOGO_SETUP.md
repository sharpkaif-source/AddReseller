# Logo Setup Instructions

## Logo File Location

The bot expects a logo file named `logo.png` in the project root directory.

### Steps:

1. **Place your logo file** in the root directory of this project:
   ```
   C:\Cursor-Projects\AddReseller\logo.png
   ```

2. **Supported formats**: PNG, JPG, JPEG

3. **File name**: The file should be named `logo.png` (or update the path in `config.js`)

### Current Configuration

The logo path is configured in `config.js`:
```javascript
logoPath: './logo.png' // Path to logo file to upload
```

You can change this path if your logo file is located elsewhere or has a different name.

## What the Bot Does

When filling the Branding form, the bot will:
1. ✅ Upload the logo file automatically
2. ✅ Select "English" as the language
3. ✅ Check the "Make default language" checkbox

Make sure your logo file exists before running the bot!
