import { Logger, registerWorker } from 'iii-sdk';

const iii = registerWorker(process.env.III_URL ?? 'ws://localhost:49134');
const logger = new Logger();

iii.registerFunction(
  'inference::get_response',
  async (payload: { messages: Record<string, any> } & Record<string, any>) => {
    logger.info("About to call inference worker");

try {
  const result = await iii.trigger({
    function_id: 'inference::run_inference',
    payload,
  });

  logger.info("Inference worker responded", result);

  return {
    ...result,
  };
} catch (err) {
  logger.error("RPC FAILED", err);
  throw err;
}
  },
);

// --- Uncomment after: iii worker add iii-http ---
iii.registerFunction(
  'http::run_inference_over_http',
  async (payload: { body: { messages: Record<string, any> } & Record<string, any> }) => {
    const result = await iii.trigger({
      function_id: 'inference::get_response',
      payload: payload.body,
    });
    logger.info("Running http inference...")
    return {
      status_code: 200,
      body: { result },
      headers: { 'Content-Type': 'application/json' },
    };
  },
);

iii.registerTrigger({
  type: 'http',
  function_id: 'http::run_inference_over_http',
  config: { api_path: '/v1/chat/completions', http_method: 'POST' },
});

logger.info('Caller worker started - listening for calls');
