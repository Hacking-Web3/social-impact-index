import CeramicClient from "@ceramicnetwork/http-client";
import { ModelManager } from "@glazed/devtools";
import SIOSchema from "../schemas/SIOProfile.json";

const ceramic = new CeramicClient();
const manager = new ModelManager(ceramic);

await manager.createSchema('SIOProfile', SIOSchema);

const publishedModel = await manager.toPublished();

console.log(publishedModel);
