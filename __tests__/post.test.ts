/**
 * Unit tests for the action's post script, src/post.ts
 */

const mockLogout = jest.fn()
const mockGetInput = jest.fn()
const mockDebug = jest.fn()

jest.mock('@actions/core', () => ({
  getInput: mockGetInput,
  debug: mockDebug
}))

jest.mock('../src/main', () => ({
  logout: mockLogout
}))

describe('logout', () => {
  beforeEach(() => {
    jest.resetModules()
    mockLogout.mockClear()
    mockGetInput.mockReset()
    mockDebug.mockClear()
  })

  it('calls logout when logout input is "true"', async () => {
    mockGetInput.mockReturnValue('true')

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/post')

    expect(mockGetInput).toHaveBeenCalledWith('logout')
    expect(mockLogout).toHaveBeenCalled()
  })

  it('skips logout when logout input is not set', async () => {
    mockGetInput.mockReturnValue('')

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/post')

    expect(mockGetInput).toHaveBeenCalledWith('logout')
    expect(mockLogout).not.toHaveBeenCalled()
  })

  it('skips logout when logout input is "false"', async () => {
    mockGetInput.mockReturnValue('false')

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/post')

    expect(mockGetInput).toHaveBeenCalledWith('logout')
    expect(mockLogout).not.toHaveBeenCalled()
  })
})
