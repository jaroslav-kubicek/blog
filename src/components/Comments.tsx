import React, { useEffect } from "react";

const Comments = () => {
  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://utteranc.es/client.js";
    script.setAttribute("repo", "jaroslav-kubicek/blog");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "comment");
    script.setAttribute("theme", "github-light");
    script.crossOrigin = "anonymous";
    script.async = true;

    const element = document.getElementById("comment-system");

    if (element) {
      element.appendChild(script);
    }
  }, []);

  return <div id="comment-system" />;
};

export default Comments;
