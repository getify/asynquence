# asynquence Contrib

Optional plugin helpers are provided (`contrib.js` is *just* **846 bytes** minzipped) in `/contrib/*`.

Gate variations:

* `all(..)` is **an alias** of `gate(..)`.
* `any(..)` is like `gate(..)`, except **just one segment** *has* to succeed to proceed on the main sequence.
* `first(..)` is like `any(..)`, except **as soon as any segment succeeds**, the main sequence proceeds (ignoring subsequent results from other segments).
* `last(..)` is like `any(..)`, except only **the latest segment to complete successfully** sends message(s) along to the main sequence.
* `none(..)` is the inverse of `gate(..)`: the main sequence proceeds only **if all the segments fail** (with all segment error message(s) transposed as success message(s) and vice versa).

Sequence-step variations:

* `until(..)` is like `then(..)`, except it **keeps re-trying until success** or `break()` (for loop semantics) before the main sequence proceeds.
* `try(..)` is like `then(..)`, except it proceeds as success on the main sequence **regardless of success/failure signal**. If an error is caught, it's transposed as a special-format success message: `{ catch: ... }`.

## Using Contrib Plugins

Include the `contrib.js` (or `contrib.src.js`) file along with the *asynquence* library file. This automatically extends the API with the plugins.

They can then be used directly, like this:

```js
ASQ()
.try(foo)
.until(bar)
.then(baz);
```

## Building Contrib Bundle

There is a utility provided to bundle the contrib plugins and build the un-minified and minified files from the bundle.

`contrib/bundle.js` builds `contrib.src.js` (in the package root), and then builds (minifies) `contrib.js` (in the package root). The recommended way to invoke this utility is via npm:

`npm run-script bundle-contrib`

By default, the build includes all the `contrib/plugin.*` plugins. You can manually specify which plugins you want, like this:

`contrib/bundle.js any none try` (which would bundle only `any`, `none`, and `try` plugins)

**Note:** `npm run-script ..` [doesn't *currently*](https://github.com/isaacs/npm/issues/3494) support passing the extra command line params, so you must use `contrib/bundle.js` instead of `npm run-script bundle-contrib` if you want to pick which plugins to bundle.
