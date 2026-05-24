const pickDefinedFields = (source, allowedFields) =>
  allowedFields.reduce((accumulator, field) => {
    if (source[field] !== undefined) {
      accumulator[field] = source[field];
    }

    return accumulator;
  }, {});

export const songFields = [
  "title",
  "artist",
  "author",
  "writer",
  "composer",
  "relatedAuthors",
  "performer",
  "description",
  "lyrics",
  "audioUrl",
  "thumbnail",
  "year",
  "category",
  "tags",
];

export const poetryFields = [
  "title",
  "poet",
  "author",
  "content",
  "audioRecitation",
  "category",
  "tags",
];

export const historyFields = [
  "title",
  "content",
  "coverImage",
  "category",
  "tags",
  "references",
  "relatedAuthors",
];

export const authorFields = [
  "name",
  "legacySummary",
  "biography",
  "birthYear",
  "deathYear",
  "photo",
  "featuredImage",
  "specialties",
  "tags",
  "relatedAuthors",
  "archiveMetadata",
  "mediaAssets",
  "socialLinks",
];

export const pickSongPayload = (payload) => pickDefinedFields(payload, songFields);
export const pickPoetryPayload = (payload) => pickDefinedFields(payload, poetryFields);
export const pickHistoryPayload = (payload) => pickDefinedFields(payload, historyFields);
export const pickAuthorPayload = (payload) => pickDefinedFields(payload, authorFields);
