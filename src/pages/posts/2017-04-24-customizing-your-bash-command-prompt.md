---
title: Customizing your bash command prompt
tags: 'tools, bash'
category: tools
date: 2017-04-24T19:36:33.871Z
description: Customize your bash with emojis
---
For awhile now I have wanted to customize my command prompt in my terminal, but I thought I was limited because I did not use the fancy [iterm](https://www.iterm2.com/) or [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh).

Customizing your command prompt in bash is pretty straight, forward. It only requires a little bit of reading and a lot of copy and pasting.

Recently during a discovery and research session on a flight across the country to Florida, I did some easy Google searching and found my solution on the [Apple Stack Exchange](https://apple.stackexchange.com/questions/125637/iterm-colors-for-prompt-command-and-output).

I copied the code from there to my`.bashrc` with some minor changes, which the result is this:

```sh
# custom bash prompt
function parse_git_branch {
git branch --no-color 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/(\1)/'
}
export PS1="🍔  \[\033[01;35m\]\u@\h:\[\033[01;34m\]\$(parse_git_branch)
\[\033[01;32m\]\w \[\033[01;34m\]\n$ \[\e[0m\]"
```
I really don't know how to write bash, but was able to make heads and tails of what was there using this [bash wiki](https://wiki.archlinux.org/index.php/Bash/Prompt_customization). 

![custom-bash-example](/img/uploads/bash.png)

I hope you find this post useful and a good starting point for customizing your command as well.
