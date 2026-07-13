const codeMap = {
  invalid_credentials: 'Nieprawidłowy adres email lub hasło',
  email_not_confirmed: 'Adres email nie został potwierdzony',
  user_banned: 'Użytkownik został zablokowany',
  user_not_found: 'Nie znaleziono użytkownika',

  user_already_exists: 'Użytkownik już istnieje',
  email_exists: 'Użytkownik z tym adresem email już istnieje',
  signup_disabled: 'Rejestracja jest obecnie wyłączona',
  email_provider_disabled: 'Rejestracja przy użyciu adresu email jest wyłączona',

  provider_disabled: 'Ta metoda logowania jest obecnie wyłączona',
  provider_email_needs_verification: 'Potwierdź adres email, aby kontynuować',
  identity_not_found: 'Nie znaleziono tożsamości użytkownika',
  identity_already_exists: 'Ta metoda logowania jest już powiązana z kontem',

  email_address_invalid: 'Nieprawidłowy adres email',
  email_address_not_authorized: 'Ten adres email nie jest autoryzowany',

  weak_password: 'Hasło jest zbyt słabe',
  same_password: 'Nowe hasło musi różnić się od obecnego',

  otp_expired: 'Kod lub link wygasł',
  reauthentication_needed: 'Zaloguj się ponownie, aby wykonać tę operację',
  reauthentication_not_valid: 'Kod potwierdzający jest nieprawidłowy',

  refresh_token_not_found: 'Sesja wygasła. Zaloguj się ponownie.',
  refresh_token_already_used: 'Sesja wygasła. Zaloguj się ponownie.',
  session_expired: 'Sesja wygasła. Zaloguj się ponownie.',
  session_not_found: 'Nie znaleziono sesji.',
  bad_jwt: 'Nieprawidłowa sesja.',

  over_request_rate_limit: 'Zbyt wiele prób. Spróbuj ponownie później.',
  over_email_send_rate_limit: 'Przekroczono limit wysyłania wiadomości email.',
  over_sms_send_rate_limit: 'Przekroczono limit wysyłania wiadomości SMS.',

  request_timeout: 'Przekroczono czas oczekiwania.',
  validation_failed: 'Wprowadzone dane są nieprawidłowe.',
  bad_json: 'Nieprawidłowe dane żądania.',
  unexpected_failure: 'Wystąpił nieoczekiwany błąd.',
}

const messageMap = {
  'Invalid login credentials': 'Nieprawidłowy adres email lub hasło',
  'Email not confirmed': 'Adres email nie został potwierdzony',
  'User already registered': 'Użytkownik z tym adresem email już istnieje',
  'User is banned': 'Użytkownik został zablokowany',
  'User not found': 'Nie znaleziono użytkownika',
  'Signup is disabled': 'Rejestracja jest obecnie wyłączona',

  'Password should be at least 6 characters': 'Hasło musi mieć co najmniej 6 znaków',

  'Token has expired or is invalid': 'Link lub kod wygasł albo jest nieprawidłowy',
  'Email link is invalid or has expired': 'Link wygasł lub jest nieprawidłowy',
  'Otp expired': 'Kod wygasł',
  'Invalid OTP': 'Nieprawidłowy kod',

  'Refresh Token Not Found': 'Sesja wygasła. Zaloguj się ponownie.',
  'Invalid Refresh Token': 'Sesja wygasła. Zaloguj się ponownie.',
  'Session not found': 'Nie znaleziono sesji.',

  'Failed to fetch': 'Błąd połączenia z internetem.',
  'Network request failed': 'Błąd połączenia z internetem.',
  Timeout: 'Przekroczono czas oczekiwania.',
  AbortError: 'Przekroczono czas oczekiwania.',
}

const partialRules = [
  {
    match: /invalid login credentials/i,
    text: 'Nieprawidłowy adres email lub hasło',
  },
  {
    match: /email.*not.*confirmed/i,
    text: 'Adres email nie został potwierdzony',
  },
  {
    match: /already.*registered|already.*exists/i,
    text: 'Użytkownik z tym adresem email już istnieje',
  },
  {
    match: /user.*ban/i,
    text: 'Użytkownik został zablokowany',
  },
  {
    match: /user.*not.*found/i,
    text: 'Nie znaleziono użytkownika',
  },
  {
    match: /invalid.*email|email.*invalid/i,
    text: 'Nieprawidłowy adres email',
  },
  {
    match: /password.*at least|password.*6/i,
    text: 'Hasło musi mieć co najmniej 6 znaków',
  },
  {
    match: /weak.*password/i,
    text: 'Hasło jest zbyt słabe',
  },
  {
    match: /(otp|token|email link).*(expired|invalid)/i,
    text: 'Link lub kod wygasł albo jest nieprawidłowy',
  },
  {
    match: /refresh token|session expired|bad jwt/i,
    text: 'Sesja wygasła. Zaloguj się ponownie.',
  },
  {
    match: /session.*not.*found/i,
    text: 'Nie znaleziono sesji.',
  },
  {
    match: /rate limit|too many requests|security purposes/i,
    text: 'Zbyt wiele prób. Spróbuj ponownie później.',
  },
  {
    match: /failed to fetch|network/i,
    text: 'Błąd połączenia z internetem.',
  },
  {
    match: /timeout|abort/i,
    text: 'Przekroczono czas oczekiwania.',
  },
]

export function translateAuthError(error) {
  if (!error) return ''

  if (error.code && codeMap[error.code]) {
    return codeMap[error.code]
  }

  const message = typeof error === 'string' ? error : error.message || error.error_description || ''

  if (!message) return 'Wystąpił nieznany błąd.'

  if (messageMap[message]) {
    return messageMap[message]
  }

  for (const { match, text } of partialRules) {
    if (match.test(message)) {
      return text
    }
  }

  return message
}
