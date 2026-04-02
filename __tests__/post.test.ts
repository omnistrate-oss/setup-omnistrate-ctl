/**
 * Unit tests for the action's post script, src/post.ts
 */

const mockLogout = jest.fn().mockResolvedValue(undefined)
const mockCleanup = jest.fn().mockResolvedValue(undefined)
const mockGetInput = jest.fn()
const mockDebug = jest.fn()

jest.mock('@actions/core', () => ({
  getInput: mockGetInput,
  debug: mockDebug
}))

jest.mock('../src/main', () => ({
  logout: mockLogout,
  cleanup: mockCleanup
}))

describe('post', () => {
  beforeEach(() => {
    jest.resetModules()
    mockLogout.mockClear()
    mockCleanup.mockClear()
    mockGetInput.mockReset()
    mockDebug.mockClear()
  })

  it('calls logout without cleanup when logout input is "true"', async () => {
    mockGetInput.mockReturnValue('true')

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/post')
    await new Promise(resolve => setImmediate(resolve))

    expect(mockGetInput).toHaveBeenCalledWith('logout')
    expect(mockLogout).toHaveBeenCalled()
    expect(mockCleanup).not.toHaveBeenCalled()
  })

  it('skips logout but cleans up when input is empty', async () => {
    mockGetInput.mockReturnValue('')

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/post')
    await new Promise(resolve => setImmediate(resolve))

    expect(mockGetInput).toHaveBeenCalledWith('logout')
    expect(mockLogout).not.toHaveBeenCalled()
    expect(mockCleanup).toHaveBeenCalled()
  })

  it('skips logout but cleans up when input is "false"', async () => {
    mockGetInput.mockReturnValue('false')

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/post')
    await new Promise(resolve => setImmediate(resolve))

    expect(mockGetInput).toHaveBeenCalledWith('logout')
    expect(mockLogout).not.toHaveBeenCalled()
    expect(mockCleanup).toHaveBeenCalled()
  })
})
