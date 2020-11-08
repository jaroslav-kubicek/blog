import React from "react";
// @ts-expect-error: No typings for @theme-original
import OriginalBlogPostItem from "@theme-original/BlogPostItem";

import Subscribe from "../../components/Subscribe";

const BlogPostItem = (props) => {
  return (
    <>
      <OriginalBlogPostItem {...props} />
      {props.isBlogPostPage === true ? <Subscribe /> : null}
    </>
  );
};

export default BlogPostItem;
