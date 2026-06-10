<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { DimensionScores, SkillDimension } from '../types'
import { DIMENSION_LABELS } from '../types'

const props = defineProps<{
  scores: DimensionScores
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

const dimensions: SkillDimension[] = [
  'javaBasics', 'jvm', 'concurrency', 'spring', 'database', 'architecture',
]

function drawRadar() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const size = 300
  canvas.width = size * dpr
  canvas.height = size * dpr
  canvas.style.width = size + 'px'
  canvas.style.height = size + 'px'
  ctx.scale(dpr, dpr)

  const cx = size / 2
  const cy = size / 2
  const radius = 110
  const levels = 5
  const angleStep = (Math.PI * 2) / dimensions.length

  ctx.clearRect(0, 0, size, size)

  // 绘制背景网格
  for (let level = 1; level <= levels; level++) {
    const r = (radius / levels) * level
    ctx.beginPath()
    for (let i = 0; i <= dimensions.length; i++) {
      const angle = i * angleStep - Math.PI / 2
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // 绘制轴线
  for (let i = 0; i < dimensions.length; i++) {
    const angle = i * angleStep - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle))
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // 绘制数据区域
  ctx.beginPath()
  for (let i = 0; i <= dimensions.length; i++) {
    const idx = i % dimensions.length
    const dim = dimensions[idx]
    const value = props.scores[dim] / 100
    const angle = idx * angleStep - Math.PI / 2
    const x = cx + radius * value * Math.cos(angle)
    const y = cy + radius * value * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(99, 102, 241, 0.2)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 绘制数据点
  for (let i = 0; i < dimensions.length; i++) {
    const dim = dimensions[i]
    const value = props.scores[dim] / 100
    const angle = i * angleStep - Math.PI / 2
    const x = cx + radius * value * Math.cos(angle)
    const y = cy + radius * value * Math.sin(angle)
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#6366f1'
    ctx.fill()
  }

  // 绘制标签
  ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillStyle = 'var(--text-secondary, #a1a1aa)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < dimensions.length; i++) {
    const dim = dimensions[i]
    const angle = i * angleStep - Math.PI / 2
    const labelR = radius + 24
    const x = cx + labelR * Math.cos(angle)
    const y = cy + labelR * Math.sin(angle)

    const label = DIMENSION_LABELS[dim]
    const score = props.scores[dim]
    ctx.fillStyle = '#e4e4e7'
    ctx.fillText(label, x, y - 8)
    ctx.fillStyle = '#a1a1aa'
    ctx.fillText(`${score}分`, x, y + 10)
  }
}

onMounted(drawRadar)
watch(() => props.scores, drawRadar, { deep: true })
</script>

<template>
  <div class="radar-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.radar-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
