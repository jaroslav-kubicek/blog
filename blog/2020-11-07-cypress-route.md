---
slug: cypress-authentication-route2
title: "Use new Cypress cy.route2() to mock authentication process"
image: /blog/cypress-route/two-factor-auth.png
description: "Auth2 flows and single sign-on authentications posed a barrier to Cypress tests, learn how we leveraged new cy.route2 function to go around it."
tags: [cypress]
---

![Two factor Authentication](/blog/cypress-route/two-factor-auth.png)

<!--truncate-->

In the previous article ["Cypress: Setting up the first acceptance tests in GitLab CI pipeline"](/cypress-in-gitlab-pipeline), I showed you how to scaffold Cypress tests with TypeScript support, run tests in typical GitLab pipeline and avoid some common pitfalls.

Such initial setup might be already all you need to add more tests to cover relevant user scenarios. Unless your whole application is hidden behind OAuth2 flow or single sign-on, in our case managed by Google Identity and Access Management (IAM).

## Authentication as barrier

To get through such an authentication process, it's best to make the application think we're coming to the web already as signed-in user. Cypress has known limitations to visit only one superdomain per test and any redirection to third-party service presents an impassable barrier.

On top of that, our single sign-on used for internal apps requires the usage of two-step verification via mobile application.

We will take the following steps to go around this process:

1. Retrieve token through REST API.
1. Send token in HTTP headers when visiting the page.
1. Forward token also to any other API call made by the application.

## Adding custom command

Since all our tests are going to share the need for bypassing the authentication, we will implement it as a custom command which we can then execute instead of `cy.visit`:

```ts title="src/support/commands.ts"
Cypress.Commands.add(
  "login",
  (path?: string, visitOptions?: Cypress.VisitOptions) => {
    // some magical implementation here
  },
);
```

And because we use TypeScript, we add the type definition for the new "login" command too:

```ts
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(
        path?: string, 
        options?: Cypress.VisitOptions,
      ): Chainable<AUTWindow>;
    }
  }
}
```

You can place it into the same file, `src/support/commands.ts`, just above the command or choose your own way, just make sure these type definitions are properly loaded.

## API calls from Cypress

Now the implementation itself. First, we call the API with `cy.request` to retrieve the token. Then we can utilize `cy.visit` as we know with the token in HTTP headers:

```ts title="src/support/commands.ts"
Cypress.Commands.add(
  "login",
  (path?: string, visitOptions?: Cypress.VisitOptions) => {
    const options = {
      method: "POST",
      url: "https://www.googleapis.com/oauth2/v4/token",
      body: {
        client_id: Cypress.env("CLIENT_ID"),
        client_secret: Cypress.env("CLIENT_SECRET"),
        refresh_token: Cypress.env("REFRESH_TOKEN"),
        grant_type: "refresh_token",
        audience: Cypress.env("IAP_AUDIENCE"),
      },
      // Restrict cypress from showing errored response by default.
      // It would dump the whole request object, including env values.
      failOnStatusCode: false,
    };

    return cy.request(options).then((response) => {
      if (response.status !== 200) {
        throw new Error(
          `Request to get auth token failed, response: ${JSON.stringify(
            response.body,
          )}`,
        );
      }

      const { id_token: token } = response.body;
    
      return cy.visit(path || "/", {
        headers: { Authorization: `Bearer ${token}` },
        ...visitOptions,
      });
    });
  },
);
```

One thing you may notice in the code is `failOnStatusCode: false`. Cypress `cy.request` command fails by default if API returns 4xx or 5xx HTTP error code. Unfortunately, it dumps the whole request and response objects into console, including environment variables in the payload.

For that reason, we're handling errors by ourselves. 

Now we can try to use our fresh command in tests:

```ts title="src/tests/dashboard.ts"
describe("Dashboard", () => {
  it("contains latest bookings", () => {
    cy.visit("/dashboard");
    cy.findByTestId("Overview").should("be.visible");

    // ...
  });
})
```

Our morale drops because test run very likely fails. It turns out that the application sends a request to another backend to fetch the data for the dashboard, but this service doesn't have our auth token!

## Network stubbing - the old way

If we worked with just normal OAuth 2 flow, we could redeem ourselves by simply storing token in cookies, but we haven't found a reliable way to make Google IAM happy this way.

For that reason, we decided to use network stubbing instead which relies on Cypress `cy.server`. We put the following code just before `cy.visit`: 

```ts
cy.server({
  onAnyRequest: (_route, proxy) => {
    const baseUrl = Cypress.config().baseUrl;

    if (proxy.url.includes(baseUrl)) {
      proxy.xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
  },
});
```

