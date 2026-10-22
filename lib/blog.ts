/**
 * Блог — статті на загальні теми (правки клієнта 22–23.10.2026).
 *
 * Окремої моделі немає: це ті самі записи «article» у DatoCMS, що й новини,
 * але з типом матеріалу «Стаття» (або «Статті» / «Блог»), див. isBlogType у lib/cms.ts.
 * Новини таких записів не показують — розділи не змішуються.
 */
import { getArticlesPage, getLatestArticles, PAGE_SIZE } from "./cms";

export const BLOG_HREF = "/blog";

export const getBlogPage = (page = 1) => getArticlesPage(page, null, PAGE_SIZE, "blog");

export const getLatestBlogPosts = (count: number, excludeId?: string) =>
  getLatestArticles(count, { excludeId, section: "blog" });
