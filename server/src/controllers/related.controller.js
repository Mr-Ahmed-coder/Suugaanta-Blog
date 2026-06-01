import relatedContentService from "../services/related-content.service.js";
import { sendSuccess } from "../utils/api-response.js";

export const getRelatedContent = async (req, res) => {
  const relatedContent = await relatedContentService.getRelatedContent(
    req.params.resourceType,
    req.params.id,
    req.query.limit
  );

  return sendSuccess(res, 200, "Related content retrieved successfully.", relatedContent);
};
