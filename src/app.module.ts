import { Module } from '@nestjs/common';
import { DocumentModule } from './document/document.module';
import { SearchModule } from './search/search.module';

@Module({
	imports: [DocumentModule, SearchModule],
})
export class AppModule {}