:::tip XHR vs fetch
Most of the modern applications nowadays use [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) while Cypress still expects [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) to be used. The most common workaround is to remove fetch from window object and let an application fallback to polyfill with XHR underneath.

See [Experimental Fetch Polyfill](https://www.cypress.io/blog/2020/06/29/experimental-fetch-polyfill/) blog post for more details.
:::

With `onAnyRequest` option passed to `cy.server`, we can intercept - as you might guess - any request coming from the application for the duration of the test.

By now, we had everything necessary to implement our test scenarios. Until we got into trouble with authentication again when we tried to go from dashboard to the detail of one specific booking.

Suppose we have a link like this:

```html
<a href="/bookings/detail/1234567">1234567</a>
```

As soon as we click on it in a test, we got HTTP code 401 unauthorized. That's because our Cypress network stubbing worked well with XHR requests only. This is sufficient for single-page applications (SPA), but the application in our case consists of _multiple_ SPAs: For example, if you navigate to dashboard, all your interaction there is handled by ajax XHR calls as in a typical SPA. However, clicking on the link above brings you to another SPA or how we call it, _module_, resulting in a new page load, not XHR call.

For sure, we could work around this: select the link element first, retrieve its href attribute and pass it into `cy.visit`, but good news ahead! Cypress 5.x offers now far better stubbing options.

## New cy.route2 on the stage

Starting with Cypress version 5.0, there is a new, experimental network stubbing mechanism.

First, we have to enable it in the config:

```json title="cypress.json"
{
  "experimentalNetworkStubbing": true
}
```

Such an option allows us to use new `cy.route2` function. As opposed to `cy.route` and `cy.server` counterparts, it"s possible to intercept, spy, or mock any type of request within the application, including a load of a page document, fetch calls, or static assets. 

Therefore, we"re gonna replace our `cy.server({ onAnyRequest })` command with the following code:

```ts
const baseUrl = Cypress.config().baseUrl || "";

cy.route2("**", (req) => {
  if (req.url.includes(baseUrl)) {
    req.headers["Authorization"] = `Bearer ${token}`;
  }
});
```

_Voilà!_ We"ve won our struggle against relentless authentication: no more workarounds in our test code & the road to test automation is free.

## Conclusion

Network stubbing was historically one of Cypress weaker points as it lacked first-class support for intercepting _any_ application request. Although the API is still experimental, and we still experience issues with requests made in service workers, for example, it"s great to see the big progress which comes with `cy.route2` function.

## Full implementation

```ts title="src/support/commands.ts"

const login = (
  path?: string,
  visitOptions?: Cypress.VisitOptions,
): Cypress.Chainable<Cypress.AUTWindow> => {
  const options = {
    method: "POST",
    url: "https://www.googleapis.com/oauth2/v4/token",
    body: {
      client_id: Cypress.env("CLIENT_ID"),
      client_secret: Cypress.env("CLIENT_SECRET"),
      refresh_token: Cypress.env("REFRESH_TOKEN"),
      grant_type: "refresh_token",
      audience: Cypress.env("IAP_AUDIENCE"),
    },
    // Restrict cypress from showing errored response by default.
    // It would dump the whole request object, including env values.
    failOnStatusCode: false,
  };

  return cy.request(options).then((response) => {
    if (response.status !== 200) {
      throw new Error(
        `Request to get auth token failed, response: ${JSON.stringify(
          response.body,
        )}`,
      );
    }

    const { id_token: token } = response.body;

    const baseUrl = Cypress.config().baseUrl || "";
    // ignore requests to assets specified by their extension
    //
    // will be ignored:
    // https://example.com/file.svg 
    // https://example.com/file.css?v=a12c
    const extensionsToIgnore = ["jsx?", "svg", "s?css", "jpe?g", "png"];
    const patternGroup = extensionsToIgnore
      .map((ext) => `.*\\.${ext}(\\?.*)?$`)
      .join("|");
    const matchURL = new RegExp(`^(.(?!${patternGroup}))*$`);

    cy.route2(
      {
        url: matchURL,
      },
      (req) => {
        if (req.url.includes(baseUrl)) {
          req.headers["Authorization"] = `Bearer ${token}`;
        }
      },
    );

    return cy.visit(path || "/", {
      headers: { Authorization: `Bearer ${token}` },
      ...visitOptions,
    });
  });
};

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login: typeof login;
    }
  }
}

Cypress.Commands.add("login", login);
```
