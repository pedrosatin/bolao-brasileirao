// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('analytics', () => {
  const originalDev = import.meta.env.DEV

  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    delete (window as any).dataLayer
  })

  afterEach(() => {
    ;(import.meta.env as any).DEV = originalDev
  })

  describe('when in development mode', () => {
    beforeEach(() => {
      ;(import.meta.env as any).DEV = true
    })

    it('logs to console and does not modify dataLayer when params are not provided', async () => {
      const { trackEvent } = await import('./analytics')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      trackEvent('test_event')

      expect(consoleSpy).toHaveBeenCalledWith('[GTM dev]', 'test_event', {})
      expect((window as any).dataLayer).toBeUndefined()
    })

    it('logs to console and does not modify dataLayer when params are provided', async () => {
      const { trackEvent } = await import('./analytics')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      trackEvent('test_event', { foo: 'bar' })

      expect(consoleSpy).toHaveBeenCalledWith('[GTM dev]', 'test_event', { foo: 'bar' })
      expect((window as any).dataLayer).toBeUndefined()
    })
  })

  describe('when in production mode', () => {
    beforeEach(() => {
      ;(import.meta.env as any).DEV = false
    })

    it('creates dataLayer and pushes event if dataLayer does not exist', async () => {
      const { trackEvent } = await import('./analytics')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      trackEvent('test_event', { foo: 'bar' })

      expect(consoleSpy).not.toHaveBeenCalled()
      expect(window.dataLayer).toEqual([{ event: 'test_event', foo: 'bar' }])
    })

    it('pushes event to existing dataLayer if dataLayer already exists', async () => {
      window.dataLayer = [{ event: 'previous_event' }]
      const { trackEvent } = await import('./analytics')

      trackEvent('test_event')

      expect(window.dataLayer).toEqual([
        { event: 'previous_event' },
        { event: 'test_event' }
      ])
    })
  })
})
