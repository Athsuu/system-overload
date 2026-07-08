import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const projectRoot = process.cwd();
const version = process.env.npm_package_version ?? '0.1.0';
const artifactName = `ZeroArchive-${version}-portable.exe`;
const tempOutput = join(tmpdir(), 'zero-archive-electron');
const releaseDir = join(projectRoot, 'release');
const releaseArtifact = join(releaseDir, artifactName);

rmSync(tempOutput, { recursive: true, force: true });

const builder = spawnSync(
  'npx',
  [
    'electron-builder',
    '--win',
    'portable',
    '--x64',
    `--config.directories.output=${tempOutput}`,
  ],
  { stdio: 'inherit', shell: true, cwd: projectRoot },
);

if (builder.status !== 0) {
  process.exit(builder.status ?? 1);
}

mkdirSync(releaseDir, { recursive: true });
copyFileSync(join(tempOutput, artifactName), releaseArtifact);
console.log(`Portable build ready: ${releaseArtifact}`);
