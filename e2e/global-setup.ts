import path from 'node:path'
import { buildTestArtifact } from 'weapp-vite/test'

/**
 * e2e 只构建一次真实小程序产物，所有用例复用同一份 artifact。
 * `buildTestArtifact` 会把产物写到 demo/.weapp-vite/test-artifacts 下并按批次隔离。
 */
export default async function setup(project: { provide: (key: string, value: unknown) => void }) {
  const artifact = await buildTestArtifact({ cwd: path.resolve('demo') })
  project.provide('mpcoreArtifact', { projectPath: artifact.projectPath })
}
