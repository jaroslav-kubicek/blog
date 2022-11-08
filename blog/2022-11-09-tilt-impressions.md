---
slug: tilt-first-impressions
title: "Local dev environment with Tilt.dev"
image: /blog/tilt-impressions/tilt-logo.png
description: "Using Tilt.dev to improve the developer experience of local setup"
tags: [kubernetes, devX]
---

A few months ago we sit together to rethink our local development at Productboard. Product teams delivered features that relied now on more than one backend service and our set of bash scripts and docker-compose files stopped working. We decided to replace it with deployments to the local Kubernetes cluster in Docker Desktop to bring the local environment closer to production. And adopt Tilt to improve the developer experience.

<!--truncate-->

## Backstory

A long time ago, we've come to the point where our monolithic Ruby backend in Productboard stopped scaling as the company grew so the decision was made to introduce microservice architecture. That always poses some challenges, yet the tooling to deploy multiple services into the Kubernetes cluster was established quite soon. But what about running the application locally during development? 

Naturally, it was no longer feasible to teach everyone how to run every service on bare metal, and expect to make it work without hassle. So dockerization was the most convenient next step. To automate the whole local setup, we've created *"toolkit"*, a set of bash scripts and docker-compose files to install commonly used binaries, spin up the application in Docker Desktop, initialize the database, and other tasks.

But with time and an increasing number of services even this solution stopped working - we had to maintain two different formats of the configurations for every service, maintenance of routing rules for nginx container lagged behind ingress definitions and Kong decK configs and the overall developer experience wasn't very high to say at least.

For these reasons, we decided on the next step in the evolution: use Kubernetes for the local environment as well to reuse what we already have for staging and production.

But is that enough to increase the developer experience and cut the inefficient time spent by developers to fix their environment? When you start with Kubernetes as a developer, you suddenly have to grasp an understanding of a plethora of abstractions: what is the pod, deployment, service, ingress, volume claim, secret and similar.

