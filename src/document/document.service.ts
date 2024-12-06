import { Injectable } from '@nestjs/common';
const mysql = require('mysql2');
const config = require('../../config.js')
const secretConfig = require('../../secret_config.js')
const util = require('../../util.js')

@Injectable()
export class DocumentService {
    private connectionToDocumentDB;
    constructor() {
        console.log('mariadb connection start ...')
        this.connectionToDocumentDB = mysql.createConnection({
            host: config.MARIA_DB,
            user: secretConfig.USER,
            password: secretConfig.PASSWORD,
            database: secretConfig.DOUCMENT_DB
        });
        console.log('mariadb is connected')
    }

    async enrollText(text: string) {
        // enroll document to documentDB
        const insertDocumentRow = await this.enrollDocument(text);
            
        // tokenize text
        const { tokens } = await this.requestToTokenizer(text);
        console.log(tokens);
        // enroll token terms
        const tokensIndexs = await this.enrollTerms(tokens);

        // enroll document key with inverted indexs for matching
        return this.enrollDocumentKeyWithInvertedKeys(insertDocumentRow.insertId, tokensIndexs);
    }

    
    async getDocuments(terms: string[]) {
        // get inverted_index_key 
        const invertedIndexKeys = await this.getInvertedIndexKeys(terms);

        // get document_key
        const documentKeys = await this.getDocumentKeys(invertedIndexKeys);
        const uniqueDocumentKeys = await this.removeDuplicate(documentKeys);

        // get content
        const documents = await this.getDocumentsByKeys(uniqueDocumentKeys);

        // return documents
        return documents
    }

    private async enrollDocument(text: string) {
        const insertQuery = 'INSERT INTO document(content) VALUES (?)';

        try {
			const [result] = await this.connectionToDocumentDB.promise().query(insertQuery, text);
			return result;
        } catch (err) {
			console.error('INSERT 쿼리 오류', err);
			throw err;
        }
    }

    private async requestToTokenizer(document: string) {
        return util.makeHttpRequest(config.URL_TOKENIZER_SERVER, { 'Content-Type': 'application/json' }, { text: document });
    }

    private async enrollTerms(terms: string[]) {
        const uniqueTerms = [...new Set(terms)];
        const insertQuery = 'INSERT INTO inverted_index(term) VALUES (?)';
        const invertedIndexArr = [];
      
        try {
			for (const term of uniqueTerms){
				const [rows] = await this.connectionToDocumentDB.promise().query(`SELECT inverted_index_key FROM inverted_index WHERE term = ?`, [term]);
				if (rows.length > 0) {
					invertedIndexArr.push(rows[0].inverted_index_key);
				} else {
					const [result] = await this.connectionToDocumentDB.promise().query(insertQuery, [term]);
					invertedIndexArr.push(result.insertId);
				}
			}
			return invertedIndexArr;
        } catch (err) {
			console.error('INSERT 쿼리 오류', err);
			throw err;
        }
    }

    private async enrollDocumentKeyWithInvertedKeys(documentKey: number, invertedKeys: number[]) {
        const insertQuery = 'INSERT INTO document_inverted_index VALUES (?, ?)';
        const selectQuery = 'SELECT * FROM document_inverted_index WHERE document_key = ? AND inverted_index_key = ?';
      
        try {
          	for (const invertedKey of invertedKeys) {
				const [rows] = await this.connectionToDocumentDB.promise().query(selectQuery, [documentKey, invertedKey]);
				if (rows.length === 0) {
					this.connectionToDocumentDB.promise().query(insertQuery, [documentKey, invertedKey]);
				}
          	}
        } catch (err) {
          	console.error('query error', err);
        }
    }
        
    private async getInvertedIndexKeys(terms: string[]): Promise<string[]> {
        const invertedIndexKeys = [];

        const selectInvertedIndexKeys = 'SELECT inverted_index_key FROM inverted_index WHERE term = ?';

        for (const term of terms) {
            const [result] = await this.connectionToDocumentDB.promise().query(selectInvertedIndexKeys, term);
            if (result.length > 0){
            	invertedIndexKeys.push(result[0].inverted_index_key);  
            }
        }

        return invertedIndexKeys;
    }

    private async getDocumentKeys(invertedIndexKeys: string[]): Promise<string[]>{
        const documentKeys = [];
        const selectDocumentKeys = 'SELECT document_key FROM document_inverted_index WHERE inverted_index_key = ?';

        for (const invertedIndexKey of invertedIndexKeys) {
            const [results] = await this.connectionToDocumentDB.promise().query(selectDocumentKeys, invertedIndexKey);
            if (results.length > 0){
				for (const result of results){
					documentKeys.push(result.document_key);  
				}
            }
    	}
        return documentKeys;
    }

    private async removeDuplicate(documentKeys: string[]): Promise<string[]> {
        return [...new Set(documentKeys)];
    }

    private async getDocumentsByKeys(uniqueDocumentKeys: string[]): Promise<string[]> {
        const documents: string[] = [];
        const selectDocuments = 'SELECT content FROM document WHERE document_key = ?';

        for (const documentKey of uniqueDocumentKeys) {
            const [result] = await this.connectionToDocumentDB.promise().query(selectDocuments, documentKey);
            if (result.length > 0){
            	documents.push(result[0].content);  
            }
        }
        console.log(documents)
        return documents;
    }
}