// Keep API URLs in one place. Override with REACT_APP_HOLIDAY_API_URL in a .env file.
// Default to Calendarific API (India, 2026)
export const HOLIDAY_API_URL =
  process.env.REACT_APP_HOLIDAY_API_URL || "https://calendarific.com/api/v2/holidays?api_key=CdfbmEGwTRgAu7zvKlgU2E0fWmsGjN2H&country=IN&year=2026";
export const STORAGE_KEY = "attendease:data:v1";
export const THEME_KEY = "attendease:theme";
