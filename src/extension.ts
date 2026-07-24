// types
import type { GitAPI, GitRepository } from "./types"

// modules
import * as vscode from "vscode"
import Bun from "bun"

let statusBarItem: vscode.StatusBarItem
let gitExtension: vscode.Extension<GitAPI> | undefined

export function activate(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  )
  statusBarItem.command = "mustache.showStashes"
  context.subscriptions.push(statusBarItem)

  gitExtension = vscode.extensions.getExtension<GitAPI>("vscode.git")

  if (gitExtension) {
    if (!gitExtension.isActive) {
      gitExtension.activate().then(() => {
        setupGitListeners()
        checkStashes()
      })
    } else {
      setupGitListeners()
      checkStashes()
    }
  }

  const checkStashesCommand = vscode.commands.registerCommand(
    "mustache.showStashes",
    () => {
      checkStashes()
    },
  )
  context.subscriptions.push(checkStashesCommand)

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      checkStashes()
    }),
  )
}

function setupGitListeners() {
  if (!gitExtension?.exports) return

  const api = gitExtension.exports

  api.onDidOpenRepository((repo) => {
    updateStatusBar(repo)
    repo.onDidChangeState(() => updateStatusBar(repo))
  })

  for (const repo of api.repositories) {
    updateStatusBar(repo)
    repo.onDidChangeState(() => updateStatusBar(repo))
  }
}

async function checkStashes() {
  if (!gitExtension?.exports) {
    statusBarItem.hide()
    return
  }

  const api = gitExtension.exports
  if (api.repositories.length === 0) {
    statusBarItem.hide()
    return
  }

  let totalStashes = 0

  for (const repo of api.repositories) {
    try {
      const stashCount = await getStashCount(repo.rootUri.fsPath)
      totalStashes += stashCount
    } catch {
      // Ignore errors when checking stashes
    }
  }

  if (totalStashes > 0) {
    statusBarItem.text = `$(git-stash) ${totalStashes}`
    statusBarItem.tooltip = `You have ${totalStashes} stashed change${totalStashes === 1 ? "" : "s"}`
    statusBarItem.show()
  } else {
    statusBarItem.hide()
  }
}

async function getStashCount(workspacePath: string): Promise<number> {
  try {
    const output = await Bun.$`git stash list`.cwd(workspacePath).text()
    const lines = output
      .trim()
      .split("\n")
      .filter((line) => line.trim())
    return lines.length
  } catch {
    return 0
  }
}

async function updateStatusBar(repo: GitRepository) {
  try {
    const stashCount = await getStashCount(repo.rootUri.fsPath)

    if (stashCount > 0) {
      statusBarItem.text = `$(git-stash) ${stashCount}`
      statusBarItem.tooltip = `You have ${stashCount} stashed change${stashCount === 1 ? "" : "s"}`
      statusBarItem.show()
    } else {
      statusBarItem.hide()
    }
  } catch {
    statusBarItem.hide()
  }
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose()
  }
}
