/**
 * Unit tests for the action's post script, src/post.ts
 */

import * as main from '../src/main'

// Mock the action's entrypoint
const runMock = jest.spyOn(main, 'logout').mockImplementation()

describe('logout', () => {
  it('calls run when imported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/post')

    expect(runMock).toHaveBeenCalled()
  })
})
