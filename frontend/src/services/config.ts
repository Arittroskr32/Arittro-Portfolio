// Static-site configuration.
//
// The site is now a static build served by GitHub Pages. All content lives in
// JSON files under `frontend/public/data/` and images under
// `frontend/public/uploads/`. The admin panel edits those files by committing to
// the repository through the GitHub API, and the Pages workflow redeploys.

const env = (import.meta as any).env || {};

/** "owner/repo" that holds the site. Injected by the deploy workflow. */
export const GITHUB_REPO: string = env.VITE_GITHUB_REPO || 'Arittroskr32/Arittro-Portfolio';

/** Branch the site is built from (and that the admin panel commits to). */
export const GITHUB_BRANCH: string = env.VITE_GITHUB_BRANCH || 'main';

/** Folder inside the repo where the content JSON files live. */
export const REPO_DATA_DIR = 'frontend/public/data';

/** Folder inside the repo where uploaded images live. */
export const REPO_UPLOADS_DIR = 'frontend/public/uploads';

/** Base path the site is served from ("/" for a custom domain, "/Repo-Name/" otherwise). */
export const BASE_URL: string = env.BASE_URL || '/';

/** Changes on every build so browsers never serve stale content JSON. */
export const BUILD_ID: string = env.VITE_BUILD_ID || 'dev';

/** Absolute URL of a file that ships with the site, e.g. sitePath('data/projects.json'). */
export function sitePath(relative: string): string {
  const base = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
  return `${base}${relative.replace(/^\/+/, '')}`;
}
