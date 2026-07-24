import * as vscode from "vscode"
import { exec } from "child_process"

let statusBarItem: vscode.StatusBarItem

export function activate(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    1000,
  )
  statusBarItem.command = "mustache.showStashes"
  context.subscriptions.push(statusBarItem)

  console.log("Mustache: activating")

  checkStashes()

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

  const watcher = vscode.workspace.createFileSystemWatcher("**/.git/refs/stash")
  watcher.onDidChange(() => checkStashes())
  watcher.onDidCreate(() => checkStashes())
  watcher.onDidDelete(() => checkStashes())
  context.subscriptions.push(watcher)
}

async function checkStashes() {
  const folders = vscode.workspace.workspaceFolders
  if (!folders) {
    updateDot(0)
    return
  }

  let totalStashes = 0

  for (const folder of folders) {
    try {
      const count = await getStashCount(folder.uri.fsPath)
      totalStashes += count
    } catch {
      // ignore
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
  console.log(`Mustache: ${stashCount} stashes found`)
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose()
  }
}
