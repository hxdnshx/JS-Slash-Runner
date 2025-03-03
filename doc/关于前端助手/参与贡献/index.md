# 参与贡献

## 代码

[TODO](https://github.com/N0VI028/JS-Slash-Runner/blob/main/README_contribution.md)

## 文档

### 书写习惯

- 中文和英文之间应该有一个空格;
- 标点全部使用英文标点 (半角标点);
- 无论正文标题如何, 文件名中的英文全部使用小写, 单词之间用 `_` 隔开.

### 标记语言

本文档主要使用 [MyST Markdown](https://myst-parser.readthedocs.io/en/stable/intro.html) 语法编写, 但同样支持 [reStructuredText](https://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html) 语法.

MyST Markdown 语法与正常 Markdown 语法一致, 但如果需要折叠、提示等, 则需要额外语法.

```{hint}
VSCode 可以安装对应的语法高亮插件:
- ESbonio
- MyST Syntax Highlighting
```

可以参考以下网站:

- [语法: MyST Markdown](https://myst-parser.readthedocs.io/en/latest/index.html)
- [语法: reStructuredText](https://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html)
- [基础: Guide to reStructuredText and Sphinx](https://documatt.com/restructuredtext-reference/)
- [主题: Sphinx Book Theme](https://sphinx-book-theme.readthedocs.io/en/latest/content/content-blocks.html)
- [插件: Sphinx Design](https://sphinx-design.readthedocs.io/en/latest/index.html)
- [插件: Sphinx Tabs](https://sphinx-tabs.readthedocs.io/en/latest/)
- [插件: Sphinx Togglebutton](https://sphinx-togglebutton.readthedocs.io/en/latest/)

### 实时监控文档结果

首先你需要安装对应的软件:

```{code-block} bash
:linenos:
pip install -r doc/requirements.txt
```

然后, 你就能通过以下命令来监控文档实时结果:

```{code-block} bash
:linenos:
sphinx-autobuild -b dirhtml doc build
```
