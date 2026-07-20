export function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export async function compressImage(file, { maxWidth, maxHeight, maxSizeMB }) {
  if (!file.type.startsWith('image/')) return file

  const maxBytes = maxSizeMB * 1024 * 1024

  const img = await new Promise((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = URL.createObjectURL(file)
  })

  let w = img.width
  let h = img.height

  const factor = Math.min(maxWidth ? maxWidth / w : 1, maxHeight ? maxHeight / h : 1, 1)
  if (factor < 1) {
    w = Math.round(w * factor)
    h = Math.round(h * factor)
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  let quality = 0.85
  let blob

  for (let attempt = 0; attempt < 5; attempt++) {
    canvas.width = w
    canvas.height = h
    ctx.drawImage(img, 0, 0, w, h)

    quality = 0.85
    do {
      blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality))
      quality -= 0.1
    } while (blob.size > maxBytes && quality > 0.1)

    if (blob.size <= maxBytes) break

    w = Math.round(w * 0.7)
    h = Math.round(h * 0.7)
  }

  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], name, { type: 'image/jpeg' })
}
