import History from "../models/History.js";
import { createCrudService } from "./crud.service.js";

const historyService = createCrudService({
  model: History,
  entityName: "History article",
  titleField: "title",
  searchFields: ["title", "content", "category", "tags", "references"],
  populate: { path: "relatedAuthors", select: "name slug photo featuredImage specialties" },
});

export default historyService;
