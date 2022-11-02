import React from "react";
import Layout from "@theme/Layout";
import styled from "styled-components";
import { Stack, Heading, List, ListItem, TextLink, Text } from "@kiwicom/orbit-components";

import OrbitThemeProvider from "../components/OrbitThemeProvider";

const RoundedImg = styled.img`
  border-radius: 50%;
  margin: 10px;
`;

const Wrapper = styled.div`
  margin: 5vh 10vw;
`;

const NoteWrapper = styled.div`
  max-width: 50vw;
`;

export default function Hello() {
  return (
    <Layout title="About Me" description="A bit of info about Kubajz.dev">
      <OrbitThemeProvider>
        <Wrapper>
          <Stack
            direction="column"
            align="center"
            justify="center"
            spacing="large"
            spaceAfter="largest"
          >
            <Stack direction="row" justify="center">
              <RoundedImg src="/img/profile_photo.jpeg" width="200" height="200" alt="Avatar" />
              <div>
                <Heading spaceAfter="large">About me</Heading>
                <List>
                  <ListItem>Ahoj 👋 My full name is Jaroslav Kubíček.</ListItem>
                  <ListItem>I come to you from the beautiful city of Prague, CZ 🇨🇿</ListItem>
                  <ListItem>
                    I'm an enthusiastic runner and cyclist, let's deal some{" "}
                    <TextLink href="https://www.strava.com/athletes/24987564">kudos</TextLink> if
                    you are similarly obsessed.
                  </ListItem>
                  <ListItem>
                    As you may already suspect, I'm a software developer! Find me on{" "}
                    <TextLink href="https://www.linkedin.com/in/jaroslav-kub%C3%AD%C4%8Dek-25717464/">
                      LinkedIn
                    </TextLink>
                    .
                  </ListItem>
                </List>
              </div>
            </Stack>
            <NoteWrapper>
              <Text type="secondary">
                As a software engineer, I focus on making the developer experience better. Local
                environment, GraphQL setup, CI or test setup - areas of current interest can change
                a lot over the year but the goal is the same: my colleagues from product teams
                shouldn't be drained of energy when they are closing their laptops in the afternoon.
              </Text>
            </NoteWrapper>
          </Stack>
        </Wrapper>
      </OrbitThemeProvider>
    </Layout>
  );
}
