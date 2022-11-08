import React from "react";
import BlogPostPaginator from "@theme-original/BlogPostPaginator";
import Comments from "@site/src/components/Comments";
import { Stack } from "@kiwicom/orbit-components";

export default function BlogPostPaginatorWrapper(props) {
  return (
    <>
      <Stack direction="column" spacing="large">
        <BlogPostPaginator {...props} />
        <Comments />
      </Stack>
    </>
  );
}
