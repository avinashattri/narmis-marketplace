/**
 * Centralized default campus / location suggestion for NARMIS Marketplace.
 * Used ONLY as an initial suggestion when a user has not entered or saved
 * their own location; never overwrites a previously saved user location.
 */
export const DEFAULT_CAMPUS_LOCATION = 'Chitkara University, Rajpura, Punjab, India';
export const DEFAULT_CAMPUS_CITY = 'Rajpura';
export const DEFAULT_CAMPUS_STATE = 'Punjab';
export const DEFAULT_COLLEGE_NAME = 'Chitkara University';

/**
 * Formats reverse-geocoded Nominatim address fields into an approximate
 * public-safe locality string (never exposing exact house/door numbers or GPS coordinates).
 */
export const formatApproximateLocation = (addr: Record<string, string | undefined>): string => {
  const locality =
    addr.university ||
    addr.college ||
    addr.suburb ||
    addr.neighbourhood ||
    addr.village ||
    addr.town ||
    '';
  const city =
    addr.city ||
    addr.town ||
    addr.city_district ||
    addr.county ||
    DEFAULT_CAMPUS_CITY;
  const state = addr.state || DEFAULT_CAMPUS_STATE;
  const country = addr.country || 'India';

  const parts = [locality, city, state, country].filter(
    (part, idx, arr) => Boolean(part) && arr.indexOf(part) === idx
  );
  return parts.join(', ');
};
