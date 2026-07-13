export function toggleProfile(route, router) {
  if (route.path === '/profil') {
    router.push('/')
  } else {
    router.push('/profil')
  }
}

export function toggleTeachers(route, router) {
  if (route.path === '/nauczyciele') {
    router.push('/')
  } else {
    router.push('/nauczyciele')
  }
}

export function toggleFilter(route, router, active) {
  if (route.path === '/profil' || route.path === '/nauczyciele') {
    router.push('/')
  }
  if (active) {
    active.value = active.value === 'filter' ? null : 'filter'
  }
}

export function toggleRank(route, router, active) {
  if (route.path === '/profil' || route.path === '/nauczyciele') {
    router.push('/')
  }
  if (active) {
    active.value = active.value === 'ranks' ? null : 'ranks'
  }
}
