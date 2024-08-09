/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as main from '../src/main'

// Mock the action's entrypoint
const runMock = jest.spyOn(main, 'install').mockImplementation()

describe('install', () => {
  it('calls run when imported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/install')

    expect(runMock).toHaveBeenCalled()
  })
})
