/* eslint-disable no-sync */

const glob = require('glob')
const { basename } = require('path')
const fs = require('fs')

type ChecksumEntry = { filename: string; checksum: string }

type ChecksumGroups = Record<'x64' | 'arm' | 'arm64', Array<ChecksumEntry>>

type ReleaseNotesGroups = Record<
  'new' | 'added' | 'fixed' | 'improved' | 'removed',
  Array<string>
>

// 3 architectures * 3 package formats * 2 files (package + checksum file)
const SUCCESSFUL_RELEASE_FILE_COUNT = 3 * 3 * 2

const Glob = glob.GlobSync

const args = process.argv.slice(2)
const artifactsDir = args[0]

if (!artifactsDir) {
  console.error(
    `🔴 First parameter with artifacts directory not found. Aborting...`
  )
  process.exit(1)
}

const releaseTagWithoutPrefix = args[1]
if (!releaseTagWithoutPrefix) {
  console.error(`🔴 Second parameter with release tag not found. Aborting...`)
  process.exit(1)
}

console.log(
  `Preparing release notes for release tag ${releaseTagWithoutPrefix}`
)

const files = new Glob(artifactsDir + '/**/*', { nodir: true })

let countFiles = 0
const shaEntries = new Array<ChecksumEntry>()

for (const file of files.found) {
  if (file.endsWith('.sha256')) {
    shaEntries.push(getShaContents(file))
  }

  countFiles++
}

if (SUCCESSFUL_RELEASE_FILE_COUNT !== countFiles) {
  console.error(
    `🔴 Artifacts folder has ${countFiles} assets, expecting ${SUCCESSFUL_RELEASE_FILE_COUNT}. Please check the GH Actions artifacts to see which are missing.`
  )
  process.exit(1)
}

const shaEntriesByArchitecture: ChecksumGroups = {
  x64: shaEntries.filter(
    e =>
      e.filename.includes('-linux-x86_64-') ||
      e.filename.includes('-linux-amd64-')
  ),
  arm: shaEntries.filter(
    e =>
      e.filename.includes('-linux-armv7l-') ||
      e.filename.includes('-linux-armhf-')
  ),
  arm64: shaEntries.filter(
    e =>
      e.filename.includes('-linux-aarch64-') ||
      e.filename.includes('-linux-arm64-')
  ),
}

// TODO: populate these from changelog if version matches convention
const releaseNotesByGroup: ReleaseNotesGroups = {
  new: [],
  added: [],
  fixed: [],
  improved: [],
  removed: [],
}

console.log(`Found ${countFiles} files in artifacts directory`)
console.log(shaEntriesByArchitecture)

const draftReleaseNotes = generateDraftReleaseNotes(
  releaseNotesByGroup,
  shaEntriesByArchitecture
)
const releaseNotesPath = __dirname + '/release_notes.txt'

fs.writeFileSync(releaseNotesPath, draftReleaseNotes, { encoding: 'utf8' })

console.log(
  `✅ All done! The release notes have been written to ${releaseNotesPath}`
)

/**
 * Returns the filename (excluding .sha256) and its contents (a SHA256 checksum).
 */
function getShaContents(filePath: string): {
  filename: string
  checksum: string
} {
  const filename = basename(filePath).slice(0, -7)
  const checksum = fs.readFileSync(filePath, 'utf8')

  return { filename, checksum }
}

function formatReleaseNote(note: string): string {
  return ` - ${note}`
}

function renderSection(
  name: string,
  items: Array<string>,
  omitIfEmpty: boolean = true
): string {
  if (items.length === 0 && omitIfEmpty) {
    return ''
  }

  const itemsText =
    items.length === 0 ? 'TODO' : items.map(formatReleaseNote).join('\n')

  return `
## ${name}

${itemsText}
  `
}

function formatEntry(e: ChecksumEntry): string {
  return `**${e.filename}**\n${e.checksum}\n`
}

function renderArchitectureIfNotEmpty(
  name: string,
  items: Array<ChecksumEntry>
): string {
  if (items.length === 0) {
    return ''
  }

  const itemsText = items.map(formatEntry).join('\n')

  return `
  
## ${name}

${itemsText}
  
  `
}

/**
 * Takes the release notes entries and the SHA entries, then merges them into the full draft release notes ✨
 */
function generateDraftReleaseNotes(
  releaseNotesGroups: ReleaseNotesGroups,
  shaEntries: ChecksumGroups
): string {
  const draftReleaseNotes = `
${renderSection('New', releaseNotesGroups.new)}
${renderSection('Added', releaseNotesGroups.added)}
${renderSection('Fixed', releaseNotesGroups.fixed, false)}
${renderSection('Improved', releaseNotesGroups.improved, false)}
${renderSection('Removed', releaseNotesGroups.removed)}

## SHA-256 checksums

${renderArchitectureIfNotEmpty('x64', shaEntries.x64)}
${renderArchitectureIfNotEmpty('ARM64', shaEntries.arm64)}
${renderArchitectureIfNotEmpty('ARM', shaEntries.arm)}`

  return draftReleaseNotes
}
