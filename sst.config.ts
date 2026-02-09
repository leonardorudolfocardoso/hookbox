/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "hookbox",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    await import("./infra/auth");
    await import("./infra/database");
    const { api } = await import("./infra/api");
    const { web } = await import("./infra/web");

    return {
      ApiUrl: api.url,
      WebUrl: web.url,
    };
  },
});