We desired to strip our colleagues from product teams from all the complexity of the infrastructure so they can be focusing on features, customer feedback, and user experience. We wanted to offer them a better interface than that provided by bash scripts so we picked [Tilt.dev](https://tilt.dev/) as a layer between our customers - developers and the harsh underworld beneath.

## About Tilt.dev

At the first glance, Tilt is similar to tools like Skaffold or DevSpace, it just does much more. When you run `tilt up` to trigger the local deployment, you aren't provided with much terminal output, you get the link to the Web interface instead:

![Tilt web interface](/blog/tilt-impressions/tilt-dashboard.png)

This is in my opinion the direction such tooling around Kubernetes should follow. Even without a deep understanding, I immediately have an overview of my environment, how many services are deployed, and which are still spinning up. And if something fails, I can trigger a redeploy.

## Flexibility of Tiltfile

We've been relying on Tilt for over the last 6 months and one of the things we appreciate about it since then is that it uses Starlank for configuration, a language originally built for the Bazel build ecosystem. Having the power of Python-like language shines especially in comparison to alternatives like DevSpace which uses yaml for configuration.

For example, you can use conditional statements and it all feels natural:

```python
if current_namespace() != "productboard":
    fail('You must be on "productboard" namespace! Switch by executing "kubens productboard".')
```

Another great case is that you can create a new repository with shared functions and load them in every project as an extension:

```python
v1alpha1.extension_repo(name = "pb-extensions", url = "https://github.com/productboard/our-tilt-extension")
v1alpha1.extension(name = "k8s", repo_name = "pb-extensions", repo_path = "k8s")
load("ext://k8s", "add_helm_repos")

add_helm_repos({
    "bitnami": "https://charts.bitnami.com/bitnami",
    "ingress-nginx": "https://kubernetes.github.io/ingress-nginx",
    "elastic": "https://helm.elastic.co",
})
```

If you already tried Tilt, you might notice there is already [helm_repo](https://github.com/tilt-dev/tilt-extensions/tree/master/helm_resource#helm_repo) extension provided by the team behind Tilt that does the same thing. This is actually one of our "specialties" we came to as `helm_repo` adds a new resource to UI:

![Tilt web interface](/blog/tilt-impressions/helm-repo.png)

Somehow most of your engineers found it quite confusing, therefore our custom-made `add_helm_repos` function uses [local](https://docs.tilt.dev/api.html#api.local) function underneath to add a helm chart:

```python
local("helm repo add {} {}".format(name, url))
```

The function `local` runs an arbitrary command on a host machine before deployment and always outputs to a special `(Tiltfile)` resource which makes it great for any tasks to prepare the environment without distracting developers. 

## Tilt Web UI

Speaking of Web UI with a list of resources, we probably appreciate the most a button to rotate specific services when things go awry:

![Tilt web interface](/blog/tilt-impressions/trigger-update.png)

Moreover, UI can be extended with additional buttons that can trigger specific actions on these services. My personal favorite is adding "Copy connection string" on database resources:

```python
cmd_button(
    name = "{}-connection".format(database_service_name),
    argv = [
        "bash", 
        "-c", 
        "echo -n postgres://{}:{}@localhost:{}/{} | pbcopy".format(user, password, port, dbname),
    ],
    text = "Copy connection string",
    icon_name = "link",
    resource = database_service_name,
)
```

![Tilt web interface](/blog/tilt-impressions/copy-connection.png)

A very simple thing, but greatly improves the experience when one wants to swiftly connect to the DB.

UI button can be also extended by input fields, but I found its interface rather counterintuitive at this moment for most of the use cases - we would like to run some of the commands with parameters provided by the developer but instead of prompting whenever they click, it's necessary to click on the arrow to open the dropdown, fill in the values, close it and then click on the button to trigger the action.

Additionally, it would be cool to have an overview of all such action buttons in one place, similarly to commands in DevSpace:

![Tilt web interface](/blog/tilt-impressions/devspace-commands.png)

Nevertheless, we expanded our usage of Tilt far beyond Kubernetes, e.g. this is how we run webpack server for the frontend application:

```python
def run_with_nvm(script):
  return 'export NVM_DIR="${{NVM_DIR:-$HOME/.nvm}}" && source $NVM_DIR/nvm.sh && nvm install && corepack enable && nvm use && {}'.format(script)

def run_webpack(feApp, port):
  script = run_with_nvm("yarn nx serve --port {} {}".format(port, feApp))

local_resource(
  'Main app: webpack',
  cmd=run_with_nvm('yarn install'),
  serve_cmd=run_webpack('main', 4200),
  readiness_probe=probe(
      period_secs=5,
      http_get=http_get_action(port=4200, path="/")
  ),
  allow_parallel=True
)
```

We use the same [local_resource](https://docs.tilt.dev/api.html#api.local_resource) function also for other tasks like running the Relay compiler in watch mode to recompile GraphQL queries:

![Relay watch](/blog/tilt-impressions/relay-watch.png)

`local_resource` is quite a versatile function that can spin up both long-running programs and one-time scripts. The only peculiarity is how to stop such long-running programs - you have to disable them:

![Relay watch](/blog/tilt-impressions/disable-resource.png)

There's one last thing we're missing a lot and that's the ability to execute commands in the pods directly from UI. Tilt shows pod ids conveniently but having such a possibility would mean that we no longer need to leave Web UI and switch back to the terminal to use `kubectl exec` command.

These are some nitpicks that would deserve further improvements but running both backend services and local processes like Relay compiler above or unit tests in a single unified UI is a great step.

---

Summa summarum: Tilt proved to be an irreplaceable part of our platform for the local environment and I believe it's exactly the direction where things should move. 

There are people with various roles in the company and only a fraction of them understands Kubernetes in depth. The goal of the majority of people is to deliver delightful product and not to waste time on debugging their local environment. Tilt so far seems to be a good tool to bring up the working station to life, oversee all deployed services, and spot potential problems soon.
