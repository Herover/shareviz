import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import ShareDB from "sharedb";

/**
 * @typedef JSONDBSnapshot
 * @prop {string} id
 * @prop {number} v
 * @prop {string} type
 * @prop {any} data
 */
/**
 * @typedef JSONDBData
 * @prop {ShareDB.Op[]} ops
 * @prop {JSONDBSnapshot} snapshot
 */

/***
 * Only allow id's and collections to include
 * a-z
 * A-Z
 * 0-9
 * .
 * -
 */
const pathAllowExpr = /^[a-zA-Z0-9.-]*$/;
// Linux and windows both handle paths up to 255 bytes long, but we try to limit it anyways.
const pathPartMaxLength = 50;

/**
 * @param {{ documentDir?: string; } & any} options
 */
export function JSONDB(options) {
  if (!(this instanceof JSONDB)) return new JSONDB(options);
  ShareDB.DB.call(this, options);

  this.documentDir = options.documentDir || "data";

  this.closed = false;

  if (!existsSync(this.documentDir)) {
    mkdirSync(this.documentDir);
  }
}
// module.exports = JSONDB;

JSONDB.prototype = Object.create(ShareDB.DB.prototype);

JSONDB.prototype.close = function (callback) {
  this.closed = true;

  if (callback) callback();
};

// Persists an op and snapshot if it is for the next version. Calls back with
// callback(err, succeeded)
JSONDB.prototype.commit = function (collection, id, op, snapshot, options, callback) {
  try {
    if (collection.length > pathPartMaxLength) {
      throw new Error("collection name is longer than " + pathPartMaxLength + " bytes");
    }
    if (id.length > pathPartMaxLength) {
      throw new Error("id is longer than " + pathPartMaxLength + " bytes");
    }

    const collectionPathPart = collection.match(pathAllowExpr);
    if (collectionPathPart.length != 1 && collectionPathPart[0].length != 0) {
      throw new Error("collection name contains illegal characters or is invalid");
    }
    const idPathPart = id.match(pathAllowExpr);
    if (idPathPart.length != 1 && idPathPart[0].length != 0) {
      throw new Error("id contains illegal characters or is invalid");
    }

    const collectionPath = `${this.documentDir}/${collectionPathPart}`;
    const documentPath = `${collectionPath}/${idPathPart}.json`;

    if (!existsSync(collectionPath)) {
      mkdirSync(collectionPath, { recursive: true });
    }
    if (!existsSync(documentPath)) {
      writeFileSync(documentPath, JSON.stringify({ ops: [] }));
    }

    const jsonSnapshot = {
      id: id,
      v: snapshot.v,
      type: snapshot.type,
      data: snapshot.data,
    };

    /** @type JSONDBData */
    const document = JSON.parse(readFileSync(documentPath).toString("utf8"));

    if (document.ops.length == 0) {
      document.ops.push(op);
      document.snapshot = jsonSnapshot;
    } else if (
      document.ops.length ==
      jsonSnapshot.v - 1 /* && document.ops[document.ops.length - 1].v === jsonSnapshot.v */
    ) {
      document.ops.push(op);
      document.snapshot = jsonSnapshot;
    } else {
      callback(null, false);
      process.exit();
      return;
    }

    writeFileSync(documentPath, JSON.stringify(document));

    callback(null, true);
  } catch (err) {
    callback(err);
  }
};

// Get the named document from the database. The callback is called with (err,
// snapshot). A snapshot with a version of zero is returned if the docuemnt
// has never been created in the database.
JSONDB.prototype.getSnapshot = function (collection, id, fields, options, callback) {
  try {
    if (collection.length > pathPartMaxLength) {
      throw new Error("collection name is longer than " + pathPartMaxLength + " bytes");
    }
    if (id.length > pathPartMaxLength) {
      throw new Error("id is longer than " + pathPartMaxLength + " bytes");
    }

    const collectionPathPart = collection.match(pathAllowExpr);
    if (collectionPathPart.length != 1 && collectionPathPart[0].length != 0) {
      throw new Error("collection name contains illegal characters or is invalid");
    }
    const idPathPart = id.match(pathAllowExpr);
    if (idPathPart.length != 1 && idPathPart[0].length != 0) {
      throw new Error("id contains illegal characters or is invalid");
    }

    const collectionPath = `${this.documentDir}/${collectionPathPart}`;
    const documentPath = `${collectionPath}/${idPathPart}.json`;

    const nullSnapshot = {
      id: id,
      v: 0,
      type: null,
      data: undefined,
    };
    if (!existsSync(documentPath)) {
      callback(null, nullSnapshot);
      return;
    }

    /** @type JSONDBData */
    const document = JSON.parse(readFileSync(documentPath).toString("utf8"));

    if (document.ops.length == 0) {
      callback(null, nullSnapshot);
      return;
    }

    callback(null, document.snapshot);
  } catch (err) {
    callback(err);
  }
};

// Get operations between [from, to) noninclusively. (Ie, the range should
// contain start but not end).
//
// If end is null, this function should return all operations from start onwards.
//
// The operations that getOps returns don't need to have a version: field.
// The version will be inferred from the parameters if it is missing.
//
// Callback should be called as callback(error, [list of ops]);
JSONDB.prototype.getOps = function (collection, id, from, to, options, callback) {
  try {
    if (collection.length > pathPartMaxLength) {
      throw new Error("collection name is longer than " + pathPartMaxLength + " bytes");
    }
    if (id.length > pathPartMaxLength) {
      throw new Error("id is longer than " + pathPartMaxLength + " bytes");
    }

    const collectionPathPart = collection.match(pathAllowExpr);
    if (collectionPathPart.length != 1 && collectionPathPart[0].length != 0) {
      throw new Error("collection name contains illegal characters or is invalid");
    }
    const idPathPart = id.match(pathAllowExpr);
    if (idPathPart.length != 1 && idPathPart[0].length != 0) {
      throw new Error("id contains illegal characters or is invalid");
    }

    const collectionPath = `${this.documentDir}/${collectionPathPart}`;
    const documentPath = `${collectionPath}/${idPathPart}.json`;

    if (!existsSync(documentPath)) {
      callback(null, []);
      return;
    }

    /** @type JSONDBData */
    const document = JSON.parse(readFileSync(documentPath).toString("utf8"));

    return document.ops.filter((op) => from <= op.v && op.v < to).sort((a, b) => a.v - b.v);
  } catch (err) {
    callback(err);
  }
};

JSONDB.prototype.query = function (collection, inputQuery, fields, options, callback) {
  try {
    if (collection.length > pathPartMaxLength) {
      throw new Error("collection name is longer than " + pathPartMaxLength + " bytes");
    }

    const collectionPathPart = collection.match(pathAllowExpr);
    if (collectionPathPart.length != 1 && collectionPathPart[0].length != 0) {
      throw new Error("collection name contains illegal characters or is invalid");
    }

    const collectionPath = `${this.documentDir}/${collectionPathPart}`;

    const files = readdirSync(collectionPath);

    const results = [];

    files.forEach((file) => {
      results.push(
        new Promise((resolve, reject) => {
          this.getSnapshot(collection, file.split(".")[0], null, null, (err, snap) => {
            if (err) reject(err);
            resolve(snap);
          });
        }),
      );
    });

    Promise.all(results)
      .then((docs) => callback(null, docs))
      .catch((err) => callback(err));
  } catch (err) {
    callback(err);
  }
};
