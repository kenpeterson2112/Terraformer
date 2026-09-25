import { useState, useCallback, useRef, useEffect } from 'react'

const SENSITIVITY = 0.008
const MAX_TILT    = 1.3

// Drag-to-rotate state for the planet. Returns the current rotation plus
// handlers to spread onto the drag capture element.
export function usePlanetDrag() {
  const [rot, setRot]             = useState({ x: 0, y: 0 })
  const [isDragging, setDragging] = useState(false)
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 })

  const applyDelta = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - dragRef.current.lastX
    const dy = clientY - dragRef.current.lastY
    dragRef.current.lastX = clientX
    dragRef.current.lastY = clientY
    setRot(prev => ({
      x: Math.max(-MAX_TILT, Math.min(MAX_TILT, prev.x - dy * SENSITIVITY)),
      y: prev.y + dx * SENSITIVITY,
    }))
  }, [])

  // Global mouse handlers (fire even when cursor leaves phone frame mid-drag)
  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return
      applyDelta(e.clientX, e.clientY)
    }
    const onUp = () => {
      dragRef.current.active = false
      setDragging(false)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, applyDelta])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY }
    setDragging(true)
    e.preventDefault()
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    dragRef.current = { active: true, lastX: t.clientX, lastY: t.clientY }
    setDragging(true)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.active) return
    const t = e.touches[0]
    applyDelta(t.clientX, t.clientY)
    e.preventDefault()
  }, [applyDelta])

  const onTouchEnd = useCallback(() => {
    dragRef.current.active = false
    setDragging(false)
  }, [])

  return { rot, isDragging, handlers: { onMouseDown, onTouchStart, onTouchMove, onTouchEnd } }
}
