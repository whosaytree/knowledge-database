import fs from 'node:fs/promises';
import path from 'node:path';
import { collectNodeSlugs, getNodePayload, getTreePayload, visualizerRoot } from './lib/content.mjs';

const publicDir = path.join(visualizerRoot, 'public');
const dataDir = path.join(publicDir, 'data');
const nodeDir = path.join(dataDir, 'node');

async function writeJson(targetPath, payload) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, `${JSON.stringify(payload, null, 2)}\n`);
}

async function buildStaticData() {
  const treePayload = await getTreePayload();
  const slugs = await collectNodeSlugs(treePayload.tree);

  await fs.rm(dataDir, { recursive: true, force: true });
  await fs.mkdir(nodeDir, { recursive: true });
  await writeJson(path.join(dataDir, 'tree.json'), treePayload);

  for (const slug of slugs) {
    const nodePayload = await getNodePayload(slug);
    const outputPath = path.join(nodeDir, ...slug.split('/'), 'index.json');
    await writeJson(outputPath, nodePayload);
  }

  console.log(`Built static visualizer data for ${slugs.length} nodes.`);
}

buildStaticData().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
