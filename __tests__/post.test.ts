/**
 * Unit tests for the action's post script, src/post.ts
 */

const mockLogout = jest.fn().mockResolvedValue(undefined)
const mockCleanup = jest.fn().mockResolvedValue(undefined)
const mockRevokeToken = jest.fn().mockResolvedValue(undefined)
const mockGetInput = jest.fn()
const mockDebug = jest.fn()

jest.mock('@actions/core', () => ({
  getInput: mockGetInput,
  debug: mockDebug
}))

jest.mock('../src/main', () => ({
  logout: mockLogout,
  cleanup: mockCleanup,
  revokeToken: mockRevokeToken
}))

describe('post', () => {
  beforeEach(() => {
    jest.resetModules()
    mockLogout.mockClear()
    mockCleanup.mockClear()
    mockRevokeToken.mockClear()
    mockGetInput.mockReset()
    mockDebug.mockClear()
  })

  it('revokes token and logs out when logout is "true"', async () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'logout') return 'true'
      if (name === 'skip-revoke') return 'false'
      return ''
    })

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/post')
    await new Promise(resolve => setImmediate(resolve))

    expect(mockRevokeToken).toHaveBeenCalled()
    expect(mockLogout).toHaveBeenCalled()
    expect(mockCleanup).not.toHaveBeenCalled()
  })

  it('skips revoke but still logs out when skip-revoke is "true"', async () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'logout') return 'true'
      if (name === 'skip-revoke') return 'true'
      return ''
    })

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/post')
    await new Promise(resolve => setImmediate(resolve))

    expect(mockRevokeToken).not.toHaveBeenCalled()
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
    expect(mockRevokeToken).not.toHaveBeenCalled()
    expect(mockCleanup).toHaveBeenCalled()
  })

  it('skips logout but cleans up when input is "false"', async () => {
    mockGetInput.mockReturnValue('false')

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/post')
    await new Promise(resolve => setImmediate(resolve))

    expect(mockGetInput).toHaveBeenCalledWith('logout')
    expect(mockLogout).not.toHaveBeenCalled()
    expect(mockRevokeToken).not.toHaveBeenCalled()
    expect(mockCleanup).toHaveBeenCalled()
  })
})
