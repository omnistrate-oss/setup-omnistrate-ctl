// Manual CJS-compatible mock for @actions/core
// Required because @actions/core v3+ is ESM-only which Jest (CJS) cannot load directly.

export const ExitCode = {
  Success: 0,
  Failure: 1
}

export const addPath = jest.fn()
export const debug = jest.fn()
export const endGroup = jest.fn()
export const error = jest.fn()
export const exportVariable = jest.fn()
export const getBooleanInput = jest.fn()
export const getIDToken = jest.fn()
export const getInput = jest.fn()
export const getMultilineInput = jest.fn()
export const getState = jest.fn()
export const group = jest.fn()
export const info = jest.fn()
export const isDebug = jest.fn()
export const notice = jest.fn()
export const saveState = jest.fn()
export const setCommandEcho = jest.fn()
export const setFailed = jest.fn()
export const setOutput = jest.fn()
export const setSecret = jest.fn()
export const startGroup = jest.fn()
export const summary = {}
export const warning = jest.fn()

export const platform = {
  arch: jest.fn(),
  isLinux: jest.fn(),
  isMacOS: jest.fn(),
  isWindows: jest.fn(),
  platform: jest.fn()
}
