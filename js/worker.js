import {
  MLCEngineWorkerHandler,
  MLCEngine,
} from "https://esm.run/@mlc-ai/web-llm";

const engine = new MLCEngine();
const handler = new MLCEngineWorkerHandler(engine);

onmessage = (message) => {
  handler.onmessage(message);
};
