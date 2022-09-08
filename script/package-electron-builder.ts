/* eslint-disable no-sync */

import * as path from 'path'
import * as cp from 'child_process'
import { promisify } from 'util'

import glob = require('glob')
const globPromise = promisify(glob)

import { getDistPath, getDistRoot } from './dist-info'

let arch_appimage = ''
switch (process.arch) {
  case 'x64':
    console.log('This is an x86_64 system')
    arch_appimage = '--x64'
    break
  case 'arm':
    console.log('This is an ARM32 system')
    arch_appimage = '--armv7l'
    break
  case 'arm64':
    console.log('This is an ARM64 system')
    arch_appimage = '--arm64'
    break
  default:
    console.log('This architecture is unknown or not supported.')
}

export async function packageElectronBuilder(): Promise<Array<string>> {
  const distPath = getDistPath()
  const distRoot = getDistRoot()

  const electronBuilder = path.resolve(
    __dirname,
    '..',
    'node_modules',
    '.bin',
    'electron-builder'
  )

  const configPath = path.resolve(__dirname, 'electron-builder-linux.yml')

  const args = [
    'build',
    '--prepackaged',
    distPath,
    `${arch_appimage}`,
    '--config',
    configPath,
  ]

  const { error } = cp.spawnSync(electronBuilder, args, { stdio: 'inherit' })

  if (error != null) {
    return Promise.reject(error)
  }

  const appImageInstaller = `${distRoot}/GitHubDesktop-linux-*.AppImage`

  const files = await globPromise(appImageInstaller)
  if (files.length !== 1) {
    return Promise.reject(
      `Expected one AppImage installer but instead found '${files.join(
        ', '
      )}' - exiting...`
    )
  }

  const appImageInstallerPath = files[0]

  return Promise.resolve([appImageInstallerPath])
}
