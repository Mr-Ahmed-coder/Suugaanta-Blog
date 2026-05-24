import Author from "../models/Author.js";
import { createCrudService } from "./crud.service.js";

const authorService = createCrudService({
  model: Author,
  entityName: "Author",
  titleField: "name",
  searchFields: ["name", "biography", "specialties"],
  supportsCategory: false,
});

export default authorService;
