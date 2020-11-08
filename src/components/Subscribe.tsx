import React from "react";

const Subscribe = () => {
  return (
    <>
      <link
        href="//cdn-images.mailchimp.com/embedcode/horizontal-slim-10_7.css"
        rel="stylesheet"
        type="text/css"
      />
      <div id="mc_embed_signup">
        <form
          action="https://dev.us2.list-manage.com/subscribe/post?u=e6ec8e6e1fdb7e5e9d0965b42&amp;id=5eb330c61f"
          method="post"
          id="mc-embedded-subscribe-form"
          name="mc-embedded-subscribe-form"
          className="validate"
          target="_blank"
          noValidate
        >
          <div id="mc_embed_signup_scroll">
            <label htmlFor="mce-EMAIL">Interesting? Subscribe to get the next article.</label>
            <input
              type="email"
              name="EMAIL"
              className="email"
              id="mce-EMAIL"
              placeholder="email address"
              required
            />
            <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
              <input type="text" name="b_e6ec8e6e1fdb7e5e9d0965b42_5eb330c61f" tabIndex={-1} />
            </div>
            <div className="clear">
              <input
                type="submit"
                value="Subscribe"
                name="subscribe"
                id="mc-embedded-subscribe"
                className="button"
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Subscribe;
