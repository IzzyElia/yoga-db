
class schema {
    constructor () {
        this.poseEntryKeyslist = [
            `id INTEGER PRIMARY KEY`,
            `section TEXT`,
            `content TEXT`,
            `user TEXT`,
            `metadata TEXT`
        ]
    }
    createTableDefinitionFromKeysList (tableName, keyslist) { //Keyslist is NOT sanitized
        let tableDefinition = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
        for (let i = 0; i < keyslist.length; i++) {
            const key = keyslist[i];
            if (i == keyslist.length-1) { //final step (add close bracket semicolon)
                tableDefinition += `${key});`;
            }
            else { //normal step (add comma)
                tableDefinition += `${key},`;
            }
        }
        return tableDefinition;
    }
}
module.exports = new schema();
// let schema = {}
// schema.posesKeys = [
//     `id INT PRIMARY KEY`, 
//     `sanskrit TEXT`,
//     `english TEXT`,
//     `hip INT`,
//     `contraindictionsJSON TEXT`,
//     `alternativePosesJSON TEXT`,
//     `counterPosesJSON TEXT`,
//     `benefits TEXT`,
//     `enterBreath INT`,
//     `exitBreath INT`,
//     `transitionCuesJSON TEXT`,
//     `refinementCues TEXT`];

// schema.initFunction = createTableDefinitionFromKeysList('poses', schema.posesKeys);

// schema.contraindictionsKeys = [
//     `id INT PRIMARY KEY`,
//     `name TEXT`,
//     `poses TEXT`
// ];


// schema.initFunction += createTableDefinitionFromKeysList('contraindictions', schema.contraindictionsKeys);

// schema.benefitsKeys = [
//     `id INT PRIMARY KEY`,
//     `description TEXT`
// ];

// schema.initFunction += createTableDefinitionFromKeysList('benefits', schema.benefitsKeys);

// module.exports = schema;