import { HOLIDAY_API_URL } from "../constants";

/** Fetches public holidays from Calendarific API. Throws an Error with a friendly message on failure. */
export async function fetchHolidays(signal) {
  const response = await fetch(HOLIDAY_API_URL, { signal });
  if (!response.ok) {
    throw new Error(`The holiday service responded with status ${response.status}.`);
  }
  const json = await response.json();
  
  // Calendarific API returns { response: { holidays: [...] } }
  if (!json.response || !Array.isArray(json.response.holidays)) {
    throw new Error("The holiday service returned an unexpected response.");
  }
  
  // Map Calendarific format to our expected format
  return json.response.holidays
    .map((h) => ({
      date: h.date?.iso,
      name: h.name,
    }))
    .filter((h) => h && h.date && h.name);
}
