import React from "react";
import Layout from "@theme/Layout";
import BlogPostItem from "@theme/BlogPostItem";
import IconEdit from "@theme/IconEdit";
import BlogSidebar from "@theme/BlogSidebar";
import BlogPostPaginator from "@theme/BlogPostPaginator";
import TOC from "@theme/TOC";
import Stack from "@kiwicom/orbit-components/lib/Stack";
import ButtonLink from "@kiwicom/orbit-components/lib/ButtonLink";

import Subscribe from "../../components/Subscribe";
import Comments from "../../components/Comments";
import OrbitThemeProvider from "../../components/OrbitThemeProvider";

// done according to https://github.com/facebook/docusaurus/blob/master/packages/docusaurus-theme-classic/src/theme/BlogPostPage/index.tsx
const BlogPostPage = (props): JSX.Element => {
  const { content: BlogPostContents, sidebar } = props;
  const { frontMatter, metadata } = BlogPostContents;
  const { editUrl } = metadata;
  const { hide_table_of_contents: hideTableOfContents } = frontMatter;

  return (
    <OrbitThemeProvider>
      <Layout title={metadata.title} description={metadata.description}>
        {BlogPostContents && (
          <div className="container margin-vert--xl">
            <div className="row">
              <div className="col col--2">
                <BlogSidebar sidebar={sidebar} />
              </div>
              <main className="col col--8">
                <BlogPostItem frontMatter={frontMatter} metadata={metadata} isBlogPostPage>
                  <BlogPostContents />
                </BlogPostItem>
                <Stack>
                  {editUrl && (
                    <Stack align="center" direction="row" justify="around">
                      <ButtonLink href={editUrl} rel="noreferrer noopener">
                        <IconEdit />
                        Edit this page
                      </ButtonLink>
                    </Stack>
                  )}
                  <Subscribe />
                  <Comments />
                </Stack>
                {(metadata.nextItem || metadata.prevItem) && (
                  <div className="margin-vert--xs">
                    <BlogPostPaginator nextItem={metadata.nextItem} prevItem={metadata.prevItem} />
                  </div>
                )}
              </main>
              {!hideTableOfContents && BlogPostContents.toc && (
                <div className="col col--2">
                  <TOC toc={BlogPostContents.toc} />
                </div>
              )}
            </div>
          </div>
        )}
      </Layout>
    </OrbitThemeProvider>
  );
};

export default BlogPostPage;
