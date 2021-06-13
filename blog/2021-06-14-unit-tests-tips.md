---
slug: unit-tests-tips
title: "Tips to improve your unit tests with jest & testing-library"
image: /blog/unit-tests-tips/opener.png
description: "TODO"
tags: [testing-library, jest, react]
---

Unit tests can excel as your additional documentation. Or be a total mess, just like the rest of the codebase, when "staff" culture isn't that good. See some tips I collected with time to keep the bar high, without scratching the head when tests suddenly fail.

<!--truncate-->

## 📝 TL;DR

- Get the maximum from ESLint.
- Use `getBy*` queries together with `@testing-library/jest-dom` assertions.
- Try to not use `getByTestId`, aim for accessibility with `getByRole`.
- Don't initialize global context in each test. Define custom renderer.
- Use the matcher function to query text broken up by multiple elements.  
- Keep your test report clean and disable console logs in jest config.

All the examples relate to [`jest`](https://jestjs.io/) and [`@testing-library`](https://testing-library.com/) libraries we've been using for a while. If you aren't, start with their adoption :).

## 1. Use appropriate assertions

Having a descriptive error message at hand is always a good start for any debugging. Consider a test where we check for the presence of a particular element in a component:

```js
describe("NavBar", () => {
  it("renders menu", () => {
    const onMenuOpen = jest.fn();
    render(<NavBar onMenuOpen={onMenuOpen}/>);

    const menu = screen.queryByLabelText("Open menu");

    expect(menu).not.toBeNull();
  });
});
```

...which gives us the output below. Not very helpful after six months of not seeing the related code:

```shell
● NavBar › renders menu

expect(received).not.toBeNull()

Received: null

  11 |     const menu = screen.queryByLabelText("Open menu");
  12 |
> 13 |     expect(menu).not.toBeNull();
     |                      ^
```

It get's better just by using `getBy*` type of queries:

```js
describe("NavBar", () => {
  it("renders menu", () => {
    const onMenuOpen = jest.fn();
    render(<NavBar onMenuOpen={onMenuOpen}/>);

    const menu = screen.getByLabelText("Open menu");

    expect(menu).toBeInTheDocument();
  });
});
```

```shell
● NavBar › renders menu

TestingLibraryElementError: Unable to find a label with the text of: Open menu

<body>
  <div>
    <nav
      class="NavigationBar__StyledNavigationBar-sc-17lan40-1 pjXCn"
      data-test="NavBar"
    >
```

**Conclusion:**

- Always use `getBy*` to query for the element.
- Prefer assertions from [`@testing-library/jest-dom`](https://testing-library.com/docs/ecosystem-jest-dom/) over default ones.
- `queryBy*` has only one purpose - to test non-existence in pair with `.not.toBeInTheDocument()` assertion.
- Make tests fail at least once before committing to check that error message is human-friendly.

## 2. Enforce strict ESLint rules

Look at the following test. Can you spot the problem?

```js
describe("NavBar", () => {
  it("can open 🍔 menu", () => {
    const onMenuOpen = jest.fn();
    render(<NavBar onMenuOpen={onMenuOpen} />);

    userEvent.click(screen.getByLabelText("Open menu"));

    expect(onMenuOpen).toHaveBeenCalled();
  });
});
```

It all seems just fine at first glance, correct? What if I told you it doesn't work in the application. You've been just assigned to a bug where customers complain they can't open the menu.

Let's check the code:

```js
const MenuButton = ({ onClick }) => (
  <Wrapper onClick={onClick}>
    <Button onClick={onClick} icon={<Hamburger />} />
  </Wrapper>
);
```

Our test was indeed right. The callback got called. Except it likely happened twice, and the second execution canceled out the effect of the first one. Fortunately, there are more robust assertions to cover this, e.g. `toHaveBeenCalledTimes`.

What's more, we can enforce stricter variants with [`prefer-called-with`](https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/prefer-called-with.md) ESLint rule.

**Conclusion:**

- Use [eslint-plugin-jest](https://www.npmjs.com/package/eslint-plugin-jest) and [eslint-plugin-testing-library](https://www.npmjs.com/package/eslint-plugin-testing-library) ESLint plugins to prevent common pitfalls from slipping under your radar.

## 3. Avoid test-ids whenever possible

It's rather tricky in certain situations to select the element. In such cases, our developer instinct drives us to put there test id (e.g. `<button data-test="menu" />`). The chances are that the element is inaccessible not only to our unit test but to a portion of our audience as well.

![Hamburger menu](/blog/unit-tests-tips/navbar-with-hamburger.png)

If that's the case, consider UX improvement over crutch for a developer. The button in the picture has no visible text label, just an icon that cannot be easily interpreted by assistive technology. Both screen reader and unit test will become happier if we put there a label:

```js
const Button = ({ onClick }) => (
  <button onClick={onClick} aria-label="Open menu">
    <HamburgerIcon />
  </button>
);
```

And then in the test:

```js
render(<Button onClick={onClick} />);

userEvent.click(screen.getByLabelText("Open menu"));
```

**Conclusion:**

- Prefer `getByRole` query over `getByTestId` to spot accessibility issues.
- Check more on accessibility in [the previous article](/accessibility-forms-buttons).

## 4. Reuse global context with custom renderer

Usually, we don't thrive for 100 % coverage but *adequate* coverage: Having tests for all components where some interesting logic is involved. And in such cases, global context often plays a role - checking whether a user is authenticated, the proper event is tracked, and similar. Many times we then end up with code like this:

```js
it("shows remaining credits for authenticated user", () => {
  const auth = {
    onSignIn: jest.fn(),
    onLogout: jest.fn(),
    user: { name: "Joe", settings: { credits: 23, currency: "USD" } },
  };

  render(
    <AuthProvider value={auth}>
      <Billing />
    </AuthProvider>,
  );

  expect(screen.getByText("Amount: $23")).toBeInTheDocument();
});
```

Besides the repetitiveness in each test, it may also discourage anyone from writing more of them, knowing how much boilerplate is necessary for setup. Luckily we can leverage that render function from `@testing-library` takes optional `wrapper`, and define our custom renderer:

```tsx
type ExtendedOptions = {
  auth?: Partial<AuthContext>;
};

type Props = ExtendedOptions & {
  children: ReactNode;
};

const TestProvider = ({ auth, children }: Props) => {
  const defaultAuth = useAuth();
  const authValue: AuthContext = {
    ...defaultAuth,
    user: defaultUser,
    ...(auth ?? {}),
  };

  return (
    <ThemeProvider value={defaultTheme}>
      <AuthProvider value={authValue}>{children}</AuthProvider>
    </ThemeProvider>
  );
};

type Options = Omit<RenderOptions, "wrapper"> & ExtendedOptions;

export const renderWithProviders = (
    component: ReactElement, 
    options: Options = {},
) => {
  render(component, {
    ...options,
    wrapper: ({ children }) => 
        <TestProvider auth={options.auth}>{children}</TestProvider>,
  });
};
```

Our updated test then can look as follow:

```js
it("shows remaining credits for authenticated user", () => {
  renderWithProviders(<Billing />, {
    auth: { user: { name: "Joe", settings: { credits: 23, currency: "USD" } } },
  });

  expect(screen.getByText("Amount: $23")).toBeInTheDocument();
});
```

Notice how we don't need to initialize the whole context. We're passing only relevant options without sacrificing Typescript types.

**Conclusion:**

- Define a renderer, which encapsulates the common global context.
- Provide reasonable defaults, for example, default user when most of your components are behind authentication.

## 5. Match the whole text with elements

It might become trickier with our Billing component from the previous example when the text contains HTML elements:

```js
<div>
  Amount: <strong>$23</strong>
</div>
```

Standard querying by text stops working while assertion on single words isn't something we would appreciate:

```js
// does not work
screen.getByText("Amount: $23");

// works but sucks
screen.getByText("Amount:");
screen.getByText("$23");
```

`@testing-library` knows its folks, so it even gives us a clear hint on what to do in error:

```text
This could be because the text is broken up by multiple elements. 
In this case, you can provide a function for your text matcher 
to make your matcher more flexible.
```

So let's start with our reusable matcher function:

```ts
import { MatcherFunction } from "@testing-library/react";

export const matchRichText =
  (text: string): MatcherFunction =>
  (content, node) => {
    const hasText = (node?: Element | null) => node?.textContent === text;
    const nodeHasText = hasText(node);
    const childrenDontHaveText = 
        Array.from(node?.children ?? []).every((child) => !hasText(child));

    return nodeHasText && childrenDontHaveText;
  };
```

No more compromises in `getByText` query:

```js
screen.getByText(matchRichText("Amount: $23"));
```

**Conclusion:**

- `@testing-library` simply rocks. And it pays off to read error messages carefully to their end.

## 6. Disable console logs

Some time has passed, and while we keep our test suite green, a few console logs appear during each execution. Although they usually don't cause any bugs, they may warn us about deprecations, unmocked IO operations, missing contexts, and similar imperfections:

```shell
    console.error
      useTranslator must be used within a TranslatorContext

    > 22 | 	const translator = useTranslator();
```

When their numbers grow, they can signal rising technical debt, but first and foremost, they spam our terminal output!

To counterattack this, we've extended our jest configuration to disable console logs altogether and make tests fail if there are any. Check out how it's done in [React](https://github.com/facebook/react/blob/7841d0695ae4bde9848cf8953baf34d312d0cced/scripts/jest/setupTests.js) repository or [Adeira Universe](https://github.com/adeira/universe/blob/master/scripts/jest/setupTests.js#L51).

Whenever you encounter the console log then, you have to mock it explicitly or remove the cause:

```js
it("handles error", async () => {
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  render(<FaultyButton />);

  userEvent.click(screen.getByRole("button"));
  
  await screen.findByText("Something went wrong.");
  
  expect(consoleSpy).toHaveBeenCalledWith('Request failed, retrying...');
  consoleSpy.mockRestore();
});
```

----

#### Read more:

- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Five Things You (Probably) Didn't Know About Testing Library](https://polvara.me/posts/five-things-you-didnt-know-about-testing-library)