import Song from "../models/Song.js";
import { createCrudService } from "./crud.service.js";

const songService = createCrudService({
  model: Song,
  entityName: "Song",
  titleField: "title",
  searchFields: ["title", "artist", "description", "lyrics", "tags"],
  populate: [
    { path: "author", select: "name slug photo featuredImage specialties" },
    { path: "writer", select: "name slug photo featuredImage specialties" },
    { path: "composer", select: "name slug photo featuredImage specialties" },
    { path: "relatedAuthors", select: "name slug photo featuredImage specialties" },
  ],
});

export default songService;
