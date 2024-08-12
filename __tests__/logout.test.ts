import * as main from '../src/main'
import fetchMock from 'jest-fetch-mock'
import * as exec from '@actions/exec'

fetchMock.enableMocks()

// Mock the GitHub Actions core library
let execMock: jest.SpyInstance

describe('logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    execMock = jest
      .spyOn(exec, 'exec')
      .mockImplementation(() => Promise.resolve(0))
  })

  it('calls exec with the correct command', async () => {
    await main.logout()
    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl logout')
  })

  it('returns 1 when exec fails', async () => {
    execMock.mockImplementationOnce(() => Promise.resolve(1))

    const result = await main.logout()

    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl logout')
    expect(result).toBeUndefined()
    expect(console.warn).toHaveBeenCalledWith(
      'Failed to logout from Omnistrate CLI'
    )
  })

  it('handles exceptions correctly', async () => {
    const error = new Error('Test error')
    execMock.mockImplementationOnce(() => Promise.reject(error))

    await main.logout()

    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl logout')
    expect(console.warn).toHaveBeenCalledWith(
      'Failed to logout from Omnistrate CLI - ',
      error
    )
  })
})
