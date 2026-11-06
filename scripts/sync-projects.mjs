// Write data/github.json from GitHub: the pinned repos and every public repo of the account.
//   npm run sync:projects
// Local only, through the GitHub CLI (`gh auth login` once). The build never calls GitHub: it reads the committed file,
// and build-content fails until each public repo is listed in profile.projects.items or profile.projects.omit.

import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'data', 'github.json')
const USER = 'GDelpo'
const PAGE = 100

const QUERY = `query {
  user(login: "${USER}") {
    pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { name } } }
    repositories(first: ${PAGE}, privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false, orderBy: { field: NAME, direction: ASC }) {
      totalCount
      nodes { name }
    }
  }
}`

function fetchUser() {
  // INTENTIONAL: no shell. gh ships as gh.exe, and a shell would split the query at its spaces.
  const result = spawnSync('gh', ['api', 'graphql', '-f', `query=${QUERY}`], { encoding: 'utf8' })
  if (result.error || result.status !== 0) {
    throw new Error(`sync-projects: gh failed, is it installed and logged in? ${result.error?.message ?? result.stderr}`)
  }
  const user = JSON.parse(result.stdout)?.data?.user
  if (!user) throw new Error(`sync-projects: no user "${USER}" in the GitHub answer`)
  return user
}

function main() {
  const user = fetchUser()
  const repos = user.repositories.nodes.map((node) => node.name)
  // A partial list would make every missing repo look deleted, so more than one page fails instead of truncating.
  if (user.repositories.totalCount !== repos.length) {
    throw new Error(`sync-projects: ${user.repositories.totalCount} public repos but only ${repos.length} read; paginate`)
  }
  // The profile README repo is named after the account and is not a project.
  const projects = repos.filter((name) => name !== USER)
  const pinned = user.pinnedItems.nodes.map((node) => node.name).filter((name) => name !== USER)
  writeFileSync(OUT, `${JSON.stringify({ user: USER, pinned, repos: projects }, null, 2)}\n`)
  console.log(`sync-projects: data/github.json written (${pinned.length} pinned, ${projects.length} public repos). Run npm run content.`)
}

try {
  main()
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
