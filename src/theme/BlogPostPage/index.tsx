import React from "react";
import Layout from "@theme/Layout";
import BlogPostItem from "@theme/BlogPostItem";
import BlogPostPaginator from "@theme/BlogPostPaginator";

import Subscribe from "../../components/Subscribe";
import Comments from "../../components/Comments";

const BlogPostPage = (props) => {
  const { content: BlogPostContents } = props;
  const { frontMatter, metadata } = BlogPostContents;
  return (
    <Layout title={metadata.title} description={metadata.description}>
      {BlogPostContents && (
        <div className="container margin-vert--xl">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <BlogPostItem frontMatter={frontMatter} metadata={metadata} isBlogPostPage>
                <BlogPostContents />
              </BlogPostItem>
              {(metadata.nextItem || metadata.prevItem) && (
                <div className="margin-vert--xs">
                  <BlogPostPaginator nextItem={metadata.nextItem} prevItem={metadata.prevItem} />
                </div>
              )}
              <Subscribe />
              <Comments />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BlogPostPage;
