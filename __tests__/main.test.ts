jest.mock('@actions/core')
jest.mock('@actions/cache')

import * as main from '../src/main'
import * as constants from '../src/constants'
import fetchMock from 'jest-fetch-mock'
import * as exec from '@actions/exec'
import * as cache from '@actions/cache'
import * as toolCache from '@actions/tool-cache'
import * as core from '@actions/core'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

fetchMock.enableMocks()

// Mock the GitHub Actions core library
let execMock: jest.SpyInstance
let toolCacheDownloadToolMock: jest.SpyInstance
let coreAddPathMock: jest.SpyInstance
let coreSetFailed: jest.SpyInstance

describe('revokeToken', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    execMock = jest.spyOn(exec, 'exec')
  })

  it('calls exec with revoke-token command', async () => {
    execMock.mockImplementationOnce(async () => Promise.resolve(0))

    await main.revokeToken()

    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl', ['revoke-token'], {
      env: expect.objectContaining({ NO_COLOR: '1' }),
      silent: true
    })
  })

  it('warns when exec returns non-zero', async () => {
    execMock.mockImplementationOnce(async () => Promise.resolve(1))
    const warningMock = jest.spyOn(core, 'warning').mockImplementation()

    await main.revokeToken()

    expect(warningMock).toHaveBeenCalledWith(
      'Failed to revoke token from Omnistrate CLI'
    )
  })

  it('handles exceptions correctly', async () => {
    const error = new Error('Test error')
    execMock.mockImplementationOnce(async () => Promise.reject(error))
    const warningMock = jest.spyOn(core, 'warning').mockImplementation()

    await main.revokeToken()

    expect(warningMock).toHaveBeenCalledWith(
      expect.stringContaining('Test error')
    )
  })
})

describe('logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    execMock = jest.spyOn(exec, 'exec')
  })

  it('calls exec with the correct command', async () => {
    execMock.mockImplementationOnce(async () => Promise.resolve(0))

    await main.logout()

    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl', ['logout'], {
      env: expect.objectContaining({ NO_COLOR: '1' }),
      silent: true
    })
  })

  it('returns 1 when exec fails', async () => {
    execMock.mockImplementationOnce(async () => Promise.resolve(1))

    await main.logout()

    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl', ['logout'], {
      env: expect.objectContaining({ NO_COLOR: '1' }),
      silent: true
    })
  })

  it('handles exceptions correctly', async () => {
    const error = new Error('Test error')
    execMock.mockImplementationOnce(async () => Promise.reject(error))

    await main.logout()

    expect(execMock).toHaveBeenCalledWith('omnistrate-ctl', ['logout'], {
      env: expect.objectContaining({ NO_COLOR: '1' }),
      silent: true
    })
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

    expect(execMock).toHaveBeenCalledWith(
      'omnistrate-ctl login',
      ['--email', email, '--password-stdin'],
      expect.objectContaining({ input: Buffer.from(pwd), silent: true })
    )
  })

  it('returns 1 when exec fails', async () => {
    execMock.mockImplementationOnce(async () => Promise.resolve(1))

    await main.login(email, pwd)

    expect(execMock).toHaveBeenCalledWith(
      'omnistrate-ctl login',
      ['--email', email, '--password-stdin'],
      expect.objectContaining({ input: Buffer.from(pwd), silent: true })
    )
  })

  it('handles exceptions correctly', async () => {
    const error = new Error('Test error')
    execMock.mockImplementationOnce(async () => Promise.reject(error))

    await main.login(email, pwd)

    expect(execMock).toHaveBeenCalledWith(
      'omnistrate-ctl login',
      ['--email', email, '--password-stdin'],
      expect.objectContaining({ input: Buffer.from(pwd), silent: true })
    )
  })
})

const apiKey = 'om_test_key_123'

describe('loginWithAPIKey', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    execMock = jest.spyOn(exec, 'exec')
  })

  it('calls exec with --api-key-stdin and passes key via input', async () => {
    execMock.mockImplementationOnce(async () => Promise.resolve(0))

    await main.loginWithAPIKey(apiKey)

    expect(execMock).toHaveBeenCalledWith(
      'omnistrate-ctl login',
      ['--api-key-stdin'],
      expect.objectContaining({ input: Buffer.from(apiKey), silent: true })
    )
  })

  it('sets failed when exec returns non-zero', async () => {
    execMock.mockImplementationOnce(async () => Promise.resolve(1))
    coreSetFailed = jest.spyOn(core, 'setFailed').mockImplementation()

    await main.loginWithAPIKey(apiKey)

    expect(coreSetFailed).toHaveBeenCalledWith(
      'Failed to login to Omnistrate CLI with API key'
    )
  })

  it('handles exceptions correctly', async () => {
    const error = new Error('Test error')
    execMock.mockImplementationOnce(async () => Promise.reject(error))
    coreSetFailed = jest.spyOn(core, 'setFailed').mockImplementation()

    await main.loginWithAPIKey(apiKey)

    expect(coreSetFailed).toHaveBeenCalledWith('Test error')
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
    const url = `https://github.com/omnistrate-oss/omnistrate-ctl/releases/latest/download/omnistrate-ctl-${platform}-${architecture}.exe.zip`
    expect(main.resolveUrl(platform, architecture, version)).toBe(url)
  })
})

