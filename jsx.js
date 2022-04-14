const jsxState = { attrs: [], domRoots: [] };

function formatAttr(attr) {
  if (!Array.isArray(attr)) return [attr, true];
  if (attr[1] === false) return [];
  const [k, v] = attr;
  const keyMap = { htmlFor: "for", className: "class" };
  return [k in keyMap ? keyMap[k] : k.replace(/_/, "-"), v];
}

function formatTag(rawAttrs) {
  const [tagName, ...attrs] = rawAttrs;
  if (tagName.startsWith("$")) {
    if (attrs.length > 0)
      throw new Error("JSX closing tag cannot have attributes");
    return { type: "closing", tagName: tagName.replace(/^\$/, "").replace(/_/, "-") };
  } else if (attrs.at(-1) === "$") {
    attrs.pop();
    return { type: "self-close", tagName, attrs: attrs.map(formatAttr) };
  } else {
    return { type: "opening", tagName, attrs: attrs.map(formatAttr) };
  }
}

function appendChild(stack, element) {
  if (stack.length > 0) stack[0].appendChild(element);
  else jsxState.domRoots.push(element);
}

function createJSX(stack) {
  function jsx(strs, ...args) {
    const textNode = args.reduce(
      (acc, cur, idx) => acc + String(cur) + strs[idx + 1],
      strs[0],
    );
    const element = document.createTextNode(textNode);
    appendChild(stack, element);
    return createJSX(stack);
  }
  jsxState.attrs = [];
  jsx.stack = () => stack;
  jsx.toDOM = () => {
    if (stack.length)
      throw new Error(`Unclosed tags: ${stack.map(({tagName}) => tagName.toLowerCase()).join(", ")}`);
    return jsxState.domRoots;
  }
  return new Proxy(jsx, jsxTrap);
}

const jsxTrap = {
  has() { return true; },
  get(target, prop) {
    if (prop in target || typeof prop === "symbol") return target[prop];
    const {type, tagName, attrs} = formatTag(jsxState.attrs);
    const stack = target.stack();
    if (type === "self-close") {
      const element = document.createElement(tagName);
      attrs.forEach(([k, v]) => k && element.setAttribute(k, v));
      appendChild(stack, element);
    } else if (type === "closing") {
      if (stack[0].tagName.toLowerCase() !== tagName)
        throw new Error(`Tag name mismatch: ${stack[0].tagName.toLowerCase()} vs. ${tagName}`);
      const element = stack.shift();
      appendChild(stack, element);
    } else {
      const element = document.createElement(tagName);
      attrs.forEach(([k, v]) => k && element.setAttribute(k, v));
      stack.unshift(element);
    }
    return createJSX(stack);
  },
};

globalThis.universalNS = new Proxy({}, {
  has(target, prop) {
    return !(prop in globalThis);
  },
  get(target, prop) {
    if (typeof prop === "symbol") return target[prop];
    jsxState.attrs.push(prop);
    return [prop];
  },
  set(target, prop, value) {
    if (typeof prop === "symbol") target[prop] = value;
    else if (prop in globalThis) globalThis[prop] = value;
    else {
      if (Array.isArray(value)) {
        jsxState.attrs.pop();
        jsxState.attrs.push([prop, value[0]]);
      } else {
        jsxState.attrs.push([prop, value]);
      }
    }
    return true;
  }
});

globalThis.jsx = createJSX([]);
globalThis.resetJSX = () => {
  globalThis.jsx = createJSX([]);
  jsxState.attrs = [];
  jsxState.domRoots = [];
}
