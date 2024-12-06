import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { DocumentModule } from 'src/document/document.module';

@Module({
    imports: [DocumentModule],
    controllers: [SearchController],
    providers: [SearchService]
})
export class SearchModule {}