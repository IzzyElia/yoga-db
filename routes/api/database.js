const sqlite = require('sqlite3').verbose();
const path = require('path');
const schema = require('./databaseSchema');
const eventController = require('../../event-controller');

function logIfError (err) {
    if (err) {console.log(err);}
}

function close(db) {
    db.close((err) => {
        logIfError(err);
    });
}

class database {
    async getPoseAsObject (tableName) {
        return new Promise(resolve => {
            let tableObj = {}
            //tableName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
            tableObj.poseName = tableName;
            tableObj.responseStatus = 200;
            let db = new sqlite.Database(this.filePath, sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE, (err) => {
                if (err) {console.log(err);}
            })
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?;`, [tableName], (err, row) => {
                if (err) {
                    console.log (err);
                    tableObj.responseStatus = 500;
                }
                else if (row == null) {
                    console.log(`Can't find table ${tableName}`)
                    tableObj.responseStatus = 204;
                }
                else {
                    db.each(`SELECT * FROM ${tableName};`, (err, row) => {
                        if (tableObj[row.section] == undefined) {
                            tableObj[row.section] = [];
                        }
                        const entryObj = {
                            id: row.id,
                            content: row.content,
                            //section: row.section,
                            user: row.user,
                            metadata: row.metadata
                        }
                        tableObj[row.section].push(entryObj);
                    })
                }
            })
            db.close((err) => {
                if (err) {console.log(err);}
                resolve(tableObj);
            })
        })
    }
    async getPosesIndex (indexKey) {
        return new Promise ((resolve) => {
            let results = {};
            results.responseStatus = 200; //assume something went wrong if we don't change it
            if (indexKey == 'id') {results.responseStatus = 403;resolve(results);} //if they try to get the id forbid it
            results.poses = [];
            let db = new sqlite.Database(this.filePath, sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE, (err) => {
                if (err) {console.log(err);}
            })
            db.all (`SELECT name FROM sqlite_master WHERE type ='table' AND name NOT LIKE 'sqlite_%';`, (err, tables) => {
                if (err) {
                    console.log(err)
                    results.responseStatus = 500;
                }
                else {
                    let promises = [];
                    tables.forEach(table => {
                        let name = table.name;
                        let result = {sanskrit: name}
                        result.finds = [];
                        db.all(`SELECT DISTINCT content FROM ${name} WHERE section=?`, [indexKey], (err, finds) => {
                            if (err) {
                                console.log(err);
                                results.responseStatus = 500;
                            }
                            else {
                                finds.forEach(y => {
                                    result.finds.push(y.content);
                                })
                            }
                        })
                        results.poses.push(result);
                    });
                }
            })
            db.close((err) => {
                if (err) {console.log(err);}
                resolve(results);
            })
        })
    }
    async addPoseTableIfNotExists (tableName, keyslist) {
        tableName = tableName.replace(/\s/g, '_');
        return new Promise (resolve => {
            let db = new sqlite.Database(this.filePath, sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE, (err) => {
                logIfError(err);
            })
            db.get (`SELECT name FROM sqlite_master WHERE type='table' AND name=?;`,[tableName], (error, row) => {
                if (error) { console.log(`${error} in attempt to check if table '${tableName}' exists`); }
                else if (row == null) {
                    const sqlCode = schema.createTableDefinitionFromKeysList(tableName, keyslist);
                    db.run (sqlCode, (error) => {
                        if (error) { console.log(`${error} in`);}
                        else {
                            resolve(`Created table ${tableName}`)
                        }
                    });
                }
                else {
                    resolve(`Table Already Exists`)
                }
            })
            db.close((err) => {
                logIfError(err);
            })
        })
    }

    updateEdit (table, id, newContent, user) {
        let db = new sqlite.Database(this.filePath, sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE, (err) => {
            if (err) {console.log(err);}
        })
        db.run(`UPDATE ${table} SET content = ? WHERE id = ?`, [newContent, id], (err) => logIfError(err));
        db.close((err) => {
            logIfError(err);
            eventController.emit('poses-database-modified', table, null, id, newContent, 'update', user);
        })
    }

    addEdit (table, section, content, user) {
        let lastID = -1
        let db = new sqlite.Database(this.filePath, sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE, (err) => {
            if (err) {console.log(err);}
        })
        db.run (`INSERT INTO ${table} (section, content) VALUES (?, ?);`, [section, content], function (err) { //arrow function breaks lastID
            if (err) {console.log(`${err} in attempt to add edit entry with parameters Table:${table} Section:${section} Content:${content}`)}
            else {
                lastID = this.lastID
            }
        });
        db.close((err) => {
            logIfError(err);
            eventController.emit('poses-database-modified', table, section, lastID, content, 'add', user);
        })
    }

    deleteEdit (tableName, id, user) {
        let db = new sqlite.Database(this.filePath, sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE, (err) => {
            if (err) {console.log(err);}
        })
        let section = null;
        db.get (`SELECT name FROM sqlite_master WHERE type='table' AND name=?;`, [tableName], (err, row) => {
            if (err) {console.log(err);}
            else {
                db.get(`SELECT section FROM ${tableName} WHERE id=?;`, [id], (err, row) => {
                    logIfError(err);
                    if (row != undefined) {
                        section = row.section;
                        db.run (`DELETE FROM ${tableName} WHERE id=?;`, [id], (err) => logIfError(err))
                    }
                    else {
                        console.log(`Failed to delete row ${id} (not found)`)
                    }
                })
            }
        })
        db.close((err) => {
            logIfError(err);
            eventController.emit('poses-database-modified', tableName, section, id, null, 'delete', user);
        })
    }
    
    //generic
    constructor (filePath) {
        this.filePath = filePath;
        this.prepare();
    }
    prepare () { //creates and updates the database
        let db = new sqlite.Database(this.filePath, sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE, (err) => {
            if (err) {console.log(`${err} in attempt to open/create database file at ${this.filePath}`);}
        })
        // db.serialize(() => {
        //     db.run(schema.initFunction);
        // })
        db.close((err) => {if (err) {console.log(err);}})
    }
    updateSingle (table, row, key, value) { //modify a single value
        let db = new sqlite.Database(this.filePath, sqlite.OPEN_READWRITE, (err) => {
            if (err) {console.log(err);}
        })
        db.run (`UPDATE ? SET ? = ? WHERE id = ?;`, [table, key, value, row]);
        db.close((err) => {if (err) {console.log(err);}})
    }
    // insertRow (table) {
    //     let db = new sqlite.Database(thi.filePath, sqlite.OPEN_READWRITE, (err) => {
    //         if (err) {console.log(err);}
    //     })
    //     
    //    db.close((err) => {if (err) {console.log(err);}})
    // }

}

module.exports = database;