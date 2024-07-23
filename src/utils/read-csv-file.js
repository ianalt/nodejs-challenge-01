import { parse } from 'csv-parse'
import * as fs from 'fs'

export async function readCsvFile(filePath) {
    const csv = parse({
        delimiter: ",",
        columns: true,
        ltrim: true,
        encoding: 'utf8',
    })
    const dataSet = []

    const stream = fs.createReadStream(filePath)
        .pipe(csv)
        .on("data", function (row) {
            console.log('Reading row: ');
            console.log(row)
        })
        .on("error", function (error) {
            console.log(error.message);
        })
        .on("end", function () {
            console.log("File read completed.");
        });


    for await (const chunk of stream) {
        dataSet.push(chunk);
    }

    return dataSet
}