describe('cache configuration', () => {
  it('enables cache by default', () => {
    expect(main.isCacheEnabled('')).toBe(true)
  })

  it('allows cache to be disabled', () => {
    expect(main.isCacheEnabled('false')).toBe(false)
    expect(main.isCacheEnabled('FALSE')).toBe(false)
  })

  it('creates platform, architecture, and version-specific keys', () => {
    const key = main.getCacheKey('linux', 'amd64', 'v1.2.3')

    expect(key).toMatch(/^setup-omnistrate-ctl-v1-linux-amd64-v1\.2\.3-/)
    expect(key).not.toBe(main.getCacheKey('linux', 'amd64', 'v1.2.4'))
  })
})

describe('resolveLatestRelease', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  it('resolves latest to an immutable release version and URL', async () => {
    const location =
      'https://github.com/omnistrate-oss/omnistrate-ctl/releases/download/v1.2.3/omnistrate-ctl-linux-amd64.tar.gz'
    fetchMock.mockResponseOnce('', {
      status: 302,
      headers: { location }
    })

    await expect(
      main.resolveLatestRelease(
        'https://github.com/omnistrate-oss/omnistrate-ctl/releases/latest/download/omnistrate-ctl-linux-amd64.tar.gz'
      )
    ).resolves.toEqual({ version: 'v1.2.3', url: location })
  })

  it('returns undefined when the release redirect is unavailable', async () => {
    fetchMock.mockResponseOnce('', { status: 200 })

    await expect(
      main.resolveLatestRelease('https://example.com/latest')
    ).resolves.toBeUndefined()
  })
})

describe('install', () => {
  let tempDirectory: string
  let extractedDirectory: string
  let originalRunnerTemp: string | undefined

  beforeEach(() => {
    jest.clearAllMocks()
    fetchMock.resetMocks()
    originalRunnerTemp = process.env.RUNNER_TEMP
    tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'setup-ctl-test-'))
    extractedDirectory = path.join(tempDirectory, 'extracted')
    fs.mkdirSync(extractedDirectory, { recursive: true })
    process.env.RUNNER_TEMP = tempDirectory

    execMock = jest.spyOn(exec, 'exec')
    toolCacheDownloadToolMock = jest.spyOn(toolCache, 'downloadTool')
    jest.spyOn(toolCache, 'extractTar').mockResolvedValue(extractedDirectory)
    coreAddPathMock = jest.spyOn(core, 'addPath')
    coreSetFailed = jest.spyOn(core, 'setFailed')
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      if (name === 'version') return 'v1.2.3'
      if (name === 'cache') return 'true'
      return ''
    })
    jest.spyOn(cache, 'restoreCache').mockResolvedValue(undefined)
    jest.spyOn(cache, 'saveCache').mockResolvedValue(1)
    toolCacheDownloadToolMock.mockResolvedValue(
      path.join(tempDirectory, 'downloaded.tar.gz')
    )
    fs.writeFileSync(
      path.join(
        extractedDirectory,
        `omnistrate-ctl-${constants.PLATFORM}-${constants.ARCHITECTURE}`
      ),
      'binary'
    )
  })

  afterEach(() => {
    if (originalRunnerTemp === undefined) {
      delete process.env.RUNNER_TEMP
    } else {
      process.env.RUNNER_TEMP = originalRunnerTemp
    }
    fs.rmSync(tempDirectory, { recursive: true, force: true })
  })

  it('downloads and saves the tool when the cache misses', async () => {
    await main.install()

    const installDirectory = main.getInstallDirectory('v1.2.3')
    const cacheKey = main.getCacheKey(
      constants.PLATFORM,
      constants.ARCHITECTURE,
      'v1.2.3'
    )

    expect(cache.restoreCache).toHaveBeenCalledWith(
      [installDirectory],
      cacheKey
    )
    expect(toolCacheDownloadToolMock).toHaveBeenCalledTimes(1)
    expect(cache.saveCache).toHaveBeenCalledWith([installDirectory], cacheKey)
    expect(
      fs.readFileSync(path.join(installDirectory, 'omnistrate-ctl'), 'utf8')
    ).toBe('binary')
    expect(fs.readFileSync(path.join(installDirectory, 'omctl'), 'utf8')).toBe(
      'binary'
    )
    expect(coreAddPathMock).toHaveBeenCalledWith(installDirectory)
    expect(coreSetFailed).not.toHaveBeenCalled()
  })

  it('uses the restored binaries without downloading', async () => {
    jest
      .spyOn(cache, 'restoreCache')
      .mockImplementation(async (paths: string[], key: string) => {
        fs.mkdirSync(paths[0], { recursive: true })
        fs.writeFileSync(path.join(paths[0], 'omnistrate-ctl'), 'cached')
        fs.writeFileSync(path.join(paths[0], 'omctl'), 'cached')
        return key
      })

    await main.install()

    expect(toolCacheDownloadToolMock).not.toHaveBeenCalled()
    expect(cache.saveCache).not.toHaveBeenCalled()
    expect(coreAddPathMock).toHaveBeenCalledWith(
      main.getInstallDirectory('v1.2.3')
    )
  })

  it('downloads without restoring or saving when cache is disabled', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      if (name === 'version') return 'v1.2.3'
      if (name === 'cache') return 'false'
      return ''
    })

    await main.install()

    expect(cache.restoreCache).not.toHaveBeenCalled()
    expect(cache.saveCache).not.toHaveBeenCalled()
    expect(toolCacheDownloadToolMock).toHaveBeenCalledTimes(1)
  })
})
