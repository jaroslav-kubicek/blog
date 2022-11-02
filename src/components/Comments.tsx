import React, { useEffect } from "react";

const Comments = () => {
  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "jaroslav-kubicek/blog");
    script.setAttribute("data-repo-id", "MDEwOlJlcG9zaXRvcnkzMDYxMzY5NTA=");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOEj9Hds4CSV2Y");
    script.setAttribute("data-mapping", "title");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "light");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
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
