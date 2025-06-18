import { Tool } from "../data/tools";
import { AIModel } from "../graphql";

export function getToolsForModel(model?: AIModel | null | undefined): Tool[] {
  const tools: Tool[] = [];

  if (model?.capabilities.imageGeneration) {
    tools.push({
      id: "image-generation",
      icon: "Image",
    });
  }

  return tools;
}
