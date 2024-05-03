'use strict'

import path from 'path'
import { readFileSync, promises as fs } from 'fs'

import { __dirname } from './constants.js'

export class IconBuilder {
  constructor () {
    this.paths = {
      iconSrcPath: path.join(__dirname, 'svg'),
      destPath: path.join(__dirname, '..', 'fileicons'),
      iconDestPath: path.join(__dirname, '..', 'fileicons', 'images'),
      configDestPath: path.join(__dirname, '..', 'fileicons', 'studio-icons.json')
    }

    this.settings = Object.freeze(JSON.parse(
      readFileSync(path.join(__dirname, 'icon-settings.json'))
    ))
  }

  async clean () {
    await fs.rm(this.paths.destPath, { force: true, recursive: true })
  }

  async build () {
    await fs.mkdir(this.paths.destPath)
    await fs.mkdir(this.paths.iconDestPath)

    const iconDefinitions = {}

    for (const icon of this.settings.iconDefinitions) {
      await this._createIcon(icon, iconDefinitions)
    }

    await this._createConfig(iconDefinitions)
  }

  async _createIcon (icon, iconDefinitions) {
    const srcPath = path.join(this.paths.iconSrcPath, icon.iconPath)
    const lightPath = path.join(this.paths.iconDestPath, icon.iconPath)
    const darkPath = lightPath.replace('.svg', '_inverse.svg')
    const contrastPath = lightPath.replace('.svg', '_contrast.svg')

    const colors = this.settings.colors

    const content = await fs.readFile(srcPath, { encoding: 'utf-8' })
    const lightContent = content
      .replaceAll(colors.background, this.settings.light.colors.background)
      .replaceAll(colors.foreground, this.settings.light.colors.foreground)

    const darkContent = content.toString()
      .replaceAll(colors.white, this.settings.dark.colors.foreground)
      .replaceAll(colors.background, this.settings.dark.colors.background)
      .replaceAll(colors.foreground, this.settings.dark.colors.foreground)
      .replaceAll(colors.outline, this.settings.dark.colors.foreground)
      .replaceAll(colors.aspBlue, this.settings.dark.colors.aspBlue)
      .replaceAll(colors.cppPurple, this.settings.dark.colors.cppPurple)
      .replaceAll(colors.csGreen, this.settings.dark.colors.csGreen)
      .replaceAll(colors.fsPurple, this.settings.dark.colors.fsPurple)
      .replaceAll(colors.vbBlue, this.settings.dark.colors.vbBlue)
      .replaceAll(colors.tsOrange, this.settings.dark.colors.tsOrange)
      .replaceAll(colors.pyGreen, this.settings.dark.colors.pyGreen)
      .replaceAll(colors.vsPurple, this.settings.dark.colors.vsPurple)
      .replaceAll(colors.accessRed, this.settings.dark.colors.accessRed)
      .replaceAll(colors.wordBlue, this.settings.dark.colors.wordBlue)
      .replaceAll(colors.pptRed, this.settings.dark.colors.pptRed)
      .replaceAll(colors.projGreen, this.settings.dark.colors.projGreen)
      .replaceAll(colors.visioPurple, this.settings.dark.colors.visioPurple)
      .replaceAll(colors.excelGreen, this.settings.dark.colors.excelGreen)

    const contrastContent = content.toString()
      .replaceAll(colors.white, this.settings.contrast.colors.foreground)
      .replaceAll(colors.background, this.settings.contrast.colors.background)
      .replaceAll(colors.foreground, this.settings.contrast.colors.foreground)
      .replaceAll(colors.outline, this.settings.contrast.colors.outline)
      .replaceAll(colors.folderTan, this.settings.contrast.colors.background)
      .replaceAll(colors.androidGreen, this.settings.contrast.colors.background)
      .replaceAll(colors.aspBlue, this.settings.contrast.colors.background)
      .replaceAll(colors.cppPurple, this.settings.contrast.colors.background)
      .replaceAll(colors.csGreen, this.settings.contrast.colors.background)
      .replaceAll(colors.cssRed, this.settings.contrast.colors.background)
      .replaceAll(colors.fsPurple, this.settings.contrast.colors.background)
      .replaceAll(colors.jsOrange, this.settings.contrast.colors.background)
      .replaceAll(colors.vbBlue, this.settings.contrast.colors.background)
      .replaceAll(colors.tsOrange, this.settings.contrast.colors.background)
      .replaceAll(colors.gitOrange, this.settings.contrast.colors.background)
      .replaceAll(colors.pyGreen, this.settings.contrast.colors.background)
      .replaceAll(colors.vsPurple, this.settings.contrast.colors.background)
      .replaceAll(colors.sassPurple, this.settings.contrast.colors.background)
      .replaceAll(colors.accessRed, this.settings.contrast.colors.background)
      .replaceAll(colors.wordBlue, this.settings.contrast.colors.background)
      .replaceAll(colors.pptRed, this.settings.contrast.colors.background)
      .replaceAll(colors.projGreen, this.settings.contrast.colors.background)
      .replaceAll(colors.visioPurple, this.settings.contrast.colors.background)
      .replaceAll(colors.excelGreen, this.settings.contrast.colors.background)

    await fs.writeFile(lightPath, lightContent, { encoding: 'utf-8', flag: 'w' })
    await fs.writeFile(darkPath, darkContent, { encoding: 'utf-8', flag: 'w' })
    await fs.writeFile(contrastPath, contrastContent, { encoding: 'utf-8', flag: 'w' })

    const darkPathName = icon.iconPath.replace('.svg', '_inverse.svg')
    const contrastPathName = icon.iconPath.replace('.svg', '_contrast.svg')

    iconDefinitions[icon.iconPath] = {
      iconPath: `./images/${icon.iconPath}`
    }
    iconDefinitions[darkPathName] = {
      iconPath: `./images/${darkPathName}`
    }
    iconDefinitions[contrastPathName] = {
      iconPath: `./images/${contrastPathName}`
    }
  }

