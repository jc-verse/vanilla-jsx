# Vanilla JSX

This project frees you from any JSX transformer in order to enjoy JSX expressions!

It currently supports only the tree-like structure of JSX, but not any of the more complex JavaScript expressions.

**Do not even attempt to use this anywhere.**

## How to use

This package is published to npm and unpkg, but because it doesn't use any module formats (yet), currently the only way to use it is through unpkg, as follows:

```html
<!DOCTYPE html>
<html>
<head>
  <title></title>
  <meta charset="utf-8">
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/@joshcena/vanilla-jsx@0.0.1/jsx.js"></script>
  <script>
    with (universalNS) {
      const element = jsx
        [div, className="form"]
          [label, htmlFor="age"]`Age: `[$label]
          [input, id="age", type="range", max=10, value=4, $]
        [$div];
      const root = document.getElementById("root");
      element.toDOM().forEach((elem) => root.appendChild(elem));
    }
  </script>
</body>
</html>
```

You can view the demo at https://jc-verse.github.io/vanilla-jsx.

## How does it work?

I have written some introduction here: https://zhuanlan.zhihu.com/p/498356150

## Acknowledgements

This project has benefitted largely from a Discord discussion. The idea was initially brought up by someone else, but I eventually completed the DOM manipulation part and did significant refactors to the initial PoC code.
