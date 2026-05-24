import Poetry from "../models/Poetry.js";
import { createCrudService } from "./crud.service.js";

const poetryService = createCrudService({
  model: Poetry,
  entityName: "Poetry",
  titleField: "title",
  searchFields: ["title", "poet", "content", "tags"],
  populate: { path: "author", select: "name slug photo featuredImage specialties" },
});

export default poetryService;
