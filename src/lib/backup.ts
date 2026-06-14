
export function exportAllData(): string {
  const data: Record<string, any> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && !key.startsWith('app-lang')) {
      try { data[key] = JSON.parse(localStorage.getItem(key) || '') } catch { data[key] = localStorage.getItem(key) }
    }
  }
  return JSON.stringify(data, null, 2)
}

export function importAllData(jsonStr: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonStr)
    for (const key of Object.keys(data)) {
      localStorage.setItem(key, typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]))
    }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export function downloadJSON(data: string, filename: string) {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