  async _createConfig (iconDefinitions) {
    const configs = {
      iconDefinitions,
      light: this._createThemeMapping('light'),
      highContrast: this._createThemeMapping('contrast')
    }
    Object.assign(configs, this._createThemeMapping('dark'))

    await fs.writeFile(this.paths.configDestPath, JSON.stringify(configs, null, 2), { encoding: 'utf-8' })
  }

  _createThemeMapping (type) {
    let postfix = ''
    const theme = {
      fileExtensions: {},
      fileNames: {},
      folderNames: {},
      folderNamesExpanded: {},
      languageIds: {}
    }

    if (type === 'light') {
      theme.folder = this.settings.light.folder
      theme.folderExpanded = this.settings.light.folderExpanded
      theme.rootFolder = this.settings.light.rootFolder
      theme.rootFolderExpanded = this.settings.light.rootFolderExpanded
      theme.file = this.settings.light.file
    } else if (type === 'contrast') {
      postfix = '_contrast.svg'
      theme.folder = this.settings.contrast.folder
      theme.folderExpanded = this.settings.contrast.folderExpanded
      theme.rootFolder = this.settings.contrast.rootFolder
      theme.rootFolderExpanded = this.settings.contrast.rootFolderExpanded
      theme.file = this.settings.contrast.file
    } else if (type === 'dark') {
      postfix = '_inverse.svg'
      theme.folder = this.settings.dark.folder
      theme.folderExpanded = this.settings.dark.folderExpanded
      theme.rootFolder = this.settings.dark.rootFolder
      theme.rootFolderExpanded = this.settings.dark.rootFolderExpanded
      theme.file = this.settings.dark.file
    }

    for (let i = 0; i < this.settings.iconDefinitions.length; i++) {
      const icon = this.settings.iconDefinitions[i]
      const iconPath = icon.iconPath

      if (icon.fileExtensions !== undefined) {
        for (let j = 0; j < icon.fileExtensions.length; j++) {
          const extension = icon.fileExtensions[j]

          theme.fileExtensions[extension] = postfix !== ''
            ? iconPath.replace('.svg', postfix)
            : iconPath
        }
      }

      if (icon.fileNames !== undefined) {
        for (let j = 0; j < icon.fileNames.length; j++) {
          const extension = icon.fileNames[j]

          theme.fileNames[extension] = postfix !== ''
            ? iconPath.replace('.svg', postfix)
            : iconPath
        }
      }

      if (icon.folderNames !== undefined) {
        for (let j = 0; j < icon.folderNames.length; j++) {
          const extension = icon.folderNames[j]

          theme.folderNames[extension] = postfix !== ''
            ? iconPath.replace('.svg', postfix)
            : iconPath
        }
      }

      if (icon.folderNamesExpanded !== undefined) {
        for (let j = 0; j < icon.folderNamesExpanded.length; j++) {
          const extension = icon.folderNamesExpanded[j]

          theme.folderNamesExpanded[extension] = postfix !== ''
            ? iconPath.replace('.svg', postfix)
            : iconPath
        }
      }
    }

    return theme
  }
}
