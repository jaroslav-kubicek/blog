import React from "react";
import OriginalBlogPostItem from "@theme-original/BlogPostItem";

import Subscribe from "../../components/Subscribe";
import Comments from "../../components/Comments";

const BlogPostItem = (props) => {
  return (
    <>
      <OriginalBlogPostItem {...props} />
      {props.isBlogPostPage === true ? (
        <>
          <Subscribe />
          <Comments />
        </>
      ) : null}
    </>
  );
};

export default BlogPostItem;
