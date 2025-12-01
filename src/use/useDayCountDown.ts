import { onMounted, onUnmounted, ref } from 'vue'

function formatToHHMMSS(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (value: number) => value.toString().padStart(2, '0')

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function getRemainingMsOfDay() {
  const now = new Date()
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay.getTime() - now.getTime()
}

/**
 * Countdown hook for the remaining time in the current day.
 * Returns a ref string in HH:MM:SS format that updates every second.
 */
export function useDayCountDown() {
  const remainingText = ref(formatToHHMMSS(getRemainingMsOfDay()))

  const update = () => {
    remainingText.value = formatToHHMMSS(getRemainingMsOfDay())
  }

  let timer: number | undefined

  onMounted(() => {
    timer = window.setInterval(update, 1000)
  })

  onUnmounted(() => {
    if (timer !== undefined) {
      clearInterval(timer)
    }
  })

  return {
    remainingText,
  }
}
