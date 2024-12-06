import { Injectable } from '@nestjs/common';
const util = require('../../util.js')
const config = require('../../config.js')

interface Node {
    rank: number; // rank는 위치해야 할 순서
    document: string;
}

@Injectable()
export class SearchService {

	async getTokens(query: string): Promise<string[]> {
		const { tokens } = await this.requestToTokenizer(query);
		return tokens;
	}

	async rankSBert(query: string, documents: string[]): Promise<string[]>{
		const rankIndex: number[] = await this.getDocumentsRank(query, documents, this.requestToRankApiSBert)
		return await this.sortRankedDocuments(documents, rankIndex);
	}

	async rankCos(query: string, documents: string[]): Promise<string[]>{
		const rankIndex: number[] = await this.getDocumentsRank(query, documents, this.requestToRankApiCos)
		return await this.sortRankedDocuments(documents, rankIndex);
	}

	async rankMan(query: string, documents: string[]): Promise<string[]>{
		const rankIndex: number[] = await this.getDocumentsRank(query, documents, this.requestToRankApiMan)
		return await this.sortRankedDocuments(documents, rankIndex);
	}

	async rankUcl(query: string, documents: string[]): Promise<string[]>{
		const rankIndex: number[] = await this.getDocumentsRank(query, documents, this.requestToRankApiUcl)
		return await this.sortRankedDocuments(documents, rankIndex);
	}

	async rankSBert2(query: string, documents: string[]) {
		return await this.getSortedDocumentsWithSimilarity(query, documents, this.requestToRankApiSBert2)
	}

	async rankCos2(query: string, documents: string[]) {
		return await this.getSortedDocumentsWithSimilarity(query, documents, this.requestToRankApiCos2)
	}

	async rankMan2(query: string, documents: string[]) {
		return await this.getSortedDocumentsWithSimilarity(query, documents, this.requestToRankApiMan2)
	}

	async rankUcl2(query: string, documents: string[]) {
		return await this.getSortedDocumentsWithSimilarity(query, documents, this.requestToRankApiUcl2)
	}
		
	private async requestToTokenizer(query) {
		return util.makeHttpRequest(config.URL_TOKENIZER_SERVER, { 'Content-Type': 'application/json' }, { text: query });
	}
		
	private async requestToRankApiSBert(query, documents) {
		return util.makeHttpRequest(config.URL_RANK_SERVER_SBERT, { 'Content-Type': 'application/json' }, { query: query, documents: documents });
	}
			
	private async requestToRankApiCos(query, documents) {
		return util.makeHttpRequest(config.URL_RANK_SERVER_COS, { 'Content-Type': 'application/json' }, { query: query, documents: documents });
	}
			
	private async requestToRankApiMan(query, documents) {
		return util.makeHttpRequest(config.URL_RANK_SERVER_MAN, { 'Content-Type': 'application/json' }, { query: query, documents: documents });
	}
			
	private async requestToRankApiUcl(query, documents) {
		return util.makeHttpRequest(config.URL_RANK_SERVER_UCL, { 'Content-Type': 'application/json' }, { query: query, documents: documents });
	}

	private async requestToRankApiSBert2(query, documents) {
		return util.makeHttpRequest(config.URL_RANK_SERVER_SBERT2, { 'Content-Type': 'application/json' }, { query: query, documents: documents });
	}
			
	private async requestToRankApiCos2(query, documents) {
		return util.makeHttpRequest(config.URL_RANK_SERVER_COS2, { 'Content-Type': 'application/json' }, { query: query, documents: documents });
	}
			
	private async requestToRankApiMan2(query, documents) {
		return util.makeHttpRequest(config.URL_RANK_SERVER_MAN2, { 'Content-Type': 'application/json' }, { query: query, documents: documents });
	}
			
	private async requestToRankApiUcl2(query, documents) {
		return util.makeHttpRequest(config.URL_RANK_SERVER_UCL2, { 'Content-Type': 'application/json' }, { query: query, documents: documents });
	}

	private async getDocumentsRank(query, documents, requestToRankCertainSimilarity): Promise<number[]> {
		return (await requestToRankCertainSimilarity(query, documents)).documents_index;
	}
	
	private async getSortedDocumentsWithSimilarity(query, documents, requestToRankCertainSimilarity): Promise<number[]> {
		return (await requestToRankCertainSimilarity(query, documents));
	}

	private setDocumentNodes(rankIndex: number[], documents: string[]): Promise<Node[]> {
		return new Promise<Node[]>((resolve, reject) => {
			const nodes: Node[] = [];
			
			for (let i = 0; i < documents.length; i++) 
				nodes.push({ rank: rankIndex[i], document: documents[i] });
			
			resolve(nodes);
		});
	}
    
	private async sortRankedDocuments(documents: string[], rankIndex: number[]): Promise<string[]> {
		const nodes: Node[] = await this.setDocumentNodes(rankIndex, documents);
		const rankedDocumentNodes: Node[] = await this.getRankedDocumentNodes(rankIndex, nodes);
		const rankedDocuments: string[] = await this.extractDocuments(rankedDocumentNodes);

		return rankedDocuments;
	}
  
	private async getRankedDocumentNodes(rankIndex, nodes) {
		const rankedDocumentNodes: Node[] = [];
			
		const indexLength = rankIndex.length;
		const nodesLength = nodes.length;

		if (indexLength > 0)
		for (let i = 0; i < indexLength; i++) 
			for (let j = 0; j < nodesLength; j++) 
			if (nodes[j].rank == i)
				rankedDocumentNodes.push(nodes[j]);

		return rankedDocumentNodes;
	}

	private async extractDocuments(rankedDocumentNodes) {
		const rankedDocuments: string[] = [];
		for (const rankedDocumentNode of rankedDocumentNodes) 
			rankedDocuments.push(rankedDocumentNode.document);

		return rankedDocuments;
	}
}