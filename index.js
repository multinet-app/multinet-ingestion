'use strict';

const createRouter = require('@arangodb/foxx/router');
const router = createRouter();

const db = require('@arangodb').db;

module.context.use(router);

function ingestCSV(file, coll) {

}

router.post('/csv/:coll', (req, res) => {
  const errors = []
  const edges = req.headers['arango-collection-type'] === 'edges'

  let coll = db._collection(req.pathParams.coll)
  if (!coll) {
    coll = edges
      ? db._createEdgeCollection(req.pathParams.coll)
      : db._createDocumentCollection(req.pathParams.coll)
  }

  function prepLine(line) {
    let values = line.split(',')
    return values.map(value => {
      return value.replace(/^"/, '').replace(/"$/, '')
    })
  }

  const lines = req.body.split(/\r?\n/)
  const schema = prepLine(lines[0])
  const entries = lines.slice(1)

  console.log(schema)
  if (edges && !schema.includes('_to')) errors.push(`Edge schema must have "_to". Schema received: ${lines[0]}`)
  if (edges && !schema.includes('_from')) errors.push(`Edge schema must have "_from". Schema received: ${lines[0]}`)

  if (errors.length > 0) {
    errors.forEach(error => console.log(error))
    res.status
    res.json({errors: errors})
    res.statusCode = 500
    return
  }
  if (!schema.includes('_key')) errors.push(`Schemas are recommended to have "_key". Schema received: ${lines[0]}`)

  coll.load()
  entries.forEach(entry => {
    let saveable = true
    let values = prepLine(entry)
    if (values.length != schema.length) {
      errors.push(`Missing column values, entry may be saved anyway: ${entry}`)
    }

    let document = schema.reduce((acc, key, i) => {
      acc[key] = values[i]
      return acc
    }, {})

    if (edges && !document._to) {
      errors.push(`Unable to process entry, missing "_to": ${entry}`)
      saveable = false
    }
    if (edges && !document._from) {
      errors.push(`Unable to process entry, missing "_from": ${entry}`)
      saveable = false
    }

    if (saveable) {
      coll.save(document)
    }
  })
  coll.unload()

  errors.forEach(error => console.log(error))

  res.json({
    collection: coll,
    schema,
    documents: entries.length,
    warnings: errors.slice(0, 10)
  })
})
.header('arango-collection-type') // "edges" or "vertices", defaults to "vertices"
.body(['text/plain'])
.response(['text/plain'], 'Success statistics or error message.')
.summary('Upload a CSV file')
.description('Uploads a CSV file using the first line as the column keys for the values in subsequent lines.')
