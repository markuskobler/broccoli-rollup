import { RollupBuild } from 'rollup';
import { Change, realpath } from './utils';

export default class Dependencies {
  private buildPath: string;
  private inputDependencies = undefined as Set<string> | undefined;

  constructor(buildPath: string) {
    this.buildPath = realpath(buildPath);
  }

  public add(rollupBuild: RollupBuild) {
    const watchedFiles = rollupBuild.watchFiles;

    if (!Array.isArray(watchedFiles) || watchedFiles.length === 0) {
      this.inputDependencies = undefined;
      return;
    }

    const buildPath = this.buildPath;
    const relativeStart = buildPath.length + 1;
    const inputDependencies = new Set<string>();

    for (const watchedFile of watchedFiles) {
      const normalized = realpath(watchedFile);
      if (normalized.startsWith(buildPath)) {
        inputDependencies.add(normalized.slice(relativeStart));
      }
    }

    this.inputDependencies = inputDependencies;
  }

  public shouldBuild(inputChanges: Change[]) {
    // is undefined on first build
    const inputDependencies = this.inputDependencies;
    if (inputDependencies === undefined) {
      return true;
    }

    let shouldBuild = false;
    for (const change of inputChanges) {
      const inputPath = change[1];
      if (inputDependencies.has(inputPath)) {
        shouldBuild = true;
        break;
      }
    }
    return shouldBuild;
  }
}
