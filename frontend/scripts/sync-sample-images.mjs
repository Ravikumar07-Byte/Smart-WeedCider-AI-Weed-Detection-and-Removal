import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const parent = path.dirname(root)
const publicRoot = path.join(root, 'public', 'sample-images')
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const splits = ['train', 'valid', 'test']
const maxPerSplit = 40

const candidateDirs = (split) => [
  path.join(root, split, 'images'),
  path.join(root, split),
  path.join(parent, split, 'images'),
  path.join(parent, split),
  path.join(parent, 'Combined_Dataset-2', split, 'images'),
  path.join(parent, 'Combined_Dataset-2', split),
  path.join(root, 'dataset', split, 'images'),
  path.join(root, 'dataset', split),
  path.join(root, 'Combined_Dataset', split, 'images'),
  path.join(root, 'Combined_Dataset', split),
]

const safeName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '_')

async function listImageFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => path.join(dir, entry.name))
      .sort((a, b) => a.localeCompare(b))
  } catch {
    return []
  }
}

async function firstExistingImages(split) {
  for (const dir of candidateDirs(split)) {
    const images = await listImageFiles(dir)
    if (images.length > 0) return images
  }
  return []
}

await mkdir(publicRoot, { recursive: true })

const manifest = []

for (const split of splits) {
  const images = (await firstExistingImages(split)).slice(0, maxPerSplit)
  const splitOut = path.join(publicRoot, split)
  await mkdir(splitOut, { recursive: true })

  for (const source of images) {
    const filename = safeName(path.basename(source))
    const target = path.join(splitOut, filename)
    await copyFile(source, target)
    manifest.push({
      filename: `${split}/images/${path.basename(source)}`,
      label: `${split} - ${path.basename(source)}`,
      split,
      url: `/sample-images/${split}/${filename}`,
    })
  }
}

await writeFile(path.join(publicRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

if (manifest.length > 0) {
  console.log(`Synced ${manifest.length} dataset sample images into public/sample-images`)
} else {
  console.log('No train/valid/test dataset images found; using built-in demo samples')
}
