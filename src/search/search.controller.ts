import { Controller, Post, Body } from '@nestjs/common';
import { QueryDto } from './dto/query.dto';
import { SearchService } from './search.service';
import { DocumentService } from 'src/document/document.service';

interface QueryResponse {
    documents: string[];
}

@Controller('/query')
export class SearchController {
    constructor(private searchService: SearchService, private documentService: DocumentService) {}

    @Post('/sbert')
    async querySBert(@Body() dto: QueryDto): Promise<QueryResponse>{
        const query: string = dto.query;
        const tokens: string[] = await this.searchService.getTokens(query);
        const documents: string[] = await this.documentService.getDocuments(tokens);
        const rankedDocuments = await this.searchService.rankSBert(query, documents)
      	return { documents: rankedDocuments };
    }

    @Post('/cos')
    async queryCos(@Body() dto: QueryDto): Promise<QueryResponse>{
        const query: string = dto.query;
        const tokens: string[] = await this.searchService.getTokens(query);
        const documents: string[] = await this.documentService.getDocuments(tokens);
        const rankedDocuments = await this.searchService.rankCos(query, documents)
      	return { documents: rankedDocuments };
    }

    @Post('/man')
    async queryMan(@Body() dto: QueryDto): Promise<QueryResponse>{
        const query: string = dto.query;
        const tokens: string[] = await this.searchService.getTokens(query);
        const documents: string[] = await this.documentService.getDocuments(tokens);
        const rankedDocuments = await this.searchService.rankMan(query, documents)
      	return { documents: rankedDocuments };
    }

    @Post('/ucl')
    async queryUcl(@Body() dto: QueryDto): Promise<QueryResponse>{
        const query: string = dto.query;
        const tokens: string[] = await this.searchService.getTokens(query);
        const documents: string[] = await this.documentService.getDocuments(tokens);
        const rankedDocuments = await this.searchService.rankUcl(query, documents)
      	return { documents: rankedDocuments };
    }

    @Post('/sbert/v2')
    async querySBert2(@Body() dto: QueryDto) {
        const query: string = dto.query;
        const tokens: string[] = await this.searchService.getTokens(query);
        const documents: string[] = await this.documentService.getDocuments(tokens);
        const rankedDocuments = await this.searchService.rankSBert2(query, documents)
      	return rankedDocuments;
    }

    @Post('/cos/v2')
    async queryCos2(@Body() dto: QueryDto) {
        const query: string = dto.query;
        const tokens: string[] = await this.searchService.getTokens(query);
        const documents: string[] = await this.documentService.getDocuments(tokens);
        const rankedDocuments = await this.searchService.rankCos2(query, documents)
      	return rankedDocuments;
    }

    @Post('/man/v2')
    async queryMan2(@Body() dto: QueryDto) {
        const query: string = dto.query;
        const tokens: string[] = await this.searchService.getTokens(query);
        const documents: string[] = await this.documentService.getDocuments(tokens);
        const rankedDocuments = await this.searchService.rankMan2(query, documents)
      	return rankedDocuments;
    }

    @Post('/ucl/v2')
    async queryUcl2(@Body() dto: QueryDto) {
        const query: string = dto.query;
        const tokens: string[] = await this.searchService.getTokens(query);
        const documents: string[] = await this.documentService.getDocuments(tokens);
        const rankedDocuments = await this.searchService.rankUcl2(query, documents)
      	return rankedDocuments;
    }
}