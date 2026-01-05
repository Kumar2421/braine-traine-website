/**
 * Usage Chart Component
 * Displays subscription usage data in various chart formats
 */

import { useEffect, useRef } from 'react'

export function UsageChart({ data, type = 'line', title, height = 200 }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (!canvasRef.current || !data || data.length === 0) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height

        // Clear canvas
        ctx.clearRect(0, 0, width, height)

        // Simple chart rendering (for production, use a library like Chart.js or Recharts)
        if (type === 'line') {
            drawLineChart(ctx, data, width, height)
        } else if (type === 'bar') {
            drawBarChart(ctx, data, width, height)
        }
    }, [data, type])

    const drawLineChart = (ctx, data, width, height) => {
        const padding = 40
        const chartWidth = width - padding * 2
        const chartHeight = height - padding * 2

        const maxValue = Math.max(...data.map(d => d.value))
        const minValue = Math.min(...data.map(d => d.value))
        const range = maxValue - minValue || 1

        // Draw axes
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(padding, padding)
        ctx.lineTo(padding, height - padding)
        ctx.lineTo(width - padding, height - padding)
        ctx.stroke()

        // Draw line
        ctx.strokeStyle = '#14b8a6'
        ctx.lineWidth = 2
        ctx.beginPath()

        data.forEach((point, index) => {
            const x = padding + (index / (data.length - 1 || 1)) * chartWidth
            const y = height - padding - ((point.value - minValue) / range) * chartHeight

            if (index === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        })

        ctx.stroke()

        // Draw points
        ctx.fillStyle = '#14b8a6'
        data.forEach((point, index) => {
            const x = padding + (index / (data.length - 1 || 1)) * chartWidth
            const y = height - padding - ((point.value - minValue) / range) * chartHeight

            ctx.beginPath()
            ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fill()
        })
    }

    const drawBarChart = (ctx, data, width, height) => {
        const padding = 40
        const chartWidth = width - padding * 2
        const chartHeight = height - padding * 2
        const barWidth = chartWidth / data.length - 10

        const maxValue = Math.max(...data.map(d => d.value))

        data.forEach((point, index) => {
            const barHeight = (point.value / maxValue) * chartHeight
            const x = padding + index * (chartWidth / data.length) + 5
            const y = height - padding - barHeight

            ctx.fillStyle = '#14b8a6'
            ctx.fillRect(x, y, barWidth, barHeight)
        })
    }

    const drawEmptyChart = (ctx, width, height) => {
        const padding = 40
        const chartWidth = width - padding * 2
        const chartHeight = height - padding * 2

        // Draw axes
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(padding, padding)
        ctx.lineTo(padding, height - padding)
        ctx.lineTo(width - padding, height - padding)
        ctx.stroke()

        // Draw grid lines
        ctx.strokeStyle = '#f3f4f6'
        ctx.lineWidth = 0.5
        for (let i = 1; i < 5; i++) {
            const y = padding + (i * chartHeight / 5)
            ctx.beginPath()
            ctx.moveTo(padding, y)
            ctx.lineTo(width - padding, y)
            ctx.stroke()
        }
    }

    return (
        <div className="usage-chart">
            {title && <h3 className="usage-chart__title">{title}</h3>}
            <div style={{ position: 'relative' }}>
                <canvas ref={canvasRef} width={800} height={height} className="usage-chart__canvas" />
                {(!data || data.length === 0) && (
                    <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        color: 'var(--dr-muted)',
                        pointerEvents: 'none'
                    }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>No data available</p>
                    </div>
                )}
            </div>
        </div>
    )
}

