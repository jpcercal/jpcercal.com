---
draft: false
author: jpcercal@gmail.com
slug: revisiting-the-layout-and-the-blog-project
title: Revisiting the layout and the Blog project
date: 2019-03-12T21:33:54+00:00
description: A project/proof of concept that has been shown good results, it’s about a migration from a PHP website to a static blog, no server costs anymore and web-optimized. Check out a few implementation details.
categories:
  - other
tags: 
  - news
  - cms
  - seo
  - framework
  - wordpress
  - howto
  - git
---

Hello dear visitor, a long time ago I had the desire to revisit the Blog layout, however, conciliate attention to my family and write are not things that could be done at the same time, because, both of them requires dedication.

Well, technically speaking, the goal was to give back to the open-source community something and so the source code is hosted on GitHub. You can use it to inspire yourself by taking this project as a solid base or even as a starting point.

> Are you curious and would love to take a look into the source code? Then, follow the [repository link](https://github.com/jpcercal/jpcercal.com), give me a star there. Also, why not create a fork of the repo? Did you find a bug? Open an issue or even better if you send a PR. ❤️

When I started this migration project in the middle of 2017, the blog was running on top of [Wordpress](https://wordpress.org/) 3.4 and, as a dependency, a server was required in order to render the content (if you’re used to I’m talking about a [LAMP](https://www.ibm.com/cloud/learn/lamp-stack-explained) stack). That being said, I had to move all the content from the previous website to markdown files, in the end the main points that made me think about this migration were:

- No scripts running on the server-side
- No relational database to give me the content
- Have a static website generator and publish the pages to [Git Pages](https://pages.github.com/)
- Have a search system with score definition per content based on text files
- Have versioning of all posts
- Have support to multi-language (English and Brazilian Portuguese)
- Support to [SSL](https://www.cloudflare.com/learning/ssl/what-is-ssl/)
- Create links between posts, authors, categories and tags
- Write posts in *markdown* file
- Move the legacy content from [MySQL](https://www.mysql.com/)
- Compile and compress the source code during the build
- Otimize the page loading time as well as simulate search results from Google search page
- Creation of content drafts 
- Preview of posts
- Migrate to a new domain `.io`
- Reorganize the navigation strategy
- Creation of a minimalist layout giving focus to the content
- Development environment based on [Docker](https://www.docker.com/) containers

## Just in case, it just works!

*Yeap*, it’s true that a server-side technology could make a few things easier, but you have to pay the price. 💰

> It’s exactly at this point that this project succeeds.

At the same time, I didn’t need a relational database instance to give me the data anymore.

Another advantage of this approach is that there’s no script/data processing on the server-side, all the files are already waiting to be accessed and they’re compiled and web-opmized. Well, they’re just waiting for you there. 🏎

A disadvantage, but not really, is that there’s no way to perform *queries* in a relational database to search for a post,  right? So, what happens in case a visitor searches for something? Good question by the way, another tool came in to solve this specific problem, take a close look into [Lunr](https://lunrjs.com/).

> An index file is created during the build time by this [grunt](https://gruntjs.com/) [task](https://github.com/jpcercal/jpcercal.com/blob/master/grunt-custom/lunr.js), after [a JS file implements the search module](https://github.com/jpcercal/jpcercal.com/blob/master/assets/js/search.js), uses the search index created before, defines scores to each content field and, finally it searches for your search terms. Beautiful! 

## Markdown files

Those files defined either by the `.md` or `.markdown` extension are no more no less than text files.

The big advantage is about editors and tools as they are quite common for taking notes and even to write books, there’s no doubt that you could be well served to work with your text files on your smartphone, tablet, laptop or PC, you can always be writing something if you want to.

As this format is popular, why should we insist in maintaining a relational database for a simple blog? I thought that I should not and by mixing the flexibility of those files with a [git](https://git-scm.com/) repository I could have my own data text database. Done! Now, I have version control for all the changes that I made and so if needed I could undo things easily or just check how the project looked like a time ago. Keep in mind that even the more advanced CMSs usually don’t allow you to do it.

Perfect, isn’t it? Even better, I can create content in the language that I want, I just have to open the post content in the language that I want to and start typing, if you got interested in take a look into the repo where you can see translation for “static” parts of the site like menus, links, etc:

- [jpcercal/jpcercal.com/i18n/en.yaml](https://github.com/jpcercal/jpcercal.com/blob/master/i18n/en.yaml)
- [jpcercal/jpcercal.com/i18n/en.yaml](https://github.com/jpcercal/jpcercal.com/blob/master/i18n/en.yaml)

And translated post content:

- [jpcercal/jpcercal.com/content/posts/composer-clear-cache/index.en.md](https://github.com/jpcercal/jpcercal.com/blob/master/content/posts/composer-clear-cache/index.en.md)
- [jpcercal/jpcercal.com/content/posts/composer-clear-cache/index.md](https://github.com/jpcercal/jpcercal.com/blob/master/content/posts/composer-clear-cache/index.md)

## Development environment and tests

The development environment is based on docker containers and so the only thing you have to install locally is Docker, after having it installed, you just need an active internet connection to download the images for the first execution.

> You can find more details about the entire installation process as well the guide about how to use the service into the repo [jpcercal/jpcercal.com](https://github.com/jpcercal/jpcercal.com/).

## Travis CI

As any other great developer, I created a pipeline to automate the deployment process, thanks to the guys from [Travis CI](https://docs.travis-ci.com/user/for-beginners/) for giving an excellent tool to the community, at least to solve my case.

> If you got seriously curious about how the pipeline looks like and what it does, pass by and check it out on [Travis-CI  jpcercal/jpcercal.com](https://travis-ci.org/jpcercal/jpcercal.com).

What happens there in a nutshell, Travis opens the file  [.travis.yml](https://github.com/jpcercal/jpcercal.com/blob/master/.travis.yml) defined on the repository root folder and it runs the tasks that got defined there. The most important steps are listed below:

- Install dependencies
- Generate the static site in production mode (it includes among other things the assets optimization)
- Publish the artefacts generated before
- Verify the resulted build by performing a live test using [Google Page Speed](https://developers.google.com/speed/pagespeed/insights/) tool

## Other tools

It’s nice to say that our [DNS](https://www.cloudflare.com/learning/dns/what-is-dns/) points out to [Cloudflare](https://www.cloudflare.com/), they offer a good service that optimizes your assets, protects you against [DDoS](https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/) attack and offer a SSL certificate all included in a free subscription plan. 😇

Hey [Hugo](https://gohugo.io/), thank you! No, it’s not a person, but one of the fastest frameworks for building static websites, it’s written on [Golang](https://golang.org/) and you guessed right, we’re using it.

## Homepage

Along the way I noticed that the web components disposition on the previous layouts were not that good and the proposals were focusing on the layout itself and not on the content as it should be, it was trying to show things to the visitors that they were not interested in, this is the problem that the new minimalist layout tries to solve.

Take a look below in a screenshot taken from the homepage in the moment that I was writing this post.

![Homepage](homepage.en.png)

> The images talks by itself, it’s clean and nice to read the content, however, there’s too much black related colors, I have the feeling that I still need to adjust it, talking about adjustments, I always want to change something there. 🚀

## Next steps

Good! But I want to refactor a few parts yet, nevertheless, I’m quite satisfied with the results.

What started as a proof of concept now is my personal blog, it works and it works VERY well, the only concern that I have today is that I need a computer in order to publish something.

> I could be using an app for my iOS device to manage GIT repositories, but I don’t want to.

Another point that bothers me are the headers of each post content file, they are defined as follows:

```yaml
---
draft: false
author: jpcercal@gmail.com
slug: my-slug
title: My Title
date: 2019-03-20T10:08:56+00:00
description: My description
categories:
  - other
tags: 
  - apple
  - osx
---
```

> The problem actually might be the editor that I’ve been using for writing the posts, [iA Writer](https://ia.net/writer) (for Mac and iOS) does not hide the metadata shown above, if you have any trick how to solve it, then drop me a comment!

To wrap this post up, I would love to finish it within a quote of someone that I liked a lot by his perfectionism and attention to details, the lord of apples.

> One way to remember who you are is to remember who your heroes are, Steve Jobs.

If you want to talk about this adventure or even about the challenge and issues that I had along the way, drop me a message, I would feel really good to inspire any of your ideas *developers developers developers*, if I did, please tell me! See ya. 😉
