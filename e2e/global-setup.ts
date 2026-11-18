import path from 'node:path'
import { buildTestArtifact } from 'weapp-vite/test'

/**
 * e2e 只构建一次真实小程序产物，所有用例复用同一份 artifact。
 * `buildTestArtifact` 会把产物写到 demo/.weapp-vite/test-artifacts 下并按批次隔离。
 *
 * 必须把 `miniprogramRootPath` 一起传给 mpcore：只传 `projectPath` 时，
 * mpcore 会回去读 `demo/project.config.json` 的 `miniprogramRoot: dist/`，
 * 而 `demo/dist` 是被 gitignore 的构建产物，CI 上并不存在。
 */
export default async function setup(project: { provide: (key: string, value: unknown) => void }) {
  const artifact = await buildTestArtifact({ cwd: path.resolve('demo') })
  project.provide('mpcoreArtifact', {
    appConfigPath: artifact.appConfigPath,
    miniprogramRootPath: artifact.miniprogramRootPath,
    projectPath: artifact.projectPath,
  })
}
