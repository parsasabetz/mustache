import type * as vscode from "vscode"

export interface GitAPI {
  repositories: GitRepository[]
  onDidOpenRepository: vscode.Event<GitRepository>
}

export interface GitRepository {
  rootUri: vscode.Uri
  state: GitState
  onDidChangeState: vscode.Event<GitState>
  getStatus(): Promise<GitStatus | undefined>
}

export interface GitState {
  HEAD: GitReference | undefined
  onDidChange: vscode.Event<void>
}

export interface GitReference {
  name: string
  type: number
}

export interface GitStatus {
  stashChanges: number
}
