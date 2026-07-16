export function toggleProfile(route, router) {
  if (route.query.panel === 'profile') {
    router.push('/')
  } else {
    router.push({ path: '/', query: { panel: 'profile' } })
  }
}

export function toggleTeachers(route, router) {
  if (route.query.panel === 'teachers') {
    router.push('/')
  } else {
    router.push({ path: '/', query: { panel: 'teachers' } })
  }
}

export function toggleRank(route, router) {
  if (route.query.panel === 'ranks') {
    router.push('/')
  } else {
    router.push({ path: '/', query: { panel: 'ranks' } })
  }
}
