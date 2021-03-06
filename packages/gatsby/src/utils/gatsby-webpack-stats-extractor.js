const fs = require(`fs-extra`)
const path = require(`path`)

class GatsbyWebpackStatsExtractor {
  constructor(options) {
    this.plugin = { name: `GatsbyWebpackStatsExtractor` }
    this.options = options || {}
  }
  apply(compiler) {
    compiler.hooks.done.tapAsync(this.plugin.name, (stats, done) => {
      let assets = {}
      let assetsMap = {}
      for (let chunkGroup of stats.compilation.chunkGroups) {
        if (chunkGroup.name) {
          let files = []
          for (let chunk of chunkGroup.chunks) {
            files.push(...chunk.files)
          }
          assets[chunkGroup.name] = files.filter(f => f.slice(-4) !== `.map`)
          assetsMap[chunkGroup.name] = files
            .filter(
              f =>
                f.slice(-4) !== `.map` &&
                f.slice(0, chunkGroup.name.length) === chunkGroup.name
            )
            .map(filename => `/${filename}`)
        }
      }
      const webpackStats = {
        ...stats.toJson({ all: false, chunkGroups: true }),
        assetsByChunkName: assets,
      }
      fs.writeFile(
        path.join(`public`, `chunk-map.json`),
        JSON.stringify(assetsMap),
        () => {
          fs.writeFile(
            path.join(`public`, `webpack.stats.json`),
            JSON.stringify(webpackStats),
            done
          )
        }
      )
    })
  }
}

module.exports = GatsbyWebpackStatsExtractor
