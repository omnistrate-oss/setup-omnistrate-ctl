import * as core from '@actions/core'
import * as constants from '../src/constants'
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

let coreMock: jest.SpyInstance

describe('getVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    coreMock = jest.spyOn(core, 'getInput')
  })
  describe('Version', () => {
    it('should get the version from core input', () => {
      const mockVersion = '1.0.0'
      coreMock.mockImplementationOnce(() => mockVersion)
      expect(constants.getVersion()).toBe(mockVersion)
    })
  })
})

describe('Architecture', () => {
  it('should return arm64 for arm64 architecture', () => {
    expect(constants.getArchitecture('arm64')).toBe('arm64')
  })
  it('should return amd64 for x64 architecture', () => {
    expect(constants.getArchitecture('x64')).toBe('amd64')
  })
})

describe('Platform', () => {
  it('should return darwin for darwin platform', () => {
    expect(constants.getPlatform('darwin')).toBe('darwin')
  })
  it('should return linux for linux platform', () => {
    expect(constants.getPlatform('linux')).toBe('linux')
  })
  it('should return windows for win32 platform', () => {
    expect(constants.getPlatform('win32')).toBe('windows')
  })
})
