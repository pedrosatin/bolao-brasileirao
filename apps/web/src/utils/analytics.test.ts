import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Vitest module hoisting means `vi.mock` hoists to top.
// If we want dynamic mocking of `./env`, we must use `vi.doMock` inside the test!
// AND we must `vi.resetModules()` before `await import('./analytics')` to ensure it uses the new mock!

describe('trackEvent', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('window', { dataLayer: undefined })
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.doUnmock('./env')
  })

  it('development mode', async () => {
    vi.doMock('./env', () => ({
      isDev: true
    }))

    const { trackEvent } = await import('./analytics')

    trackEvent('test_event', { prop: 'value' })
    expect(console.log).toHaveBeenCalledWith('[GTM dev]', 'test_event', { prop: 'value' })
    expect(window.dataLayer).toBeUndefined()
  })

  it('development mode without params', async () => {
    vi.doMock('./env', () => ({
      isDev: true
    }))

    const { trackEvent } = await import('./analytics')

    trackEvent('test_event_no_params')
    expect(console.log).toHaveBeenCalledWith('[GTM dev]', 'test_event_no_params', {})
    expect(window.dataLayer).toBeUndefined()
  })

  it('production mode', async () => {
    vi.doMock('./env', () => ({
      isDev: false
    }))

    const { trackEvent } = await import('./analytics')

    trackEvent('prod_event')

    expect(console.log).not.toHaveBeenCalled()
    expect(window.dataLayer).toBeDefined()
    expect(window.dataLayer).toHaveLength(1)
    expect(window.dataLayer![0]).toEqual({ event: 'prod_event' })

    trackEvent('prod_event_2', { prop: 'val' })
    expect(window.dataLayer).toHaveLength(2)
    expect(window.dataLayer![1]).toEqual({ event: 'prod_event_2', prop: 'val' })
  })
})
