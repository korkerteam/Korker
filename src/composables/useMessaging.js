import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from './useAuth.js'

const ATTACHMENT_BUCKET = 'profile_pictures'

const conversations = ref([])
const messages = ref([])
const loadingMessages = ref(false)
const activeUserId = ref(null)
const searchResults = ref([])
const searchLoading = ref(false)
const currentContact = ref(null)
const lastIncomingMessage = ref(null)
const notifications = ref([])
const nextNotificationId = ref(1)

let realtimeChannel = null

const profileCache = new Map()

function isImageFile(type) {
  return type?.startsWith('image/')
}

function getAttachmentUrl(path) {
  const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function stringToColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const isHighContrast = document.documentElement.getAttribute('data-contrast') === 'high'
  const colors = isHighContrast
    ? ['#f2b500', '#ffcf33', '#ffd84d', '#ffde66', '#ffe27f', '#f9dc76', '#f7d96e', '#fce491']
    : ['#4f75c7', '#5b8cff', '#3b82f6', '#2563eb', '#1d4ed8', '#60a5fa', '#8ab4ff', '#93c5fd']
  return colors[Math.abs(hash) % colors.length]
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'teraz'
  if (mins < 60) return `${mins} min temu`
  if (hours < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return 'wczoraj'
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

function makeContact(userId, profile) {
  return {
    userId,
    name: profile ? [profile.name, profile.surname].filter(Boolean).join(' ') : 'Nieznany',
    avatarColor: stringToColor(userId),
    profilePicture: profile?.profile_picture || null,
  }
}

function updateConversationUnread(userId, unreadCount) {
  const idx = conversations.value.findIndex((conversation) => conversation.userId === userId)
  if (idx < 0) return

  const arr = [...conversations.value]
  arr[idx] = { ...arr[idx], unread: unreadCount }
  conversations.value = arr
}

async function getProfileByAuthId(authId) {
  if (profileCache.has(authId)) return profileCache.get(authId)
  const { data, error } = await supabase
    .from('users')
    .select('name, surname, profile_picture')
    .eq('auth_id', authId)
    .maybeSingle()
  const result = error || !data ? null : data
  profileCache.set(authId, result)
  return result
}

export function useMessaging() {
  const { user } = useAuth()

  const activeConversation = computed(() => {
    if (!activeUserId.value) return null
    const found = conversations.value.find((c) => c.userId === activeUserId.value)
    return found || currentContact.value
  })

  async function loadConversations() {
    if (!user.value) {
      conversations.value = []
      return
    }

    const { data, error } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, content, created_at, read_at, attachments')
      .or(`sender_id.eq.${user.value.id},receiver_id.eq.${user.value.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('loadConversations error:', error)
      return
    }

    if (!data || data.length === 0) {
      conversations.value = []
      return
    }

    const groups = {}
    for (const msg of data) {
      const otherId = msg.sender_id === user.value.id ? msg.receiver_id : msg.sender_id
      if (!groups[otherId]) {
        const displayText = msg.content || (msg.attachments?.length ? '[Załącznik]' : '')
        groups[otherId] = {
          userId: otherId,
          lastMessage: displayText,
          lastTime: msg.created_at,
          lastTimeLabel: formatRelativeTime(msg.created_at),
          unread: 0,
        }
      }
      if (msg.receiver_id === user.value.id && msg.read_at === null) {
        groups[otherId].unread++
      }
    }

    const enriched = await Promise.all(
      Object.values(groups).map(async (g) => {
        const profile = await getProfileByAuthId(g.userId)
        return {
          ...g,
          ...makeContact(g.userId, profile),
        }
      }),
    )

    enriched.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime))

    conversations.value = enriched
  }

  async function openConversation(otherUserId) {
    if (!user.value) return

    activeUserId.value = otherUserId
    loadingMessages.value = true
    messages.value = []

    const found = conversations.value.find((c) => c.userId === otherUserId)
    if (found) {
      currentContact.value = found
    } else {
      const profile = await getProfileByAuthId(otherUserId)
      currentContact.value = makeContact(otherUserId, profile)
    }

    const uid = user.value.id
    const filter = `and(sender_id.eq.${uid},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${uid})`

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(filter)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('openConversation error:', error)
      loadingMessages.value = false
      return
    }

    messages.value = data || []
    loadingMessages.value = false

    await markAsRead(otherUserId)
  }

  function closeConversation() {
    activeUserId.value = null
    messages.value = []
    currentContact.value = null
  }

  async function uploadAttachments(files) {
    if (!files || files.length === 0) return []
    const uploaded = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `chat/${user.value.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file)
      if (error) {
        console.error('uploadAttachment error:', error)
        continue
      }
      uploaded.push({
        name: file.name,
        size: file.size,
        type: file.type,
        path,
        url: getAttachmentUrl(path),
      })
    }
    return uploaded
  }

  async function sendMessage(content, files) {
    if (!user.value || !activeUserId.value) return false
    if (!content?.trim() && (!files || files.length === 0)) return false

    const attachments = files?.length ? await uploadAttachments(files) : []

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.value.id,
        receiver_id: activeUserId.value,
        content: content?.trim() || '',
        attachments: attachments.length ? attachments : null,
      })
      .select()
      .single()

    if (error) {
      console.error('sendMessage error:', error)
      return false
    }

    messages.value = [...messages.value, data]

    const displayText = data.content || (data.attachments?.length ? '[Załącznik]' : '')

    const convIdx = conversations.value.findIndex((c) => c.userId === activeUserId.value)
    if (convIdx >= 0) {
      const updated = {
        ...conversations.value[convIdx],
        lastMessage: displayText,
        lastTime: data.created_at,
        lastTimeLabel: formatRelativeTime(data.created_at),
      }
      const arr = [...conversations.value]
      arr.splice(convIdx, 1)
      arr.unshift(updated)
      conversations.value = arr
    } else {
      const profile = await getProfileByAuthId(activeUserId.value)
      const entry = {
        ...makeContact(activeUserId.value, profile),
        lastMessage: displayText,
        lastTime: data.created_at,
        lastTimeLabel: formatRelativeTime(data.created_at),
        unread: 0,
      }
      conversations.value = [entry, ...conversations.value]
    }

    return true
  }

  async function editMessage(messageId, newContent) {
    if (!user.value || !newContent.trim()) return false

    const { error } = await supabase
      .from('messages')
      .update({ content: newContent.trim() })
      .eq('id', messageId)
      .eq('sender_id', user.value.id)

    if (error) {
      console.error('editMessage error:', error)
      return false
    }

    messages.value = messages.value.map((m) =>
      m.id === messageId ? { ...m, content: newContent.trim() } : m,
    )

    const msg = messages.value.find((m) => m.id === messageId)
    if (msg) {
      const otherId = msg.receiver_id === user.value.id ? msg.sender_id : msg.receiver_id
      const convIdx = conversations.value.findIndex((c) => c.userId === otherId)
      if (convIdx >= 0) {
        const arr = [...conversations.value]
        arr[convIdx] = { ...arr[convIdx], lastMessage: newContent.trim() }
        conversations.value = arr
      }
    }

    return true
  }

  async function deleteMessage(messageId) {
    if (!user.value) return false

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', user.value.id)

    if (error) {
      console.error('deleteMessage error:', error)
      return false
    }

    const deleted = messages.value.find((m) => m.id === messageId)
    messages.value = messages.value.filter((m) => m.id !== messageId)

    if (deleted) {
      const otherId =
        deleted.receiver_id === user.value.id ? deleted.sender_id : deleted.receiver_id
      const remaining = messages.value.filter(
        (m) =>
          (m.sender_id === user.value.id && m.receiver_id === otherId) ||
          (m.sender_id === otherId && m.receiver_id === user.value.id),
      )
      const lastMsg = remaining[remaining.length - 1]
      const convIdx = conversations.value.findIndex((c) => c.userId === otherId)
      if (convIdx >= 0) {
        const arr = [...conversations.value]
        arr[convIdx] = {
          ...arr[convIdx],
          lastMessage: lastMsg ? lastMsg.content : '',
          lastTime: lastMsg ? lastMsg.created_at : '',
          lastTimeLabel: lastMsg ? formatRelativeTime(lastMsg.created_at) : '',
        }
        conversations.value = arr
      }
    }

    return true
  }

  async function markAsRead(otherUserId) {
    if (!user.value) return

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('receiver_id', user.value.id)
      .eq('sender_id', otherUserId)
      .is('read_at', null)

    updateConversationUnread(otherUserId, 0)
  }

  async function searchUsers(query) {
    if (!query || !query.trim() || !user.value) {
      searchResults.value = []
      return
    }

    searchLoading.value = true
    const { data, error } = await supabase
      .from('users')
      .select('auth_id, name, surname, profile_picture')
      .or(`name.ilike.%${query}%,surname.ilike.%${query}%`)
      .neq('auth_id', user.value.id)
      .limit(20)

    if (error) {
      console.error('searchUsers error:', error)
      searchResults.value = []
      searchLoading.value = false
      return
    }

    searchResults.value = (data || []).map((u) => ({
      userId: u.auth_id,
      name: [u.name, u.surname].filter(Boolean).join(' '),
      avatarColor: stringToColor(u.auth_id),
      profilePicture: u.profile_picture || null,
    }))
    searchLoading.value = false
  }

  function clearSearch() {
    searchResults.value = []
  }

  async function getSenderDisplayName(senderId) {
    if (!senderId) return 'Nieznany'

    const existing = conversations.value.find((conversation) => conversation.userId === senderId)
    if (existing?.name) return existing.name

    const profile = await getProfileByAuthId(senderId)
    return [profile?.name, profile?.surname].filter(Boolean).join(' ') || 'Nieznany'
  }

  async function addChatNotification(msg) {
    if (!msg || !msg.sender_id) return
    if (notifications.value.some((n) => n.id === msg.id)) return

    const senderId = msg.sender_id
    const preview = msg.content || (msg.attachments?.length ? '[Załącznik]' : '[Nowa wiadomość]')
    const senderName = await getSenderDisplayName(senderId)
    const timestamp = 'Teraz'

    notifications.value.unshift({
      id: msg.id || nextNotificationId.value,
      senderId,
      message: preview,
      sender: senderName,
      time: timestamp,
      isRead: false,
    })

    if (!msg.id) {
      nextNotificationId.value += 1
    }
  }

  function markNotificationRead(id) {
    const notif = notifications.value.find((n) => n.id === id)
    if (notif) {
      notif.isRead = true
    }
  }

  function clearNotifications() {
    notifications.value = []
  }

  function setupRealtime() {
    teardownRealtime()

    realtimeChannel = supabase.channel('messages-realtime')

    async function handleIncomingMessage(msg) {
      if (!user.value) return

      const involvesMe = msg.sender_id === user.value.id || msg.receiver_id === user.value.id
      if (!involvesMe) return

      if (
        activeUserId.value &&
        ((msg.sender_id === user.value.id && msg.receiver_id === activeUserId.value) ||
          (msg.sender_id === activeUserId.value && msg.receiver_id === user.value.id))
      ) {
        if (!messages.value.some((m) => m.id === msg.id)) {
          messages.value = [...messages.value, msg]
        }
      }

      const otherId = msg.sender_id === user.value.id ? msg.receiver_id : msg.sender_id
      if (!otherId) return

      const isIncoming = msg.receiver_id === user.value.id && msg.sender_id !== user.value.id
      if (isIncoming) {
        lastIncomingMessage.value = msg
        if (msg.sender_id !== activeUserId.value) {
          await addChatNotification(msg)
        }
      }

      const idx = conversations.value.findIndex((c) => c.userId === otherId)

      const displayText = msg.content || (msg.attachments?.length ? '[Załącznik]' : '')

      if (idx >= 0) {
        const isUnread = msg.receiver_id === user.value.id && otherId !== activeUserId.value
        const updated = {
          ...conversations.value[idx],
          lastMessage: displayText,
          lastTime: msg.created_at,
          lastTimeLabel: formatRelativeTime(msg.created_at),
        }
        if (isUnread) updated.unread = (updated.unread || 0) + 1
        const arr = [...conversations.value]
        arr.splice(idx, 1)
        arr.unshift(updated)
        conversations.value = arr
      } else {
        const profile = await getProfileByAuthId(otherId)
        const isUnread = msg.receiver_id === user.value.id && otherId !== activeUserId.value
        const entry = {
          ...makeContact(otherId, profile),
          lastMessage: displayText,
          lastTime: msg.created_at,
          lastTimeLabel: formatRelativeTime(msg.created_at),
          unread: isUnread ? 1 : 0,
        }
        conversations.value = [entry, ...conversations.value]
      }
    }

    function handleUpdatedMessage(msg) {
      if (!user.value) return
      const involvesMe = msg.sender_id === user.value.id || msg.receiver_id === user.value.id
      if (!involvesMe) return

      messages.value = messages.value.map((m) =>
        m.id === msg.id ? { ...m, content: msg.content, attachments: msg.attachments } : m,
      )

      const otherId = msg.sender_id === user.value.id ? msg.receiver_id : msg.sender_id
      const convIdx = conversations.value.findIndex((c) => c.userId === otherId)
      if (convIdx >= 0) {
        const arr = [...conversations.value]
        arr[convIdx] = { ...arr[convIdx], lastMessage: msg.content }
        conversations.value = arr
      }
    }

    function handleDeletedMessage(oldMsg) {
      if (!user.value) return
      const involvesMe = oldMsg.sender_id === user.value.id || oldMsg.receiver_id === user.value.id
      if (!involvesMe) return

      messages.value = messages.value.filter((m) => m.id !== oldMsg.id)

      const otherId = oldMsg.sender_id === user.value.id ? oldMsg.receiver_id : oldMsg.sender_id
      const remaining = messages.value.filter(
        (m) =>
          (m.sender_id === user.value.id && m.receiver_id === otherId) ||
          (m.sender_id === otherId && m.receiver_id === user.value.id),
      )
      const lastMsg = remaining[remaining.length - 1]
      const convIdx = conversations.value.findIndex((c) => c.userId === otherId)
      if (convIdx >= 0) {
        const arr = [...conversations.value]
        arr[convIdx] = {
          ...arr[convIdx],
          lastMessage: lastMsg ? lastMsg.content : '',
          lastTime: lastMsg ? lastMsg.created_at : '',
          lastTimeLabel: lastMsg ? formatRelativeTime(lastMsg.created_at) : '',
        }
        conversations.value = arr
      }
    }

    realtimeChannel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => handleIncomingMessage(payload.new),
    )

    realtimeChannel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'messages' },
      (payload) => handleUpdatedMessage(payload.new),
    )

    realtimeChannel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'messages' },
      (payload) => handleDeletedMessage(payload.old),
    )

    realtimeChannel.subscribe()
  }

  function teardownRealtime() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  watch(
    () => user.value?.id,
    (userId) => {
      if (userId) {
        setupRealtime()
      } else {
        teardownRealtime()
      }
    },
    { immediate: true },
  )

  return {
    conversations,
    messages,
    loadingMessages,
    activeUserId,
    activeConversation,
    searchResults,
    searchLoading,
    loadConversations,
    openConversation,
    closeConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    searchUsers,
    clearSearch,
    notifications,
    markNotificationRead,
    clearNotifications,
    lastIncomingMessage,
    setupRealtime,
    teardownRealtime,
  }
}
