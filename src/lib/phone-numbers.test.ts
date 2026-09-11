import { describe, expect, it } from 'vitest'
import { getTelephoneHref } from './phone-numbers'

describe('getTelephoneHref', () => {
  it('keeps an international prefix and removes display separators', () => {
    expect(getTelephoneHref('+48 (22) 123-45-67')).toBe(
      'tel:+48221234567',
    )
  })
})
