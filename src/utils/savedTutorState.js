function getAccountType(profile) {
  return [profile?.account_type, profile?.accountType].find(Boolean) || ''
}

function isTutorAccountType(accountType = '') {
  return `${accountType}`.toLowerCase().includes('tutor')
}

export function buildLikedTeachersState(authIds = [], profiles = [], isTutorAccount = false) {
  const ids = Array.isArray(authIds) ? authIds : []
  const rows = Array.isArray(profiles) ? profiles : []

  const byAuthId = Object.fromEntries(
    rows
      .filter((profile) => profile?.auth_id)
      .map((profile) => [profile.auth_id, { ...profile, id: String(profile.id) }]),
  )

  return ids
    .map((id) => byAuthId[id])
    .filter((profile) => {
      if (!profile) return false
      const accountType = getAccountType(profile)
      const isTutor = isTutorAccountType(accountType)
      return isTutorAccount ? !isTutor : isTutor
    })
}

export { getAccountType, isTutorAccountType }
