#!/usr/bin/env node
import { copyFile, lstat, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const destinationRoot = path.join(websiteRoot, 'src/demo/product')
if (process.argv.length > 3) {
  throw new Error('Usage: node scripts/sync-demo-product.mjs [path/to/sillage/apps/web/src]')
}

const sourceRoot = await realpath(path.resolve(process.argv[2] ?? path.join(websiteRoot, '../sillage/apps/web/src')))

function contains(parent, child) {
  const relative = path.relative(parent, child)
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

if (contains(sourceRoot, destinationRoot) || contains(destinationRoot, sourceRoot)) {
  throw new Error('The source and snapshot directories must not contain one another.')
}

for (const required of ['app/AppShell.tsx', 'app/Sidebar.tsx', 'features/memos/HomePage.tsx', 'styles/app.css']) {
  if (!(await lstat(path.join(sourceRoot, required))).isFile()) {
    throw new Error(`Not a Sillage Web source directory: missing ${required}`)
  }
}

async function productionFiles(root, relative = '') {
  const files = []
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const file = path.join(relative, entry.name)
    if (entry.isSymbolicLink()) {
      throw new Error(`Refusing a symbolic link in a source snapshot: ${file}`)
    }
    if (entry.isDirectory()) {
      if (entry.name !== 'test' && entry.name !== '__tests__') {
        files.push(...await productionFiles(root, file))
      }
    } else if (entry.isFile() && /\.(?:ts|tsx|css)$/.test(entry.name) && !/\.test\./.test(entry.name) && entry.name !== 'main.tsx') {
      files.push(file)
    }
  }
  return files.sort()
}

async function sourceRevision() {
  let directory = sourceRoot
  while (directory !== path.dirname(directory)) {
    const gitPath = path.join(directory, '.git')
    let gitDirectory
    try {
      const info = await lstat(gitPath)
      gitDirectory = info.isDirectory()
        ? gitPath
        : path.resolve(directory, (await readFile(gitPath, 'utf8')).trim().replace(/^gitdir:\s*/, ''))
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      directory = path.dirname(directory)
      continue
    }
    const head = (await readFile(path.join(gitDirectory, 'HEAD'), 'utf8')).trim()
    if (/^[0-9a-f]{40}$/.test(head)) return head
    const reference = head.replace(/^ref:\s*/, '')
    let commonDirectory = gitDirectory
    try {
      commonDirectory = path.resolve(gitDirectory, (await readFile(path.join(gitDirectory, 'commondir'), 'utf8')).trim())
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    try {
      return (await readFile(path.join(commonDirectory, reference), 'utf8')).trim()
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      const refs = await readFile(path.join(commonDirectory, 'packed-refs'), 'utf8')
      const revision = refs.split('\n').find((line) => line.endsWith(` ${reference}`))?.split(' ')[0]
      if (revision && /^[0-9a-f]{40}$/.test(revision)) return revision
      throw new Error(`Cannot resolve the source revision: ${reference}`)
    }
  }
  throw new Error('The source must be inside the Sillage Git repository so its revision can be recorded.')
}

const revision = await sourceRevision()
const files = await productionFiles(sourceRoot)
await mkdir(destinationRoot, { recursive: true })
const existingFiles = await productionFiles(destinationRoot)
const expectedFiles = new Set(files)
for (const file of existingFiles) {
  if (!expectedFiles.has(file)) await rm(path.join(destinationRoot, file))
}
for (const file of files) {
  const destination = path.join(destinationRoot, file)
  await mkdir(path.dirname(destination), { recursive: true })
  await copyFile(path.join(sourceRoot, file), destination)
}

const sourcePublic = path.resolve(sourceRoot, '../public')
const websitePublic = path.join(websiteRoot, 'public')
const assets = ['sillage-icon.svg']
let changedAssets = 0
for (const asset of assets) {
  const sourceBytes = await readFile(path.join(sourcePublic, asset))
  const destination = path.join(websitePublic, asset)
  let identical = false
  try {
    identical = sourceBytes.equals(await readFile(destination))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  if (!identical) {
    await mkdir(path.dirname(destination), { recursive: true })
    await writeFile(destination, sourceBytes)
    changedAssets += 1
  }
}

await writeFile(path.join(destinationRoot, 'UPSTREAM.md'), `# Sillage Web UI snapshot

Source repository: https://github.com/getsillage/sillage

Source directory: \`sillage/apps/web/src\`

Source commit: \`${revision}\`

This directory contains ${files.length} production TypeScript, TSX, and CSS files copied byte for byte from the actual Sillage Web UI. Test files, test directories, and the upstream \`main.tsx\` entry are excluded. Do not edit the copied source files.

The website demo entry and its local data/API adapters live outside this snapshot. They supply the fictional demo account and records while the snapshot renders the actual product UI.

The static brand resource referenced by the source, \`/sillage-icon.svg\`, is shared through \`website/public\`. Markdown attachment and image URLs come from record content and are supplied by the outer demo adapter.

Refresh from the website repository with:

\`\`\`sh
node scripts/sync-demo-product.mjs
# Or provide the path to a local Sillage Web source checkout:
node scripts/sync-demo-product.mjs /path/to/sillage/apps/web/src
\`\`\`

The script updates this revision, copies the production source unchanged, removes obsolete copied source files, and updates the required brand resource only when its bytes differ.
`)

console.log(`Synced ${files.length} production files from Sillage ${revision}; updated ${changedAssets} brand assets.`)
