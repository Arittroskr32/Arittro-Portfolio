// Minimal GitHub REST client used by the admin panel.
//
// The admin signs in with a fine-grained personal access token that has
// "Contents: read and write" on this one repository. The token is kept only in
// this browser's localStorage and is sent only to api.github.com.

import { GITHUB_BRANCH, GITHUB_REPO } from './config';

const API = 'https://api.github.com';
const TOKEN_KEY = 'gh_admin_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function gh<T>(path: string, init: RequestInit = {}, token = getToken()): Promise<T> {
  if (!token) throw new GitHubError('Not signed in', 401);
  const res = await fetch(`${API}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `GitHub API error ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) msg = `${msg}: ${body.message}`;
    } catch {
      /* ignore */
    }
    throw new GitHubError(msg, res.status);
  }
  if (res.status === 204) return undefined as T;
  const type = res.headers.get('content-type') || '';
  return (type.includes('json') ? res.json() : res.text()) as Promise<T>;
}

export interface GitHubIdentity {
  login: string;
  name: string | null;
  avatar_url: string;
}

/** Checks that the token works and can push to the site repository. */
export async function verifyToken(token: string): Promise<GitHubIdentity> {
  const repo = await gh<any>(`/repos/${GITHUB_REPO}`, {}, token).catch((e: GitHubError) => {
    if (e.status === 401) throw new Error('That token is not valid (or it has expired).');
    if (e.status === 404) throw new Error(`The token cannot see ${GITHUB_REPO}. Give it access to this repository.`);
    throw e;
  });
  if (repo?.permissions && repo.permissions.push === false) {
    throw new Error('The token can read the repository but cannot write to it. Give it "Contents: Read and write".');
  }
  const user = await gh<any>('/user', {}, token).catch(() => null);
  return {
    login: user?.login || repo?.owner?.login || 'admin',
    name: user?.name || null,
    avatar_url: user?.avatar_url || '',
  };
}

/** Latest commit SHA on the site branch. */
export async function getHeadSha(): Promise<string> {
  const ref = await gh<any>(`/repos/${GITHUB_REPO}/git/ref/heads/${encodeURIComponent(GITHUB_BRANCH)}`);
  return ref.object.sha as string;
}

/** Reads a text file at a given commit. Returns null if it does not exist. */
export async function readTextFile(path: string, ref: string): Promise<string | null> {
  try {
    return await gh<string>(
      `/repos/${GITHUB_REPO}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${ref}`,
      { headers: { Accept: 'application/vnd.github.raw+json' } }
    );
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return null;
    throw e;
  }
}

export interface FileChange {
  path: string;
  /** utf-8 text, or base64 when `base64` is true. null deletes the file. */
  content: string | null;
  base64?: boolean;
}

/**
 * Creates one commit with all changes on top of `parentSha` and moves the
 * branch to it. Throws GitHubError(409) if the branch moved in the meantime.
 */
export async function commitFiles(parentSha: string, changes: FileChange[], message: string): Promise<string> {
  const parent = await gh<any>(`/repos/${GITHUB_REPO}/git/commits/${parentSha}`);
  const tree = await Promise.all(
    changes.map(async (c) => {
      if (c.content === null) {
        return { path: c.path, mode: '100644', type: 'blob', sha: null };
      }
      const blob = await gh<any>(`/repos/${GITHUB_REPO}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: c.content, encoding: c.base64 ? 'base64' : 'utf-8' }),
      });
      return { path: c.path, mode: '100644', type: 'blob', sha: blob.sha };
    })
  );
  const newTree = await gh<any>(`/repos/${GITHUB_REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
  });
  const commit = await gh<any>(`/repos/${GITHUB_REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [parentSha] }),
  });
  try {
    await gh(`/repos/${GITHUB_REPO}/git/refs/heads/${encodeURIComponent(GITHUB_BRANCH)}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
  } catch (e) {
    if (e instanceof GitHubError && e.status === 422) {
      throw new GitHubError('Branch moved while saving', 409);
    }
    throw e;
  }
  return commit.sha as string;
}

export interface DeployStatus {
  status: 'queued' | 'in_progress' | 'completed' | 'unknown';
  conclusion: string | null;
  html_url: string | null;
  updated_at: string | null;
}

/** Status of the most recent Pages deploy workflow run. */
export async function getLatestDeploy(): Promise<DeployStatus> {
  try {
    const runs = await gh<any>(
      `/repos/${GITHUB_REPO}/actions/workflows/deploy-pages.yml/runs?branch=${encodeURIComponent(GITHUB_BRANCH)}&per_page=1`
    );
    const run = runs.workflow_runs?.[0];
    if (!run) return { status: 'unknown', conclusion: null, html_url: null, updated_at: null };
    return { status: run.status, conclusion: run.conclusion, html_url: run.html_url, updated_at: run.updated_at };
  } catch {
    return { status: 'unknown', conclusion: null, html_url: null, updated_at: null };
  }
}
