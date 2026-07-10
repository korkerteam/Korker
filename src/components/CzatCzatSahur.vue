<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'

let n = 0
const id = () => `${Date.now().toString(36)}_${++n}`
const seed = (a) => a.map((m) => ({ id: id(), edited: false, editedAt: null, ...m }))

const showChat = ref(false)
const activeId = ref(null)
const newMsg = ref('')
const editId = ref(null)
const editTxt = ref('')
const delId = ref(null)
const body = ref(null)
const panel = ref(null)

function onClickOutside(e) {
  if (panel.value && !panel.value.contains(e.target) && !e.target.closest('.fab')) {
    showChat.value = false
    activeId.value = null
    clr()
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

const contacts = ref(
  [
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'Matematyka',
      color: '#4f75c7',
      online: 1,
      last: 'teraz',
      msgs: seed([
        {
          from: 'them',
          text: 'Hej! Widzę, że szukasz pomocy z matmy? Jestem tu po to!',
          time: '14:14',
        },
        { from: 'them', text: 'Który temat sprawia Ci najwięcej trudności?', time: '14:14' },
        { from: 'me', text: 'Cześć! Szeregi Taylora kompletnie mnie rozwalają 😅', time: '14:18' },
        {
          from: 'them',
          text: 'Spokojnie, ogarniemy to! Test ilorazowy to nasz kumpel.',
          time: '14:19',
        },
      ]),
    },
    {
      id: 2,
      name: 'Michał Kowalski',
      role: 'Fizyka',
      color: '#e056fd',
      online: 0,
      last: '2h temu',
      msgs: seed([
        {
          from: 'them',
          text: 'Cześć! Przygotowałem zadania z mechaniki dla Ciebie.',
          time: '11:00',
        },
        { from: 'me', text: 'O, super! Dzięki wielkie', time: '11:05' },
      ]),
    },
    {
      id: 3,
      name: 'Anna Nowak',
      role: 'Angielski',
      color: '#42b883',
      online: 1,
      last: 'teraz',
      msgs: seed([
        { from: 'them', text: 'Hi! Ready for our next conversation practice?', time: '09:30' },
        { from: 'me', text: "Sure! Let's do it.", time: '09:32' },
        { from: 'them', text: "Great! I'll prepare some topics about travel.", time: '09:33' },
      ]),
    },
    {
      id: 4,
      name: 'Kasia Wiśniewska',
      role: 'Chemia',
      color: '#10b981',
      online: 1,
      last: '5min temu',
      msgs: seed([
        { from: 'them', text: 'Hej! Ogarnijmy razem te równania redox', time: '12:00' },
        { from: 'me', text: 'Brzmi dobrze! Kiedy masz czas?', time: '12:02' },
        { from: 'them', text: 'Jutro po 15?', time: '12:03' },
        { from: 'me', text: 'Pasuje!', time: '12:05' },
      ]),
    },
  ].map((c) => ({ ...c, messages: c.msgs, msgs: void 0 })),
)

const cur = computed(() => contacts.value.find((c) => c.id === activeId.value) || null)
const list = computed(() => !cur.value)

function down() {
  nextTick(() => {
    if (body.value) body.value.scrollTop = body.value.scrollHeight
  })
}
function openChat(id) {
  activeId.value = id
  down()
}
function clr() {
  editId.value = null
  editTxt.value = ''
  delId.value = null
}
function back() {
  activeId.value = null
  clr()
}
function toggle() {
  showChat.value = !showChat.value
  if (!showChat.value) {
    activeId.value = null
    clr()
  }
}

function send() {
  if (!newMsg.value.trim() || !cur.value) return
  const c = contacts.value.find((x) => x.id === activeId.value)
  if (!c) return
  c.messages.push({
    id: id(),
    from: 'me',
    text: newMsg.value,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    edited: false,
    editedAt: null,
  })
  newMsg.value = ''
  down()
}
function onkey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function startEdit(m) {
  editId.value = m.id
  editTxt.value = m.text
  nextTick(() => {
    const el = document.querySelector('.et')
    if (el) {
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  })
}
function cancelEdit() {
  editId.value = null
  editTxt.value = ''
}
function saveEdit(id) {
  if (!editTxt.value.trim()) return
  const c = contacts.value.find((x) => x.id === activeId.value)
  if (!c) return
  const m = c.messages.find((x) => x.id === id)
  if (!m) return
  m.text = editTxt.value
  m.edited = true
  m.editedAt = new Date().toISOString()
  editId.value = null
  editTxt.value = ''
}
function onEditKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    saveEdit(editId.value)
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    cancelEdit()
    delId.value = null
  }
}
function reqDel(id) {
  delId.value = id
}
function cancelDel() {
  delId.value = null
}
function delMsg() {
  const id = delId.value
  if (!id) return
  const c = contacts.value.find((x) => x.id === activeId.value)
  if (!c) return
  const i = c.messages.findIndex((x) => x.id === id)
  if (i === -1) return
  c.messages.splice(i, 1)
  if (editId.value === id) cancelEdit()
  delId.value = null
}

