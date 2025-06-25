# Code Citations

## License: desconocido
https://github.com/Borwoll/blog-mern/tree/446f2b9b4e198e7a3ba2b522377612bb723c3a9a/utils/handleValidationErrors.js

```
;
export default (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
```

