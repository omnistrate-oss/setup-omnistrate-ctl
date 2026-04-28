import * as path from 'path'
import * as os from 'os'

const mockExistsSync = jest.fn()
const mockRmSync = jest.fn()

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
  rmSync: (...args: unknown[]) => mockRmSync(...args)
}))

jest.mock('@actions/core')

import * as core from '@actions/core'
import { cleanup } from '../src/main'

const configDir = path.join(os.homedir(), '.omnistrate')

describe('cleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('removes ~/.omnistrate/ when it exists', async () => {
    mockExistsSync.mockReturnValue(true)
    mockRmSync.mockImplementation()
    const infoMock = jest.spyOn(core, 'info').mockImplementation()

    await cleanup()

    expect(mockExistsSync).toHaveBeenCalledWith(configDir)
    expect(mockRmSync).toHaveBeenCalledWith(configDir, {
      recursive: true
    })
    expect(infoMock).toHaveBeenCalledWith(
      'Cleaned up ~/.omnistrate/ credentials'
    )
  })

  it('skips cleanup when ~/.omnistrate/ does not exist', async () => {
    mockExistsSync.mockReturnValue(false)
    const debugMock = jest.spyOn(core, 'debug').mockImplementation()

    await cleanup()

    expect(mockExistsSync).toHaveBeenCalledWith(configDir)
    expect(mockRmSync).not.toHaveBeenCalled()
    expect(debugMock).toHaveBeenCalledWith(
      'No ~/.omnistrate/ directory to clean up'
    )
  })

  it('warns on cleanup failure', async () => {
    mockExistsSync.mockReturnValue(true)
    mockRmSync.mockImplementation(() => {
      throw new Error('permission denied')
    })
    const warningMock = jest.spyOn(core, 'warning').mockImplementation()

    await cleanup()

    expect(warningMock).toHaveBeenCalledWith(
      expect.stringContaining('permission denied')
    )
  })
})
