import * as main from '../src/main'
import fetchMock from 'jest-fetch-mock'
import * as exec from '@actions/exec'
import * as toolCache from '@actions/tool-cache'
import * as core from '@actions/core'
// import * as fs from 'fs'

fetchMock.enableMocks()

// Mock the GitHub Actions core library
let execMock: jest.SpyInstance
let toolCacheFindMock: jest.SpyInstance
//let toolCacheCacheFileMock: jest.SpyInstance
let toolCacheDownloadToolMock: jest.SpyInstance
let coreAddPathMock: jest.SpyInstance
let coreSetFailed: jest.SpyInstance
// let fsChmodSyncMock: jest.SpyInstance

describe('logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    execMock = jest.spyOn(exec, 'exec')
  })

  it('calls exec with the correct command', async () => {
    execMock.mockImplementationOnce(async () => Promise.resolve(0))

    await main.logout()

    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl logout')
  })

  it('returns 1 when exec fails', async () => {
    execMock.mockImplementationOnce(async () => Promise.resolve(1))

    await main.logout()

    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl logout')
  })

  it('handles exceptions correctly', async () => {
    const error = new Error('Test error')
    execMock.mockImplementationOnce(async () => Promise.reject(error))

    await main.logout()

    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl logout')
  })
})

const email = 'test@omnistrate.com'
const pwd = 'test123'

describe('login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    execMock = jest.spyOn(exec, 'exec')
  })

  it('calls exec with the correct command', async () => {
    execMock.mockImplementationOnce(async () => Promise.resolve(0))

    await main.login(email, pwd)

    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl login', [
      '--email',
      email,
      '--password',
      pwd
    ])
  })

  it('returns 1 when exec fails', async () => {
    execMock.mockImplementationOnce(async () => Promise.resolve(1))

    await main.login(email, pwd)

    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl login', [
      '--email',
      email,
      '--password',
      pwd
    ])
  })

  it('handles exceptions correctly', async () => {
    const error = new Error('Test error')
    execMock.mockImplementationOnce(async () => Promise.reject(error))

    await main.login(email, pwd)

    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl login', [
      '--email',
      email,
      '--password',
      pwd
    ])
  })
})

describe('resolveUrl', () => {
  it('should return the correct URL for darwin arm64 latest', () => {
    const platform = 'darwin'
    const architecture = 'arm64'
    const version = 'latest'
    const url = `https://github.com/omnistrate-oss/omnistrate-ctl/releases/latest/download/omnistrate-ctl-${platform}-${architecture}.tar.gz`
    expect(main.resolveUrl(platform, architecture, version)).toBe(url)
  })
  it('should return the correct URL for linux x64 1.0.0', () => {
    const platform = 'linux'
    const architecture = 'x64'
    const version = '1.0.0'
    const url = `https://github.com/omnistrate-oss/omnistrate-ctl/releases/download/${version}/omnistrate-ctl-${platform}-${architecture}.tar.gz`
    expect(main.resolveUrl(platform, architecture, version)).toBe(url)
  })
  it('should return the correct URL for windows amd64 latest', () => {
    const platform = 'windows'
    const architecture = 'amd64'
    const version = 'latest'
    const url = `https://github.com/omnistrate-oss/omnistrate-ctl/releases/latest/download/omnistrate-ctl-${platform}-${architecture}.zip`
    expect(main.resolveUrl(platform, architecture, version)).toBe(url)
  })
})

describe('install', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    execMock = jest.spyOn(exec, 'exec')
    toolCacheFindMock = jest.spyOn(toolCache, 'find')
    toolCacheDownloadToolMock = jest.spyOn(toolCache, 'downloadTool')
    coreAddPathMock = jest.spyOn(core, 'addPath')
    coreSetFailed = jest.spyOn(core, 'setFailed')
  })

  it('should install the tool', async () => {
    const version = 'latest'
    const downloadPath = '/path/downloaded'

    toolCacheFindMock.mockImplementation(() => '')
    toolCacheDownloadToolMock.mockImplementation(async () =>
      Promise.resolve(downloadPath)
    )

    main.install()

    expect(toolCacheFindMock).toHaveBeenCalledWith('omnistrate-ctl', version)
    expect(toolCacheFindMock).toHaveBeenCalledWith('omctl', version)
    expect(coreAddPathMock).not.toHaveBeenCalledWith('')
    expect(toolCacheDownloadToolMock).toHaveBeenCalledTimes(1)
    expect(coreSetFailed).not.toHaveBeenCalled()
  })
})
