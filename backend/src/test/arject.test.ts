import aj from "../config/arcject/arrject.ts";

async function testArcjet() {
  const mockReq = {
    ip: "127.0.0.1",
    method: "POST",
    url: "/test",
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    body: {},
  };

  for (let i = 0; i < 15; i++) {
    const decision = await aj.protect(mockReq as any, { requested: 1 });

    console.log(`Test ${i + 1}/15 - Arcjet Decision:`, {
      id: decision.id,
      conclusion: decision.conclusion,
      ip: decision.ip,
      isDenied: decision.isDenied(),
    });
  }
}

testArcjet();
