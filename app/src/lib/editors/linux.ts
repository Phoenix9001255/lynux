import { pathExists } from '../helpers/linux'

import { IFoundEditor } from './found-editor'

/** Represents an external editor on Linux */
interface ILinuxExternalEditor {
  /** Name of the editor. It will be used both as identifier and user-facing. */
  readonly name: string

  /** List of possible paths where the editor's executable might be located. */
  readonly paths: string[]
}

/**
 * This list contains all the external editors supported on Linux. Add a new
 * entry here to add support for your favorite editor.
 **/
const editors: ILinuxExternalEditor[] = [
  {
    name: 'Atom',
    paths: [
      '/snap/bin/atom', 
      '/usr/bin/atom',
      '/usr/bin/env atom'
    ],
  },
  {
    name: 'Neovim',
    paths: [
      '/usr/bin/nvim',
      '/usr/bin/env nvim'
    ],
  },
  {
    name: 'Neovim-Qt',
    paths: [
      '/usr/bin/nvim-qt',
      '/usr/bin/env nvim-qt'
    ],
  },
  {
    name: 'Neovide',
    paths: [
      '/usr/bin/neovide',
      '/usr/bin/env neovide'
    ],
  },
  {
    name: 'gVim',
    paths: [
      '/usr/bin/gvim',
      '/usr/bin/env gvim'
    ],
  },
  {
    name: 'Visual Studio Code',
    paths: [
      '/usr/share/code/bin/code',
      '/snap/bin/code',
      '/usr/bin/code',
      '/mnt/c/Program Files/Microsoft VS Code/bin/code',
      '/var/lib/flatpak/app/com.visualstudio.code/current/active/export/bin/com.visualstudio.code',
      '.local/share/flatpak/app/com.visualstudio.code/current/active/export/bin/com.visualstudio.code',
      '/usr/bin/env code'
    ],
  },
  {
    name: 'Visual Studio Code (Insiders)',
    paths: [
      '/snap/bin/code-insiders',
      '/usr/bin/code-insiders',
      '/var/lib/flatpak/app/com.visualstudio.code.insiders/current/active/export/bin/com.visualstudio.code.insiders',
      '.local/share/flatpak/app/com.visualstudio.code.insiders/current/active/export/bin/com.visualstudio.code.insiders',
      '/usr/bin/env code-insiders'
    ],
  },
  {
    name: 'VSCodium',
    paths: [
      '/usr/bin/codium',
      '/var/lib/flatpak/app/com.vscodium.codium/current/active/export/bin/com.vscodium.codium',
      '/usr/share/vscodium-bin/bin/codium',
      '.local/share/flatpak/app/com.vscodium.codium/current/active/export/bin/com.vscodium.codium',
      '/snap/bin/codium',
      '/usr/bin/env codium'
    ],
  },
  {
    name: 'VSCodium (Insiders)',
    paths: [
      '/usr/bin/codium-insiders',
      '/usr/bin/env codium-insiders'
    ],
  },
  {
    name: 'Sublime Text',
    paths: [
      '/usr/bin/subl',
      '/usr/bin/env subl'
    ],
  },
  {
    name: 'Typora',
    paths: [
      '/usr/bin/typora',
      '/usr/bin/env typora'
    ],
  },
  {
    name: 'SlickEdit',
    paths: [
      '/opt/slickedit-pro2018/bin/vs',
      '/opt/slickedit-pro2017/bin/vs',
      '/opt/slickedit-pro2016/bin/vs',
      '/opt/slickedit-pro2015/bin/vs',
      // maybe? '/usr/bin/env vs' //
    ],
  },
  {
    // Code editor for elementary OS
    // https://github.com/elementary/code
    name: 'Code',
    paths: [
      '/usr/bin/io.elementary.code',
      '/usr/bin/env io.elementary.code'
    ],
  },
  {
    name: 'Lite XL',
    paths: [
      '/usr/bin/lite-xl',
      '/usr/bin/env lite-xl'
    ],
  },
  {
    name: 'JetBrains PhpStorm',
    paths: [
      '/snap/bin/phpstorm',
      '.local/share/JetBrains/Toolbox/scripts/PhpStorm',
      '/usr/bin/env phpstorm'
    ],
  },
  {
    name: 'JetBrains WebStorm',
    paths: [
      '/snap/bin/webstorm',
      '.local/share/JetBrains/Toolbox/scripts/webstorm',
      '/usr/bin/env webstorm'
    ],
  },
  {
    name: 'IntelliJ IDEA',
    paths: [
      '/snap/bin/idea', 
      '.local/share/JetBrains/Toolbox/scripts/idea',
      '/usr/bin/env idea'
    ],
  },
  {
    name: 'IntelliJ IDEA Ultimate Edition',
    paths: [
      '/snap/bin/intellij-idea-ultimate',
      '.local/share/JetBrains/Toolbox/scripts/intellij-idea-ultimate',
      '/usr/bin/env intelliji-idea-ultimate'
    ],
  },
  {
    name: 'IntelliJ Goland',
    paths: [
      '/snap/bin/goland',
      '.local/share/JetBrains/Toolbox/scripts/goland',
      '/usr/bin/env goland'
    ],
  },
  {
    name: 'JetBrains CLion',
    paths: [
      '/snap/bin/clion', 
      '.local/share/JetBrains/Toolbox/scripts/clion1',
      '/usr/bin/env clion'
    ],
  },
  {
    name: 'JetBrains Rider',
    paths: [
      '/snap/bin/rider', 
      '.local/share/JetBrains/Toolbox/scripts/rider',
      '/usr/bin/env rider'
    ],
  },
  {
    name: 'JetBrains RubyMine',
    paths: [
      '/snap/bin/rubymine',
      '.local/share/JetBrains/Toolbox/scripts/rubymine',
      '/usr/bin/env rubymine'
    ],
  },
  {
    name: 'JetBrains PyCharm',
    paths: [
      '/snap/bin/pycharm',
      '/snap/bin/pycharm-professional',
      '.local/share/JetBrains/Toolbox/scripts/pycharm',
      '/usr/bin/env pycharm'
    ],
  },
  {
    name: 'JetBrains JetBrains RustRover',
    paths: [
      '/snap/bin/rustrover',
      '.local/share/JetBrains/Toolbox/scripts/rustrover',
      '/usr/bin/env rustrover'
    ],
  },
  {
    name: 'Android Studio',
    paths: [
      '/snap/bin/studio',
      '.local/share/JetBrains/Toolbox/scripts/studio',
      '/usr/bin/env studio'
    ],
  },
  {
    name: 'Emacs',
    paths: [
      '/snap/bin/emacs', 
      '/usr/local/bin/emacs', 
      '/usr/bin/emacs',
      '/usr/bin/env emacs'
    ],
  },
  {
    name: 'Kate',
    paths: [
      '/usr/bin/kate',
      '/usr/bin/env kate'
    ],
  },
  {
    name: 'GEdit',
    paths: [
      '/usr/bin/gedit',
      '/usr/bin/env gedit'
    ],
  },
  {
    name: 'GNOME Text Editor',
    paths: [
      '/usr/bin/gnome-text-editor',
      '/usr/bin/env gnome-text-editor'
    ],
  },
  {
    name: 'GNOME Builder',
    paths: [
      '/usr/bin/gnome-builder',
      '/usr/bin/env gnome-builder'
    ],
  },
  {
    name: 'Notepadqq',
    paths: [
      '/usr/bin/notepadqq',
      '/usr/bin/env notepadqq'
    ],
  },
  {
    name: 'Mousepad',
    paths: [
      '/usr/bin/mousepad',
      '/usr/bin/env mousepad'
    ],
  },
  {
    name: 'Pulsar',
    paths: [
      '/usr/bin/pulsar',
      '/usr/bin/env pulsar'
    ],
  },
  {
    name: 'Pluma',
    paths: [
      '/usr/bin/pluma',
      '/usr/bin/env pluma'
    ],
  },
  {
    name: 'Zed',
    paths: [
      '/usr/bin/zedit',
      '/usr/bin/zeditor',
      '/usr/bin/zed-editor',
      '~/.local/bin/zed',
      '/usr/bin/zed',
      '/usr/bin/env zed'
    ],
  },
]

async function getAvailablePath(paths: string[]): Promise<string | null> {
  for (const path of paths) {
    if (await pathExists(path)) {
      return path
    }
  }

  return null
}

export async function getAvailableEditors(): Promise<
  ReadonlyArray<IFoundEditor<string>>
> {
  const results: Array<IFoundEditor<string>> = []

  for (const editor of editors) {
    const path = await getAvailablePath(editor.paths)
    if (path) {
      results.push({ editor: editor.name, path })
    }
  }

  return results
}
