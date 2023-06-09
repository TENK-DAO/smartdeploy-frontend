const just = require("just");

module.exports = {
  async onPreBuild({ utils }) {
    try {
      // Run the 'just generate' command via shell using the absolute path
      await utils.run.command(
        "/opt/build/repo/node_modules/.bin/just generate"
      );
    } catch (error) {
      utils.build.failBuild("Failed to run `just generate` command", { error });
    }
  },
  async onBuild({ utils }) {
    try {
      // Run the 'npm run build' command
      await utils.run.command("npm run build");
    } catch (error) {
      utils.build.failBuild("Failed to run `npm run build` command", { error });
    }
  },
};