watch(activeId, down)
</script>

<template>
  <div class="r">
    <button v-if="!showChat" class="fab" @click="toggle" title="Czat">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
          fill="currentColor"
        />
        <rect x="7" y="9" width="10" height="2" rx="1" fill="white" />
        <rect x="7" y="13" width="7" height="2" rx="1" fill="white" />
      </svg>
    </button>
    <Transition name="s">
      <div v-if="showChat" ref="panel" class="dr">
        <div v-if="list" class="h">
          <h2 class="ht">Wiadomości</h2>
          <button class="hb" @click="toggle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div v-else class="h hc">
          <button class="hb" @click="back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                fill="currentColor"
              />
            </svg>
          </button>
          <div class="hi">
            <div class="ha" :style="{ background: cur?.color }">{{ cur?.name?.charAt(0) }}</div>
            <div class="hm">
              <span class="hn">{{ cur?.name }}</span
              ><span class="hs" :class="{ on: cur?.online }">{{
                cur?.online ? 'Online' : cur?.last
              }}</span>
            </div>
          </div>
          <button class="hb" @click="toggle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div v-if="list" class="cl">
          <button v-for="c in contacts" :key="c.id" class="ci" @click="openChat(c.id)">
            <div class="cil">
              <div class="cia" :style="{ background: c.color }">{{ c.name.charAt(0) }}</div>
              <div class="cii">
                <span class="cin">{{ c.name }}</span
                ><span class="cir">{{ c.role }}</span
                ><span v-if="c.messages.length" class="cila">{{
                  c.messages[c.messages.length - 1].text
                }}</span>
              </div>
            </div>
            <div class="cir2">
              <span v-if="c.online" class="cid"></span><span v-else class="cia2">{{ c.last }}</span>
            </div>
          </button>
        </div>
        <div v-else ref="body" class="ms">
          <div
            v-for="m in cur?.messages"
            :key="m.id"
            class="mr"
            :class="m.from === 'me' ? 'me' : 'th'"
          >
            <div v-if="m.from === 'them'" class="ma" :style="{ background: cur?.color }">
              {{ cur?.name?.charAt(0) }}
            </div>
            <div class="mb">
              <div class="bw" :class="m.from === 'me' ? 'bwm' : ''">
                <div v-if="editId === m.id && m.from === 'me'" class="ew">
                  <textarea v-model="editTxt" class="et" rows="2" @keydown="onEditKey"></textarea>
                  <div class="ea">
                    <button class="es" @click="saveEdit(m.id)" :disabled="!editTxt.trim()">
                      Zapisz</button
                    ><button class="ec" @click="cancelEdit">Anuluj</button>
                  </div>
                </div>
                <div v-else class="bb" :class="m.from === 'me' ? 'bm' : 'bt'">
                  {{ m.text }}
                  <div v-if="m.from === 'me' && delId !== m.id" class="ao">
                    <button class="ab" @click="startEdit(m)" title="Edytuj">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button class="ab" @click="reqDel(m.id)" title="Usuń">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                  <div v-if="m.from === 'me' && delId === m.id" class="dc">
                    <span class="dl">Usunąć?</span><button class="dy" @click="delMsg()">Usuń</button
                    ><button class="dn" @click="cancelDel">Anuluj</button>
                  </div>
                </div>
              </div>
              <span class="mt" :class="m.from === 'me' ? 'mtr' : ''"
                >{{ m.time }}<span v-if="m.edited" class="ed">. edytowano</span></span
              >
            </div>
          </div>
        </div>
        <div v-if="!list" class="ia">
          <div class="ir">
            <textarea
              v-model="newMsg"
              class="it"
              placeholder="Napisz wiadomość..."
              rows="1"
              @keydown="onkey"
            ></textarea
            ><button class="is" @click="send" :disabled="!newMsg.trim()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.r {
  font-family: sans-serif;
}
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1200;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #4f75c7;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(79, 117, 199, 0.35);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.fab:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 28px rgba(79, 117, 199, 0.5);
}
.fab:active {
  transform: scale(0.93);
}
.dr {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1100;
  width: 100%;
  max-width: 420px;
  height: 100vh;
  height: 100dvh;
  background: #f5f7fa;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.s-enter-active {
  animation: sl 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.s-leave-active {
  animation: sl 0.22s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}
@keyframes sl {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #4f75c7;
  color: #fff;
  flex-shrink: 0;
  min-height: 64px;
}
.hc {
  padding: 16px 20px;
  min-height: 64px;
}
.ht {
  font-family: 'Horizon', sans-serif;
  font-size: 20px;
  font-weight: 400;
  margin: 0;
  letter-spacing: 0.5px;
}
.hb {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.hb:hover {
  background: rgba(255, 255, 255, 0.35);
}
.hb:active {
  transform: scale(0.92);
}

.hi {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}
.ha {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}
.hm {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.hn {
  font-size: 17px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hs {
  font-size: 12px;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hs.on::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  margin-right: 5px;
  vertical-align: middle;
}

.cl {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}
.cl::-webkit-scrollbar,
.ms::-webkit-scrollbar {
  width: 5px;
}
.cl::-webkit-scrollbar-track,
.ms::-webkit-scrollbar-track {
  background: transparent;
}
.cl::-webkit-scrollbar-thumb,
.ms::-webkit-scrollbar-thumb {
  background: #d1dcee;
  border-radius: 4px;
}

.ci {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  border-bottom: 1px solid #e8edf5;
}
.ci:hover {
  background: #e8edf5;
}
.ci:active {
  background: #d1dcee;
}
.cil {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}
.cia {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}
.cii {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.cin {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cir {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cila {
  font-size: 13px;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 1px;
}
.cir2 {
  flex-shrink: 0;
  margin-left: 10px;
  display: flex;
  align-items: center;
}
.cid {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
}
.cia2 {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}

.ms {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mr {
  display: flex;
  gap: 8px;
  max-width: 88%;
}
.mr.th {
  align-self: flex-start;
}
.mr.me {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.ma {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 4px;
}
.mb {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.me .mb {
  align-items: flex-end;
}
.bw {
  position: relative;
}
.bwm:hover .ao {
  display: flex;
}

.ao {
  position: absolute;
  top: -14px;
  right: 0;
  display: none;
  gap: 2px;
  z-index: 10;
}
.ab {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #e8edf5;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.ab:hover {
  background: #d1dcee;
  color: #1a1a2e;
}
.ab:active {
  transform: scale(0.9);
}

.dc {
  position: absolute;
  top: -14px;
  right: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
  background: #fff;
  border-radius: 8px;
  padding: 3px 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}
.dl {
  font-size: 11px;
  color: #6b7280;
  margin-right: 2px;
}
.dy,
.dn {
  padding: 3px 8px;
  border: none;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.dy {
  background: #ef4444;
  color: #fff;
}
.dy:hover {
  background: #dc2626;
}
.dn {
  background: #e8edf5;
  color: #6b7280;
}
.dn:hover {
  background: #d1dcee;
}

.bb {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.bt {
  background: #e8edf5;
  color: #1a1a2e;
  border-bottom-left-radius: 5px;
}
.bm {
  background: #4f75c7;
  color: #fff;
  border-bottom-right-radius: 5px;
}

.mt {
  font-size: 11px;
  color: #9ca3af;
  padding: 0 4px;
}
.mtr {
  align-self: flex-end;
}
.ed {
  color: #9ca3af;
  font-size: 11px;
}

.ew {
  background: #fff;
  border: 2px solid #4f75c7;
  border-radius: 14px;
  padding: 8px;
  min-width: 220px;
}
.et {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #1a1a2e;
  resize: none;
  outline: none;
  line-height: 1.5;
  font-family: inherit;
  min-height: 40px;
}
.ea {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 6px;
}
.es,
.ec {
  padding: 5px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.es {
  background: #4f75c7;
  color: #fff;
}
.es:hover {
  background: #3d62ad;
}
.es:disabled {
  background: #d1dcee;
  cursor: default;
}
.ec {
  background: #e8edf5;
  color: #6b7280;
}
.ec:hover {
  background: #d1dcee;
}

.ia {
  padding: 10px 14px 14px;
  border-top: 1px solid #e8edf5;
  background: #f5f7fa;
  flex-shrink: 0;
}
.ir {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #fff;
  border-radius: 20px;
  padding: 4px 4px 4px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}
.ir:focus-within {
  box-shadow: 0 2px 12px rgba(79, 117, 199, 0.15);
}
.it {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #1a1a2e;
  resize: none;
  padding: 10px 0;
  outline: none;
  max-height: 100px;
  min-height: 40px;
  line-height: 1.5;
  font-family: inherit;
}
.it::placeholder {
  color: #9ca3af;
}
.is {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #4f75c7;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.is:hover {
  background: #3d62ad;
  transform: scale(1.05);
}
.is:active {
  transform: scale(0.92);
}
.is:disabled {
  background: #d1dcee;
  cursor: default;
  transform: none;
}
</style>
