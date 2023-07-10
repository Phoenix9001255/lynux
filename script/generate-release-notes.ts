const glob = require('glob')
const { basename } = require('path')
const fs = require('fs')

// eslint-disable-next-line no-sync
const Glob = glob.GlobSync

const args = process.argv.slice(2)
const artifactsDir = args[0]

const files = new Glob(artifactsDir + '/**/*', { nodir: true })
let countFiles = 0
const shaEntries: Array<{ filename: string; checksum: string }> = []

for (const file of files.found) {
  if (file.endsWith('.sha256')) {
    shaEntries.push(getShaContents(file))
  }

  countFiles++
}

console.log(`Found ${countFiles} files in artifacts directory`)
console.log(shaEntries)

const draftReleaseNotes = generateDraftReleaseNotes([], shaEntries)
const releaseNotesPath = __dirname + '/release_notes.txt'

// eslint-disable-next-line no-sync
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
  // eslint-disable-next-line no-sync
  const checksum = fs.readFileSync(filePath, 'utf8')

  return { filename, checksum }
}

/**
 * Takes the release notes entries and the SHA entries, then merges them into the full draft release notes ✨
 */
function generateDraftReleaseNotes(
  releaseNotesEntries: Array<string>,
  shaEntries: Array<{ filename: string; checksum: string }>
): string {
  const changelogText = releaseNotesEntries.join('\n')

  const fileList = shaEntries.map(e => `**${e.filename}**\n${e.checksum}\n`)
  const fileListText = fileList.join('\n')

  const draftReleaseNotes = `${changelogText}

## SHA-256 hashes:

${fileListText}`

  return draftReleaseNotes
}
