// types
import type { GitAPI, GitRepository } from "./types"

// modules
import * as vscode from "vscode"
import { exec } from "child_process"

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
    updateDot(0)
    return
  }

  const api = gitExtension.exports
  if (api.repositories.length === 0) {
    updateDot(0)
    return
  }

  let totalStashes = 0

  for (const repo of api.repositories) {
    try {
      const stashCount = await getStashCount(repo.rootUri.fsPath)
      totalStashes += stashCount
    } catch {
      // Ignore errors
    }
  }

  updateDot(totalStashes)
}

function getStashCount(workspacePath: string): Promise<number> {
  return new Promise((resolve) => {
    exec(
      "git stash list",
      { cwd: workspacePath, timeout: 5000 },
      (err, stdout) => {
        if (err) {
          resolve(0)
          return
        }
        const lines = stdout
          .trim()
          .split("\n")
          .filter((line) => line.trim())
        resolve(lines.length)
      },
    )
  })
}

function updateDot(stashCount: number) {
  if (stashCount > 0) {
    statusBarItem.text = "●"
    statusBarItem.color = new vscode.ThemeColor("charts.blue")
    statusBarItem.tooltip = `You have ${stashCount} stashed change${stashCount === 1 ? "" : "s"}`
  } else {
    statusBarItem.text = "●"
    statusBarItem.color = new vscode.ThemeColor("charts.gray")
    statusBarItem.tooltip = "No stashed changes"
  }
  statusBarItem.show()
}

async function updateStatusBar(repo: GitRepository) {
  try {
    const stashCount = await getStashCount(repo.rootUri.fsPath)
    updateDot(stashCount)
  } catch {
    updateDot(0)
  }
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose()
  }
}
