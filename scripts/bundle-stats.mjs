import { readFileSync, readdirSync, statSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const nextDir = join(__dirname, "..", ".next")

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function findJsFiles(dir) {
  const files = []
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...findJsFiles(fullPath))
      } else if (entry.name.endsWith(".js")) {
        files.push(fullPath)
      }
    }
  } catch {}
  return files
}

// Read build manifest
let routes = {}
let pagesBySize = []
let chunks = []

try {
  const manifest = JSON.parse(readFileSync(join(nextDir, "build-manifest.json"), "utf-8"))
  
  // Collect page bundles
  for (const [page, pageChunks] of Object.entries(manifest.pages || {})) {
    let totalSize = 0
    const chunkFiles = pageChunks.map(chunk => {
      const fullPath = join(nextDir, chunk)
      try {
        const size = statSync(fullPath).size
        totalSize += size
        return { file: chunk, size }
      } catch { return { file: chunk, size: 0 } }
    })
    pagesBySize.push({ page, totalSize, chunks: chunkFiles })
  }

  // Collect all unique JS chunks from static directory
  const staticDir = join(nextDir, "static", "chunks")
  const allJsFiles = findJsFiles(staticDir)
  chunks = allJsFiles.map(f => ({
    file: f.replace(nextDir + "/", ""),
    size: statSync(f).size
  })).sort((a, b) => b.size - a.size)

} catch (e) {
  console.error("Could not read build manifest. Build the project first (npm run build).")
  process.exit(1)
}

console.log("=".repeat(64))
console.log("  📦  BUNDLE SIZE ANALYSIS")
console.log("=".repeat(64))

// Page bundles
pagesBySize.sort((a, b) => b.totalSize - a.totalSize)
console.log(`\n📄  PAGES (${pagesBySize.length} total):`)
console.log("-".repeat(64))
console.log("  SIZE".padEnd(12), "PAGE")
console.log("-".repeat(64))
for (const { page, totalSize } of pagesBySize) {
  console.log(`  ${formatBytes(totalSize).padEnd(10)} ${page}`)
}

// Shared chunks
console.log(`\n🔧  LARGEST SHARED CHUNKS (top 20):`)
console.log("-".repeat(64))
console.log("  SIZE".padEnd(12), "FILE")
console.log("-".repeat(64))

for (const chunk of chunks.slice(0, 20)) {
  if (chunk.size > 1024) {
    console.log(`  ${formatBytes(chunk.size).padEnd(10)} ${chunk.file.split("/").pop()}`)
  }
}

// Summary
const totalBuildSize = chunks.reduce((sum, c) => sum + c.size, 0)
const top5Pages = pagesBySize.slice(0, 5)
const top5Size = top5Pages.reduce((sum, p) => sum + p.totalSize, 0)

console.log("\n" + "=".repeat(64))
console.log("  SUMMARY")
console.log("=".repeat(64))
console.log(`  Total JS bundles size:  ${formatBytes(totalBuildSize)}`)
console.log(`  Total pages:            ${pagesBySize.length}`)
console.log(`  Top 5 pages size:       ${formatBytes(top5Size)} (${((top5Size / totalBuildSize) * 100).toFixed(1)}% of total)`)

// Optimization suggestions
console.log(`\n💡  POTENTIAL OPTIMIZATIONS:`)
console.log("-".repeat(64))

for (const { page, totalSize, chunks } of pagesBySize) {
  if (totalSize > 50000) { // > 50KB
    console.log(`  • ${page}: ${formatBytes(totalSize)}`)
  }
}

const largeShared = chunks.filter(c => c.size > 100000) // > 100KB
if (largeShared.length > 0) {
  console.log(`  • Large shared chunks (>100KB): ${largeShared.length} chunk(s)`)
  for (const c of largeShared) {
    console.log(`    - ${formatBytes(c.size)}: ${c.file.split("/").pop()}`)
  }
}

console.log("")
