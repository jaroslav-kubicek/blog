import React from "react";
import Button from "@kiwicom/orbit-components/lib/Button";
import Illustration from "@kiwicom/orbit-components/lib/Illustration";
import InputField from "@kiwicom/orbit-components/lib/InputField";
import CallOutBanner from "@kiwicom/orbit-components/lib/CallOutBanner";

const Subscribe = () => {
  return (
    <form
      action="https://dev.us2.list-manage.com/subscribe/post?u=e6ec8e6e1fdb7e5e9d0965b42&amp;id=5eb330c61f"
      method="post"
      id="mc-embedded-subscribe-form"
      name="mc-embedded-subscribe-form"
      className="validate"
      target="_blank"
      noValidate
    >
      <CallOutBanner
        {...{} /* lol https://github.com/Microsoft/TypeScript/issues/27552#issuecomment-495830020
      // @ts-ignore */ /* prettier-ignore */}
        illustration={<Illustration name="Mailbox" />}
        title="Interesting? Subscribe to get the next article."
        description="Get message every time I post a new blog post. No spam."
      >
        <InputField inlineLabel label="Your email:" type="email" name="EMAIL" id="mce-EMAIL" />
        <Button submit>Subscribe</Button>
      </CallOutBanner>
    </form>
  );
};

export default Subscribe;
