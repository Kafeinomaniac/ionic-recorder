We are more than happy to accept external contributions to the project 
in the form of feedback, bug reports and even better - pull requests :)

This file outlines a set of guidelines for contributing to this project. 
It is based on 
[this file](https://github.com/yeoman/yeoman/blob/master/contributing.md)

## Contribution Guidelines

In order for us to help you please check that you've completed the 
following steps:

* Developed according to our development guideline outlined in the top-level
  [README.md](
      https://github.com/tracktunes/ionic-recorder/blob/master/README.md)
* Made sure you're on the latest version: issue `git pull` in your cloned 
code repository
* Used the issue search feature to ensure that the issue hasn't been raised
* Included as much information about the issue as possible, including:
  * Any output you've received
  * OS version
  * Browser version
* Ran the unit test suite by issuing `npm test` at the project's home 
directory - before and after your changes (all tests should pass at 
start)

[Submit your issue here](
    https://github.com/tracktunes/ionic-recorder/issues/new)

## Style Guide

Your code must pass `npm test`. It includes a `tslint` run with many 
[lint rules](
    https://github.com/tracktunes/ionic-recorder/blob/master/tslint.json)
which your code must obey.

## Pull Request Guidelines

* Check for procedural updates in this file every time (as they may
change)
* Please check to make sure that there aren't existing pull requests 
attempting to address the issue mentioned
* Non-trivial changes should be discussed in an issue first. If there is
no issue for your pull request, create one first. Then mention the issue
you are addressing in the pull request comment section
* Develop in a branch, not master
* Add relevant tests to cover the change
* Use `npm test` to make sure all tests pass before submitting the request
* [Squash your commits](https://github.com/blog/2141-squash-your-commits)
* Write a convincing description of your PR and why we should land it
